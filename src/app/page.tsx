'use client';
// ─────────────────────────────────────────────────────────────────────────────
// MediKiosk — Patient Kiosk (11-step workflow)
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import type { Language } from '@/types/clinical';
import type { ClinicalInterviewState } from '@/types/interviewState';

import WelcomeStep from '@/components/patient/WelcomeStep';
import LanguageStep from '@/components/patient/LanguageStep';
import ConsentStep from '@/components/patient/ConsentStep';
import PatientIdStep from '@/components/patient/PatientIdStep';
import ModeSelectionStep from '@/components/patient/ModeSelectionStep';
import ChiefComplaintStep from '@/components/patient/ChiefComplaintStep';
import InterviewStep from '@/components/patient/InterviewStep';
import DocumentStep from '@/components/patient/DocumentStep';
import ProcessingStep from '@/components/patient/ProcessingStep';
import ReviewStep from '@/components/patient/ReviewStep';
import SubmissionStep from '@/components/patient/SubmissionStep';

type Step =
  | 'welcome'
  | 'language'
  | 'consent'
  | 'patient_id'
  | 'mode'
  | 'complaint'
  | 'interview'
  | 'documents'
  | 'processing'
  | 'review'
  | 'submitted';

export default function KioskPage() {
  const [step, setStep] = useState<Step>('welcome');
  const [language, setLanguage] = useState<Language>('en');
  const [mode, setMode] = useState<'voice' | 'text' | 'touch'>('text');
  const [caseId, setCaseId] = useState('');
  const [, setComplaint] = useState('abdominal pain');
  const [summary, setSummary] = useState('');
  const [redFlagCount, setRedFlagCount] = useState(0);
  const [, setFinalState] = useState<ClinicalInterviewState | null>(null);

  // ── Create consultation on server ─────────────────────────────────────────
  const createConsultation = async (
    patientId: string,
    name: string,
    age: number | undefined,
    gender: string,
    chiefComplaint: string,
    lang: Language,
    interactionMode: 'voice' | 'text' | 'touch'
  ): Promise<string> => {
    const res = await fetch('/api/consultations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, name, age, gender, language: lang, interactionMode, chiefComplaint }),
    });
    const data = await res.json();
    return data.caseId;
  };

  // ── Submit to doctor queue ─────────────────────────────────────────────────
  const submitToDoctor = async () => {
    setStep('processing');
    await fetch(`/api/consultations/${caseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'pending_review' }),
    });
    setStep('submitted');
  };

  const STEP_LABELS: Partial<Record<Step, string>> = {
    language: 'Language', consent: 'Consent', patient_id: 'Registration',
    mode: 'Input Mode', complaint: 'Chief Complaint', interview: 'Interview',
    documents: 'Documents', review: 'Review',
  };
  const ORDERED: Step[] = ['language','consent','patient_id','mode','complaint','interview','documents','review'];
  const currentIdx = ORDERED.indexOf(step);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Top bar with Navigation Switcher */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-blue-700 text-xl font-bold">🏥 MediKiosk</span>
          <span className="hidden sm:inline text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
            SIH 2026 · Ayush #26047
          </span>
        </div>

        {/* Center: Non-diagnostic assurance */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
          <span className="text-emerald-600">🛡</span>
          <span>Assistive Case-Taking Only · Clinician Always Confirms</span>
        </div>

        {/* Right: View Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <span className="px-3 py-1.5 rounded-lg bg-blue-600 text-white shadow-xs">
              Patient Kiosk
            </span>
            <a
              href="/doctor"
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
            >
              Doctor Portal →
            </a>
          </div>
        </div>
      </header>

      {/* Step progress dots */}
      {currentIdx >= 0 && (
        <div className="flex justify-center gap-2 py-3">
          {ORDERED.map((s, i) => (
            <div key={s} title={STEP_LABELS[s]}
              className={`h-2 rounded-full transition-all ${i < currentIdx ? 'w-6 bg-blue-400' : i === currentIdx ? 'w-6 bg-blue-600' : 'w-2 bg-gray-200'}`}
            />
          ))}
        </div>
      )}

      {/* Step content */}
      <main className="px-4 py-6">
        {step === 'welcome' && (
          <WelcomeStep
            language={language}
            onNext={() => setStep('language')}
            onLanguageChange={(lang) => setLanguage(lang)}
          />
        )}
        {step === 'language'   && <LanguageStep onSelect={lang => { setLanguage(lang); setStep('consent'); }} />}
        {step === 'consent'    && <ConsentStep language={language} onAccept={() => setStep('patient_id')} />}
        {step === 'patient_id' && (
          <PatientIdStep language={language} onNext={async (pid, name, age, gender) => {
            setStep('mode');
            // Store patient info in state for later
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).__mkPatient = { pid, name, age, gender };
          }} />
        )}
        {step === 'mode'       && <ModeSelectionStep language={language} onSelect={m => { setMode(m); setStep('complaint'); }} />}
        {step === 'complaint'  && (
          <ChiefComplaintStep language={language} onNext={async (cc) => {
            setComplaint(cc);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const p = (window as any).__mkPatient ?? {};
            const id = await createConsultation(p.pid || '', p.name || '', p.age, p.gender || '', cc, language, mode);
            setCaseId(id);
            setStep('interview');
          }} />
        )}
        {step === 'interview'  && caseId && (
          <InterviewStep
            caseId={caseId}
            language={language}
            interactionMode={mode}
            onComplete={(state, s) => {
              setFinalState(state);
              setSummary(s);
              setRedFlagCount(Object.values(state.fields).filter(f => f.status === 'present' && f.questionId?.startsWith('haem')).length);
              setStep('documents');
            }}
          />
        )}
        {step === 'documents' && (
          <DocumentStep
            caseId={caseId}
            language={language}
            onSkip={() => setStep('review')}
            onProceed={async () => {
              // Refresh case details to include document findings in summary and red flags
              try {
                const res = await fetch(`/api/consultations/${caseId}`);
                if (res.ok) {
                  const updatedCase = await res.json();
                  if (updatedCase.preliminarySummary) {
                    setSummary(updatedCase.preliminarySummary);
                  }
                  if (updatedCase.redFlags) {
                    setRedFlagCount(updatedCase.redFlags.length);
                  }
                }
              } catch {
                // proceed
              }
              setStep('review');
            }}
          />
        )}
        {step === 'processing' && <ProcessingStep language={language} />}
        {step === 'review'     && (
          <ReviewStep language={language} summary={summary} redFlagCount={redFlagCount} onSubmit={submitToDoctor} />
        )}
        {step === 'submitted'  && <SubmissionStep language={language} />}
      </main>
    </div>
  );
}
