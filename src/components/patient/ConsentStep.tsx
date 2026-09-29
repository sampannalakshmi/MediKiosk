'use client';
import { useState } from 'react';
import { t } from '@/i18n/translations';
import type { Language } from '@/types/clinical';

export default function ConsentStep({ language, onAccept }: { language: Language; onAccept: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [ticked, setTicked] = useState(false);

  return (
    <div className="max-w-lg mx-auto space-y-5 py-8 px-4">
      {/* Title */}
      <div className="text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl mb-3">
          🛡
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">{t(language, 'consentTitle')}</h2>
        <p className="text-sm text-slate-500 mt-1">Please read carefully before proceeding</p>
      </div>

      {/* Scrollable Consent Body */}
      <div
        className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-700 leading-relaxed text-sm max-h-52 overflow-y-auto space-y-4"
        onScroll={(e) => {
          const el = e.currentTarget;
          if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) setScrolled(true);
        }}
      >
        <p>{t(language, 'consentBody')}</p>
        <hr className="border-slate-200" />
        <p className="font-semibold text-slate-800">What will this system do?</p>
        <ul className="list-disc list-inside space-y-1.5 text-slate-600">
          <li>Ask you structured questions about your symptoms</li>
          <li>Help digitize your previous medical documents (optional)</li>
          <li>Generate a structured summary for your doctor&apos;s review</li>
          <li>Flag potentially serious symptoms for prioritized attention</li>
        </ul>
        <p className="font-semibold text-slate-800">What will this system NOT do?</p>
        <ul className="list-disc list-inside space-y-1.5 text-slate-600">
          <li>Diagnose any medical condition</li>
          <li>Prescribe or recommend medications</li>
          <li>Replace your physician&apos;s examination and judgment</li>
          <li>Share information outside your treating clinical team</li>
        </ul>
        <p className="text-xs text-slate-400 italic">
          Ministry of Ayush — SIH 2026 Prototype · Problem Statement ID: 26047
        </p>
      </div>

      {/* Not scrolled hint */}
      {!scrolled && (
        <p className="text-center text-xs text-amber-600">↓ Scroll to read full consent before proceeding</p>
      )}

      {/* Non-diagnostic Safety Notice */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
        <span className="text-xl shrink-0">⚠</span>
        <p>
          This system does <strong>NOT</strong> diagnose or prescribe. All information is reviewed by a qualified physician.
        </p>
      </div>

      {/* Checkbox Consent */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={ticked}
          onChange={(e) => setTicked(e.target.checked)}
          className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
        <span className="text-sm text-slate-700 leading-relaxed group-hover:text-slate-900">
          {t(language, 'iConsent')}
        </span>
      </label>

      {/* CTA */}
      <button
        onClick={onAccept}
        disabled={!ticked}
        className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-base shadow-md shadow-green-600/20"
      >
        ✓ Consent &amp; Proceed
      </button>
    </div>
  );
}
