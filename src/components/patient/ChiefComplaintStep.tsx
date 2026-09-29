'use client';
import { useState } from 'react';
import { t } from '@/i18n/translations';
import type { Language } from '@/types/clinical';

interface Props { language: Language; onNext: (complaint: string) => void; }

interface Complaint {
  label: string;
  labelTe: string;
  labelHi: string;
  emoji: string;
  value: string;
  ayushSupported?: boolean;
}

const COMPLAINTS: Complaint[] = [
  { label: 'Abdominal Pain', labelTe: 'కడుపు నొప్పి', labelHi: 'पेट दर्द', emoji: '🫁', value: 'abdominal pain', ayushSupported: true },
  { label: 'Nausea & Vomiting', labelTe: 'వికారం & వాంతి', labelHi: 'मतली और उल्टी', emoji: '🤢', value: 'nausea and vomiting' },
  { label: 'Fever with Body Ache', labelTe: 'జ్వరం & శరీర నొప్పి', labelHi: 'बुखार और बदन दर्द', emoji: '🤒', value: 'fever with body ache' },
  { label: 'Indigestion / Acidity', labelTe: 'అజీర్ణం / యాసిడ్‌టీ', labelHi: 'अपच / एसिडिटी', emoji: '🔥', value: 'indigestion acidity', ayushSupported: true },
  { label: 'Loose Motions / Diarrhea', labelTe: 'విరేచనాలు', labelHi: 'दस्त / डायरिया', emoji: '💧', value: 'diarrhea loose motions' },
  { label: 'Loss of Appetite', labelTe: 'ఆకలి తక్కువ', labelHi: 'भूख न लगना', emoji: '🍽', value: 'loss of appetite', ayushSupported: true },
  { label: 'Other', labelTe: 'ఇతర', labelHi: 'अन्य', emoji: '💬', value: '' },
];

export default function ChiefComplaintStep({ language, onNext }: Props) {
  const [selected, setSelected] = useState<string | null>('abdominal pain');
  const [customText, setCustomText] = useState('');

  const getLabel = (c: Complaint) => {
    if (language === 'te') return c.labelTe;
    if (language === 'hi') return c.labelHi;
    return c.label;
  };

  const isOther = selected === '';
  const finalComplaint = isOther ? customText.trim() : (selected ?? '');

  const heading =
    language === 'te'
      ? 'ఈరోజు మీ ప్రధాన సమస్య ఏమిటి?'
      : language === 'hi'
      ? 'आज आपकी मुख्य समस्या क्या है?'
      : 'What is your main problem today?';

  return (
    <div className="max-w-lg mx-auto space-y-5 py-8 px-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-3xl mb-3">
          🩺
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">{heading}</h2>
        <p className="text-sm text-slate-500">
          {language === 'te'
            ? 'మీ లక్షణాన్ని ఎంచుకోండి'
            : language === 'hi'
            ? 'अपना लक्षण चुनें'
            : 'Select the symptom that best describes your problem'}
        </p>
      </div>

      {/* Complaint Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {COMPLAINTS.map((c) => (
          <button
            key={c.value + c.label}
            onClick={() => {
              setSelected(c.value);
              setCustomText('');
            }}
            className={`flex flex-col items-center gap-2 px-3 py-4 border-2 rounded-2xl transition-all text-center cursor-pointer ${
              selected === c.value
                ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
                : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
            }`}
          >
            <span className="text-3xl">{c.emoji}</span>
            <div>
              <span className={`text-sm font-semibold ${selected === c.value ? 'text-blue-800' : 'text-slate-800'}`}>
                {getLabel(c)}
              </span>
              {c.ayushSupported && (
                <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-full px-1.5 py-0.5 mt-1 inline-block">
                  🌿 AYUSH
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Custom text for "Other" */}
      {isOther && (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Describe your complaint
          </label>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder={t(language, 'chiefComplaintPlaceholder')}
            rows={3}
            className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            autoFocus
          />
        </div>
      )}

      {/* Phase 2 notice for abdominal pain */}
      {selected === 'abdominal pain' && (
        <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
          <span className="text-base shrink-0">ℹ</span>
          <p>
            Abdominal Pain uses the full SOCRATES clinical history framework with AYUSH holistic intake.
          </p>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={() => onNext(finalComplaint || 'abdominal pain')}
        disabled={!finalComplaint && !selected}
        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-40 transition-colors text-base shadow-md shadow-blue-600/20"
      >
        {t(language, 'startInterview')} →
      </button>
    </div>
  );
}
