// ─────────────────────────────────────────────────────────────────────────────
// POST /api/documents/[id]/confirm
// Marks a document and its extractions as confirmed/verified
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const docId = params.id;
    const body = await req.json().catch(() => ({}));
    const { reviewStatus = 'verified' } = body;

    const found = repo.getDocument(docId);
    if (!found) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const updated = repo.updateDocument(docId, {
      reviewStatus,
      processingStatus: 'confirmed',
    });

    return NextResponse.json({ success: true, document: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error confirming document';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
