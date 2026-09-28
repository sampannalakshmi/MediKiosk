// POST /api/interview/start
// Initialises a ClinicalInterviewState for a case and returns the first question.

import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';
import { getAIService } from '@/services/ai/aiService';
import { ABDOMINAL_PAIN_QUESTIONS, getNextQuestion } from '@/services/questionEngine';
import type { ClinicalInterviewState, NextQuestion } from '@/types/interviewState';
import type { Language } from '@/types/clinical';

export async function POST(req: NextRequest) {
  const { caseId, language } = await req.json() as { caseId: string; language: Language };

  const consultation = repo.getCase(caseId);
  if (!consultation) return NextResponse.json({ error: 'Case not found' }, { status: 404 });

  const now = new Date().toISOString();

  // Build initial state with all fields unknown
  const fields: ClinicalInterviewState['fields'] = {};
  for (const q of ABDOMINAL_PAIN_QUESTIONS) {
    for (const f of q.fields) {
      fields[f] = { status: 'unknown' };
    }
  }

  const state: ClinicalInterviewState = {
    sessionId: `session-${Date.now()}`,
    caseId,
    language,
    startedAt: now,
    lastUpdatedAt: now,
    currentQuestionId: null,
    fields,
    askedQuestions: [],
    skippedQuestions: [],
    clarificationCount: 0,
  };

  const firstDef = getNextQuestion(state);
  if (!firstDef) {
    return NextResponse.json({ error: 'No questions available' }, { status: 500 });
  }

  const ai = getAIService();
  const baseText = firstDef.basePrompt[language] ?? firstDef.basePrompt['en'];
  const phrased = await ai.phraseQuestion({
    questionId: firstDef.id,
    basePrompt: baseText,
    language,
    contextSummary: `Starting interview. Chief complaint: ${consultation.chiefComplaint}.`,
  });

  state.currentQuestionId = firstDef.id;

  const firstQuestion: NextQuestion = {
    id: firstDef.id,
    text: phrased,
    options: firstDef.options,
    isBinary: firstDef.responseType === 'binary',
    isScale: firstDef.responseType === 'scale',
  };

  return NextResponse.json({ state, firstQuestion });
}
