// ─────────────────────────────────────────────────────────────────────────────
// POST /api/documents/upload
// Handles file uploads, camera captures, and synthetic demo document loads
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { documentStorage } from '@/services/documents/documentStorageService';
import { validateDocumentFile } from '@/services/documents/fileValidationService';
import { SYNTHETIC_DEMO_DOCUMENTS } from '@/services/documents/demoDocuments';
import { repo } from '@/lib/db/repository';
import type { DocumentType, MedicalDocument } from '@/types/document';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let caseId = '';
    let patientId = '';
    let documentType: DocumentType = 'not_sure';
    let filename = '';
    let mimeType = '';
    let fileSize = 0;
    let base64Data: string | undefined = undefined;
    let previewUrl: string | undefined = undefined;
    let storageReference = '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      caseId = body.caseId;
      patientId = body.patientId;
      documentType = body.documentType || 'not_sure';
      const demoDocId = body.demoDocId;

      if (demoDocId) {
        // Load synthetic demo document
        const demo = SYNTHETIC_DEMO_DOCUMENTS.find((d) => d.id === demoDocId);
        if (!demo) {
          return NextResponse.json({ error: 'Demo document not found' }, { status: 404 });
        }
        filename = demo.filename;
        mimeType = demo.mimeType;
        fileSize = 150000;
        storageReference = demo.id;
        documentType = demo.documentType;
        previewUrl = `data:image/svg+xml;utf8,${encodeURIComponent(demo.previewSvg)}`;
      } else {
        filename = body.filename || `document_${Date.now()}.pdf`;
        mimeType = body.mimeType || 'application/pdf';
        base64Data = body.base64Data;
        fileSize = body.fileSize || (base64Data ? Math.round((base64Data.length * 3) / 4) : 1024);
      }
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      caseId = (formData.get('caseId') as string) || '';
      patientId = (formData.get('patientId') as string) || '';
      documentType = ((formData.get('documentType') as string) as DocumentType) || 'not_sure';
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }

      filename = file.name;
      mimeType = file.type || 'application/octet-stream';
      fileSize = file.size;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      base64Data = buffer.toString('base64');
    } else {
      return NextResponse.json({ error: 'Unsupported request content type' }, { status: 400 });
    }

    if (!caseId) {
      return NextResponse.json({ error: 'caseId is required' }, { status: 400 });
    }

    const consultation = repo.getCase(caseId);
    if (!consultation) {
      return NextResponse.json({ error: 'Consultation case not found' }, { status: 404 });
    }

    if (!patientId) {
      patientId = consultation.patientId;
    }

    // Server-side validation
    const validation = validateDocumentFile(filename, mimeType, fileSize);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Persist to document storage abstraction if not already stored
    if (!storageReference && base64Data) {
      const stored = await documentStorage.saveDocument({
        filename: validation.sanitizedFilename || filename,
        mimeType: validation.mimeType || mimeType,
        base64: base64Data,
      });
      storageReference = stored.storageReference;
      previewUrl = stored.previewUrl;
      fileSize = stored.size;
    }

    const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const medicalDoc: MedicalDocument = {
      id: docId,
      patientId,
      consultationId: caseId,
      filename: validation.sanitizedFilename || filename,
      fileType: validation.mimeType || mimeType,
      fileSize,
      storageReference,
      documentType,
      uploadedAt: new Date().toISOString(),
      pageCount: 1,
      extractions: [],
      processingStatus: 'uploaded',
      extractionConfidence: 0,
      reviewStatus: 'pending',
      previewUrl,
    };

    // Attach to case
    const existingDocs = consultation.documents || [];
    repo.updateCase(caseId, {
      documents: [...existingDocs, medicalDoc],
    });

    return NextResponse.json({ success: true, document: medicalDoc }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown upload error';
    return NextResponse.json({ error: `Upload failed: ${msg}` }, { status: 500 });
  }
}
