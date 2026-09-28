// ─────────────────────────────────────────────────────────────────────────────
// POST /api/documents/[id]/process
// Triggers OCR and medical extraction for an uploaded document
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';
import { documentStorage } from '@/services/documents/documentStorageService';
import { documentProcessor } from '@/services/documents/documentProcessor';

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const docId = params.id;
    const found = repo.getDocument(docId);

    if (!found) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const { document: currentDoc, caseId } = found;

    // Retrieve file data from storage if available
    let base64Data: string | undefined = undefined;
    if (currentDoc.storageReference) {
      const stored = await documentStorage.getDocument(currentDoc.storageReference);
      if (stored) {
        base64Data = stored.data;
      }
    }

    const result = await documentProcessor.processDocument({
      caseId,
      patientId: currentDoc.patientId,
      filename: currentDoc.filename,
      mimeType: currentDoc.fileType,
      fileSize: currentDoc.fileSize,
      documentType: currentDoc.documentType,
      base64Data,
      preloadedStorageRef: currentDoc.storageReference,
      previewUrl: currentDoc.previewUrl,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Document processing failed', document: result.document },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      document: result.document,
      conflicts: result.conflicts || [],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Processing error';
    return NextResponse.json({ error: `Internal processing error: ${msg}` }, { status: 500 });
  }
}
