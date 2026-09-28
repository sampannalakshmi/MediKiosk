// ─────────────────────────────────────────────────────────────────────────────
// GET /api/documents/[id]/extractions
// Returns all extracted clinical facts with page & snippet evidence links
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const docId = params.id;
  const found = repo.getDocument(docId);

  if (!found) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  const { document } = found;

  return NextResponse.json({
    documentId: document.id,
    filename: document.filename,
    extractions: document.extractions || [],
    pageCount: document.pageCount,
    confidence: document.extractionConfidence,
    processingStatus: document.processingStatus,
    reviewStatus: document.reviewStatus,
  });
}
