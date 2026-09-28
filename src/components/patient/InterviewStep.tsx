'use client';
// ─────────────────────────────────────────────────────────────────────────────
// InterviewStep — Phase 2: AI-driven interview engine
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react';
import { t } from '@/i18n/translations';
import type { Language } from '@/types/clinical';
import type {
  ClinicalInterviewState,
  NextQuestion,
  InterviewRespondResponse,
  ExtractionResult,
} from '@/types/interviewState';

interface Props {
  caseId: string;
  language: Language;
  interactionMode: 'voice' | 'text' | 'touch';
  onComplete: (state: ClinicalInterviewState, summary: string) => void;
}

type FieldBadge = { field: string; status: string; value?: unknown };

export default function InterviewStep({ caseId, language, interactionMode, onComplete }: Props) {
  const [state, setState] = useState<ClinicalInterviewState | null>(null);
  const [currentQ, setCurrentQ] = useState<NextQuestion | null>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [collectedFields, setCollectedFields] = useState<FieldBadge[]>([]);
  const [redFlagCount, setRedFlagCount] = useState(0);
  const [correctionMode, setCorrectionMode] = useState(false);
  const [, setCorrectionField] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const progressBarWidth = state
    ? Math.round(((state.askedQuestions.length) / 16) * 100)
    : 0;

  // ── Initialise interview ──────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/interview/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caseId, language }),
        });
        const data = await res.json();
        setState(data.state);
        setCurrentQ(data.firstQuestion);
      } catch {
        setError('Failed to start interview. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [caseId, language]);

  // ── Focus textarea when question changes ──────────────────────────────────
  useEffect(() => {
    if (interactionMode === 'text' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [currentQ, interactionMode]);

  // ── Speech recognition ────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { setError(t(language, 'recordingError')); return; }

    const rec = new SR();
    rec.lang = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN';
    rec.continuous = false;
    rec.interimResults = false;

    rec.onstart = () => setListening(true);
    rec.onend   = () => setListening(false);
    rec.onerror = () => { setListening(false); setError(t(language, 'recordingError')); };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const transcript = e.results[0]?.[0]?.transcript ?? '';
      setAnswer(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognitionRef.current = rec;
    rec.start();
  }, [language]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  // ── Submit answer ─────────────────────────────────────────────────────────
  const submitAnswer = useCallback(async (responseText: string) => {
    if (!state || !currentQ || !responseText.trim()) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/interview/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId,
          questionId: currentQ.id,
          questionText: currentQ.text,
          patientResponse: responseText,
          language,
          currentState: state,
        }),
      });

      if (!res.ok) throw new Error('Server error');
      const data: InterviewRespondResponse = await res.json();

      setState(data.updatedState);
      setAnswer('');
      setRedFlagCount(data.redFlagsTriggered.length);

      // Update collected fields display
      const newBadges: FieldBadge[] = data.extractedFacts.map((f: ExtractionResult) => ({
        field: f.field,
        status: f.status,
        value: f.value,
      }));
      setCollectedFields(prev => {
        const map = new Map(prev.map(b => [b.field, b]));
        for (const b of newBadges) map.set(b.field, b);
        return Array.from(map.values());
      });

      if (data.interviewComplete) {
        onComplete(data.updatedState, data.preliminarySummary ?? '');
      } else if (data.nextQuestion) {
        setCurrentQ(data.nextQuestion);
      }
    } catch {
      setError('Failed to process your answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [state, currentQ, caseId, language, onComplete]);

  // ── Touch option select ───────────────────────────────────────────────────
  const handleTouchOption = (val: string, label: string) => {
    submitAnswer(`${label} (${val})`);
  };

  // ── Skip question ─────────────────────────────────────────────────────────
  const skipQuestion = async () => {
    if (!state || !currentQ) return;
    // Submit a skip answer to let the engine advance
    await submitAnswer('skip / not applicable');
  };

  // ── Correction select ─────────────────────────────────────────────────────
  const startCorrection = (field: string) => {
    setCorrectionField(field);
    setCorrectionMode(false);
    // Find the question that owns this field
    // For simplicity: just re-submit with new answer from user
  };

  // ── Scale (0–10) ──────────────────────────────────────────────────────────
  const ScaleSelector = () => (
    <div className="flex flex-wrap gap-2 mt-3">
      {Array.from({ length: 11 }, (_, i) => (
        <button
          key={i}
          onClick={() => submitAnswer(String(i))}
          disabled={submitting}
          className={`w-10 h-10 rounded-full font-bold text-sm border-2 transition-colors
            ${i <= 3 ? 'border-green-400 hover:bg-green-100' :
              i <= 6 ? 'border-yellow-400 hover:bg-yellow-100' :
              'border-red-400 hover:bg-red-100'}`}
        >
          {i}
        </button>
      ))}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">{t(language, 'processing')}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progressBarWidth}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 text-right">{progressBarWidth}% complete</p>

      {/* Red flag banner */}
      {redFlagCount > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-3 flex items-center gap-2">
          <span className="text-red-600 text-xl">⚠</span>
          <p className="text-red-700 text-sm font-medium">{t(language, 'redFlagAlert')}</p>
        </div>
      )}

      {/* Current question */}
      {currentQ && (
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <p className="text-lg font-medium text-gray-800 leading-relaxed mb-6">
            {currentQ.text}
          </p>

          {/* Scale */}
          {currentQ.isScale && <ScaleSelector />}

          {/* Touch options */}
          {!currentQ.isScale && currentQ.options && interactionMode !== 'text' && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {currentQ.options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleTouchOption(opt.value, opt.label)}
                  disabled={submitting}
                  className="text-left px-4 py-3 rounded-xl border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-sm font-medium text-gray-700"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Binary quick buttons */}
          {currentQ.isBinary && (
            <div className="flex gap-3 mb-4">
              {[t(language, 'yes'), t(language, 'no'), t(language, 'notSure')].map((label, i) => (
                <button
                  key={i}
                  onClick={() => submitAnswer(label)}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl font-medium border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Voice mode */}
          {interactionMode === 'voice' && (
            <div className="mt-4 space-y-3">
              <button
                onMouseDown={startListening}
                onMouseUp={stopListening}
                onTouchStart={startListening}
                onTouchEnd={stopListening}
                disabled={submitting}
                className={`w-full py-4 rounded-xl font-semibold text-white transition-colors ${
                  listening ? 'bg-red-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {listening ? `🎙 ${t(language, 'listening')}` : `🎙 ${t(language, 'tapToSpeak')}`}
              </button>
              {answer && (
                <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700">
                  <span className="text-xs text-gray-400 block mb-1">Heard:</span>
                  {answer}
                </div>
              )}
            </div>
          )}

          {/* Text mode */}
          {interactionMode !== 'voice' && !currentQ.isScale && (
            <div className="mt-4 space-y-3">
              <textarea
                ref={textareaRef}
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitAnswer(answer); } }}
                placeholder={t(language, 'typeYourAnswer')}
                rows={3}
                disabled={submitting}
                className="w-full border border-gray-300 rounded-xl p-3 text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          )}

          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

          {/* Action buttons */}
          <div className="flex gap-3 mt-4">
            {(interactionMode !== 'touch' || currentQ.isScale) && !currentQ.isBinary && !currentQ.isScale && (
              <button
                onClick={() => submitAnswer(answer)}
                disabled={submitting || !answer.trim()}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? '...' : t(language, 'submit')}
              </button>
            )}
            {interactionMode === 'voice' && answer && (
              <button
                onClick={() => submitAnswer(answer)}
                disabled={submitting}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {t(language, 'submit')}
              </button>
            )}
            <button
              onClick={skipQuestion}
              disabled={submitting}
              className="px-4 py-3 text-gray-500 border border-gray-300 rounded-xl hover:bg-gray-50 text-sm"
            >
              {t(language, 'skip')}
            </button>
          </div>
        </div>
      )}

      {/* Collected fields sidebar */}
      {collectedFields.length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Collected so far</h3>
            <button
              onClick={() => setCorrectionMode(!correctionMode)}
              className="text-xs text-blue-600 underline"
            >
              {correctionMode ? 'Close' : t(language, 'correct')}
            </button>
          </div>
          {correctionMode && (
            <p className="text-xs text-gray-500 mb-2">{t(language, 'correctionInstruction')}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {collectedFields.map(f => (
              <button
                key={f.field}
                onClick={() => correctionMode && startCorrection(f.field)}
                disabled={!correctionMode}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                  ${f.status === 'present' ? 'bg-green-100 text-green-700 border-green-300' :
                    f.status === 'denied' ? 'bg-gray-100 text-gray-600 border-gray-300' :
                    'bg-yellow-100 text-yellow-700 border-yellow-300'}
                  ${correctionMode ? 'cursor-pointer hover:opacity-75' : 'cursor-default'}
                `}
              >
                {f.field}: {f.status === 'present' ? String(f.value) : f.status}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
