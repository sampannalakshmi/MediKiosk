'use client';
import { useState } from 'react';
import { t } from '@/i18n/translations';
import type { Language } from '@/types/clinical';

interface Props {
  language: Language;
  onNext: (patientId: string, name: string, age: number | undefined, gender: string) => void;
}

export default function PatientIdStep({ language, onNext }: Props) {
  const [pid, setPid] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  return (
    <div className="max-w-md mx-auto space-y-5 py-8">
      <h2 className="text-2xl font-bold text-gray-800">{t(language, 'enterPatientId')}</h2>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name (optional)" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />
      <input value={age} onChange={e => setAge(e.target.value)} type="number" placeholder="Age (optional)" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />
      <select value={gender} onChange={e => setGender(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400">
        <option value="">Gender (optional)</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
        <option value="prefer_not_to_say">Prefer not to say</option>
      </select>
      <input value={pid} onChange={e => setPid(e.target.value)} placeholder={t(language, 'patientIdLabel')} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />
      <div className="flex gap-3">
        <button onClick={() => onNext(pid || '', name, age ? parseInt(age) : undefined, gender)} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          {t(language, 'next')}
        </button>
        <button onClick={() => onNext('', '', undefined, '')} className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
          {t(language, 'continueAsGuest')}
        </button>
      </div>
    </div>
  );
}
