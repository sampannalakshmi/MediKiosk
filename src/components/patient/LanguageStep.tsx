'use client';
import type { Language } from '@/types/clinical';

interface Props { onSelect: (lang: Language) => void; }

const LANGS: { code: Language; label: string; native: string; flag: string }[] = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
];

export default function LanguageStep({ onSelect }: Props) {
  return (
    <div className="text-center space-y-6 py-8">
      <h2 className="text-2xl font-bold text-gray-800">Please select your language / भाषा चुनें / భాష ఎంచుకోండి</h2>
      <div className="flex flex-col gap-4 max-w-xs mx-auto">
        {LANGS.map(l => (
          <button
            key={l.code}
            onClick={() => onSelect(l.code)}
            className="flex items-center gap-4 px-6 py-4 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
          >
            <span className="text-3xl">{l.flag}</span>
            <div>
              <div className="font-semibold text-gray-800">{l.native}</div>
              <div className="text-sm text-gray-500">{l.label}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
