'use client';
import { t } from '@/i18n/translations';
import type { Language } from '@/types/clinical';

export default function ConsentStep({ language, onAccept }: { language: Language; onAccept: () => void }) {
  return (
    <div className="max-w-lg mx-auto space-y-6 py-8">
      <h2 className="text-2xl font-bold text-gray-800">{t(language, 'consentTitle')}</h2>
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-gray-700 leading-relaxed">
        <p>{t(language, 'consentBody')}</p>
      </div>
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
        ⚠ This system does <strong>not</strong> diagnose or prescribe. All information is reviewed by a qualified physician.
      </div>
      <button onClick={onAccept} className="w-full py-4 bg-green-600 text-white rounded-2xl font-semibold hover:bg-green-700 transition-colors">
        ✓ {t(language, 'iConsent')}
      </button>
    </div>
  );
}
