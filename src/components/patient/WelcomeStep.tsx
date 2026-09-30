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
      {/* ── Main Dark Glassmorphic Hero Card ───────────────────────────────── */}
      <div className="dark-glass-card rounded-3xl overflow-hidden relative border border-slate-800 shadow-2xl shadow-cyan-950/20 text-center">
        {/* Ambient Top Glow Effect */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-10 w-80 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="p-6 sm:p-12 relative z-10">
          {/* Top Bar: Ministry Trust Badge & Accessibility Sound */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800/80">
            {/* National / Ayush Trust Badge */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center border border-emerald-800/60 shadow-inner">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <span>Ministry of Ayush · SIH 2026</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Problem ID: 26047 · Patient Case-Taking Software
                </div>
              </div>
            </div>

            {/* Language Switcher & Audio Narration */}
            <div className="flex items-center gap-2">
              {onLanguageChange && (
                <div className="inline-flex bg-slate-950/80 p-1 rounded-2xl border border-slate-800 text-xs font-bold shadow-inner">
                  <button
                    type="button"
                    onClick={() => onLanguageChange('en')}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      language === 'en'
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => onLanguageChange('te')}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      language === 'te'
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    తెలుగు
                  </button>
                  <button
                    type="button"
                    onClick={() => onLanguageChange('hi')}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      language === 'hi'
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/30'
                        : 'text-slate-400 hover:text-white'
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
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
                    : 'bg-slate-900/80 text-cyan-400 hover:text-cyan-300 border-slate-800 hover:border-cyan-500/40'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                <span className="hidden md:inline">{isSpeaking ? 'Stop Audio' : 'Narration'}</span>
              </button>
            </div>
          </div>

          {/* Central Medical Neon Glowing Emblem */}
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-2xl shadow-cyan-500/30 animate-float">
              <Stethoscope className="w-12 h-12" />
            </div>
            <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black border-2 border-slate-900 shadow-md flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Certified Terminal</span>
            </span>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {t(language, 'appName')}
          </h1>
          <p className="text-base sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 mt-2">
            AI-Assisted Clinical History &amp; Pre-Consultation Platform
          </p>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mt-3 leading-relaxed">
            {language === 'te'
              ? 'వైద్యుడిని సంప్రదించడానికి ముందు మీ ఆరోగ్య చరిత్ర, లక్షణాలు మరియు పాత నివేదికలను సులభంగా నమోదు చేసుకోండి. ఇది మీ విలువైన సంప్రదింపు సమయాన్ని ఆదా చేస్తుంది.'
              : language === 'hi'
              ? 'डॉक्टर से परामर्श से पहले अपने स्वास्थ्य का इतिहास, लक्षण और पुरानी रिपोर्ट सुरक्षित रूप से दर्ज करें। यह आपके परामर्श के समय की बचत करता है।'
              : 'Digital pre-consultation case-taking supporting voice, touch, document OCR digitization, and national ABDM FHIR health record synthesis.'}
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8 text-left">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 dark-glass-card-hover group">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 text-cyan-400 flex items-center justify-center mb-3 border border-cyan-800/60">
                <Clock className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Faster Clinical Triage
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Structures the SOCRATES symptom profile prior to physician examination.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 dark-glass-card-hover group">
              <div className="w-10 h-10 rounded-xl bg-teal-950/80 text-teal-400 flex items-center justify-center mb-3 border border-teal-800/60">
                <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Document OCR &amp; Facts
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Instantly digitizes lab reports, past prescriptions, and previous diagnoses.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 dark-glass-card-hover group">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center mb-3 border border-emerald-800/60">
                <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                AYUSH Holistic Profile
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Integrates Prakriti, Agni, Ahara, and Vihara lifestyle factors seamlessly.
              </p>
            </div>
          </div>

          {/* Primary Attractive Glowing Call to Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onNext}
              className="btn-glow-primary w-full sm:w-auto px-10 py-5 rounded-2xl text-base sm:text-lg flex items-center justify-center mx-auto space-x-3 cursor-pointer group"
            >
              <span>
                {language === 'te'
                  ? 'ప్రారంభించండి (Start Case Intake)'
                  : language === 'hi'
                  ? 'शुरू करें (Start Case Intake)'
                  : 'Start Patient Case Intake'}
              </span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Non-Diagnostic Safety Seal */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-start sm:items-center justify-center gap-3 text-xs text-slate-400 max-w-xl mx-auto">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-left leading-relaxed">
              <strong className="text-slate-200">Strict Clinical Safety Principle:</strong> MediKiosk collects and structures clinical history. It does not diagnose, prescribe, or replace a medical doctor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
