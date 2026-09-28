'use client';
import { t } from '@/i18n/translations';
import type { Language } from '@/types/clinical';

interface Props { language: Language; onSelect: (mode: 'voice' | 'text' | 'touch') => void; }

export default function ModeSelectionStep({ language, onSelect }: Props) {
  const modes: { mode: 'voice' | 'text' | 'touch'; icon: string; key: 'voiceMode' | 'textMode' | 'touchMode' }[] = [
    { mode: 'voice', icon: '🎙', key: 'voiceMode' },
    { mode: 'text',  icon: '⌨',  key: 'textMode'  },
    { mode: 'touch', icon: '👆', key: 'touchMode' },
  ];
  return (
    <div className="max-w-md mx-auto space-y-6 py-8">
      <h2 className="text-2xl font-bold text-gray-800">{t(language, 'selectMode')}</h2>
      {modes.map(({ mode, icon, key }) => (
        <button key={mode} onClick={() => onSelect(mode)}
          className="w-full flex items-center gap-5 px-6 py-5 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
          <span className="text-4xl">{icon}</span>
          <span className="font-semibold text-gray-800">{t(language, key)}</span>
        </button>
      ))}
    </div>
  );
}
