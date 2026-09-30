'use client';
// ─────────────────────────────────────────────────────────────────────────────
// MediKiosk — Premium Patient Kiosk (Hospital-Grade Interactive Workflow)
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

import { 
  ArrowLeft, 
  RotateCcw, 
  Activity, 
  Globe2, 
  HeartPulse, 
  AlertCircle
} from 'lucide-react';

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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-50/70 via-slate-50 to-white flex flex-col justify-between selection:bg-medical-500 selection:text-white">
      {/* ── Top Header Navigation Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-medical-600 via-medical-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-medical-500/20">
              <HeartPulse className="w-6 h-6 animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Medi<span className="text-medical-600">Kiosk</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-ping" />
                  Terminal 01 · Live
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-500 font-medium">
                National Ayush &amp; Clinical Case-Taking Gateway · SIH 2026 #26047
              </p>
            </div>
          </div>

          {/* Center: Clinical Safety Trust Seal */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/90 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs">
            <span className="text-base text-medical-600">🛡️</span>
            <span>Assistive Pre-Consultation History · Attending Physician Confirms All Findings</span>
          </div>

          {/* Right: Quick Portal Navigation Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100/90 p-1 rounded-2xl border border-slate-200/90 text-xs font-bold shadow-inner">
              <span className="px-3.5 py-1.5 rounded-xl bg-medical-600 text-white shadow-sm flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>Patient Kiosk</span>
              </span>
              <a
                href="/doctor"
                className="px-3.5 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-all flex items-center gap-1"
                title="Switch to Doctor Consultation Dashboard"
              >
                <span>Doctor Portal</span>
                <span className="text-slate-400 font-mono">→</span>
              </a>
            </div>
          </div>
        </div>

        {/* ── Sub-Header: Active Step & Navigation Breadcrumb (Only visible during active intake) ── */}
        {currentIdx >= 0 && (
          <div className="bg-slate-50/90 border-t border-slate-200/60 px-4 sm:px-6 py-2.5">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
              {/* Back & Reset controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 shadow-xs transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={restartSession}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Restart intake"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Restart</span>
                </button>
              </div>

              {/* Progress Tracker */}
              <div className="flex-1 max-w-xs sm:max-w-md mx-2">
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-700 mb-1">
                  <span className="truncate">
                    Step {currentIdx + 1} of {totalInteractiveSteps}:{' '}
                    <span className="text-medical-700">{STEP_METADATA[step]?.label}</span>
                  </span>
                  <span className="font-mono text-medical-700">{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-medical-500 to-teal-500 h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Quick Language Toggle */}
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-slate-200 shadow-xs text-xs font-semibold">
                <Globe2 className="w-3.5 h-3.5 ml-2 text-slate-400" />
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    language === 'en' ? 'bg-medical-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('te')}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    language === 'te' ? 'bg-medical-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  తె
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    language === 'hi' ? 'bg-medical-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  हि
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

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

      {/* ── Healthcare Footer with Emergency Helpline ──────────────────────── */}
      <footer className="bg-white/80 border-t border-slate-200/80 px-4 py-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-amber-700 font-semibold bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-xl">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Emergency Notice: If experiencing severe trauma or chest pain, alert hospital staff or dial 108 immediately.</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Smart India Hackathon 2026 · Problem ID: 26047 · Ministry of Ayush
          </div>
        </div>
      </footer>
    </div>
  );
}
