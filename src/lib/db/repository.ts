// ─────────────────────────────────────────────────────────────────────────────
// MediKiosk — In-Memory Repository (singleton)
//
// No PostgreSQL in prototype. Uses global for Next.js hot-reload stability.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  ConsultationCase,
  Patient,
  RedFlagAlert,
  SOCRATESAbdominalHistory,
} from '@/types/clinical';

// ── Global singleton guard ───────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __medikiosk_repo: Repository | undefined;
}

class Repository {
  private patients = new Map<string, Patient>();
  private cases = new Map<string, ConsultationCase>();

  constructor() {
    this.seed();
  }

  // ── Patients ───────────────────────────────────────────────────────────────

  upsertPatient(p: Patient): Patient {
    this.patients.set(p.id, p);
    return p;
  }

  getPatient(id: string): Patient | undefined {
    return this.patients.get(id);
  }

  listPatients(): Patient[] {
    return Array.from(this.patients.values());
  }

  // ── Cases ──────────────────────────────────────────────────────────────────

  createCase(c: ConsultationCase): ConsultationCase {
    this.cases.set(c.id, c);
    return c;
  }

  getCase(id: string): ConsultationCase | undefined {
    const c = this.cases.get(id);
    if (!c) return undefined;
    return { ...c, patient: this.patients.get(c.patientId) };
  }

  updateCase(id: string, updates: Partial<ConsultationCase>): ConsultationCase | null {
    const existing = this.cases.get(id);
    if (!existing) return null;
    const updated: ConsultationCase = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    this.cases.set(id, updated);
    return { ...updated, patient: this.patients.get(updated.patientId) };
  }

  listCases(): ConsultationCase[] {
    return Array.from(this.cases.values()).map((c) => ({
      ...c,
      patient: this.patients.get(c.patientId),
    }));
  }

  // ── Seed ───────────────────────────────────────────────────────────────────

  private seed() {
    // Patient A
    const pA: Patient = {
      id: 'patient-001',
      name: 'Ramesh Verma',
      age: 45,
      gender: 'male',
      language: 'te',
      createdAt: '2026-09-01T08:00:00Z',
    };
    this.patients.set(pA.id, pA);

    const socA: SOCRATESAbdominalHistory = {
      site: 'Right iliac fossa',
      onset: 'gradual',
      onsetDuration: '2 days',
      character: 'dull aching',
      nausea: true,
      fever: true,
      feverDegree: '38.5°C',
      severity: 6,
    };

    this.cases.set('case-demo-001', {
      id: 'case-demo-001',
      patientId: 'patient-001',
      chiefComplaint: 'abdominal pain',
      language: 'te',
      interactionMode: 'voice',
      status: 'pending_review',
      priority: 'MEDIUM',
      socratesHistory: socA,
      ayushHistory: {},
      documents: [],
      timeline: [
        {
          date: '2026-09-01',
          type: 'consultation',
          description: 'Initial presentation with right iliac fossa pain',
          source: 'interview',
        },
      ],
      redFlags: [],
      evidenceMap: {},
      createdAt: '2026-09-01T08:00:00Z',
      updatedAt: '2026-09-01T08:30:00Z',
    });

    // Patient B — high priority with pre-seeded red flags
    const pB: Patient = {
      id: 'patient-002',
      name: 'Sunita Devi',
      age: 28,
      gender: 'female',
      language: 'hi',
      createdAt: '2026-09-01T09:00:00Z',
    };
    this.patients.set(pB.id, pB);

    const rfB: RedFlagAlert[] = [
      {
        category: 'PREGNANCY_ACUTE',
        severity: 'CRITICAL',
        label: 'Possible Ectopic / Acute Pregnancy Emergency',
        description: 'Severe acute abdominal pain in female of reproductive age with haemodynamic instability signs.',
        triggeredBy: ['severity >= 9', 'gender = female', 'age 15–45'],
        recommendedAction: 'Immediate surgical review. Confirm pregnancy status (urine hCG). IV access.',
        timestamp: new Date().toISOString(),
      },
      {
        category: 'HEMODYNAMIC_SHOCK',
        severity: 'CRITICAL',
        label: 'Haemodynamic Instability',
        description: 'Severity 9/10 with sudden onset — haemodynamic shock cannot be excluded.',
        triggeredBy: ['severity >= 9', 'onset = sudden'],
        recommendedAction: 'Immediate assessment. Check BP/HR. IV fluids. Surgical consult.',
        timestamp: new Date().toISOString(),
      },
    ];

    const socB: SOCRATESAbdominalHistory = {
      site: 'Lower abdomen',
      onset: 'sudden',
      character: 'sharp',
      severity: 9,
      nausea: true,
      vomiting: true,
    };

    this.cases.set('case-demo-002', {
      id: 'case-demo-002',
      patientId: 'patient-002',
      chiefComplaint: 'severe abdominal pain',
      language: 'hi',
      interactionMode: 'text',
      status: 'pending_review',
      priority: 'CRITICAL',
      socratesHistory: socB,
      ayushHistory: {},
      documents: [],
      timeline: [],
      redFlags: rfB,
      evidenceMap: {},
      createdAt: '2026-09-01T09:00:00Z',
      updatedAt: '2026-09-01T09:05:00Z',
    });
  }
}

export const repo: Repository =
  globalThis.__medikiosk_repo ?? (globalThis.__medikiosk_repo = new Repository());

export const DEMO_USERS = [
  { id: 'patient-001', name: 'Ramesh Verma' },
  { id: 'patient-002', name: 'Sunita Devi' },
];
