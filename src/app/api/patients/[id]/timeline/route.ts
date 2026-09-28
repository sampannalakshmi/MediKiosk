// ─────────────────────────────────────────────────────────────────────────────
// GET /api/patients/[id]/timeline
// Returns chronological clinical events for a patient with source provenance
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';
import type { TimelineEvent } from '@/types/clinical';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const patientId = params.id;
  const cases = repo.listCases();
  const patientCases = cases.filter((c) => c.patientId === patientId);

  const timelineEvents: TimelineEvent[] = [];
  for (const pc of patientCases) {
    if (pc.timeline && pc.timeline.length > 0) {
      timelineEvents.push(...pc.timeline);
    }
  }

  // Sort chronologically
  timelineEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return NextResponse.json({
    patientId,
    timeline: timelineEvents,
    totalCount: timelineEvents.length,
  });
}
