// ─────────────────────────────────────────────────────────────────────────────
// POST /api/consultations — create a new case
// GET  /api/consultations — list all cases (doctor queue)
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';
import type { ConsultationCase, Patient } from '@/types/clinical';

export async function GET() {
  const cases = repo.listCases();
  return NextResponse.json(cases);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { patientId, name, age, gender, language, interactionMode, chiefComplaint } = body;

  if (!language || !chiefComplaint) {
    return NextResponse.json({ error: 'language and chiefComplaint are required' }, { status: 400 });
  }

  // Upsert patient
  const pid = patientId || `patient-${Date.now()}`;
  const patient: Patient = {
    id: pid,
    name: name || undefined,
    age: age || undefined,
    gender: gender || undefined,
    language,
    createdAt: new Date().toISOString(),
  };
  repo.upsertPatient(patient);

  const now = new Date().toISOString();
  const caseId = `case-${Date.now()}`;
  const newCase: ConsultationCase = {
    id: caseId,
    patientId: pid,
    chiefComplaint,
    language,
    interactionMode: interactionMode || 'text',
    status: 'in_progress',
    priority: 'LOW',
    socratesHistory: {},
    ayushHistory: {},
    documents: [],
    timeline: [],
    redFlags: [],
    evidenceMap: {},
    createdAt: now,
    updatedAt: now,
  };

  repo.createCase(newCase);
  return NextResponse.json({ caseId, patientId: pid }, { status: 201 });
}
