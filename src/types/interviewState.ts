// ─────────────────────────────────────────────────────────────────────────────
// MediKiosk — Interview State Types (Phase 2)
//
// Tracks the structured, per-field status of a clinical interview.
// FieldStatus must distinguish: unknown / present / denied / uncertain
// ─────────────────────────────────────────────────────────────────────────────

import type { FieldStatus, Language } from './clinical';

// ── Per-field entry in the interview state ───────────────────────────────────

export interface InterviewField {
  status: FieldStatus;
  value?: unknown;              // extracted structured value (if present)
  rawText?: string;             // patient's original words
  language?: Language;          // language the answer was given in
  timestamp?: string;           // ISO-8601 when captured
  confidence?: number;          // 0–1 extraction confidence
  questionId?: string;          // which question surfaced this field
}

// ── Full interview state ─────────────────────────────────────────────────────

export interface ClinicalInterviewState {
  // Tracking
  sessionId: string;
  caseId: string;
  language: Language;
  startedAt: string;
  lastUpdatedAt: string;
  completedAt?: string;

  // Which question the engine is currently on (null = interview complete)
  currentQuestionId: string | null;

  // All fields keyed by field path (mirrors SOCRATESAbdominalHistory keys)
  fields: Record<string, InterviewField>;

  // Ordered list of question IDs that have been asked
  askedQuestions: string[];

  // Ordered list of question IDs that were skipped (reason known from prior answer)
  skippedQuestions: string[];

  // Number of clarification attempts for the current question
  clarificationCount: number;
}

// ── Extraction result returned by the AI extraction service ──────────────────

export interface ExtractionResult {
  /** Field name matching SOCRATESAbdominalHistory keys */
  field: string;
  /** Extracted structured value */
  value: unknown;
  /** 'present' | 'denied' | 'uncertain' */
  status: Exclude<FieldStatus, 'unknown'>;
  /** 0–1 confidence score */
  confidence: number;
  /** Brief reason for the extraction (for audit) */
  reasoning?: string;
}

// ── Response from POST /api/interview/respond ─────────────────────────────────

export interface InterviewRespondResponse {
  /** Updated full state after processing the patient's answer */
  updatedState: ClinicalInterviewState;
  /** Facts extracted from this single answer */
  extractedFacts: ExtractionResult[];
  /** Next question to ask (null if interview is complete) */
  nextQuestion: NextQuestion | null;
  /** Any red flags triggered */
  redFlagsTriggered: import('./clinical').RedFlagAlert[];
  /** Whether the interview is now complete */
  interviewComplete: boolean;
  /** The preliminary summary (only present when interviewComplete = true) */
  preliminarySummary?: string;
}

export interface NextQuestion {
  id: string;
  /** Natural-language question text in the patient's language */
  text: string;
  /** Optional touch options for quick-select answers */
  options?: TouchOption[];
  /** Whether this is a yes/no binary question */
  isBinary: boolean;
  /** Whether this is a numeric scale (0–10) */
  isScale: boolean;
  /** Hint text for voice mode */
  audioHint?: string;
}

export interface TouchOption {
  value: string;
  label: string;            // Display label in the patient's language
  subOptions?: TouchOption[]; // Drill-down options after selection
}
