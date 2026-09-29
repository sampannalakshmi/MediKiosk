'use client';
import { useState } from 'react';
import { t } from '@/i18n/translations';
import type { Language } from '@/types/clinical';

interface Props {
  language: Language;
  onNext: (patientId: string, name: string, age: number | undefined, gender: string) => void;
}

const GENDERS = [
  { value: 'male', label: 'Male', labelTe: 'పురుషుడు', labelHi: 'पुरुष' },
  { value: 'female', label: 'Female', labelTe: 'స్త్రీ', labelHi: 'महिला' },
  { value: 'other', label: 'Other', labelTe: 'ఇతర', labelHi: 'अन्य' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say', labelTe: 'చెప్పకూడదు', labelHi: 'बताना नहीं चाहते' },
];

export default function PatientIdStep({ language, onNext }: Props) {
  const [pid, setPid] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  const getGenderLabel = (g: typeof GENDERS[0]) => {
    if (language === 'te') return g.labelTe;
    if (language === 'hi') return g.labelHi;
    return g.label;
  };

  const fieldClass = "w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-900 bg-white placeholder:text-slate-400 text-sm";

  return (
    <div className="max-w-lg mx-auto space-y-5 py-8 px-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-3xl mb-3">
          🪪
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">
          {t(language, 'enterPatientId')}
        </h2>
        <p className="text-sm text-slate-500">
          {language === 'te'
            ? 'అన్ని ఫీల్డ్‌లు ఐచ్ఛికం — మీరు అతిథిగా కొనసాగవచ్చు'
            : language === 'hi'
            ? 'सभी फ़ील्ड वैकल्पिक हैं — आप अतिथि के रूप में जारी रख सकते हैं'
            : 'All fields are optional — you can continue as a guest'}
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Full Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={language === 'te' ? 'పూర్తి పేరు (ఐచ్ఛికం)' : language === 'hi' ? 'पूरा नाम (वैकल्पिक)' : 'Full name (optional)'}
            className={fieldClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Age
            </label>
            <input
              value={age}
              onChange={(e) => setAge(e.target.value)}
              type="number"
              min="0"
              max="120"
              placeholder={language === 'te' ? 'వయస్సు' : language === 'hi' ? 'आयु' : 'Age'}
              className={fieldClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={fieldClass}
            >
              <option value="">
                {language === 'te' ? 'లింగం (ఐచ్ఛికం)' : language === 'hi' ? 'लिंग (वैकल्पिक)' : 'Gender (optional)'}
              </option>
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>
                  {getGenderLabel(g)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Patient ID / ABHA Number
          </label>
          <input
            value={pid}
            onChange={(e) => setPid(e.target.value)}
            placeholder={t(language, 'patientIdLabel')}
            className={fieldClass}
          />
          <p className="text-xs text-slate-400 mt-1">
            Optional — used to link with hospital records or ABDM
          </p>
        </div>
      </div>

      {/* Demo Quick-Fill Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-blue-800">
        <span className="text-base shrink-0">💡</span>
        <p>
          <strong>Demo mode:</strong> Leave all fields blank and click &ldquo;Continue&rdquo; to use the demo patient (Ramesh Verma, 45M) for evaluation.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => onNext(pid || '', name, age ? parseInt(age) : undefined, gender)}
          className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
        >
          {t(language, 'next')} →
        </button>
        <button
          onClick={() => onNext('', '', undefined, '')}
          className="flex-1 py-3.5 border-2 border-slate-300 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
        >
          {t(language, 'continueAsGuest')}
        </button>
      </div>
    </div>
  );
}
