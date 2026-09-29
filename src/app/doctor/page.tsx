'use client';
// ─────────────────────────────────────────────────────────────────────────────
// MediKiosk — Doctor Portal
// ─────────────────────────────────────────────────────────────────────────────

import { useState, Suspense } from 'react';
import type { ConsultationCase } from '@/types/clinical';
import PatientQueue from '@/components/doctor/PatientQueue';
import CaseDetailView from '@/components/doctor/CaseDetailView';

function DoctorPortal() {
  const [selected, setSelected] = useState<ConsultationCase | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectCase = async (c: ConsultationCase) => {
    // Fetch fresh full case
    const res = await fetch(`/api/consultations/${c.id}`);
    const full = await res.json();
    setSelected(full);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with Navigation Switcher */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2">
            <span className="text-blue-700 text-xl font-bold">🏥 MediKiosk</span>
          </a>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
            SIH 2026 · Ayush #26047
          </span>
          <span className="hidden md:inline-block text-xs text-gray-500 border-l border-gray-200 pl-3">
            Physician Intake &amp; Triage Portal
          </span>
        </div>

        {/* Center: Non-diagnostic assurance */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
          <span className="text-emerald-600">🛡</span>
          <span>Verified Clinician Review View · English Translation Mode</span>
        </div>

        {/* Right: Actions & View Switcher */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={async () => {
              if (confirm('Reset prototype state to default synthetic demo cases?')) {
                await fetch('/api/consultations', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ reset: true }),
                }).catch(() => {});
                setRefreshKey(k => k + 1);
                setSelected(null);
              }
            }}
            className="text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            title="Reset synthetic demo cases"
          >
            ↻ Reset Demo Data
          </button>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <a
              href="/"
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
            >
              ← Patient Kiosk
            </a>
            <span className="px-3 py-1.5 rounded-lg bg-blue-700 text-white shadow-xs">
              Doctor Portal
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Queue sidebar */}
        <aside className="w-72 shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Patient Queue</h2>
            <p className="text-xs text-gray-400 mt-0.5">Auto-refreshes every 10s</p>
          </div>
          <PatientQueue
            key={refreshKey}
            onSelectCase={handleSelectCase}
            selectedId={selected?.id}
          />
        </aside>

        {/* Case detail */}
        <main className="flex-1 overflow-y-auto">
          {selected ? (
            <CaseDetailView
              key={selected.id}
              caseData={selected}
              onUpdated={() => {
                setRefreshKey(k => k + 1);
                setSelected(null);
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div className="text-5xl mb-4">📋</div>
                <p className="text-lg">Select a patient from the queue</p>
                <p className="text-sm mt-1">Cases are sorted by priority</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function DoctorPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>}>
      <DoctorPortal />
    </Suspense>
  );
}
