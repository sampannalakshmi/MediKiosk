// ─────────────────────────────────────────────────────────────────────────────
// MediKiosk — Clinical Types
// ─────────────────────────────────────────────────────────────────────────────

export type Language = 'en' | 'te' | 'hi';
export type InteractionMode = 'voice' | 'text' | 'touch';

// ── Evidence & Confidence ────────────────────────────────────────────────────

export type EvidenceSourceType = 'interview' | 'document' | 'ayush' | 'doctor';

export interface EvidenceSource {
  field: string;
  value: unknown;
  source: EvidenceSourceType;
  original_response: string;
  language: Language;
  timestamp: string;          // ISO-8601
  confidence: number;         // 0–1
  question_id?: string;
}

// ── Clinical Field Status ────────────────────────────────────────────────────

/** Exactly four states — do NOT collapse unknown into null */
export type FieldStatus = 'present' | 'denied' | 'uncertain' | 'unknown';

// ── SOCRATES Abdominal History ────────────────────────────────────────────────

export interface SOCRATESAbdominalHistory {
  // S — Site
  site?: string;
  siteRadiation?: string;

  // O — Onset
  onset?: string;             // e.g. "sudden", "gradual"
  onsetDuration?: string;     // e.g. "2 days"
  onsetContext?: string;      // e.g. "after eating"

  // C — Character
  character?: string;         // e.g. "crampy", "burning", "sharp"

  // R — Radiation
  radiation?: string;

  // A — Associations
  nausea?: boolean;
  vomiting?: boolean;
  vomitingFrequency?: string;
  vomitingContent?: string;   // e.g. "blood", "bile"
  fever?: boolean;
  feverDegree?: string;
  diarrhoea?: boolean;
  constipation?: boolean;
  bloodInStool?: boolean;
  jaundice?: boolean;
  anorexia?: boolean;
  weightLoss?: boolean;
  dysuria?: boolean;
  urinaryFrequency?: boolean;
  vaginalDischarge?: boolean;  // if applicable
  lastMenstrualPeriod?: string;

  // T — Time
  timeCourse?: string;        // "constant", "intermittent", "colicky"
  progressionTrend?: string;  // "worsening", "improving", "stable"

  // E — Exacerbating / Relieving
  exacerbatingFactors?: string[];
  relievingFactors?: string[];
  relationToFood?: string;
  relationToPosture?: string;
  relationToDefaecation?: string;

  // S — Severity
  severity?: number;          // 0–10 numeric scale

  // Past & Background
  similarEpisodesBefore?: boolean;
  previousAbdominalSurgery?: boolean;
  previousAbdominalSurgeryDetails?: string;
  relevantMedications?: string[];
  relevantMedicationsDetails?: string;
  allergies?: string;
  alcoholUse?: boolean;
  smokingUse?: boolean;
  familyHistory?: string;
  pregnancyStatus?: string;
}

// ── AYUSH Intake ─────────────────────────────────────────────────────────────

export interface AYUSHHistory {
  prakriti?: string;
  agni?: string;
  lifestyle?: string;
  dietaryHabits?: string;
  seasonalInfluence?: string;
  previousAyurvedicTreatment?: boolean;
  previousAyurvedicDetails?: string;
}

// ── Medical Document ─────────────────────────────────────────────────────────

export interface MedicalDocument {
  id: string;
  filename: string;
  fileType: string;
  uploadedAt: string;
  ocrText?: string;
  structuredData?: Record<string, unknown>;
  documentType?: string;
  summary?: string;
}

// ── Timeline ─────────────────────────────────────────────────────────────────

export interface TimelineEvent {
  date: string;
  type: string;
  description: string;
  source: EvidenceSourceType;
  documentId?: string;
}

// ── Red Flags ────────────────────────────────────────────────────────────────

export type RedFlagSeverity = 'CRITICAL' | 'HIGH' | 'MODERATE';
export type RedFlagCategory =
  | 'HEMODYNAMIC_SHOCK'
  | 'ACUTE_PERITONITIS'
  | 'GI_BLEED'
  | 'SEPSIS'
  | 'PREGNANCY_ACUTE'
  | 'INTRACTABLE_VOMITING';

export interface RedFlagAlert {
  category: RedFlagCategory;
  severity: RedFlagSeverity;
  label: string;
  description: string;
  triggeredBy: string[];
  recommendedAction: string;
  timestamp: string;
}

// ── Doctor Review ─────────────────────────────────────────────────────────────

export interface DoctorReview {
  reviewedAt: string;
  reviewedBy: string;
  edits: Record<string, unknown>;
  notes?: string;
  confirmed: boolean;
  confirmedAt?: string;
}

// ── Patient ──────────────────────────────────────────────────────────────────

export interface Patient {
  id: string;
  name?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  phone?: string;
  language: Language;
  createdAt: string;
}

// ── Consultation Case ─────────────────────────────────────────────────────────

export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type CaseStatus = 'in_progress' | 'pending_review' | 'reviewed' | 'completed';

export interface ConsultationCase {
  id: string;
  patientId: string;
  patient?: Patient;
  chiefComplaint: string;
  language: Language;
  interactionMode: InteractionMode;
  status: CaseStatus;
  priority: CasePriority;
  socratesHistory: SOCRATESAbdominalHistory;
  ayushHistory: AYUSHHistory;
  documents: MedicalDocument[];
  timeline: TimelineEvent[];
  redFlags: RedFlagAlert[];
  evidenceMap: Record<string, EvidenceSource>;
  preliminarySummary?: string;
  doctorReview?: DoctorReview;
  createdAt: string;
  updatedAt: string;
  interviewCompletedAt?: string;
}
