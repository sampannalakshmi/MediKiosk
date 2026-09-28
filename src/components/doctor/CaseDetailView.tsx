'use client';
// ─────────────────────────────────────────────────────────────────────────────
// MediKiosk — Doctor Case Detail View (Phase 3)
// Enhanced with Medical Documents, Conflict Alerts, Timeline, & Evidence Linking
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import type { ConsultationCase } from '@/types/clinical';
import type { MedicalDocument } from '@/types/document';
import DocumentViewerModal from './DocumentViewerModal';

interface Props {
  caseData: ConsultationCase;
  onUpdated: () => void;
}

export default function CaseDetailView({ caseData: c, onUpdated }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [notes, setNotes] = useState('');
  const [showFHIR, setShowFHIR] = useState(false);
  const [fhirData, setFhirData] = useState<object | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<MedicalDocument | null>(null);

  const h = c.socratesHistory;

  const confirm = async () => {
    setConfirming(true);
    await fetch('/api/doctor/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseId: c.id, reviewedBy: 'Dr. (Verified Clinician)', notes }),
    });
    setConfirming(false);
    onUpdated();
  };

  const loadFHIR = async () => {
    const res = await fetch(`/api/abdm/simulate?caseId=${c.id}`);
    setFhirData(await res.json());
    setShowFHIR(true);
  };

  const handleConfirmDoc = async (docId: string) => {
    await fetch(`/api/documents/${docId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewStatus: 'verified' }),
    });
    setSelectedDoc(null);
    onUpdated();
  };

  const Row = ({ label, value }: { label: string; value?: unknown }) =>
    value !== undefined && value !== null && value !== '' ? (
      <div className="flex gap-3 py-1.5 border-b border-gray-100">
        <span className="text-xs text-gray-500 w-40 shrink-0 pt-0.5">{label}</span>
        <span className="text-sm text-gray-800 font-medium">{String(value)}</span>
      </div>
    ) : null;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">{c.patient?.name ?? 'Guest Patient'}</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
              {c.patientId}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {c.patient?.age ? `${c.patient.age}y ` : ''}
            {c.patient?.gender ? `• ${c.patient.gender} ` : ''}• Intake Language: {c.language.toUpperCase()} • Case ID: {c.id}
          </p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold border ${
            c.priority === 'CRITICAL'
              ? 'bg-red-100 text-red-800 border-red-300'
              : c.priority === 'HIGH'
              ? 'bg-orange-100 text-orange-800 border-orange-300'
              : c.priority === 'MEDIUM'
              ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
              : 'bg-green-100 text-green-800 border-green-300'
          }`}
        >
          {c.priority} PRIORITY
        </div>
      </div>

      {/* ⚠ Clinical Conflict Alert Banner (Item 16 & 27) */}
      {c.conflicts && c.conflicts.length > 0 && (
        <div className="space-y-3">
          {c.conflicts.map((conf) => (
            <div
              key={conf.id}
              className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 shadow-xs space-y-2"
            >
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <span className="text-lg">⚠️</span>
                <span>Information Conflict Detected — Clinician Verification Required</span>
              </div>
              <p className="text-xs text-amber-800">{conf.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
                  <span className="font-semibold text-gray-600 block">Patient Interview Reported:</span>
                  <span className="text-gray-900 font-medium">{conf.interviewValue}</span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
                  <span className="font-semibold text-gray-600 block">Document Stated ({conf.documentName}):</span>
                  <span className="text-gray-900 font-medium">{conf.documentValue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Red Flags Section */}
      {c.redFlags.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-red-700 uppercase tracking-wider">
            Clinical Red Flag Alerts ({c.redFlags.length})
          </h3>
          {c.redFlags.map((f, i) => (
            <div
              key={i}
              className={`rounded-2xl p-4 border ${
                f.severity === 'CRITICAL' ? 'bg-red-50 border-red-300' : 'bg-orange-50 border-orange-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">⚠</span>
                <span className="font-bold text-sm text-gray-900">{f.label}</span>
                <span
                  className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    f.severity === 'CRITICAL' ? 'bg-red-200 text-red-900' : 'bg-orange-200 text-orange-900'
                  }`}
                >
                  {f.severity}
                </span>
              </div>
              <p className="text-xs text-gray-700 ml-6">{f.description}</p>
              {f.sourceSnippet && (
                <p className="text-[11px] font-mono text-gray-600 ml-6 mt-1 bg-white/60 p-1.5 rounded border border-gray-200">
                  Evidence: &quot;{f.sourceSnippet}&quot;
                </p>
              )}
              <p className="text-xs text-gray-900 ml-6 mt-1 font-semibold">
                Recommended Action: {f.recommendedAction}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Chief Complaint */}
      <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4">
        <p className="text-[11px] text-blue-600 font-bold uppercase tracking-wider">Chief Complaint</p>
        <p className="text-base font-semibold text-blue-950 mt-0.5">{c.chiefComplaint}</p>
      </div>

      {/* 📄 Medical Documents Cards Section (Item 14) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Medical Documents ({c.documents?.length || 0})
            </h3>
            <p className="text-xs text-gray-500">
              Digitized prescriptions, lab investigations, and previous hospital summaries.
            </p>
          </div>
        </div>

        {(!c.documents || c.documents.length === 0) ? (
          <p className="text-xs text-gray-400 italic py-2">No documents attached to this case.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {c.documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl border border-gray-200 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-xs text-gray-900 line-clamp-1">{doc.filename}</h4>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                        doc.reviewStatus === 'verified'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {doc.reviewStatus === 'verified' ? '● Verified' : '● Needs review'}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500">
                    <span className="capitalize">{doc.documentType.replace(/_/g, ' ')}</span> • {doc.documentDate || 'Recent'}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 pt-1">{doc.summary}</p>
                </div>

                <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-blue-700">
                    {doc.extractions?.length || 0} clinical facts extracted
                  </span>
                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className="px-3 py-1 bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                  >
                    View Document →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ⏱ Patient Timeline Section (Item 17) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
          Patient Clinical Timeline
        </h3>
        <p className="text-xs text-gray-500">
          Chronological clinical events merged across interview statements and medical records.
        </p>

        {(!c.timeline || c.timeline.length === 0) ? (
          <p className="text-xs text-gray-400 italic">No timeline events recorded.</p>
        ) : (
          <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 ml-2 mt-3">
            {c.timeline.map((evt, idx) => (
              <div key={idx} className="relative group">
                {/* Dot */}
                <div
                  className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs ${
                    evt.source === 'document'
                      ? 'bg-emerald-500'
                      : evt.source === 'interview'
                      ? 'bg-blue-500'
                      : 'bg-purple-500'
                  }`}
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700">{evt.date}</span>
                    <span
                      className={`text-[10px] px-2 py-0.2 rounded-full font-bold uppercase ${
                        evt.source === 'document'
                          ? 'bg-emerald-100 text-emerald-800'
                          : evt.source === 'interview'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {evt.source === 'document' ? 'Document' : evt.source === 'interview' ? 'Patient' : 'System'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium">{evt.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SOCRATES Clinical History */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
          SOCRATES Clinical History
        </h3>
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

      {/* Preliminary AI Summary (Item 19) */}
      {c.preliminarySummary && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            Integrated Clinical Summary (Interview + Documents)
          </h3>
          <pre className="whitespace-pre-wrap text-xs text-gray-800 font-mono leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
            {c.preliminarySummary}
          </pre>
          <p className="text-[11px] text-amber-800 mt-2 bg-amber-50 rounded-lg p-2 border border-amber-200">
            ⚠ AI-generated draft based on available patient interview and uploaded documents. Clinician verification and examination required before diagnosis or treatment.
          </p>
        </div>
      )}

      {/* Doctor Notes & Confirmation */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
          Doctor Examination Notes &amp; Management Plan
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Add clinical findings, physical examination notes, differential diagnoses, or medication reconciliation..."
          className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap pt-2">
        <button
          onClick={confirm}
          disabled={confirming}
          className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors text-sm shadow-xs"
        >
          {confirming ? 'Confirming...' : '✓ Confirm & Sign Off Case'}
        </button>
        <button
          onClick={loadFHIR}
          className="px-5 py-3 border border-blue-400 text-blue-700 bg-blue-50/50 hover:bg-blue-50 rounded-xl font-semibold text-sm transition-colors"
        >
          📋 View ABDM FHIR Bundle
        </button>
      </div>

      {/* Document Viewer Modal */}
      {selectedDoc && (
        <DocumentViewerModal
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onConfirmDocument={() => handleConfirmDoc(selectedDoc.id)}
        />
      )}

      {/* FHIR Modal */}
      {showFHIR && fhirData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto shadow-xl">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="font-bold text-gray-900 text-sm">FHIR R4 Bundle (ABDM Simulation)</h3>
              <button onClick={() => setShowFHIR(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap">
              {JSON.stringify(fhirData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
