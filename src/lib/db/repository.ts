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
  TimelineEvent,
  EvidenceSource,
  AYUSHHistory,
} from '@/types/clinical';
import type { MedicalDocument, DocumentExtraction, ClinicalConflict } from '@/types/document';
import { SYNTHETIC_DEMO_DOCUMENTS } from '@/services/documents/demoDocuments';

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

  // ── Documents ──────────────────────────────────────────────────────────────

  getDocument(docId: string): { document: MedicalDocument; caseId: string } | undefined {
    for (const c of Array.from(this.cases.values())) {
      const doc = (c.documents || []).find((d) => d.id === docId);
      if (doc) return { document: doc, caseId: c.id };
    }
    return undefined;
  }

  updateDocument(docId: string, updates: Partial<MedicalDocument>): MedicalDocument | null {
    for (const c of Array.from(this.cases.values())) {
      const docIndex = (c.documents || []).findIndex((d) => d.id === docId);
      if (docIndex >= 0) {
        const existing = c.documents[docIndex];
        const updatedDoc: MedicalDocument = { ...existing, ...updates };
        c.documents[docIndex] = updatedDoc;
        return updatedDoc;
      }
    }
    return null;
  }

  updateDocumentExtraction(
    docId: string,
    extractionId: string,
    updates: Partial<DocumentExtraction>
  ): DocumentExtraction | null {
    for (const c of Array.from(this.cases.values())) {
      const doc = (c.documents || []).find((d) => d.id === docId);
      if (doc) {
        const extIndex = doc.extractions.findIndex((e) => e.id === extractionId);
        if (extIndex >= 0) {
          const updated = { ...doc.extractions[extIndex], ...updates };
          doc.extractions[extIndex] = updated;
          return updated;
        }
      }
    }
    return null;
  }

  // ── Reset ──────────────────────────────────────────────────────────────────
  reset() {
    this.patients.clear();
    this.cases.clear();
    this.seed();
  }

  // ── Seed ───────────────────────────────────────────────────────────────────

  private seed() {
    // ── Patient A: Ramesh Verma ──────────────────────────────────────────────
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
      relevantMedications: ['Amlodipine 10 mg once daily', 'Pantoprazole 40 mg'],
      relevantMedicationsDetails: 'Patient reported taking Amlodipine 10 mg in the morning for hypertension',
      previousAbdominalSurgery: true,
      previousAbdominalSurgeryDetails: 'Appendectomy 2012',
    };

    // Pre-seed Demo Document 1: Blood Report
    const doc1Demo = SYNTHETIC_DEMO_DOCUMENTS[0];
    const doc1: MedicalDocument = {
      id: 'doc-demo-001',
      patientId: 'patient-001',
      consultationId: 'case-demo-001',
      filename: doc1Demo.filename,
      fileType: doc1Demo.mimeType,
      fileSize: 245000,
      storageReference: doc1Demo.id,
      documentType: doc1Demo.documentType,
      uploadedAt: '2026-09-12T10:15:00Z',
      processedAt: '2026-09-12T10:16:00Z',
      pageCount: 1,
      ocrText: doc1Demo.rawOcrText,
      previewUrl: `data:image/svg+xml;utf8,${encodeURIComponent(doc1Demo.previewSvg)}`,
      documentDate: doc1Demo.documentDate,
      facilityName: doc1Demo.facility,
      extractionConfidence: 0.96,
      processingStatus: 'ready_for_review',
      reviewStatus: 'verified',
      summary: 'Complete Blood Count showing mild microcytic anemia (Hb 10.2 g/dL) and reactive leukocytosis (WBC 11,500). Normal platelets.',
      extractions: [
        {
          id: 'ext-doc1-1',
          documentId: 'doc-demo-001',
          pageNumber: 1,
          category: 'investigation',
          field: 'hemoglobin',
          value: '10.2 g/dL',
          rawValue: '10.2',
          status: 'confirmed',
          confidence: 0.95,
          sourceText: 'Hemoglobin (Hb) 10.2 g/dL (Ref: 13.0 - 17.0) LOW',
          unit: 'g/dL',
          referenceRange: '13.0 - 17.0',
          abnormalFlag: 'abnormal',
          timestamp: '2026-09-12T10:16:00Z',
        },
        {
          id: 'ext-doc1-2',
          documentId: 'doc-demo-001',
          pageNumber: 1,
          category: 'investigation',
          field: 'total_wbc_count',
          value: '11,500 /cumm',
          rawValue: '11500',
          status: 'confirmed',
          confidence: 0.92,
          sourceText: 'Total WBC Count (TLC) 11,500 /cumm (Ref: 4,000 - 11,000) HIGH',
          unit: '/cumm',
          referenceRange: '4,000 - 11,000',
          abnormalFlag: 'abnormal',
          timestamp: '2026-09-12T10:16:00Z',
        },
        {
          id: 'ext-doc1-3',
          documentId: 'doc-demo-001',
          pageNumber: 1,
          category: 'investigation',
          field: 'platelet_count',
          value: '220,000 /cumm',
          rawValue: '220000',
          status: 'confirmed',
          confidence: 0.94,
          sourceText: 'Platelet Count 220,000 /cumm (Ref: 150,000 - 450,000) NORMAL',
          unit: '/cumm',
          referenceRange: '150,000 - 450,000',
          abnormalFlag: 'normal',
          timestamp: '2026-09-12T10:16:00Z',
        },
      ],
    };

    // Pre-seed Demo Document 2: Prescription (with intentional dosage discrepancy)
    const doc2Demo = SYNTHETIC_DEMO_DOCUMENTS[1];
    const doc2: MedicalDocument = {
      id: 'doc-demo-002',
      patientId: 'patient-001',
      consultationId: 'case-demo-001',
      filename: doc2Demo.filename,
      fileType: doc2Demo.mimeType,
      fileSize: 180000,
      storageReference: doc2Demo.id,
      documentType: doc2Demo.documentType,
      uploadedAt: '2026-07-02T11:00:00Z',
      processedAt: '2026-07-02T11:02:00Z',
      pageCount: 1,
      ocrText: doc2Demo.rawOcrText,
      previewUrl: `data:image/svg+xml;utf8,${encodeURIComponent(doc2Demo.previewSvg)}`,
      documentDate: doc2Demo.documentDate,
      facilityName: doc2Demo.facility,
      extractionConfidence: 0.95,
      processingStatus: 'ready_for_review',
      reviewStatus: 'verified',
      summary: 'Prescription for Hypertension and Dyspepsia: Amlodipine 5 mg OD, Pantoprazole 40 mg OD, Paracetamol 500 mg SOS.',
      extractions: [
        {
          id: 'ext-doc2-1',
          documentId: 'doc-demo-002',
          pageNumber: 1,
          category: 'medication',
          field: 'amlodipine',
          value: 'Amlodipine 5 mg — 1 tablet Once Daily',
          rawValue: '5 mg',
          status: 'confirmed',
          confidence: 0.96,
          sourceText: 'Tab. AMLODIPINE 5 mg Sig: 1 tablet Once Daily (Morning after food)',
          timestamp: '2026-07-02T11:02:00Z',
        },
        {
          id: 'ext-doc2-2',
          documentId: 'doc-demo-002',
          pageNumber: 1,
          category: 'medication',
          field: 'pantoprazole',
          value: 'Pantoprazole 40 mg — 1 tablet Once Daily',
          rawValue: '40 mg',
          status: 'confirmed',
          confidence: 0.95,
          sourceText: 'Tab. PANTOPRAZOLE 40 mg Sig: 1 tablet Once Daily (Before breakfast)',
          timestamp: '2026-07-02T11:02:00Z',
        },
        {
          id: 'ext-doc2-3',
          documentId: 'doc-demo-002',
          pageNumber: 1,
          category: 'condition',
          field: 'hypertension',
          value: 'Essential Hypertension',
          rawValue: 'Essential Hypertension',
          status: 'confirmed',
          confidence: 0.94,
          sourceText: 'Diagnosis: Essential Hypertension, Dyspepsia',
          timestamp: '2026-07-02T11:02:00Z',
        },
      ],
    };

    // Pre-seed Demo Document 3: Gastroenterology Consultation Note
    const doc3Demo = SYNTHETIC_DEMO_DOCUMENTS[2];
    const doc3: MedicalDocument = {
      id: 'doc-demo-003',
      patientId: 'patient-001',
      consultationId: 'case-demo-001',
      filename: doc3Demo.filename,
      fileType: doc3Demo.mimeType,
      fileSize: 310000,
      storageReference: doc3Demo.id,
      documentType: doc3Demo.documentType,
      uploadedAt: '2026-08-08T14:30:00Z',
      processedAt: '2026-08-08T14:32:00Z',
      pageCount: 1,
      ocrText: doc3Demo.rawOcrText,
      previewUrl: `data:image/svg+xml;utf8,${encodeURIComponent(doc3Demo.previewSvg)}`,
      documentDate: doc3Demo.documentDate,
      facilityName: doc3Demo.facility,
      extractionConfidence: 0.94,
      processingStatus: 'ready_for_review',
      reviewStatus: 'verified',
      summary: 'Gastroenterology OPD note. Epigastric burning post-meals. Ultrasound reveals Grade 1 Fatty Liver, normal gallbladder. Past appendectomy (2012).',
      extractions: [
        {
          id: 'ext-doc3-1',
          documentId: 'doc-demo-003',
          pageNumber: 1,
          category: 'procedure',
          field: 'appendectomy',
          value: 'Appendectomy (2012, laparoscopic)',
          rawValue: 'Appendectomy in 2012',
          status: 'confirmed',
          confidence: 0.95,
          sourceText: 'Appendectomy performed in 2012 (uncomplicated laparoscopic procedure)',
          timestamp: '2026-08-08T14:32:00Z',
        },
        {
          id: 'ext-doc3-2',
          documentId: 'doc-demo-003',
          pageNumber: 1,
          category: 'investigation',
          field: 'ultrasound_abdomen',
          value: 'Grade 1 Fatty Liver (hepatic steatosis)',
          rawValue: 'Mild diffuse increased echogenicity',
          status: 'confirmed',
          confidence: 0.92,
          sourceText: 'Ultrasonography (USG) Abdomen: Liver: Mild diffuse increased echogenicity consistent with Grade 1 Fatty Liver.',
          timestamp: '2026-08-08T14:32:00Z',
        },
        {
          id: 'ext-doc3-3',
          documentId: 'doc-demo-003',
          pageNumber: 1,
          category: 'condition',
          field: 'haematemesis',
          value: 'denied',
          rawValue: 'Haematemesis: DENIED',
          status: 'confirmed',
          confidence: 0.98,
          isDenied: true,
          sourceText: 'Haematemesis: DENIED. No blood in vomitus.',
          timestamp: '2026-08-08T14:32:00Z',
        },
      ],
    };

    // Intentional Demonstration Conflict (Item 16 & 27)
    const conflictsA: ClinicalConflict[] = [
      {
        id: 'conflict-demo-amlo',
        field: 'Amlodipine Dosage Discrepancy',
        interviewValue: '10 mg once daily (reported during intake interview)',
        documentValue: '5 mg once daily (stated in dr_rao_prescription_02jul2026.png)',
        documentId: 'doc-demo-002',
        documentName: 'dr_rao_prescription_02jul2026.png',
        description: 'Patient reported taking Amlodipine 10 mg during intake, whereas Dr. Rao prescription specifies Amlodipine 5 mg Once Daily. Clinician verification required before dosing.',
        requiresVerification: true,
        resolved: false,
      },
    ];

    const timelineA: TimelineEvent[] = [
      {
        date: '2012-06-15',
        type: 'surgery',
        description: 'Laparoscopic Appendectomy (Document: gastro_consultation_summary_08aug2026.pdf)',
        source: 'document',
        documentId: 'doc-demo-003',
        documentName: 'gastro_consultation_summary_08aug2026.pdf',
        page: 1,
      },
      {
        date: '2026-07-02',
        type: 'medication_prescribed',
        description: 'Prescription: Amlodipine 5mg OD & Pantoprazole 40mg OD (Apollo Clinic)',
        source: 'document',
        documentId: 'doc-demo-002',
        documentName: 'dr_rao_prescription_02jul2026.png',
        page: 1,
      },
      {
        date: '2026-08-08',
        type: 'consultation',
        description: 'Gastroenterology Consultation & Ultrasound: Grade 1 Fatty Liver (City General Hospital)',
        source: 'document',
        documentId: 'doc-demo-003',
        documentName: 'gastro_consultation_summary_08aug2026.pdf',
        page: 1,
      },
      {
        date: '2026-09-01',
        type: 'intake_interview',
        description: 'Patient Kiosk Intake: 2-day history of right iliac fossa pain (Severity: 6/10, Fever: 38.5°C)',
        source: 'interview',
      },
      {
        date: '2026-09-12',
        type: 'lab_investigation',
        description: 'Blood test: Hemoglobin 10.2 g/dL (Mild Anemia), WBC 11,500 /cumm (Apex Diagnostics)',
        source: 'document',
        documentId: 'doc-demo-001',
        documentName: 'apex_cbc_blood_report_12sep2026.pdf',
        page: 1,
      },
    ];

    const evidenceMapA: Record<string, EvidenceSource> = {
      'document.doc-demo-001.hemoglobin': {
        field: 'hemoglobin',
        value: '10.2 g/dL',
        source: 'document',
        original_response: 'Hemoglobin (Hb) 10.2 g/dL (Ref: 13.0 - 17.0) LOW',
        language: 'en',
        timestamp: '2026-09-12T10:16:00Z',
        confidence: 0.95,
        document_id: 'doc-demo-001',
        page_number: 1,
        snippet: 'Hemoglobin (Hb) 10.2 g/dL (Ref: 13.0 - 17.0) LOW (Mild Anemia)',
      },
      'document.doc-demo-002.amlodipine': {
        field: 'amlodipine',
        value: 'Amlodipine 5 mg OD',
        source: 'document',
        original_response: 'Tab. AMLODIPINE 5 mg Sig: 1 tablet Once Daily',
        language: 'en',
        timestamp: '2026-07-02T11:02:00Z',
        confidence: 0.96,
        document_id: 'doc-demo-002',
        page_number: 1,
        snippet: '1. Tab. AMLODIPINE 5 mg Sig: 1 tablet Once Daily (Morning after food)',
      },
      'document.doc-demo-003.appendectomy': {
        field: 'appendectomy',
        value: 'Appendectomy (2012)',
        source: 'document',
        original_response: 'Appendectomy performed in 2012 (uncomplicated laparoscopic procedure)',
        language: 'en',
        timestamp: '2026-08-08T14:32:00Z',
        confidence: 0.95,
        document_id: 'doc-demo-003',
        page_number: 1,
        snippet: 'Appendectomy performed in 2012 (uncomplicated laparoscopic procedure).',
      },
    };

    const ayushA: AYUSHHistory = {
      prakriti: 'Pitta-Vata predominantly',
      agni: 'Vishama Agni (irregular digestion with post-prandial bloating)',
      dietaryHabits: 'Irregular meal timings, spicy and fried foods (Ushna, Tikshna ahara)',
      lifestyle: 'Sedentary desk job with high occupational stress',
      seasonalInfluence: 'Aggravated in Varsha ritu (monsoon season)',
      previousAyurvedicTreatment: true,
      previousAyurvedicDetails: 'Avipattikar Churna 1 tsp at bedtime taken for 2 weeks with temporary relief',
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
      ayushHistory: ayushA,
      documents: [doc1, doc2, doc3],
      timeline: timelineA,
      redFlags: [],
      evidenceMap: evidenceMapA,
      conflicts: conflictsA,
      preliminarySummary: `CLINICAL HISTORY SUMMARY (AI-assisted, for physician review only)
Chief Complaint: Abdominal pain
Patient: Ramesh Verma (45M)

--- SOCRATES Assessment ---
• Site: Right iliac fossa
• Onset: Gradual (2 days)
• Character: Dull aching
• Severity: 6/10
• Associated Symptoms: Nausea (present), Fever (38.5°C)
• Relevant Medications: Amlodipine (discrepancy noted), Pantoprazole

--- DOCUMENT FINDINGS ---
• Blood Report (12-Sep-2026): Hemoglobin 10.2 g/dL (Mild Anemia), WBC 11,500 /cumm
• Prescription (02-Jul-2026): Amlodipine 5 mg OD, Pantoprazole 40 mg OD
• Consultation (08-Aug-2026): Ultrasound showed Grade 1 Fatty Liver. Normal gallbladder. Past appendectomy (2012).

⚠ INFORMATION CONFLICT:
Patient reported taking Amlodipine 10 mg, while prescription lists Amlodipine 5 mg. Clinician verification required.

NOTE: AI-generated draft — clinician verification and examination required before diagnosis.`,
      createdAt: '2026-09-01T08:00:00Z',
      updatedAt: '2026-09-12T10:30:00Z',
    });

    // ── Patient B: Sunita Devi (Critical Emergency with Critical STAT Lab) ────
    const pB: Patient = {
      id: 'patient-002',
      name: 'Sunita Devi',
      age: 28,
      gender: 'female',
      language: 'hi',
      createdAt: '2026-09-01T09:00:00Z',
    };
    this.patients.set(pB.id, pB);

    const doc4Demo = SYNTHETIC_DEMO_DOCUMENTS[3];
    const doc4: MedicalDocument = {
      id: 'doc-demo-004',
      patientId: 'patient-002',
      consultationId: 'case-demo-002',
      filename: doc4Demo.filename,
      fileType: doc4Demo.mimeType,
      fileSize: 220000,
      storageReference: doc4Demo.id,
      documentType: doc4Demo.documentType,
      uploadedAt: '2026-09-28T07:45:00Z',
      processedAt: '2026-09-28T07:46:00Z',
      pageCount: 1,
      ocrText: doc4Demo.rawOcrText,
      previewUrl: `data:image/svg+xml;utf8,${encodeURIComponent(doc4Demo.previewSvg)}`,
      documentDate: doc4Demo.documentDate,
      facilityName: doc4Demo.facility,
      extractionConfidence: 0.98,
      processingStatus: 'ready_for_review',
      reviewStatus: 'needs_review',
      summary: 'Emergency STAT Lab: Severe Anemia (Hemoglobin 5.8 g/dL) and Thrombocytopenia (Platelets 42,000 /cumm). Emergency surgical/obstetric directive.',
      extractions: [
        {
          id: 'ext-doc4-1',
          documentId: 'doc-demo-004',
          pageNumber: 1,
          category: 'investigation',
          field: 'hemoglobin',
          value: '5.8 g/dL',
          rawValue: '5.8',
          status: 'confirmed',
          confidence: 0.99,
          sourceText: 'Hemoglobin (Hb) 5.8 g/dL (Ref: 12.0 - 15.0) *** CRITICAL LOW ***',
          unit: 'g/dL',
          referenceRange: '12.0 - 15.0',
          abnormalFlag: 'critical',
          timestamp: '2026-09-28T07:46:00Z',
        },
        {
          id: 'ext-doc4-2',
          documentId: 'doc-demo-004',
          pageNumber: 1,
          category: 'investigation',
          field: 'platelet_count',
          value: '42,000 /cumm',
          rawValue: '42000',
          status: 'confirmed',
          confidence: 0.98,
          sourceText: 'Platelet Count 42,000 /cumm (Ref: 150,000 - 450,000) *** CRITICAL LOW ***',
          unit: '/cumm',
          referenceRange: '150,000 - 450,000',
          abnormalFlag: 'critical',
          timestamp: '2026-09-28T07:46:00Z',
        },
      ],
    };

    const rfB: RedFlagAlert[] = [
      {
        category: 'PREGNANCY_ACUTE',
        severity: 'CRITICAL',
        label: 'Acute Emergency Directive: Rule Out Ruptured Ectopic / Internal Bleed',
        description: 'Document and clinical intake indicate severe acute pain in reproductive age female with profound anemia.',
        triggeredBy: ['severity >= 9', 'gender = female', 'emergency directive'],
        recommendedAction: 'Immediate emergency gynaecological & surgical consult. Cross-match 2 units PRBC. Bedside ultrasound.',
        timestamp: '2026-09-28T07:50:00Z',
        sourceType: 'document',
        sourceDocumentId: 'doc-demo-004',
        sourceSnippet: 'Severe decompensated anemia with marked thrombocytopenia. Rule out ruptured ectopic pregnancy.',
      },
      {
        category: 'GI_BLEED',
        severity: 'CRITICAL',
        label: 'Severe Critical Anemia Detected in Document',
        description: 'Documented Hemoglobin 5.8 g/dL (< 7.0 g/dL critical cutoff) indicating acute decompensation.',
        triggeredBy: ['hemoglobin = 5.8 g/dL (< 7.0)'],
        recommendedAction: 'Immediate blood transfusion. Establish two large-bore IV lines. Urgent ICU / surgical admission.',
        timestamp: '2026-09-28T07:50:00Z',
        sourceType: 'document',
        sourceDocumentId: 'doc-demo-004',
        sourceSnippet: 'Hemoglobin (Hb) 5.8 g/dL (Ref: 12.0 - 15.0) *** CRITICAL LOW ***',
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
      chiefComplaint: 'severe lower abdominal pain',
      language: 'hi',
      interactionMode: 'text',
      status: 'pending_review',
      priority: 'CRITICAL',
      socratesHistory: socB,
      ayushHistory: {},
      documents: [doc4],
      timeline: [
        {
          date: '2026-09-28',
          type: 'emergency_lab',
          description: 'Emergency STAT CBC: Hemoglobin 5.8 g/dL (Critical), Platelets 42,000 /cumm',
          source: 'document',
          documentId: 'doc-demo-004',
          documentName: 'urgent_stat_cbc_critical_anemia.pdf',
          page: 1,
        },
      ],
      redFlags: rfB,
      evidenceMap: {
        'document.doc-demo-004.hemoglobin': {
          field: 'hemoglobin',
          value: '5.8 g/dL',
          source: 'document',
          original_response: 'Hemoglobin (Hb) 5.8 g/dL *** CRITICAL LOW ***',
          language: 'en',
          timestamp: '2026-09-28T07:46:00Z',
          confidence: 0.99,
          document_id: 'doc-demo-004',
          page_number: 1,
          snippet: 'Hemoglobin (Hb) 5.8 g/dL *** CRITICAL LOW ***',
        },
      },
      createdAt: '2026-09-01T09:00:00Z',
      updatedAt: '2026-09-28T07:55:00Z',
    });
  }
}

export const repo: Repository =
  globalThis.__medikiosk_repo ?? (globalThis.__medikiosk_repo = new Repository());

export const DEMO_USERS = [
  { id: 'patient-001', name: 'Ramesh Verma' },
  { id: 'patient-002', name: 'Sunita Devi' },
];
