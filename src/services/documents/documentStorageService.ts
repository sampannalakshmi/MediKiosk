// ─────────────────────────────────────────────────────────────────────────────
// MediKiosk — Document Storage Service Abstraction (Phase 3)
// Provider-agnostic storage interface for medical documents
// ─────────────────────────────────────────────────────────────────────────────

export interface StoredDocumentPayload {
  data: string; // base64 encoded or data URI
  mimeType: string;
  filename: string;
  size: number;
  createdAt: string;
}

export interface SaveDocumentResult {
  storageReference: string;
  previewUrl: string;
  size: number;
}

export interface DocumentStorageService {
  saveDocument(
    file: {
      buffer?: Buffer | ArrayBuffer;
      base64?: string;
      filename: string;
      mimeType: string;
    }
  ): Promise<SaveDocumentResult>;

  getDocument(storageReference: string): Promise<StoredDocumentPayload | null>;

  deleteDocument(storageReference: string): Promise<boolean>;
}

/**
 * Prototype In-Memory Storage
 * Stores documents in memory cache with data URI preview capability.
 * 
 * Production Boundary Note:
 * In a production hospital setup, replace this class with an S3 / Google Cloud Storage /
 * hospital PACS / VNA adapter featuring at-rest AES-256 encryption, HIPAA/ABDM-compliant
 * access logs, pre-signed short-lived read URLs, and patient consent verification.
 */
class MemoryDocumentStorageService implements DocumentStorageService {
  private store = new Map<string, StoredDocumentPayload>();

  async saveDocument(file: {
    buffer?: Buffer | ArrayBuffer;
    base64?: string;
    filename: string;
    mimeType: string;
  }): Promise<SaveDocumentResult> {
    const storageReference = `doc-store-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    let base64Data = '';
    let size = 0;

    if (file.base64) {
      // Remove any prefix data URL if present for clean storage
      const matches = file.base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches[2]) {
        base64Data = matches[2];
      } else {
        base64Data = file.base64;
      }
      size = Math.round((base64Data.length * 3) / 4);
    } else if (file.buffer) {
      const buf = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);
      base64Data = buf.toString('base64');
      size = buf.length;
    }

    const payload: StoredDocumentPayload = {
      data: base64Data,
      mimeType: file.mimeType,
      filename: file.filename,
      size,
      createdAt: new Date().toISOString(),
    };

    this.store.set(storageReference, payload);

    // Create a data URL preview for client-side rendering
    const previewUrl = `data:${file.mimeType};base64,${base64Data}`;

    return {
      storageReference,
      previewUrl,
      size,
    };
  }

  async getDocument(storageReference: string): Promise<StoredDocumentPayload | null> {
    const doc = this.store.get(storageReference);
    return doc ?? null;
  }

  async deleteDocument(storageReference: string): Promise<boolean> {
    return this.store.delete(storageReference);
  }
}

// Global singleton for Next.js hot-reload persistence
declare global {
  // eslint-disable-next-line no-var
  var __medikiosk_document_storage: DocumentStorageService | undefined;
}

export const documentStorage: DocumentStorageService =
  globalThis.__medikiosk_document_storage ??
  (globalThis.__medikiosk_document_storage = new MemoryDocumentStorageService());
