'use client';
import { useState, useEffect } from 'react';
import type { ConsultationCase } from '@/types/clinical';

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-300',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  LOW: 'bg-green-100 text-green-800 border-green-300',
};

interface Props { onSelectCase: (c: ConsultationCase) => void; selectedId?: string; }

export default function PatientQueue({ onSelectCase, selectedId }: Props) {
  const [cases, setCases] = useState<ConsultationCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/consultations');
        const data = await res.json();
        // Sort: CRITICAL first
        const order: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        data.sort((a: ConsultationCase, b: ConsultationCase) => (order[a.priority] ?? 4) - (order[b.priority] ?? 4));
        setCases(data);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-4 text-gray-500 text-sm animate-pulse">Loading queue...</div>;

  return (
    <div className="divide-y divide-gray-100">
      {cases.length === 0 && <p className="p-4 text-gray-400 text-sm">No cases in queue.</p>}
      {cases.map(c => (
        <button
          key={c.id}
          onClick={() => onSelectCase(c)}
          className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selectedId === c.id ? 'bg-blue-50' : ''}`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-gray-800">{c.patient?.name ?? 'Guest'}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${PRIORITY_COLORS[c.priority]}`}>
              {c.priority}
            </span>
          </div>
          <div className="text-sm text-gray-500">{c.chiefComplaint}</div>
          <div className="flex items-center gap-2 mt-1">
            {c.redFlags.length > 0 && (
              <span className="text-xs text-red-600 font-medium">⚠ {c.redFlags.length} flag(s)</span>
            )}
            <span className="text-xs text-gray-400">{c.language.toUpperCase()} · {c.status}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
