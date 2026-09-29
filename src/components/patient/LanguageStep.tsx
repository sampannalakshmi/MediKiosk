'use client';
import type { Language } from '@/types/clinical';
import { useState } from 'react';

interface Props { onSelect: (lang: Language) => void; }

const LANGS: {
  code: Language;
  native: string;
  english: string;
  flag: string;
  greeting: string;
  description: string;
}[] = [
  {
    code: 'en',
    native: 'English',
    english: 'English',
    flag: '🇬🇧',
    greeting: 'Welcome',
    description: 'Proceed in English for the full clinical interview.',
  },
  {
    code: 'te',
    native: 'తెలుగు',
    english: 'Telugu',
    flag: '🇮🇳',
    greeting: 'స్వాగతం',
    description: 'తెలుగులో మీ వైద్య చరిత్రను నమోదు చేయండి.',
  },
  {
    code: 'hi',
    native: 'हिन्दी',
    english: 'Hindi',
    flag: '🇮🇳',
    greeting: 'स्वागत है',
    description: 'हिन्दी में अपना क्लिनिकल इतिहास दर्ज करें।',
  },
];

export default function LanguageStep({ onSelect }: Props) {
  const [hovered, setHovered] = useState<Language | null>(null);

  return (
    <div className="max-w-lg mx-auto py-8 px-4 space-y-6">
      {/* Heading in all three languages */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-extrabold text-slate-900">Select Language</h2>
        <p className="text-slate-500 text-sm">
          भाषा चुनें &nbsp;·&nbsp; భాష ఎంచుకోండి
        </p>
      </div>

      <div className="space-y-3">
        {LANGS.map((l) => (
          <button
            key={l.code}
            onClick={() => onSelect(l.code)}
            onMouseEnter={() => setHovered(l.code)}
            onMouseLeave={() => setHovered(null)}
            className={`w-full flex items-center gap-5 px-6 py-5 border-2 rounded-2xl transition-all text-left group cursor-pointer ${
              hovered === l.code
                ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
                : 'border-gray-200 bg-white hover:border-blue-300'
            }`}
          >
            <span className="text-4xl shrink-0">{l.flag}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${hovered === l.code ? 'text-blue-800' : 'text-slate-900'}`}>
                  {l.native}
                </span>
                {l.code !== 'en' && (
                  <span className="text-xs text-slate-400 font-medium">({l.english})</span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-0.5">{l.description}</p>
            </div>
            <span className={`text-2xl transition-transform ${hovered === l.code ? 'translate-x-1' : ''}`}>
              →
            </span>
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-slate-400 pt-2">
        You can change language at any time on the next screen
      </p>
    </div>
  );
}
