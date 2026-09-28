// ─────────────────────────────────────────────────────────────────────────────
// MediKiosk — Evidence Service
// ─────────────────────────────────────────────────────────────────────────────

import type { EvidenceSource, Language } from '@/types/clinical';

export function makeInterviewEvidence(
  field: string,
  value: unknown,
  questionId: string,
  originalResponse: string,
  language: Language,
  confidence: number
): EvidenceSource {
  return {
    field,
    value,
    source: 'interview',
    original_response: originalResponse,
    language,
    timestamp: new Date().toISOString(),
    confidence,
    question_id: questionId,
  };
}

export function makeDocumentEvidence(
  field: string,
  value: unknown,
  documentId: string,
  extractedText: string
): EvidenceSource {
  return {
    field,
    value,
    source: 'document',
    original_response: extractedText,
    language: 'en',
    timestamp: new Date().toISOString(),
    confidence: 0.85,
    question_id: documentId,
  };
}

export function makeAyushEvidence(
  field: string,
  value: unknown,
  originalResponse: string,
  language: Language
): EvidenceSource {
  return {
    field,
    value,
    source: 'ayush',
    original_response: originalResponse,
    language,
    timestamp: new Date().toISOString(),
    confidence: 0.7,
  };
}
