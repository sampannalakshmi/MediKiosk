'use client';
import { useEffect, useState } from 'react';
import type { Language } from '@/types/clinical';

const STAGES = [
  { icon: '📝', label: 'Compiling interview answers', labelTe: 'ఇంటర్వ్యూ సమాధానాలు సంకలనం', labelHi: 'साक्षात्कार उत्तर संकलित' },
  { icon: '🚨', label: 'Applying clinical red-flag rules', labelTe: 'రెడ్-ఫ్లాగ్ నియమాలు అమలు', labelHi: 'रेड-फ्लैग नियम लागू' },
  { icon: '📄', label: 'Merging uploaded document findings', labelTe: 'పత్ర ఫలితాలు విలీనం', labelHi: 'दस्तावेज़ निष्कर्ष विलय' },
  { icon: '🧬', label: 'Generating structured SOCRATES summary', labelTe: 'నిర్మాణాత్మక సారాంశం తయారు', labelHi: 'संरचित SOCRATES सारांश' },
  { icon: '✅', label: 'Sending to doctor queue', labelTe: 'వైద్యుడి క్యూకు పంపడం', labelHi: 'डॉक्टर की क्यू को भेजना' },
];

export default function ProcessingStep({ language }: { language: Language }) {
  const [activeStage, setActiveStage] = useState(0);

  const getLabel = (s: typeof STAGES[0]) => {
    if (language === 'te') return s.labelTe;
    if (language === 'hi') return s.labelHi;
    return s.label;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-md mx-auto flex flex-col items-center space-y-8 py-16 px-4">
      {/* Spinner */}
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
        <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-3xl">
          {STAGES[activeStage]?.icon}
        </div>
      </div>

      {/* Heading */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-slate-900">
          {language === 'te' ? 'ప్రాసెస్ అవుతోంది...' : language === 'hi' ? 'प्रोसेस हो रहा है...' : 'Processing your information…'}
        </h2>
        <p className="text-sm text-slate-500">
          {language === 'te' ? 'దయచేసి వేచి ఉండండి' : language === 'hi' ? 'कृपया प्रतीक्षा करें' : 'Please wait a moment'}
        </p>
      </div>

      {/* Stage progress */}
      <div className="w-full space-y-2.5">
        {STAGES.map((stage, i) => (
          <div key={i} className={`flex items-center gap-3 py-2.5 px-4 rounded-xl transition-all ${
            i < activeStage
              ? 'bg-green-50 border border-green-200'
              : i === activeStage
              ? 'bg-blue-50 border border-blue-200'
              : 'bg-slate-50 border border-slate-100 opacity-40'
          }`}>
            <span className="text-base shrink-0">
              {i < activeStage ? '✅' : i === activeStage ? <span className="animate-pulse">⏳</span> : stage.icon}
            </span>
            <span className={`text-sm ${
              i < activeStage ? 'text-green-700 font-medium' :
              i === activeStage ? 'text-blue-700 font-semibold' : 'text-slate-400'
            }`}>
              {getLabel(stage)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
