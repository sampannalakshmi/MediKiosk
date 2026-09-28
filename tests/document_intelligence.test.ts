// ─────────────────────────────────────────────────────────────────────────────
// MediKiosk — Medical Document Intelligence Tests (Phase 3)
// Tests: File Validation, OCR, Clinical Extraction, Evidence, Conflicts, Red Flags
// ─────────────────────────────────────────────────────────────────────────────

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { validateDocumentFile, sanitizeFilename } from '../src/services/documents/fileValidationService';
import { ocrService } from '../src/services/documents/ocrService';
import { medicalExtractionService } from '../src/services/documents/medicalExtractionService';
import { documentProcessor } from '../src/services/documents/documentProcessor';
import { repo } from '../src/lib/db/repository';
import { SYNTHETIC_DEMO_DOCUMENTS } from '../src/services/documents/demoDocuments';

// ── 1. File Validation Tests (Item 30) ────────────────────────────────────────

test('DOC-VAL-1: Valid JPG file passes validation', () => {
  const res = validateDocumentFile('prescription.jpg', 'image/jpeg', 1024 * 500);
  assert.strictEqual(res.isValid, true);
  assert.strictEqual(res.mimeType, 'image/jpeg');
});

test('DOC-VAL-2: Valid PDF file passes validation', () => {
  const res = validateDocumentFile('blood_report.pdf', 'application/pdf', 1024 * 1024 * 2);
  assert.strictEqual(res.isValid, true);
  assert.strictEqual(res.mimeType, 'application/pdf');
});

test('DOC-VAL-3: Invalid file extension rejected', () => {
  const res = validateDocumentFile('medical_records.exe', 'application/x-msdownload', 1024);
  assert.strictEqual(res.isValid, false);
  assert(res.error?.includes('Unsupported file extension'));
});

test('DOC-VAL-4: Oversized file (> 10MB default) rejected', () => {
  const res = validateDocumentFile('scan.pdf', 'application/pdf', 15 * 1024 * 1024);
  assert.strictEqual(res.isValid, false);
  assert(res.error?.includes('exceeds the maximum allowed limit'));
});

test('DOC-VAL-5: Empty file rejected', () => {
  const res = validateDocumentFile('empty.png', 'image/png', 0);
  assert.strictEqual(res.isValid, false);
  assert(res.error?.includes('empty'));
});

test('DOC-VAL-6: Filename sanitization strips path traversal and invalid chars', () => {
  const safe = sanitizeFilename('../../etc/passwd<script>.pdf');
  assert(!safe.includes('/'), 'Should not contain slashes');
  assert(!safe.includes('<'), 'Should not contain angle brackets');
  assert(safe.endsWith('.pdf'), 'Should keep safe extension');
});

// ── 2. OCR / Text Extraction Tests ────────────────────────────────────────────

test('OCR-1: Synthetic blood report matches and extracts high confidence text', async () => {
  const res = await ocrService.extractText({
    storageReference: 'demo-doc-blood-report',
    filename: 'apex_cbc_blood_report_12sep2026.pdf',
    mimeType: 'application/pdf',
  });
  assert(res.text.includes('Hemoglobin'), 'Should extract Hemoglobin');
  assert(res.text.includes('10.2'), 'Should extract 10.2');
  assert.strictEqual(res.isUncertain, false);
  assert(res.overallConfidence >= 0.9);
});

test('OCR-2: Unknown or unreadable document marked as uncertain', async () => {
  const res = await ocrService.extractText({
    storageReference: 'unknown-storage-ref',
    filename: 'unreadable_scan.png',
    mimeType: 'image/png',
  });
  assert.strictEqual(res.isUncertain, true, 'Uncertain OCR must be flagged');
  assert(res.note?.includes('could not be reliably extracted'));
});

// ── 3. Structured Clinical Extraction Tests ───────────────────────────────────

test('CLIN-EXT-1: CBC Blood Report extracts Hb, WBC, Platelets, and Date', async () => {
  const bloodDoc = SYNTHETIC_DEMO_DOCUMENTS[0];
  const res = medicalExtractionService.extractDeterministically(
    bloodDoc.rawOcrText,
    'doc-test-1',
    'lab_report',
    1
  );

  assert(res.clinicalFacts.some(f => f.field === 'hemoglobin' && f.value.includes('10.2')));
  assert(res.clinicalFacts.some(f => f.field === 'total_wbc_count' && f.value.includes('11,500')));
  assert(res.clinicalFacts.some(f => f.field === 'platelet_count' && f.value.includes('220,000')));
  assert.strictEqual(res.patientInfo.date, '12-Sep-2026');
});

test('CLIN-EXT-2: Explicitly denied symptoms stored as isDenied: true (Item 8)', async () => {
  const consultDoc = SYNTHETIC_DEMO_DOCUMENTS[2];
  const res = medicalExtractionService.extractDeterministically(
    consultDoc.rawOcrText,
    'doc-test-2',
    'previous_consultation',
    1
  );

  const vomitFact = res.clinicalFacts.find(f => f.field === 'vomiting');
  assert(vomitFact !== undefined, 'Denied vomiting should be captured');
  assert.strictEqual(vomitFact?.isDenied, true, 'Denied symptom must have isDenied: true');
  assert.strictEqual(vomitFact?.value, 'denied');

  const haemFact = res.clinicalFacts.find(f => f.field === 'haematemesis');
  assert(haemFact !== undefined);
  assert.strictEqual(haemFact?.isDenied, true);
});

test('CLIN-EXT-3: Missing facts are NOT fabricated into "No" (Item 8)', async () => {
  // Document that only mentions blood report parameters — nothing about headache or allergy
  const shortText = `PATIENT REPORT Date: 12-Sep-2026
Hemoglobin: 12.5 g/dL
Total WBC: 6,000 /cumm`;

  const res = medicalExtractionService.extractDeterministically(shortText, 'doc-test-3', 'lab_report', 1);

  // Assert headache or allergy was NOT invented as "No"
  const headacheFact = res.clinicalFacts.find(f => f.field === 'headache');
  assert.strictEqual(headacheFact, undefined, 'Missing symptom must not be fabricated as No');
  const allergyFact = res.clinicalFacts.find(f => f.field === 'allergies');
  assert.strictEqual(allergyFact, undefined, 'Missing allergy must not be fabricated as No');
});

test('CLIN-EXT-4: Prescription extracts medication name, dosage, and frequency', async () => {
  const rxDoc = SYNTHETIC_DEMO_DOCUMENTS[1];
  const res = medicalExtractionService.extractDeterministically(
    rxDoc.rawOcrText,
    'doc-test-4',
    'prescription',
    1
  );

  const amlo = res.clinicalFacts.find(f => f.field === 'amlodipine');
  assert(amlo !== undefined, 'Amlodipine must be extracted');
  assert(amlo!.value.includes('5 mg'));

  const panto = res.clinicalFacts.find(f => f.field === 'pantoprazole');
  assert(panto !== undefined, 'Pantoprazole must be extracted');
  assert(panto!.value.includes('40 mg'));
});

// ── 4. Deterministic Red Flags from Documents (Item 18) ───────────────────────

test('DOC-RF-1: Critical low hemoglobin (< 7.0 g/dL) triggers CRITICAL alert', () => {
  const criticalDoc = SYNTHETIC_DEMO_DOCUMENTS[3];
  const res = medicalExtractionService.extractDeterministically(
    criticalDoc.rawOcrText,
    'doc-crit-1',
    'lab_report',
    1
  );

  const criticalAnemiaAlert = res.redFlags.find(rf => rf.category === 'GI_BLEED' && rf.severity === 'CRITICAL');
  assert(criticalAnemiaAlert !== undefined, 'Severe anemia < 7.0 g/dL must trigger CRITICAL alert');
  assert(criticalAnemiaAlert!.description.includes('5.8 g/dL'));
});

test('DOC-RF-2: Critical thrombocytopenia (< 50,000 /cumm) triggers CRITICAL alert', () => {
  const criticalDoc = SYNTHETIC_DEMO_DOCUMENTS[3];
  const res = medicalExtractionService.extractDeterministically(
    criticalDoc.rawOcrText,
    'doc-crit-2',
    'lab_report',
    1
  );

  const pltAlert = res.redFlags.find(rf => rf.category === 'HEMODYNAMIC_SHOCK' && rf.severity === 'CRITICAL');
  assert(pltAlert !== undefined, 'Platelets < 50,000 must trigger CRITICAL alert');
  assert(pltAlert!.description.includes('42,000'));
});

// ── 5. Evidence Linking & Conflict Detection (Item 10 & 16) ───────────────────

test('EVID-1: Every extracted fact retains source snippet and page', async () => {
  const bloodDoc = SYNTHETIC_DEMO_DOCUMENTS[0];
  const res = medicalExtractionService.extractDeterministically(bloodDoc.rawOcrText, 'doc-evid', 'lab_report', 1);

  for (const fact of res.clinicalFacts) {
    assert(fact.sourceText.length > 0, `Fact ${fact.field} must retain sourceText`);
    assert.strictEqual(fact.pageNumber, 1, `Fact ${fact.field} must have page number`);
    assert(fact.confidence > 0, `Fact ${fact.field} must have confidence score`);
  }
});

test('CONF-1: Clinical conflict detected when patient interview dosage differs from prescription', async () => {
  // Demo case 1 has patient reporting Amlodipine 10mg
  const processResult = await documentProcessor.processDocument({
    caseId: 'case-demo-001',
    patientId: 'patient-001',
    filename: 'dr_rao_prescription_02jul2026.png',
    mimeType: 'image/png',
    fileSize: 180000,
    documentType: 'prescription',
    base64Data: 'dummy',
    preloadedStorageRef: 'demo-doc-prescription',
  });

  assert(processResult.success, 'Document processing should succeed');
  assert(processResult.conflicts && processResult.conflicts.length > 0, 'Should detect Amlodipine dosage discrepancy');
  const amloConflict = processResult.conflicts!.find(c => c.field.includes('Amlodipine'));
  assert(amloConflict !== undefined);
  assert(amloConflict!.interviewValue.includes('10 mg'));
  assert(amloConflict!.documentValue.includes('5 mg'));
  assert.strictEqual(amloConflict!.requiresVerification, true);
});

// ── 6. Repository Integration & Persistence (Item 30) ─────────────────────────

test('REPO-DOC-1: Pre-seeded demo cases have documents and timeline', () => {
  const caseA = repo.getCase('case-demo-001');
  assert(caseA !== undefined);
  assert(caseA!.documents.length >= 3, 'Demo case 1 should have 3 pre-seeded documents');
  assert(caseA!.timeline.length >= 4, 'Demo case 1 should have chronological timeline');
  assert(caseA!.conflicts && caseA!.conflicts.length > 0, 'Demo case 1 should have pre-seeded conflict');
});

test('REPO-DOC-2: getDocument and updateDocumentExtraction work cleanly', () => {
  const docResult = repo.getDocument('doc-demo-001');
  assert(docResult !== undefined, 'Should retrieve doc-demo-001');
  assert.strictEqual(docResult!.document.filename, 'apex_cbc_blood_report_12sep2026.pdf');

  // Update extraction
  const updatedExt = repo.updateDocumentExtraction('doc-demo-001', 'ext-doc1-1', {
    status: 'confirmed',
    value: '10.2 g/dL (Clinician Verified)',
  });
  assert.strictEqual(updatedExt?.value, '10.2 g/dL (Clinician Verified)');
});
