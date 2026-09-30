'use client';
// ─────────────────────────────────────────────────────────────────────────────
// MediKiosk — Premium Dark Healthcare Navigation Header
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import type { Language } from '@/types/clinical';
import { 
  HeartPulse, 
  Activity, 
  ArrowLeft, 
  RotateCcw, 
  Globe2, 
  Volume2, 
  VolumeX, 
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  currentPortal: 'patient' | 'doctor';
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
  // Step navigation props (used on patient kiosk)
  currentStep?: string;
  currentStepNumber?: number;
  totalSteps?: number;
  progressPercent?: number;
  onBack?: () => void;
  onRestart?: () => void;
  // Audio narration props
  isSpeaking?: boolean;
  onToggleSpeech?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPortal,
  language = 'en',
  onLanguageChange,
  currentStep,
  currentStepNumber,
  totalSteps = 8,
  progressPercent = 0,
  onBack,
  onRestart,
  isSpeaking,
  onToggleSpeech,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl shadow-slate-950/50">
      {/* Top Accent Neon Line */}
      <div className="neon-line" />

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand Identity & National Emblem */}
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6 animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">
                  Medi<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">Kiosk</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-950/80 text-cyan-300 border border-cyan-800/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1.5 animate-ping" />
                  Terminal 01 · Live
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-400 font-medium">
                National Ayush &amp; Clinical Case-Taking Gateway · SIH 2026 #26047
              </p>
            </div>
          </a>
        </div>

        {/* Center: Clinical Safety Trust Seal */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 text-slate-300 text-xs font-semibold border border-slate-800 shadow-inner">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Assistive Case Intake · Attending Physician Confirms All Findings</span>
        </div>

        {/* Right: Quick Portal Navigation Switcher & Audio */}
        <div className="flex items-center gap-2.5">
          {/* Audio narration toggle if provided */}
          {onToggleSpeech && (
            <button
              type="button"
              onClick={onToggleSpeech}
              title="Voice narration"
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isSpeaking
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              <span className="hidden md:inline">{isSpeaking ? 'Speaking...' : 'Narration'}</span>
            </button>
          )}

          {/* Cool Portal Switcher Tabs */}
          <div className="flex bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-xs font-bold shadow-inner">
            <a
              href="/"
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                currentPortal === 'patient'
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Patient Kiosk</span>
            </a>

            <a
              href="/doctor"
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                currentPortal === 'doctor'
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>Doctor Portal</span>
              <span className="text-slate-500 font-mono">→</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── Sub-Navigation Bar: Active Step, Back Button & Progress (During intake) ── */}
      {currentStepNumber && currentStepNumber > 0 && (
        <div className="bg-slate-900/95 border-t border-slate-800/80 px-4 sm:px-6 py-2">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            {/* Back & Reset controls */}
            <div className="flex items-center gap-2">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 transition-all cursor-pointer shadow-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Back</span>
                </button>
              )}

              {onRestart && (
                <button
                  type="button"
                  onClick={onRestart}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                  title="Restart session"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Restart</span>
                </button>
              )}
            </div>

            {/* Glowing Progress Tracker */}
            <div className="flex-1 max-w-xs sm:max-w-md mx-2">
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-300 mb-1">
                <span className="truncate">
                  Step {currentStepNumber} of {totalSteps}:{' '}
                  <span className="text-cyan-400 font-semibold">{currentStep}</span>
                </span>
                <span className="font-mono text-cyan-400 font-extrabold">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-700/60 shadow-inner">
                <div
                  className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-300 ease-out shadow-sm shadow-cyan-400/50"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Quick Language Switcher Dropdown/Pills */}
            {onLanguageChange && (
              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-xl border border-slate-800 text-xs font-bold">
                <Globe2 className="w-3.5 h-3.5 ml-2 text-slate-500" />
                <button
                  onClick={() => onLanguageChange('en')}
                  className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                    language === 'en'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => onLanguageChange('te')}
                  className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                    language === 'te'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  తెలుగు
                </button>
                <button
                  onClick={() => onLanguageChange('hi')}
                  className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                    language === 'hi'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  हिन्दी
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
