'use client';
import { t } from '@/i18n/translations';
import type { Language } from '@/types/clinical';

interface Props {
  language: Language;
  summary: string;
  redFlagCount: number;
  onSubmit: () => void;
}

export default function ReviewStep({ language, summary, redFlagCount, onSubmit }: Props) {
  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6">
      <h2 className="text-2xl font-bold text-gray-800">{t(language, 'reviewSummary')}</h2>

      {redFlagCount > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4">
          <p className="text-red-700 font-semibold">⚠ {redFlagCount} alert(s) flagged for urgent physician review</p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Preliminary Clinical Summary</h3>
        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">{summary || 'Summary will appear here.'}</pre>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
        ⚠ This is an AI-assisted summary based on your answers. Your doctor will review and verify all information before your consultation.
      </div>

      <button onClick={onSubmit} className="w-full py-4 bg-green-600 text-white rounded-2xl font-semibold hover:bg-green-700 transition-colors text-lg">
        ✓ {t(language, 'submit')} — Send to Doctor
      </button>
    </div>
  );
}
