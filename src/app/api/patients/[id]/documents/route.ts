// ─────────────────────────────────────────────────────────────────────────────
// GET /api/patients/[id]/documents
// Returns all documents associated with a patient across their consultations
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';
import type { MedicalDocument } from '@/types/document';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const patientId = params.id;
  const cases = repo.listCases();
  const patientCases = cases.filter((c) => c.patientId === patientId);

  const allDocs: MedicalDocument[] = [];
  for (const pc of patientCases) {
    if (pc.documents && pc.documents.length > 0) {
      allDocs.push(...pc.documents);
    }
  }

  return NextResponse.json({
    patientId,
    documents: allDocs,
    totalCount: allDocs.length,
  });
}
