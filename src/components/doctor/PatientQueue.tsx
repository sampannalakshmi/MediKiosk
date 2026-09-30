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
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500 animate-ping',
  },
  HIGH: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  MEDIUM: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    dot: 'bg-yellow-500',
  },
  LOW: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
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
    <div className="flex flex-col h-full">
      {/* Search & Filter Header */}
      <div className="p-3 border-b border-slate-100 bg-white space-y-2 sticky top-0 z-10">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient, ABHA, complaint..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-medical-500 bg-slate-50/50"
          />
        </div>

        {/* Priority Filter Chips */}
        <div className="flex items-center gap-1 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setPriorityFilter('ALL')}
            className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
              priorityFilter === 'ALL'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({cases.length})
          </button>
          <button
            type="button"
            onClick={() => setPriorityFilter('CRITICAL')}
            className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
              priorityFilter === 'CRITICAL'
                ? 'bg-red-600 text-white font-bold'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            Critical ({cases.filter((c) => c.priority === 'CRITICAL' || c.redFlags.length > 0).length})
          </button>
          <button
            type="button"
            onClick={() => setPriorityFilter('HIGH')}
            className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
              priorityFilter === 'HIGH'
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            High ({cases.filter((c) => c.priority === 'HIGH').length})
          </button>
        </div>
      </div>

      {/* Queue Item List */}
      <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
        {loading && (
          <div className="p-6 text-center text-slate-400 text-xs animate-pulse">
            Loading active triage queue...
          </div>
        )}

        {!loading && filteredCases.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs">
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
                  ? 'bg-medical-50/80 border-l-4 border-medical-600 shadow-2xs'
                  : 'hover:bg-slate-50 border-l-4 border-transparent'
              }`}
            >
              {/* Row 1: Patient Name & Urgency Badge */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      c.patient?.gender === 'female' ? 'bg-rose-100 text-rose-700' : 'bg-sky-100 text-sky-700'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-slate-900 text-xs group-hover:text-medical-700">
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
              <div className="text-xs text-slate-600 font-medium line-clamp-1 ml-7">
                {c.chiefComplaint}
              </div>

              {/* Row 3: Meta tags (ABHA, Lang, Flags, Docs) */}
              <div className="flex items-center gap-2 mt-2 ml-7 text-[10px] flex-wrap">
                <span className="font-mono bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-medium">
                  {c.patientId}
                </span>

                <span className="font-bold uppercase text-slate-400">
                  {c.language}
                </span>

                {c.redFlags.length > 0 && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded font-bold bg-red-100 text-red-700">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>{c.redFlags.length} flag{c.redFlags.length > 1 ? 's' : ''}</span>
                  </span>
                )}

                {docCount > 0 && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded font-semibold bg-emerald-100 text-emerald-800">
                    <FileText className="w-2.5 h-2.5" />
                    <span>{docCount} doc{docCount > 1 ? 's' : ''}</span>
                  </span>
                )}

                {(c.status === 'reviewed' || c.status === 'completed') && (
                  <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold ml-auto" title="Reviewed by doctor">
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
