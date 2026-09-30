'use client';
// ─────────────────────────────────────────────────────────────────────────────
// MediKiosk — Doctor Portal & Clinical Triage Command Center
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, Suspense } from 'react';
import type { ConsultationCase } from '@/types/clinical';
import PatientQueue from '@/components/doctor/PatientQueue';
import CaseDetailView from '@/components/doctor/CaseDetailView';
import { 
  HeartPulse, 
  RotateCcw, 
  Activity, 
  ShieldCheck, 
  Users, 
  AlertTriangle, 
  FileCheck2, 
  Clock,
  Sparkles
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
          // If none selected, default to the highest priority case
          if (!selected && data.length > 0) {
            // keep unselected or let doctor click
          }
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
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-medical-500 selection:text-white">
      {/* ── Top Header Navigation Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Brand & Subtitle */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2.5">
              <a href="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-medical-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-medical-600/20">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-lg font-extrabold text-slate-900 tracking-tight">
                    Medi<span className="text-medical-600">Kiosk</span>
                  </span>
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-medical-50 text-medical-800 border border-medical-200">
                    Physician Portal
                  </span>
                </div>
              </a>
            </div>

            <div className="hidden lg:flex items-center gap-2 border-l border-slate-200 pl-3">
              <span className="text-xs text-slate-500 font-medium">
                Hospital Intake &amp; Triage Station
              </span>
            </div>
          </div>

          {/* Center: Verified Clinician View Seal */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified Clinician Review View · English Translation Engine</span>
          </div>

          {/* Right: Actions & Portal Navigation Switcher */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetDemoData}
              disabled={isResetting}
              className="text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Reset synthetic demo cases"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-slate-400 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Resetting...' : 'Reset Demo Data'}</span>
            </button>

            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold shadow-inner">
              <a
                href="/"
                className="px-3.5 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-all"
              >
                ← Patient Kiosk
              </a>
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white shadow-xs flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-medical-400" />
                <span>Doctor Portal</span>
              </span>
            </div>
          </div>
        </div>

        {/* ── Metric Ribbon Bar ────────────────────────────────────────────── */}
        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" />
              <span className="text-slate-600 font-medium">Patients Waiting</span>
            </div>
            <span className="font-bold text-slate-900 text-sm font-mono">{totalCount}</span>
          </div>

          <div className="bg-red-50/70 p-2.5 rounded-xl border border-red-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-red-900 font-medium">Critical Triage</span>
            </div>
            <span className="font-bold text-red-700 text-sm font-mono">{criticalCount}</span>
          </div>

          <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-amber-900 font-medium">High Priority</span>
            </div>
            <span className="font-bold text-amber-700 text-sm font-mono">{highCount}</span>
          </div>

          <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-900 font-medium">Digitized Records</span>
            </div>
            <span className="font-bold text-emerald-700 text-sm font-mono">{documentsCount}</span>
          </div>
        </div>
      </header>

      {/* ── Main Layout: Queue Sidebar + Patient Case Workspace ────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Patient Queue Sidebar */}
        <aside className="w-80 shrink-0 bg-white border-r border-slate-200 overflow-y-auto flex flex-col shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Active Patient Queue</h2>
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Live Priority Sorting</span>
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-md">
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
        <main className="flex-1 overflow-y-auto bg-slate-50/60">
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
              <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl shadow-slate-900/5">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-medical-100 to-teal-100 text-medical-700 flex items-center justify-center mx-auto mb-6">
                  <HeartPulse className="w-10 h-10 text-medical-600" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Clinician Consultation Workspace
                </h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto mt-2 leading-relaxed">
                  Select a patient from the priority queue on the left to review their structured SOCRATES history, digitized records, and red flag triage findings.
                </p>

                {/* Quick Demo Case Selector */}
                {queueCases.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                      Quick Access Demo Cases
                    </span>
                    <div className="flex flex-wrap justify-center gap-3">
                      {queueCases.slice(0, 3).map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleSelectCase(c)}
                          className="px-4 py-2.5 rounded-2xl border border-slate-200 hover:border-medical-500 hover:bg-medical-50/50 bg-slate-50 text-left transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-medical-700">
                              {c.patient?.name ?? 'Patient'}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.2 rounded-full font-bold uppercase ${
                                c.priority === 'CRITICAL'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {c.priority}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {c.chiefComplaint}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <Sparkles className="w-3.5 h-3.5 text-medical-500" />
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
        <div className="flex items-center justify-center h-screen text-slate-500">
          Loading Physician Portal...
        </div>
      }
    >
      <DoctorPortal />
    </Suspense>
  );
}
