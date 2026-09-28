// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/document-extractions/[id]
// Allows patient or clinician to edit or confirm an extracted clinical fact
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const extractionId = params.id;
    const body = await req.json();
    const { documentId, value, status, normalizedValue } = body;

    if (!documentId) {
      return NextResponse.json({ error: 'documentId is required' }, { status: 400 });
    }

    const updated = repo.updateDocumentExtraction(documentId, extractionId, {
      ...(value !== undefined && { value }),
      ...(status !== undefined && { status }),
      ...(normalizedValue !== undefined && { normalizedValue }),
    });

    if (!updated) {
      return NextResponse.json({ error: 'Extraction not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, extraction: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Update error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
