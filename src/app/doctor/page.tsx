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
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-blue-700 text-xl font-bold">🏥 MediKiosk</span>
          <span className="text-sm font-semibold text-gray-700 border-l border-gray-300 pl-3">Doctor Portal</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">Dashboard is in English regardless of patient language</span>
          <a href="/" className="text-xs text-blue-600 underline">← Patient Kiosk</a>
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
