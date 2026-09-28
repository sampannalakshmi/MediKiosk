'use client';
import { useState } from 'react';
import { t } from '@/i18n/translations';
import type { Language } from '@/types/clinical';

interface Props { language: Language; onNext: (complaint: string) => void; }

export default function ChiefComplaintStep({ language, onNext }: Props) {
  const [complaint, setComplaint] = useState('abdominal pain');
  const COMMON = ['Abdominal pain', 'Stomach ache', 'Nausea & vomiting', 'Fever with pain', 'Other'];
  return (
    <div className="max-w-md mx-auto space-y-5 py-8">
      <h2 className="text-2xl font-bold text-gray-800">{t(language, 'chiefComplaint')}</h2>
      <div className="flex flex-wrap gap-2">
        {COMMON.map(c => (
          <button key={c} onClick={() => setComplaint(c.toLowerCase())}
            className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-colors ${complaint === c.toLowerCase() ? 'border-blue-500 bg-blue-100 text-blue-700' : 'border-gray-300 text-gray-600 hover:border-blue-300'}`}>
            {c}
          </button>
        ))}
      </div>
      <textarea
        value={complaint}
        onChange={e => setComplaint(e.target.value)}
        placeholder={t(language, 'chiefComplaintPlaceholder')}
        rows={3}
        className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button onClick={() => onNext(complaint)} disabled={!complaint.trim()}
        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
        {t(language, 'startInterview')}
      </button>
    </div>
  );
}
