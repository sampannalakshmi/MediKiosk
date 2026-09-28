// ─────────────────────────────────────────────────────────────────────────────
// MediKiosk — File Validation Service (Phase 3)
// Server-side validation for medical document uploads
// ─────────────────────────────────────────────────────────────────────────────

import type { FileValidationResult } from '@/types/document';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.pdf',
]);

export function getMaxFileSizeMB(): number {
  const envVal = process.env.MAX_DOCUMENT_SIZE_MB;
  if (envVal) {
    const parsed = parseInt(envVal, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return 10; // Default 10 MB
}

export function getMaxFileSizeBytes(): number {
  return getMaxFileSizeMB() * 1024 * 1024;
}

export function sanitizeFilename(filename: string): string {
  // Strip path traversal and dangerous characters
  const clean = filename
    .replace(/^.*[\\/]/, '') // remove path
    .replace(/[^a-zA-Z0-9._-]/g, '_') // only safe characters
    .trim();
  return clean || `document_${Date.now()}`;
}

export function validateDocumentFile(
  filename: string,
  mimeType: string,
  sizeBytes: number
): FileValidationResult {
  // 1. Check size
  const maxBytes = getMaxFileSizeBytes();
  if (sizeBytes <= 0) {
    return {
      isValid: false,
      error: 'The uploaded file is empty.',
    };
  }

  if (sizeBytes > maxBytes) {
    return {
      isValid: false,
      error: `File size (${(sizeBytes / (1024 * 1024)).toFixed(1)} MB) exceeds the maximum allowed limit of ${getMaxFileSizeMB()} MB.`,
      fileSize: sizeBytes,
      mimeType,
    };
  }

  // 2. Check filename extension
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex === -1) {
    return {
      isValid: false,
      error: 'File has no extension. Please upload a valid JPG, PNG, WEBP, or PDF document.',
    };
  }

  const ext = filename.substring(dotIndex).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      isValid: false,
      error: `Unsupported file extension (${ext}). Supported formats: JPG, JPEG, PNG, WEBP, and PDF.`,
      fileSize: sizeBytes,
      mimeType,
    };
  }

  // 3. Check MIME type (normalized)
  const normMime = (mimeType || '').toLowerCase().trim();
  if (normMime && !ALLOWED_MIME_TYPES.has(normMime)) {
    return {
      isValid: false,
      error: `Unsupported file type (${mimeType}). Please upload an image (JPG, PNG, WEBP) or PDF file.`,
      fileSize: sizeBytes,
      mimeType,
    };
  }

  return {
    isValid: true,
    fileSize: sizeBytes,
    mimeType: normMime || (ext === '.pdf' ? 'application/pdf' : 'image/jpeg'),
    sanitizedFilename: sanitizeFilename(filename),
  };
}
