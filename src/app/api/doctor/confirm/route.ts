// POST /api/doctor/confirm

import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';

export async function POST(req: NextRequest) {
  const { caseId, reviewedBy, notes } = await req.json();
  const c = repo.getCase(caseId);
  if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = repo.updateCase(caseId, {
    status: 'completed',
    doctorReview: {
      ...(c.doctorReview ?? { edits: {}, reviewedAt: new Date().toISOString(), reviewedBy: reviewedBy || 'Doctor' }),
      confirmed: true,
      confirmedAt: new Date().toISOString(),
      notes: notes ?? c.doctorReview?.notes,
    },
  });
  return NextResponse.json(updated);
}
