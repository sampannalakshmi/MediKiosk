'use client';
// ─────────────────────────────────────────────────────────────────────────────
// MediKiosk — Premium Patient Kiosk (Hospital-Grade Interactive Dark Workflow)
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import type { Language } from '@/types/clinical';
import type { ClinicalInterviewState } from '@/types/interviewState';

import Header from '@/components/common/Header';
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

import { AlertCircle } from 'lucide-react';

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
  const [mode, setMode] = useState<'voice' | 'text' | 'touch'>('touch');
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

  const STEP_METADATA: Record<Step, { label: string; number: number }> = {
    welcome: { label: 'Start Intake', number: 0 },
    language: { label: 'Language Selection', number: 1 },
    consent: { label: 'Informed Consent', number: 2 },
    patient_id: { label: 'Registration & ABHA', number: 3 },
    mode: { label: 'Interaction Mode', number: 4 },
    complaint: { label: 'Chief Complaint', number: 5 },
    interview: { label: 'Clinical History', number: 6 },
    documents: { label: 'Medical Records', number: 7 },
    processing: { label: 'AI Synthesis', number: 8 },
    review: { label: 'Summary Review', number: 8 },
    submitted: { label: 'Queue Dispatched', number: 8 },
  };

  const ORDERED_STEPS: Step[] = [
    'language',
    'consent',
    'patient_id',
    'mode',
    'complaint',
    'interview',
    'documents',
    'review',
  ];

  const currentIdx = ORDERED_STEPS.indexOf(step);
  const totalInteractiveSteps = ORDERED_STEPS.length;
  const progressPercent = currentIdx >= 0 ? Math.round(((currentIdx + 1) / totalInteractiveSteps) * 100) : 0;

  const handleBack = () => {
    if (step === 'language') setStep('welcome');
    else if (step === 'consent') setStep('language');
    else if (step === 'patient_id') setStep('consent');
    else if (step === 'mode') setStep('patient_id');
    else if (step === 'complaint') setStep('mode');
    else if (step === 'documents') setStep('interview');
    else if (step === 'review') setStep('documents');
  };

  const restartSession = () => {
    if (confirm('Start a new patient intake session? Current progress will be reset.')) {
      setStep('welcome');
      setCaseId('');
      setSummary('');
      setRedFlagCount(0);
      setFinalState(null);
    }
  };

  return (
    <div className="min-h-screen bg-ambient-dark text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950">
      {/* ── Top Header Navigation Bar ────────────────────────────────────────── */}
      <Header
        currentPortal="patient"
        language={language}
        onLanguageChange={(lang) => setLanguage(lang)}
        currentStep={STEP_METADATA[step]?.label}
        currentStepNumber={STEP_METADATA[step]?.number}
        totalSteps={totalInteractiveSteps}
        progressPercent={progressPercent}
        onBack={currentIdx >= 0 ? handleBack : undefined}
        onRestart={currentIdx >= 0 ? restartSession : undefined}
      />

      {/* ── Main Dynamic Stage Content ────────────────────────────────────────── */}
      <main className="flex-1 px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {step === 'welcome' && (
            <WelcomeStep
              language={language}
              onNext={() => setStep('language')}
              onLanguageChange={(lang) => setLanguage(lang)}
            />
          )}

          {step === 'language' && (
            <LanguageStep
              onSelect={(lang) => {
                setLanguage(lang);
                setStep('consent');
              }}
            />
          )}

          {step === 'consent' && (
            <ConsentStep
              language={language}
              onAccept={() => setStep('patient_id')}
            />
          )}

          {step === 'patient_id' && (
            <PatientIdStep
              language={language}
              onNext={async (pid, name, age, gender) => {
                setStep('mode');
                // Store patient info in state for consultation creation
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (window as any).__mkPatient = { pid, name, age, gender };
              }}
            />
          )}

          {step === 'mode' && (
            <ModeSelectionStep
              language={language}
              onSelect={(m) => {
                setMode(m);
                setStep('complaint');
              }}
            />
          )}

          {step === 'complaint' && (
            <ChiefComplaintStep
              language={language}
              onNext={async (cc) => {
                setComplaint(cc);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const p = (window as any).__mkPatient ?? {};
                const id = await createConsultation(
                  p.pid || '',
                  p.name || '',
                  p.age,
                  p.gender || '',
                  cc,
                  language,
                  mode
                );
                setCaseId(id);
                setStep('interview');
              }}
            />
          )}

          {step === 'interview' && caseId && (
            <InterviewStep
              caseId={caseId}
              language={language}
              interactionMode={mode}
              onComplete={(state, s) => {
                setFinalState(state);
                setSummary(s);
                setRedFlagCount(
                  Object.values(state.fields).filter(
                    (f) => f.status === 'present' && f.questionId?.startsWith('haem')
                  ).length
                );
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
                  // proceed gracefully
                }
                setStep('review');
              }}
            />
          )}

          {step === 'processing' && <ProcessingStep language={language} />}

          {step === 'review' && (
            <ReviewStep
              language={language}
              summary={summary}
              redFlagCount={redFlagCount}
              onSubmit={submitToDoctor}
            />
          )}

          {step === 'submitted' && <SubmissionStep language={language} />}
        </div>
      </main>

      {/* ── Healthcare Dark Footer with Emergency Helpline ──────────────────── */}
      <footer className="bg-slate-950/90 border-t border-slate-800/80 px-4 py-4 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-amber-300 font-semibold bg-amber-950/40 border border-amber-800/50 px-3.5 py-1.5 rounded-xl shadow-xs">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Emergency Notice: If experiencing severe trauma or acute chest pain, alert hospital staff or dial 108 immediately.</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Smart India Hackathon 2026 · Problem ID: 26047 · Ministry of Ayush
          </div>
        </div>
      </footer>
    </div>
  );
}
