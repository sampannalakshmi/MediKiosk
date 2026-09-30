'use client';

import React, { useState } from 'react';
import type { Language } from '@/types/clinical';
import { t } from '@/i18n/translations';
import { 
  ArrowRight, 
  Clock, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Building2,
  Stethoscope
} from 'lucide-react';

interface WelcomeStepProps {
  language: Language;
  onNext: () => void;
  onLanguageChange?: (lang: Language) => void;
}

export default function WelcomeStep({ language, onNext, onLanguageChange }: WelcomeStepProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const narrationText =
      language === 'te'
        ? 'మెడికియోస్క్ కు స్వాగతం. డాక్టరు గారిని కలవడానికి ముందు మీ ఆరోగ్య వివరాలను మరియు పాత ప్రిస్క్రిప్షన్లను నమోదు చేసుకోండి. ప్రారంభించడానికి కింద ఉన్న బటన్ నొక్కండి.'
        : language === 'hi'
        ? 'मेडीकियोस्क में आपका स्वागत है। डॉक्टर से मिलने से पहले अपने लक्षणों और पिछली पर्चियों को दर्ज करें। शुरू करने के लिए नीचे दिए गए बटन पर टैप करें।'
        : 'Welcome to MediKiosk. An AI-assisted clinical case-taking platform. Please share your symptoms and documents before seeing your doctor. Tap start to begin.';

    const utterance = new SpeechSynthesisUtterance(narrationText);
    utterance.lang = language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-4xl mx-auto py-2 sm:py-6">
      {/* ── Main Glassmorphic Hero Card ─────────────────────────────────────── */}
      <div className="bg-white/95 rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-200/90 overflow-hidden relative backdrop-blur-xl">
        {/* Decorative Top Accent Stripe */}
        <div className="h-2 w-full bg-gradient-to-r from-medical-600 via-teal-500 to-ayush-500" />

        <div className="p-6 sm:p-12 text-center">
          {/* Top Bar: Official Trust Header & Accessibility Sound */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
            {/* National / Ayush Trust Badge */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-ayush-50 text-ayush-700 flex items-center justify-center border border-ayush-200">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
                  Ministry of Ayush · SIH 2026
                </div>
                <div className="text-[10px] text-slate-500">
                  Problem ID: 26047 · Patient Case-Taking Terminal
                </div>
              </div>
            </div>

            {/* Language Switcher & Audio Narration */}
            <div className="flex items-center gap-2">
              {onLanguageChange && (
                <div className="inline-flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold shadow-inner">
                  <button
                    type="button"
                    onClick={() => onLanguageChange('en')}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      language === 'en'
                        ? 'bg-medical-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => onLanguageChange('te')}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      language === 'te'
                        ? 'bg-medical-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    తెలుగు
                  </button>
                  <button
                    type="button"
                    onClick={() => onLanguageChange('hi')}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      language === 'hi'
                        ? 'bg-medical-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    हिन्दी
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleSpeak}
                title="Audio instructions narration"
                className={`p-2.5 rounded-2xl border transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                  isSpeaking
                    ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                    : 'bg-medical-50 text-medical-700 hover:bg-medical-100 border-medical-200'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4 text-amber-700" /> : <Volume2 className="w-4 h-4" />}
                <span className="hidden md:inline">{isSpeaking ? 'Stop Audio' : 'Audio Narration'}</span>
              </button>
            </div>
          </div>

          {/* Central Medical Glow Icon */}
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-medical-600 via-medical-500 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-medical-500/25">
              <Stethoscope className="w-12 h-12" />
            </div>
            <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold border-2 border-white shadow-sm flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Verified Kiosk</span>
            </span>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {t(language, 'appName')}
          </h1>
          <p className="text-base sm:text-xl font-semibold text-medical-700 mt-2">
            AI-Assisted Clinical History &amp; Pre-Consultation Platform
          </p>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mt-3 leading-relaxed">
            {language === 'te'
              ? 'వైద్యుడిని సంప్రదించడానికి ముందు మీ ఆరోగ్య చరిత్ర, లక్షణాలు మరియు పాత నివేదికలను సులభంగా నమోదు చేసుకోండి. ఇది మీ విలువైన సంప్రదింపు సమయాన్ని ఆదా చేస్తుంది.'
              : language === 'hi'
              ? 'डॉक्टर से परामर्श से पहले अपने स्वास्थ्य का इतिहास, लक्षण और पुरानी रिपोर्ट सुरक्षित रूप से दर्ज करें। यह आपके परामर्श के समय की बचत करता है।'
              : 'Digital pre-consultation case-taking supporting multilingual voice, touch interactions, document OCR, and ABDM FHIR health record synthesis.'}
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8 text-left">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-medical-300 hover:bg-white transition-all shadow-xs group">
              <div className="w-10 h-10 rounded-xl bg-medical-100 text-medical-700 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Faster Clinical Triage
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Structures the SOCRATES symptom profile prior to physician examination.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-teal-300 hover:bg-white transition-all shadow-xs group">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Medical Document OCR
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Instantly digitizes lab reports, past prescriptions, and previous diagnoses.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-ayush-300 hover:bg-white transition-all shadow-xs group">
              <div className="w-10 h-10 rounded-xl bg-ayush-100 text-ayush-700 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                AYUSH Holistic Intake
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Integrates Prakriti, Agni, Ahara, and Vihara lifestyle factors seamlessly.
              </p>
            </div>
          </div>

          {/* Primary Call to Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onNext}
              className="w-full sm:w-auto px-10 py-4.5 bg-gradient-to-r from-medical-600 via-medical-700 to-indigo-700 hover:from-medical-700 hover:to-indigo-800 text-white text-base sm:text-lg font-bold rounded-2xl shadow-xl shadow-medical-600/30 flex items-center justify-center mx-auto space-x-3 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>
                {language === 'te'
                  ? 'ప్రారంభించండి (Start Case Intake)'
                  : language === 'hi'
                  ? 'शुरू करें (Start Case Intake)'
                  : 'Start Patient Case Intake'}
              </span>
              <ArrowRight className="w-5 h-5 animate-pulse" />
            </button>
          </div>

          {/* Non-Diagnostic Safety Seal */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-start sm:items-center justify-center gap-3 text-xs text-slate-500 max-w-xl mx-auto">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-left leading-relaxed">
              <strong className="text-slate-700">Strict Clinical Safety Principle:</strong> MediKiosk collects and structures clinical history. It does not diagnose, prescribe, or replace a medical doctor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
