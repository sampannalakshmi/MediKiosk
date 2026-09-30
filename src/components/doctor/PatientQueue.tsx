'use client';

import { useState, useEffect } from 'react';
import type { ConsultationCase } from '@/types/clinical';
import { 
  Search, 
  AlertTriangle, 
  FileText, 
  User, 
  CheckCircle2 
} from 'lucide-react';

const PRIORITY_BADGES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  CRITICAL: {
    bg: 'bg-red-950/80',
    text: 'text-red-300',
    border: 'border-red-800',
    dot: 'bg-red-500 animate-ping',
  },
  HIGH: {
    bg: 'bg-amber-950/80',
    text: 'text-amber-300',
    border: 'border-amber-800',
    dot: 'bg-amber-500',
  },
  MEDIUM: {
    bg: 'bg-yellow-950/80',
    text: 'text-yellow-300',
    border: 'border-yellow-800',
    dot: 'bg-yellow-500',
  },
  LOW: {
    bg: 'bg-emerald-950/80',
    text: 'text-emerald-300',
    border: 'border-emerald-800',
    dot: 'bg-emerald-500',
  },
};

interface Props {
  onSelectCase: (c: ConsultationCase) => void;
  selectedId?: string;
}

export default function PatientQueue({ onSelectCase, selectedId }: Props) {
  const [cases, setCases] = useState<ConsultationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/consultations');
        const data = await res.json();
        const order: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        data.sort(
          (a: ConsultationCase, b: ConsultationCase) =>
            (order[a.priority] ?? 4) - (order[b.priority] ?? 4)
        );
        setCases(data);
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      (c.patient?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (c.patientId?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (c.chiefComplaint?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    const matchesPriority =
      priorityFilter === 'ALL'
        ? true
        : priorityFilter === 'CRITICAL'
        ? c.priority === 'CRITICAL' || c.redFlags.length > 0
        : c.priority === 'HIGH';

    return matchesSearch && matchesPriority;
  });

  return (
    <div className="flex flex-col h-full bg-slate-900/40">
      {/* Search & Filter Header */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/90 space-y-2 sticky top-0 z-10 backdrop-blur-md">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search patient, ABHA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-700/80 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-950 text-white placeholder-slate-500 shadow-inner"
          />
        </div>

        {/* Priority Filter Chips */}
        <div className="flex items-center gap-1 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setPriorityFilter('ALL')}
            className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
              priorityFilter === 'ALL'
                ? 'bg-cyan-500 text-slate-950 font-black'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            All ({cases.length})
          </button>
          <button
            type="button"
            onClick={() => setPriorityFilter('CRITICAL')}
            className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
              priorityFilter === 'CRITICAL'
                ? 'bg-red-500 text-slate-950 font-black'
                : 'bg-red-950/60 text-red-400 hover:bg-red-900/60 border border-red-900/40'
            }`}
          >
            Critical ({cases.filter((c) => c.priority === 'CRITICAL' || c.redFlags.length > 0).length})
          </button>
          <button
            type="button"
            onClick={() => setPriorityFilter('HIGH')}
            className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
              priorityFilter === 'HIGH'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-amber-950/60 text-amber-400 hover:bg-amber-900/60 border border-amber-900/40'
            }`}
          >
            High ({cases.filter((c) => c.priority === 'HIGH').length})
          </button>
        </div>
      </div>

      {/* Queue Item List */}
      <div className="divide-y divide-slate-800/80 flex-1 overflow-y-auto">
        {loading && (
          <div className="p-6 text-center text-slate-500 text-xs animate-pulse">
            Loading active triage queue...
          </div>
        )}

        {!loading && filteredCases.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs">
            No matching cases in queue.
          </div>
        )}

        {filteredCases.map((c) => {
          const isSelected = selectedId === c.id;
          const badge = PRIORITY_BADGES[c.priority] || PRIORITY_BADGES.LOW;
          const docCount = c.documents?.length || 0;

          return (
            <button
              key={c.id}
              onClick={() => onSelectCase(c)}
              className={`w-full text-left p-3.5 transition-all cursor-pointer relative group ${
                isSelected
                  ? 'bg-cyan-950/50 border-l-4 border-cyan-400 shadow-md shadow-cyan-950/30'
                  : 'hover:bg-slate-800/60 border-l-4 border-transparent'
              }`}
            >
              {/* Row 1: Patient Name & Urgency Badge */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      c.patient?.gender === 'female'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                        : 'bg-sky-950 text-sky-300 border border-sky-800/60'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-white text-xs group-hover:text-cyan-300">
                    {c.patient?.name ?? 'Guest Patient'}
                  </span>
                </div>

                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full mr-1 ${badge.dot}`} />
                  {c.priority}
                </span>
              </div>

              {/* Row 2: Chief Complaint */}
              <div className="text-xs text-slate-300 font-medium line-clamp-1 ml-7">
                {c.chiefComplaint}
              </div>

              {/* Row 3: Meta tags (ABHA, Lang, Flags, Docs) */}
              <div className="flex items-center gap-2 mt-2 ml-7 text-[10px] flex-wrap">
                <span className="font-mono bg-slate-950 text-slate-400 px-1.5 py-0.2 rounded font-medium border border-slate-800">
                  {c.patientId}
                </span>

                <span className="font-bold uppercase text-slate-500">
                  {c.language}
                </span>

                {c.redFlags.length > 0 && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded font-bold bg-red-950 text-red-300 border border-red-900/60">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>{c.redFlags.length} flag{c.redFlags.length > 1 ? 's' : ''}</span>
                  </span>
                )}

                {docCount > 0 && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded font-semibold bg-emerald-950 text-emerald-300 border border-emerald-900/60">
                    <FileText className="w-2.5 h-2.5" />
                    <span>{docCount} doc{docCount > 1 ? 's' : ''}</span>
                  </span>
                )}

                {(c.status === 'reviewed' || c.status === 'completed') && (
                  <span className="inline-flex items-center gap-0.5 text-emerald-400 font-bold ml-auto" title="Reviewed by doctor">
                    <CheckCircle2 className="w-3 h-3" />
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
