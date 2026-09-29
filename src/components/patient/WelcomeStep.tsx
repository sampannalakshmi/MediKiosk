'use client';

import React, { useState } from 'react';
import type { Language } from '@/types/clinical';
import { t } from '@/i18n/translations';

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
    <div className="max-w-3xl mx-auto py-4 px-4">
      {/* Hero Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-200 overflow-hidden text-center p-6 sm:p-10 relative">
        {/* Top Controls: Language Switcher & Audio */}
        <div className="flex items-center justify-between sm:justify-end gap-2 mb-6">
          {onLanguageChange && (
            <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  language === 'en' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('te')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  language === 'te' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                తెలుగు
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('hi')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  language === 'hi' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                हिन्दी
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleSpeak}
            title="Listen to audio introduction"
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-medium ${
              isSpeaking
                ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200'
            }`}
          >
            <span className="text-base">{isSpeaking ? '🔊' : '🔈'}</span>
            <span className="hidden sm:inline">{isSpeaking ? 'Speaking...' : 'Listen'}</span>
          </button>
        </div>

        {/* Medical Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-700/25 mb-4">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>

        {/* Badges & Titles */}
        <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200">
          Smart India Hackathon 2026 · Ministry of Ayush
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t(language, 'appName')}
        </h1>
        <p className="text-base sm:text-lg font-medium text-blue-800 mt-2">
          AI Clinical History &amp; Pre-Consultation Platform
        </p>
        <p className="text-sm text-slate-600 max-w-xl mx-auto mt-3 leading-relaxed">
          {language === 'te'
            ? 'వైద్యుడిని సంప్రదించడానికి ముందు మీ ఆరోగ్య చరిత్ర, లక్షణాలు మరియు పాత నివేదికలను సులభంగా నమోదు చేసుకోండి. ఇది మీ విలువైన సంప్రదింపు సమయాన్ని ఆదా చేస్తుంది.'
            : language === 'hi'
            ? 'डॉक्टर से परामर्श से पहले अपने स्वास्थ्य का इतिहास, लक्षण और पुरानी रिपोर्ट सुरक्षित रूप से दर्ज करें। यह आपके परामर्श के समय की बचत करता है।'
            : 'Pre-consultation clinical case intake with voice, touch, and document digitization to maximize your doctor consultation time.'}
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-8 text-left">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-2 font-bold text-sm">
              ⏱
            </div>
            <h4 className="text-xs font-bold text-slate-900 uppercase">Faster Consultation</h4>
            <p className="text-xs text-slate-500 mt-1">Saves up to 10 minutes of intake time per patient.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 font-bold text-sm">
              📄
            </div>
            <h4 className="text-xs font-bold text-slate-900 uppercase">Document Digitization</h4>
            <p className="text-xs text-slate-500 mt-1">Extracts past prescriptions, medications, and lab reports.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2 font-bold text-sm">
              🌿
            </div>
            <h4 className="text-xs font-bold text-slate-900 uppercase">AYUSH &amp; General</h4>
            <p className="text-xs text-slate-500 mt-1">Supports Allopathic SOCRATES and Ayurvedic case-taking.</p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          type="button"
          onClick={onNext}
          className="w-full sm:w-auto px-10 py-4.5 bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white text-lg font-bold rounded-2xl shadow-xl shadow-blue-700/25 flex items-center justify-center mx-auto space-x-3 transition-transform active:scale-95 cursor-pointer"
        >
          <span>
            {language === 'te'
              ? 'ప్రారంభించండి (Start Intake)'
              : language === 'hi'
              ? 'शुरू करें (Start Intake)'
              : 'Start Clinical Pre-Consultation'}
          </span>
          <span className="text-xl">→</span>
        </button>

        {/* Non-Diagnostic Safety Disclaimer */}
        <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-center gap-2.5 text-xs text-slate-500 max-w-xl mx-auto">
          <span className="text-emerald-600 text-base shrink-0">🛡</span>
          <p className="text-left leading-normal">
            <strong>Assistive tool only:</strong> MediKiosk is NOT an AI doctor and never diagnoses or prescribes. A qualified human clinician will review your complete case.
          </p>
        </div>
      </div>
    </div>
  );
}
