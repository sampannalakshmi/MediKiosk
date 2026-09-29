'use client';
import { useEffect, useState } from 'react';
import type { Language } from '@/types/clinical';

export default function SubmissionStep({ language }: { language: Language }) {
  const [count, setCount] = useState(0);

  // Confetti-style counter animation
  useEffect(() => {
    let n = 0;
    const interval = setInterval(() => {
      n++;
      setCount(n);
      if (n >= 100) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  const successMsg =
    language === 'te'
      ? 'విజయవంతంగా సమర్పించబడింది'
      : language === 'hi'
      ? 'सफलतापूर्वक जमा किया गया'
      : 'Successfully Submitted';

  const doctorMsg =
    language === 'te'
      ? 'మీ వైద్యుడు మీ సంప్రదింపుకు ముందు దీన్ని సమీక్షిస్తారు.'
      : language === 'hi'
      ? 'आपके परामर्श से पहले आपके डॉक्टर इसकी समीक्षा करेंगे।'
      : 'Your doctor will review this before your consultation.';

  return (
    <div className="max-w-xl mx-auto text-center space-y-8 py-12 px-4">
      {/* Success icon with progress ring */}
      <div className="relative w-28 h-28 mx-auto">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="54"
            fill="none" stroke="#16a34a" strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 54}`}
            strokeDashoffset={`${2 * Math.PI * 54 * (1 - count / 100)}`}
            strokeLinecap="round"
            className="transition-all"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl">{count >= 100 ? '✅' : '⏳'}</span>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl font-extrabold text-green-700">{successMsg}</h2>
        <p className="text-slate-600 text-base max-w-md mx-auto">{doctorMsg}</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
        {[
          { icon: '📋', title: 'Intake Complete', desc: 'Clinical history recorded' },
          { icon: '🔒', title: 'Data Secured', desc: 'Shared only with your doctor' },
          { icon: '👨‍⚕️', title: 'Doctor Notified', desc: 'Placed in priority queue' },
        ].map((item) => (
          <div key={item.title} className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <span className="text-2xl">{item.icon}</span>
            <p className="font-bold text-green-900 text-sm mt-2">{item.title}</p>
            <p className="text-xs text-green-700 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Non-diagnostic reminder */}
      <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 text-left">
        <span className="text-emerald-600 text-xl shrink-0">🛡</span>
        <p>
          Remember: MediKiosk is an <strong>assistive case-taking tool</strong>. Your doctor will examine you, interpret findings, and make all medical decisions.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
        >
          Start New Session
        </button>
        <a
          href="/doctor"
          className="px-8 py-3.5 border-2 border-slate-300 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors text-center"
        >
          View Doctor Portal →
        </a>
      </div>
    </div>
  );
}
