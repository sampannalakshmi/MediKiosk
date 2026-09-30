'use client';
// ─────────────────────────────────────────────────────────────────────────────
// MediKiosk — Doctor Portal & Clinical Triage Command Center (Dark Theme)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, Suspense } from 'react';
import type { ConsultationCase } from '@/types/clinical';
import Header from '@/components/common/Header';
import PatientQueue from '@/components/doctor/PatientQueue';
import CaseDetailView from '@/components/doctor/CaseDetailView';
import { 
  RotateCcw, 
  Users, 
  AlertTriangle, 
  FileCheck2, 
  Clock,
  Sparkles,
  HeartPulse
} from 'lucide-react';

function DoctorPortal() {
  const [selected, setSelected] = useState<ConsultationCase | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [queueCases, setQueueCases] = useState<ConsultationCase[]>([]);
  const [isResetting, setIsResetting] = useState(false);

  // Load queue cases to calculate metrics
  useEffect(() => {
    fetch('/api/consultations')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setQueueCases(data);
        }
      })
      .catch(() => {});
  }, [refreshKey, selected]);

  const handleSelectCase = async (c: ConsultationCase) => {
    const res = await fetch(`/api/consultations/${c.id}`);
    const full = await res.json();
    setSelected(full);
  };

  const handleResetDemoData = async () => {
    if (confirm('Reset prototype state to default synthetic demo cases (Ramesh Verma & Priya Reddy)?')) {
      setIsResetting(true);
      await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset: true }),
      }).catch(() => {});
      setIsResetting(false);
      setRefreshKey((k) => k + 1);
      setSelected(null);
    }
  };

  // Metric counts
  const totalCount = queueCases.length;
  const criticalCount = queueCases.filter((c) => c.priority === 'CRITICAL' || c.redFlags.length > 0).length;
  const highCount = queueCases.filter((c) => c.priority === 'HIGH').length;
  const documentsCount = queueCases.reduce((acc, c) => acc + (c.documents?.length || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* ── Top Header Navigation Bar ────────────────────────────────────────── */}
      <Header currentPortal="doctor" />

      {/* ── Sub-Header: Metric Ribbon Bar & Reset Button ───────────────────── */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Metric Ribbon Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs flex-1 w-full">
            <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400 font-medium">Waiting</span>
              </div>
              <span className="font-bold text-white text-sm font-mono">{totalCount}</span>
            </div>

            <div className="bg-red-950/40 p-2 rounded-xl border border-red-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-red-300 font-medium">Critical Triage</span>
              </div>
              <span className="font-bold text-red-400 text-sm font-mono">{criticalCount}</span>
            </div>

            <div className="bg-amber-950/40 p-2 rounded-xl border border-amber-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300 font-medium">High Priority</span>
              </div>
              <span className="font-bold text-amber-400 text-sm font-mono">{highCount}</span>
            </div>

            <div className="bg-emerald-950/40 p-2 rounded-xl border border-emerald-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-medium">Digitized</span>
              </div>
              <span className="font-bold text-emerald-400 text-sm font-mono">{documentsCount}</span>
            </div>
          </div>

          {/* Quick Demo Reset */}
          <button
            type="button"
            onClick={handleResetDemoData}
            disabled={isResetting}
            className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700/80 hover:border-cyan-500/50 hover:bg-slate-800 transition-all font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            title="Reset synthetic demo cases"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-cyan-400 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Resetting...' : 'Reset Demo Data'}</span>
          </button>
        </div>
      </div>

      {/* ── Main Layout: Queue Sidebar + Patient Case Workspace ────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Patient Queue Sidebar */}
        <aside className="w-80 shrink-0 bg-slate-900/70 border-r border-slate-800 overflow-y-auto flex flex-col shadow-xs">
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
            <div>
              <h2 className="font-bold text-white text-xs uppercase tracking-wider">Active Patient Queue</h2>
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Deterministic Safety Triage</span>
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold bg-slate-800 text-cyan-400 px-2 py-0.5 rounded-md border border-slate-700">
              {queueCases.length} Cases
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            <PatientQueue
              key={refreshKey}
              onSelectCase={handleSelectCase}
              selectedId={selected?.id}
            />
          </div>
        </aside>

        {/* Case Detail Workspace */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6">
          {selected ? (
            <CaseDetailView
              key={selected.id}
              caseData={selected}
              onUpdated={() => {
                setRefreshKey((k) => k + 1);
                setSelected(null);
              }}
            />
          ) : (
            <div className="max-w-3xl mx-auto py-16 px-6 text-center">
              <div className="dark-glass-card rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-950 to-teal-900 text-cyan-400 flex items-center justify-center mx-auto mb-6 border border-cyan-800/60 shadow-lg shadow-cyan-950/40">
                  <HeartPulse className="w-10 h-10 animate-pulse-subtle" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  Physician Consultation Workspace
                </h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto mt-2 leading-relaxed">
                  Select a patient from the priority queue on the left to review their structured SOCRATES history, digitized records, and red flag triage findings.
                </p>

                {/* Quick Demo Case Selector */}
                {queueCases.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-slate-800/80">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                      Quick Access Demo Cases
                    </span>
                    <div className="flex flex-wrap justify-center gap-3">
                      {queueCases.slice(0, 3).map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleSelectCase(c)}
                          className="px-4 py-2.5 rounded-2xl border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-800/80 bg-slate-900/60 text-left transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white group-hover:text-cyan-400">
                              {c.patient?.name ?? 'Patient'}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.2 rounded-full font-bold uppercase ${
                                c.priority === 'CRITICAL'
                                  ? 'bg-red-950 text-red-300 border border-red-800'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}
                            >
                              {c.priority}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {c.chiefComplaint}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Supports ABDM Milestone 3 HL7 FHIR Bundle Generation &amp; Evidence Auditing</span>
                </div>
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
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-slate-950 text-slate-400">
          Loading Physician Portal...
        </div>
      }
    >
      <DoctorPortal />
    </Suspense>
  );
}
