// POST /api/doctor/review  — doctor edits the case
// POST /api/doctor/confirm — doctor signs off

import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';

export async function POST(req: NextRequest) {
  const { caseId, reviewedBy, edits, notes } = await req.json();
  const c = repo.getCase(caseId);
  if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = repo.updateCase(caseId, {
    socratesHistory: { ...c.socratesHistory, ...edits },
    status: 'reviewed',
    doctorReview: {
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewedBy || 'Doctor',
      edits,
      notes,
      confirmed: false,
    },
  });
  return NextResponse.json(updated);
}
