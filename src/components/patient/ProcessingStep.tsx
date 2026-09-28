'use client';
import { t } from '@/i18n/translations';
import type { Language } from '@/types/clinical';

export default function ProcessingStep({ language }: { language: Language }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 space-y-6">
      <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full" />
      <p className="text-xl font-medium text-gray-700">{t(language, 'processing')}</p>
      <p className="text-sm text-gray-500">Generating your clinical summary...</p>
    </div>
  );
}
