// ─────────────────────────────────────────────────────────────────────────────
// MediKiosk — Medical Document Intelligence Types (Phase 3)
// ─────────────────────────────────────────────────────────────────────────────

import type { RedFlagAlert, TimelineEvent } from './clinical';

export type DocumentType =
  | 'prescription'
  | 'lab_report'
  | 'imaging_report'
  | 'discharge_summary'
  | 'previous_consultation'
  | 'medical_certificate'
  | 'other'
  | 'not_sure';

export type ProcessingStatus =
  | 'uploaded'
  | 'validating'
  | 'processing'
  | 'extracting'
  | 'structuring'
  | 'ready_for_review'
  | 'needs_review'
  | 'confirmed'
  | 'failed';

export type ExtractionCategory =
  | 'patient_info'
  | 'medication'
  | 'investigation'
  | 'condition'
  | 'procedure'
  | 'vital_sign'
  | 'allergy'
  | 'instruction';

export type ExtractionStatus =
  | 'extracted'
  | 'needs_review'
  | 'confirmed'
  | 'rejected';

export interface DocumentPage {
  id: string;
  documentId: string;
  pageNumber: number;
  imageReference?: string;
  extractedText: string;
  ocrConfidence: number;
}

export interface DocumentExtraction {
  id: string;
  documentId: string;
  pageNumber: number;
  category: ExtractionCategory;
  field: string;
  value: string;
  rawValue: string;
  normalizedValue?: string;
  status: ExtractionStatus;
  confidence: number; // 0.0 - 1.0
  sourceText: string;
  isDenied?: boolean;
  isUnknown?: boolean;
  unit?: string;
  referenceRange?: string;
  abnormalFlag?: 'normal' | 'abnormal' | 'critical';
  timestamp: string;
}

export interface MedicalDocument {
  id: string;
  patientId: string;
  consultationId: string;
  filename: string;
  fileType: string; // MIME type
  fileSize: number; // Bytes
  storageReference: string; // Storage key or data URL
  documentType: DocumentType;
  uploadedAt: string;
  processedAt?: string;
  pageCount: number;
  ocrText?: string;
  pages?: DocumentPage[];
  extractions: DocumentExtraction[];
  processingStatus: ProcessingStatus;
  extractionConfidence: number; // 0.0 - 1.0
  reviewStatus: 'pending' | 'verified' | 'needs_review' | 'rejected';
  summary?: string;
  error?: string;
  previewUrl?: string;
  documentDate?: string;
  facilityName?: string;
  clinicianName?: string;
}

export interface ClinicalConflict {
  id: string;
  field: string;
  interviewValue: string;
  documentValue: string;
  documentId: string;
  documentName: string;
  description: string;
  requiresVerification: boolean;
  resolved?: boolean;
  resolutionNote?: string;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  fileSize?: number;
  mimeType?: string;
  sanitizedFilename?: string;
}

export interface OCRResult {
  text: string;
  pages: { pageNumber: number; text: string; confidence: number }[];
  overallConfidence: number;
  isUncertain: boolean;
  note?: string;
}

export interface MedicalExtractionResult {
  patientInfo: {
    name?: string;
    age?: number;
    gender?: string;
    date?: string;
  };
  clinicalFacts: DocumentExtraction[];
  summary: string;
  redFlags: RedFlagAlert[];
  timelineEvents: TimelineEvent[];
  conflicts?: ClinicalConflict[];
}
