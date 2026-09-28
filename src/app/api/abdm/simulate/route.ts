// GET /api/abdm/simulate?caseId=xxx

import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';
import { generateFHIRBundle } from '@/services/abdm/abdmSimulation';

export async function GET(req: NextRequest) {
  const caseId = req.nextUrl.searchParams.get('caseId');
  if (!caseId) return NextResponse.json({ error: 'caseId required' }, { status: 400 });

  const c = repo.getCase(caseId);
  if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!c.patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });

  const bundle = generateFHIRBundle(c.patient, c);
  return NextResponse.json(bundle);
}
