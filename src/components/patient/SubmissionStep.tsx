'use client';
import { t } from '@/i18n/translations';
import type { Language } from '@/types/clinical';

export default function SubmissionStep({ language }: { language: Language }) {
  return (
    <div className="text-center space-y-6 py-16">
      <div className="text-6xl">✅</div>
      <h2 className="text-2xl font-bold text-green-700">{t(language, 'submitted')}</h2>
      <p className="text-gray-600 max-w-md mx-auto">{t(language, 'doctorWillReview')}</p>
      <div className="bg-blue-50 rounded-2xl p-6 max-w-sm mx-auto text-sm text-blue-700">
        <p className="font-semibold mb-2">Your information is secure</p>
        <p>Your medical history has been sent to the doctor&apos;s queue and will be reviewed before your consultation.</p>
      </div>
      <button onClick={() => window.location.reload()} className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors">
        Start a new session
      </button>
    </div>
  );
}
