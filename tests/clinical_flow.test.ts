// ─────────────────────────────────────────────────────────────────────────────
// MediKiosk — Integration Tests
// Run with: node --require tsx/cjs --test tests/clinical_flow.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { evaluateAbdominalRedFlags } from '../src/services/redFlagRules';
import { getNextQuestion, isInterviewComplete, ABDOMINAL_PAIN_QUESTIONS } from '../src/services/questionEngine';
import { repo } from '../src/lib/db/repository';
import type { ClinicalInterviewState } from '../src/types/interviewState';

// ── Helper: blank state ───────────────────────────────────────────────────────

function makeState(overrides: Partial<ClinicalInterviewState> = {}): ClinicalInterviewState {
  const fields: ClinicalInterviewState['fields'] = {};
  for (const q of ABDOMINAL_PAIN_QUESTIONS) {
    for (const f of q.fields) fields[f] = { status: 'unknown' };
  }
  return {
    sessionId: 'test',
    caseId: 'test-case',
    language: 'en',
    startedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    currentQuestionId: null,
    fields,
    askedQuestions: [],
    skippedQuestions: [],
    clarificationCount: 0,
    ...overrides,
  };
}

// ── Red flag tests ─────────────────────────────────────────────────────────────

test('RF-1: Severity 9 + sudden onset → HEMODYNAMIC_SHOCK (CRITICAL)', () => {
  const flags = evaluateAbdominalRedFlags({ severity: 9, onset: 'sudden' }, []);
  const flag = flags.find(f => f.category === 'HEMODYNAMIC_SHOCK');
  assert(flag, 'Expected HEMODYNAMIC_SHOCK flag');
  assert.strictEqual(flag.severity, 'CRITICAL');
});

test('RF-2: Blood in stool → GI_BLEED', () => {
  const flags = evaluateAbdominalRedFlags({ bloodInStool: true }, []);
  assert(flags.some(f => f.category === 'GI_BLEED'), 'Expected GI_BLEED flag');
});

test('RF-3: Coffee ground vomit in raw text → GI_BLEED', () => {
  const flags = evaluateAbdominalRedFlags({}, ['I had coffee ground vomiting last night']);
  assert(flags.some(f => f.category === 'GI_BLEED'), 'Expected GI_BLEED from raw text');
});

test('RF-4: Fever + high severity + sudden → SEPSIS', () => {
  const flags = evaluateAbdominalRedFlags({ fever: true, severity: 8, onset: 'sudden' }, []);
  assert(flags.some(f => f.category === 'SEPSIS'), 'Expected SEPSIS flag');
});

test('RF-5: Low severity, no fever → no red flags', () => {
  const flags = evaluateAbdominalRedFlags({ severity: 3, onset: 'gradual', fever: false }, []);
  assert.strictEqual(flags.length, 0, 'Expected zero red flags');
});

test('RF-6: Pregnancy status + high severity → PREGNANCY_ACUTE', () => {
  const flags = evaluateAbdominalRedFlags({ pregnancyStatus: 'possibly_pregnant', severity: 8 }, []);
  assert(flags.some(f => f.category === 'PREGNANCY_ACUTE'), 'Expected PREGNANCY_ACUTE flag');
});

test('RF-7: De-duplication — only one flag per category', () => {
  // Two GI_BLEED triggers: bloodInStool AND raw text about coffee grounds
  const flags = evaluateAbdominalRedFlags({ bloodInStool: true }, ['coffee ground vomiting']);
  const giFlags = flags.filter(f => f.category === 'GI_BLEED');
  // Each trigger produces a separate entry but the de-dup keeps at most one per category
  // Our implementation keeps up to 2 (blood stool + haematemesis are different entries before dedup)
  // After dedup by category → exactly 1
  assert.strictEqual(giFlags.length, 1, 'De-dup should yield exactly 1 GI_BLEED flag');
});

// ── Question engine tests ──────────────────────────────────────────────────────

test('QE-1: First question is "site"', () => {
  const state = makeState();
  const q = getNextQuestion(state);
  assert(q !== null, 'Expected a first question');
  assert.strictEqual(q!.id, 'site');
});

test('QE-2: haematemesis not shown before nausea_vomiting is asked', () => {
  // Only site asked so far
  const state = makeState({ askedQuestions: ['site'] });
  const q = getNextQuestion(state);
  assert.notStrictEqual(q?.id, 'haematemesis');
});

test('QE-3: haematemesis skipped when vomiting denied', () => {
  const state = makeState({
    askedQuestions: ABDOMINAL_PAIN_QUESTIONS
      .map(q => q.id)
      .filter(id => id !== 'haematemesis' && id !== 'gynaecological' && id !== 'habits' && id !== 'medications' && id !== 'past_history' && id !== 'urinary' && id !== 'jaundice_anorexia' && id !== 'bowel' && id !== 'exacerbating'),
    fields: {
      ...makeState().fields,
      vomiting: { status: 'denied', value: false, questionId: 'nausea_vomiting' },
    },
  });
  // haematemesis requires vomiting = true
  const next = getNextQuestion(state);
  assert.notStrictEqual(next?.id, 'haematemesis', 'haematemesis should be skipped when vomiting denied');
});

test('QE-4: Interview complete when all questions asked', () => {
  const allIds = ABDOMINAL_PAIN_QUESTIONS.map(q => q.id);
  const state = makeState({ askedQuestions: allIds });
  assert(isInterviewComplete(state), 'Expected interview to be complete');
});

test('QE-5: Interview not complete after 3 questions', () => {
  const state = makeState({ askedQuestions: ['site', 'onset', 'character'] });
  assert(!isInterviewComplete(state), 'Expected interview not complete');
});

// ── Repository tests ──────────────────────────────────────────────────────────

test('REPO-1: Demo case-demo-001 exists and is seeded', () => {
  const c = repo.getCase('case-demo-001');
  assert(c !== undefined, 'case-demo-001 should exist');
  assert.strictEqual(c!.patientId, 'patient-001');
});

test('REPO-2: Demo case-demo-002 is CRITICAL with red flags', () => {
  const c = repo.getCase('case-demo-002');
  assert.strictEqual(c?.priority, 'CRITICAL');
  assert(c!.redFlags.length > 0, 'Should have at least one red flag');
});

test('REPO-3: Create and retrieve a new case', () => {
  repo.upsertPatient({ id: 'test-p-99', language: 'en', createdAt: new Date().toISOString() });
  repo.createCase({
    id: 'test-c-99', patientId: 'test-p-99', chiefComplaint: 'test pain', language: 'en',
    interactionMode: 'text', status: 'in_progress', priority: 'LOW',
    socratesHistory: {}, ayushHistory: {}, documents: [], timeline: [], redFlags: [],
    evidenceMap: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  });
  const fetched = repo.getCase('test-c-99');
  assert.strictEqual(fetched?.id, 'test-c-99');
});

test('REPO-4: Update case priority', () => {
  const updated = repo.updateCase('test-c-99', { priority: 'HIGH' });
  assert.strictEqual(updated?.priority, 'HIGH');
});

test('REPO-5: listCases returns seeded cases', () => {
  const all = repo.listCases();
  assert(all.length >= 2, 'Should have at least 2 demo cases');
  const ids = all.map(c => c.id);
  assert(ids.includes('case-demo-001'));
  assert(ids.includes('case-demo-002'));
});
