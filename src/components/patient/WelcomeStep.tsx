'use client';
import { t } from '@/i18n/translations';
import type { Language } from '@/types/clinical';

export default function WelcomeStep({ language, onNext }: { language: Language; onNext: () => void }) {
  return (
    <div className="text-center space-y-8 py-12">
      <div className="text-6xl">🏥</div>
      <div>
        <h1 className="text-3xl font-bold text-blue-800">{t(language, 'appName')}</h1>
        <p className="mt-3 text-gray-600 text-lg max-w-md mx-auto">{t(language, 'welcomeSubtitle')}</p>
      </div>
      <div className="bg-blue-50 rounded-2xl p-4 max-w-sm mx-auto text-sm text-blue-700">
        <strong>Ministry of Ayush</strong> — Patient Case-Taking Software
      </div>
      <button onClick={onNext} className="px-10 py-4 bg-blue-600 text-white rounded-2xl text-lg font-semibold hover:bg-blue-700 shadow-lg transition-colors">
        {t(language, 'next')} →
      </button>
    </div>
  );
}
