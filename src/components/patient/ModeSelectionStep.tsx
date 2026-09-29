'use client';
import { useState } from 'react';
import { t } from '@/i18n/translations';
import type { Language } from '@/types/clinical';

interface Props { language: Language; onSelect: (mode: 'voice' | 'text' | 'touch') => void; }

const MODES: {
  mode: 'voice' | 'text' | 'touch';
  icon: string;
  key: 'voiceMode' | 'textMode' | 'touchMode';
  description: { en: string; te: string; hi: string };
  recommended?: boolean;
}[] = [
  {
    mode: 'touch',
    icon: '👆',
    key: 'touchMode',
    description: {
      en: 'Best for kiosk — select answers by tapping on-screen options. Easy and fast.',
      te: 'కియోస్క్‌కు అత్యుత్తమం — స్క్రీన్‌పై ఐచ్ఛికాలను నొక్కి జవాబులు ఇవ్వండి.',
      hi: 'कियोस्क के लिए सर्वोत्तम — स्क्रीन पर विकल्पों को टैप करके उत्तर दें।',
    },
    recommended: true,
  },
  {
    mode: 'voice',
    icon: '🎙',
    key: 'voiceMode',
    description: {
      en: 'Speak your answers aloud. Supports English, Telugu, and Hindi voice input.',
      te: 'మీ జవాబులు బిగ్గరగా చెప్పండి. తెలుగు, హిందీ మరియు ఇంగ్లీష్ మద్దతు ఉంది.',
      hi: 'अपने उत्तर बोलें। हिन्दी, तेलुगु और अंग्रेज़ी में बोल सकते हैं।',
    },
  },
  {
    mode: 'text',
    icon: '⌨',
    key: 'textMode',
    description: {
      en: 'Type your answers using the keyboard. Works in any language.',
      te: 'కీబోర్డ్ ఉపయోగించి టైప్ చేయండి. ఏ భాషలోనైనా పని చేస్తుంది.',
      hi: 'कीबोर्ड से उत्तर टाइप करें। किसी भी भाषा में काम करता है।',
    },
  },
];

export default function ModeSelectionStep({ language, onSelect }: Props) {
  const [selected, setSelected] = useState<'voice' | 'text' | 'touch' | null>(null);

  const getDesc = (m: typeof MODES[0]) => m.description[language] ?? m.description.en;

  return (
    <div className="max-w-lg mx-auto space-y-5 py-8 px-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-3xl mb-3">
          🎛
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">
          {t(language, 'selectMode')}
        </h2>
        <p className="text-sm text-slate-500">
          {language === 'te'
            ? 'మీకు అనుకూలమైన మోడ్ ఎంచుకోండి'
            : language === 'hi'
            ? 'अपना पसंदीदा मोड चुनें'
            : 'Choose the interaction mode that suits you best'}
        </p>
      </div>

      <div className="space-y-3">
        {MODES.map(({ mode, icon, key, description, recommended }) => (
          <button
            key={mode}
            onClick={() => {
              setSelected(mode);
              onSelect(mode);
            }}
            className={`w-full flex items-start gap-5 px-6 py-5 border-2 rounded-2xl transition-all text-left cursor-pointer ${
              selected === mode
                ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
                : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
            }`}
          >
            <span className="text-4xl shrink-0 mt-0.5">{icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`font-bold ${selected === mode ? 'text-blue-800' : 'text-slate-900'}`}>
                  {t(language, key)}
                </span>
                {recommended && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase border border-emerald-200">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">{getDesc({ mode, icon, key, description })}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
