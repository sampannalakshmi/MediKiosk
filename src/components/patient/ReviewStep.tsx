'use client';
import { useEffect, useState } from 'react';
import type { Language } from '@/types/clinical';

interface Props {
  language: Language;
  summary: string;
  redFlagCount: number;
  onSubmit: () => void;
}

const STAGES = [
  'Compiling interview responses…',
  'Applying red-flag screening rules…',
  'Merging document findings…',
  'Generating structured SOCRATES summary…',
  'Ready for doctor review',
];

export default function ReviewStep({ language, summary, redFlagCount, onSubmit }: Props) {
  const [stage, setStage] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Animate through stages, then mark ready
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx >= STAGES.length - 1) {
        setStage(STAGES.length - 1);
        setReady(true);
        clearInterval(interval);
      } else {
        setStage(idx);
      }
    }, 700);
    return () => clearInterval(interval);
  }, []);

  const headingText =
    language === 'te'
      ? 'మీ సారాంశాన్ని సమీక్షించండి'
      : language === 'hi'
      ? 'अपना सारांश देखें'
      : 'Review Your Summary';

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6 px-4">
      <h2 className="text-2xl font-extrabold text-slate-900 text-center">{headingText}</h2>

      {/* Processing animation */}
      {!ready && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Preparing Summary</p>
          {STAGES.slice(0, stage + 1).map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs ${
                i < stage ? 'bg-green-500 text-white' : 'bg-blue-500 text-white animate-pulse'
              }`}>
                {i < stage ? '✓' : '…'}
              </span>
              <span className={`text-sm ${i === stage ? 'font-semibold text-blue-700' : 'text-slate-500'}`}>{s}</span>
            </div>
          ))}
        </div>
      )}

      {/* Red Flag Alert */}
      {ready && redFlagCount > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
          <span className="text-3xl shrink-0">🚨</span>
          <div>
            <p className="font-bold text-red-800 text-base">
              {redFlagCount} Clinical Alert{redFlagCount > 1 ? 's' : ''} Detected
            </p>
            <p className="text-sm text-red-700 mt-1">
              Your responses indicate potentially serious symptoms that require prompt physician attention. You will be placed in priority queue.
            </p>
          </div>
        </div>
      )}

      {/* Summary Card */}
      {ready && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Clinical Pre-Consultation Summary
            </h3>
            <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full font-semibold border border-amber-200">
              AI Draft — Clinician Verifies
            </span>
          </div>

          {summary ? (
            <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-sans bg-slate-50 p-4 rounded-xl border border-slate-200">
              {summary}
            </pre>
          ) : (
            <p className="text-sm text-slate-500 italic">
              Summary data not available — doctor will conduct full intake during consultation.
            </p>
          )}
        </div>
      )}

      {/* Non-Diagnostic Disclaimer */}
      {ready && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
          <span className="text-xl shrink-0">⚠</span>
          <p>
            This is an <strong>AI-assisted pre-consultation summary</strong> based on your responses. Your doctor will
            review and verify all information before your consultation. This is <strong>NOT a medical diagnosis</strong>.
          </p>
        </div>
      )}

      {/* What's next info */}
      {ready && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">What Happens Next</p>
          <div className="space-y-2">
            {[
              '✓ Your clinical summary will be sent to the doctor\'s queue',
              '✓ The doctor will review it before calling you in',
              '✓ You may still need to answer follow-up questions',
              '✓ Physical examination and diagnostics are conducted by the doctor',
            ].map((step, i) => (
              <p key={i} className="text-sm text-slate-600">{step}</p>
            ))}
          </div>
        </div>
      )}

      {/* Submit CTA */}
      <button
        onClick={onSubmit}
        disabled={!ready}
        className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-base shadow-md shadow-green-600/20"
      >
        {ready
          ? (language === 'te' ? '✓ వైద్యుడికి పంపండి' : language === 'hi' ? '✓ डॉक्टर को भेजें' : '✓ Submit to Doctor Queue')
          : 'Preparing…'}
      </button>
    </div>
  );
}
