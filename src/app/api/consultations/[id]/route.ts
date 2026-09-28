// ─────────────────────────────────────────────────────────────────────────────
// GET  /api/consultations/[id]
// PATCH /api/consultations/[id]
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const c = repo.getCase(params.id);
  if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(c);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updated = repo.updateCase(params.id, body);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}
