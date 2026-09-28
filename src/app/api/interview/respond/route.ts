// ─────────────────────────────────────────────────────────────────────────────
// POST /api/interview/respond
//
// Body:
//   caseId: string
//   questionId: string
//   questionText: string (base prompt used)
//   patientResponse: string
//   language: Language
//   currentState: ClinicalInterviewState
//
// Returns: InterviewRespondResponse
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';
import { getAIService } from '@/services/ai/aiService';
import { evaluateAbdominalRedFlags } from '@/services/redFlagRules';
import { makeInterviewEvidence } from '@/services/evidenceService';
import { getNextQuestion, isInterviewComplete, ABDOMINAL_PAIN_QUESTIONS } from '@/services/questionEngine';
import type { ClinicalInterviewState, InterviewRespondResponse, NextQuestion } from '@/types/interviewState';
import type { Language } from '@/types/clinical';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { caseId, questionId, questionText, patientResponse, language, currentState } = body as {
    caseId: string;
    questionId: string;
    questionText: string;
    patientResponse: string;
    language: Language;
    currentState: ClinicalInterviewState;
  };

  if (!caseId || !questionId || !patientResponse || !currentState) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const consultation = repo.getCase(caseId);
  if (!consultation) return NextResponse.json({ error: 'Case not found' }, { status: 404 });

  // Find the question definition
  const questionDef = ABDOMINAL_PAIN_QUESTIONS.find(q => q.id === questionId);
  if (!questionDef) return NextResponse.json({ error: 'Unknown question' }, { status: 400 });

  // ── 1. AI extraction ────────────────────────────────────────────────────────
  const ai = getAIService();
  const extraction = await ai.extractAnswer({
    questionId,
    questionText,
    patientResponse,
    language,
    targetFields: questionDef.fields,
  });

  // ── 2. Update interview state ────────────────────────────────────────────────
  const updatedState: ClinicalInterviewState = {
    ...currentState,
    lastUpdatedAt: new Date().toISOString(),
    fields: { ...currentState.fields },
  };

  // Mark question as asked
  if (!updatedState.askedQuestions.includes(questionId)) {
    updatedState.askedQuestions = [...updatedState.askedQuestions, questionId];
  }

  // Apply extracted facts
  for (const fact of extraction.extracted) {
    updatedState.fields[fact.field] = {
      status: fact.status,
      value: fact.value,
      rawText: patientResponse,
      language,
      timestamp: new Date().toISOString(),
      confidence: fact.confidence,
      questionId,
    };
  }

  // Handle clarification count
  if (extraction.needsClarification) {
    updatedState.clarificationCount = (updatedState.clarificationCount ?? 0) + 1;
    const maxClari = questionDef.maxClarifications ?? 1;
    if (updatedState.clarificationCount > maxClari) {
      // Mark all target fields as uncertain and move on
      for (const f of questionDef.fields) {
        if (!updatedState.fields[f] || updatedState.fields[f].status === 'unknown') {
          updatedState.fields[f] = { status: 'uncertain', rawText: patientResponse, language, questionId };
        }
      }
    }
  } else {
    updatedState.clarificationCount = 0;
  }

  // ── 3. Update socratesHistory on case ────────────────────────────────────────
  const historyUpdates: Record<string, unknown> = {};
  const evidenceUpdates: Record<string, ReturnType<typeof makeInterviewEvidence>> = {};

  for (const fact of extraction.extracted) {
    historyUpdates[fact.field] = fact.value;
    evidenceUpdates[`socratesHistory.${fact.field}`] = makeInterviewEvidence(
      fact.field, fact.value, questionId, patientResponse, language, fact.confidence
    );
  }

  // ── 4. Red flag evaluation ─────────────────────────────────────────────────
  const mergedHistory = { ...consultation.socratesHistory, ...historyUpdates };
  const redFlags = evaluateAbdominalRedFlags(mergedHistory, [patientResponse]);

  // Priority escalation
  let priority = consultation.priority;
  if (redFlags.some(f => f.severity === 'CRITICAL')) priority = 'CRITICAL';
  else if (redFlags.some(f => f.severity === 'HIGH') && priority !== 'CRITICAL') priority = 'HIGH';

  repo.updateCase(caseId, {
    socratesHistory: mergedHistory,
    evidenceMap: { ...consultation.evidenceMap, ...evidenceUpdates },
    redFlags,
    priority,
  });

  // ── 5. Determine next question ───────────────────────────────────────────────
  const complete = isInterviewComplete(updatedState);
  let nextQ: NextQuestion | null = null;
  let summary: string | undefined;

  if (!complete) {
    const nextDef = getNextQuestion(updatedState);
    if (nextDef) {
      const baseText = nextDef.basePrompt[language] ?? nextDef.basePrompt['en'];
      // Build context summary from known fields
      const knownCount = Object.values(updatedState.fields).filter(f => f.status !== 'unknown').length;
      const contextSummary = `${knownCount} fields collected so far. Chief complaint: abdominal pain.`;
      const phrased = await ai.phraseQuestion({
        questionId: nextDef.id,
        basePrompt: baseText,
        language,
        contextSummary,
      });
      nextQ = {
        id: nextDef.id,
        text: phrased,
        options: nextDef.options,
        isBinary: nextDef.responseType === 'binary',
        isScale: nextDef.responseType === 'scale',
        audioHint: nextDef.responseType === 'binary' ? 'Answer yes or no' : undefined,
      };
      updatedState.currentQuestionId = nextDef.id;
    }
  } else {
    updatedState.currentQuestionId = null;
    updatedState.completedAt = new Date().toISOString();
    // Generate summary
    const historyForSummary: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(updatedState.fields)) {
      if (v.status === 'present') historyForSummary[k] = v.value;
      else if (v.status === 'denied') historyForSummary[k] = false;
    }
    summary = await ai.generateSummary({
      language,
      chiefComplaint: consultation.chiefComplaint,
      extractedHistory: historyForSummary,
      redFlagCategories: redFlags.map(f => f.category),
    });
    repo.updateCase(caseId, {
      status: 'pending_review',
      preliminarySummary: summary,
      interviewCompletedAt: updatedState.completedAt,
    });
  }

  const response: InterviewRespondResponse = {
    updatedState,
    extractedFacts: extraction.extracted.map(e => ({
      field: e.field,
      value: e.value,
      status: e.status,
      confidence: e.confidence,
      reasoning: e.reasoning,
    })),
    nextQuestion: nextQ,
    redFlagsTriggered: redFlags,
    interviewComplete: complete,
    preliminarySummary: summary,
  };

  return NextResponse.json(response);
}
