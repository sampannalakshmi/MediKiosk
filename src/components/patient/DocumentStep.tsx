'use client';
import { t } from '@/i18n/translations';
import type { Language } from '@/types/clinical';

interface Props { language: Language; onSkip: () => void; }

export default function DocumentStep({ language, onSkip }: Props) {
  return (
    <div className="max-w-md mx-auto space-y-6 py-8 text-center">
      <div className="text-5xl">📄</div>
      <h2 className="text-2xl font-bold text-gray-800">{t(language, 'uploadDocuments')}</h2>
      <p className="text-gray-600">Previous prescriptions, lab reports, or discharge summaries help your doctor.</p>
      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-gray-400">
        <p>Document upload available in full version</p>
      </div>
      <button onClick={onSkip} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition-colors">
        {t(language, 'next')} (Skip for now)
      </button>
    </div>
  );
}
