// ─────────────────────────────────────────────────────────────────────────────
// GET /api/documents/[id] — Retrieve document metadata, preview, and extractions
// DELETE /api/documents/[id] — Remove document
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';
import { documentStorage } from '@/services/documents/documentStorageService';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const docId = params.id;
  const found = repo.getDocument(docId);

  if (!found) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  return NextResponse.json({
    document: found.document,
    caseId: found.caseId,
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const docId = params.id;
  const found = repo.getDocument(docId);

  if (!found) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  const { document: currentDoc, caseId } = found;

  // 1. Delete from storage if storageReference exists
  if (currentDoc.storageReference) {
    await documentStorage.deleteDocument(currentDoc.storageReference);
  }

  // 2. Remove from consultation case
  const consultation = repo.getCase(caseId);
  if (consultation) {
    const updatedDocs = (consultation.documents || []).filter((d) => d.id !== docId);
    repo.updateCase(caseId, { documents: updatedDocs });
  }

  return NextResponse.json({ success: true, message: 'Document removed' });
}
