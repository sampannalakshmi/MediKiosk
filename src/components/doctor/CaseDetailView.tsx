'use client';
import { useState } from 'react';
import type { ConsultationCase } from '@/types/clinical';

interface Props { caseData: ConsultationCase; onUpdated: () => void; }

export default function CaseDetailView({ caseData: c, onUpdated }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [notes, setNotes] = useState('');
  const [showFHIR, setShowFHIR] = useState(false);
  const [fhirData, setFhirData] = useState<object | null>(null);
  const h = c.socratesHistory;

  const confirm = async () => {
    setConfirming(true);
    await fetch('/api/doctor/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseId: c.id, reviewedBy: 'Dr. (Demo)', notes }),
    });
    setConfirming(false);
    onUpdated();
  };

  const loadFHIR = async () => {
    const res = await fetch(`/api/abdm/simulate?caseId=${c.id}`);
    setFhirData(await res.json());
    setShowFHIR(true);
  };

  const Row = ({ label, value }: { label: string; value?: unknown }) =>
    value !== undefined && value !== null && value !== '' ? (
      <div className="flex gap-3 py-1.5 border-b border-gray-100">
        <span className="text-xs text-gray-500 w-40 shrink-0 pt-0.5">{label}</span>
        <span className="text-sm text-gray-800 font-medium">{String(value)}</span>
      </div>
    ) : null;

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{c.patient?.name ?? 'Guest'}</h2>
          <p className="text-sm text-gray-500">
            {c.patient?.age ? `${c.patient.age}y ` : ''}{c.patient?.gender ?? ''} · {c.language.toUpperCase()} · Case {c.id}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold border
          ${c.priority === 'CRITICAL' ? 'bg-red-100 text-red-800 border-red-300' :
            c.priority === 'HIGH'     ? 'bg-orange-100 text-orange-800 border-orange-300' :
            'bg-gray-100 text-gray-700 border-gray-300'}`}>
          {c.priority}
        </div>
      </div>

      {/* Red flags */}
      {c.redFlags.length > 0 && (
        <div className="space-y-2">
          {c.redFlags.map((f, i) => (
            <div key={i} className={`rounded-xl p-4 border ${f.severity === 'CRITICAL' ? 'bg-red-50 border-red-300' : 'bg-orange-50 border-orange-300'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">⚠</span>
                <span className="font-semibold text-sm">{f.label}</span>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${f.severity === 'CRITICAL' ? 'bg-red-200 text-red-800' : 'bg-orange-200 text-orange-800'}`}>{f.severity}</span>
              </div>
              <p className="text-sm text-gray-700 ml-7">{f.description}</p>
              <p className="text-xs text-gray-500 ml-7 mt-1 font-medium">Action: {f.recommendedAction}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chief complaint */}
      <div className="bg-blue-50 rounded-xl p-4">
        <p className="text-xs text-blue-500 font-semibold uppercase tracking-wide">Chief Complaint</p>
        <p className="text-lg font-medium text-blue-900 mt-1">{c.chiefComplaint}</p>
      </div>

      {/* SOCRATES history */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">SOCRATES History</h3>
        <Row label="Site" value={h.site} />
        <Row label="Radiation" value={h.radiation} />
        <Row label="Onset" value={h.onset} />
        <Row label="Duration" value={h.onsetDuration} />
        <Row label="Context" value={h.onsetContext} />
        <Row label="Character" value={h.character} />
        <Row label="Time course" value={h.timeCourse} />
        <Row label="Trend" value={h.progressionTrend} />
        <Row label="Severity" value={h.severity !== undefined ? `${h.severity}/10` : undefined} />
        <Row label="Nausea" value={h.nausea !== undefined ? (h.nausea ? 'Yes' : 'No') : undefined} />
        <Row label="Vomiting" value={h.vomiting !== undefined ? (h.vomiting ? 'Yes' : 'No') : undefined} />
        <Row label="Fever" value={h.fever !== undefined ? (h.fever ? `Yes${h.feverDegree ? ` (${h.feverDegree})` : ''}` : 'No') : undefined} />
        <Row label="Diarrhoea" value={h.diarrhoea !== undefined ? (h.diarrhoea ? 'Yes' : 'No') : undefined} />
        <Row label="Blood in stool" value={h.bloodInStool !== undefined ? (h.bloodInStool ? '⚠ Yes' : 'No') : undefined} />
        <Row label="Jaundice" value={h.jaundice !== undefined ? (h.jaundice ? 'Yes' : 'No') : undefined} />
        <Row label="Exacerbating" value={h.exacerbatingFactors?.join(', ')} />
        <Row label="Relieving" value={h.relievingFactors?.join(', ')} />
        <Row label="Past similar" value={h.similarEpisodesBefore !== undefined ? (h.similarEpisodesBefore ? 'Yes' : 'No') : undefined} />
        <Row label="Prior surgery" value={h.previousAbdominalSurgery !== undefined ? (h.previousAbdominalSurgery ? 'Yes' : 'No') : undefined} />
        <Row label="Medications" value={h.relevantMedications?.join(', ')} />
        <Row label="Allergies" value={h.allergies} />
        <Row label="LMP" value={h.lastMenstrualPeriod} />
      </div>

      {/* Preliminary summary */}
      {c.preliminarySummary && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Preliminary AI Summary</h3>
          <pre className="whitespace-pre-wrap text-xs text-gray-700 font-mono leading-relaxed">{c.preliminarySummary}</pre>
          <p className="text-xs text-yellow-700 mt-3 bg-yellow-50 rounded p-2">⚠ This is an AI-assisted preliminary summary for physician review only. Not a diagnosis.</p>
        </div>
      )}

      {/* Doctor notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          placeholder="Add clinical notes, differentials, or corrections here..."
          className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <button onClick={confirm} disabled={confirming}
          className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors">
          {confirming ? 'Confirming...' : '✓ Confirm & Sign Off'}
        </button>
        <button onClick={loadFHIR}
          className="px-6 py-3 border border-blue-400 text-blue-700 rounded-xl font-medium hover:bg-blue-50 transition-colors">
          📋 View FHIR Bundle
        </button>
      </div>

      {/* FHIR Modal */}
      {showFHIR && fhirData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">FHIR R4 Bundle (ABDM Simulation)</h3>
              <button onClick={() => setShowFHIR(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap">{JSON.stringify(fhirData, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
