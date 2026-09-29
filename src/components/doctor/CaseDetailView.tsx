'use client';
// ─────────────────────────────────────────────────────────────────────────────
// MediKiosk — Doctor Case Detail View (Phase 3 Integrated)
// Enhanced with Medical Documents, Conflict Alerts, Timeline, Evidence Linking,
// ABDM Modal, Edit Case Modal, and Red Flag Triage Banner
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import type { ConsultationCase, EvidenceSource } from '@/types/clinical';
import type { MedicalDocument } from '@/types/document';
import DocumentViewerModal from './DocumentViewerModal';
import AbdmModal from './AbdmModal';
import EditCaseModal from './EditCaseModal';
import EvidenceModal from '@/components/common/EvidenceModal';
import RedFlagBanner from '@/components/common/RedFlagBanner';
import { Edit3, Database, CheckCircle2, Search } from 'lucide-react';

interface Props {
  caseData: ConsultationCase;
  onUpdated: () => void;
}

export default function CaseDetailView({ caseData: c, onUpdated }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [notes, setNotes] = useState(c.doctorReview?.notes || '');
  const [showFHIR, setShowFHIR] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<MedicalDocument | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceSource | null>(null);
  const [selectedEvidenceField, setSelectedEvidenceField] = useState<string>('');
  const [triageAcknowledged, setTriageAcknowledged] = useState(false);

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

  const handleConfirmDoc = async (docId: string) => {
    await fetch(`/api/documents/${docId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewStatus: 'verified' }),
    });
    setSelectedDoc(null);
    onUpdated();
  };

  const Row = ({ label, value, fieldKey }: { label: string; value?: unknown; fieldKey?: string }) => {
    if (value === undefined || value === null || value === '') return null;
    const ev = fieldKey && c.evidenceMap ? c.evidenceMap[fieldKey] : null;

    return (
      <div className="flex items-center justify-between py-1.5 border-b border-gray-100 hover:bg-slate-50/80 px-2 rounded-lg transition-colors group">
        <div className="flex gap-3 items-center flex-1">
          <span className="text-xs text-gray-500 w-36 shrink-0">{label}</span>
          <span className="text-sm text-gray-800 font-medium">{String(value)}</span>
        </div>
        {ev ? (
          <button
            type="button"
            onClick={() => {
              setSelectedEvidence(ev);
              setSelectedEvidenceField(label);
            }}
            className="text-[11px] text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2 py-0.5 rounded-md font-semibold opacity-80 group-hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer"
          >
            <Search className="w-3 h-3" />
            <span>Audit Evidence</span>
          </button>
        ) : null}
      </div>
    );
  };

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEdit(true)}
            className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Fields</span>
          </button>
          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
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
      </div>

      {/* Red Flag Alert Banner */}
      {c.redFlags.length > 0 && !triageAcknowledged && (
        <RedFlagBanner
          alerts={c.redFlags}
          isDoctorView={true}
          onAcknowledge={() => setTriageAcknowledged(true)}
        />
      )}

      {/* Triage Acknowledged Pill */}
      {triageAcknowledged && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Red-flag triage acknowledged by attending clinician. Prioritized bedside workup active.</span>
          </div>
          <button
            onClick={() => setTriageAcknowledged(false)}
            className="text-xs text-emerald-700 underline hover:text-emerald-900 cursor-pointer"
          >
            Show alert banner
          </button>
        </div>
      )}

      {/* Clinical Conflict Alert Banner */}
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

      {/* Digitized Medical Documents Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Digitized Medical Documents ({c.documents?.length || 0})
            </h3>
            <p className="text-xs text-gray-500">
              OCR-digitized previous prescriptions, lab reports, and imaging
            </p>
          </div>
        </div>

        {c.documents && c.documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {c.documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className="border border-gray-200 rounded-xl p-3.5 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {doc.documentType === 'prescription' ? '💊' : doc.documentType === 'lab_report' ? '🧪' : '📄'}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-gray-800 group-hover:text-blue-700">
                        {doc.filename}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {doc.documentDate || 'Undated'} • {doc.documentType.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      doc.reviewStatus === 'verified'
                        ? 'bg-green-100 text-green-800'
                        : doc.reviewStatus === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {doc.reviewStatus || 'pending review'}
                  </span>
                </div>

                <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">{doc.extractions?.length || 0} extracted facts</span>
                  <span className="text-blue-600 font-semibold group-hover:underline">
                    Inspect &amp; Verify →
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">No medical documents uploaded for this case.</p>
        )}
      </div>

      {/* Clinical Timeline */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
          Chronological Clinical Timeline
        </h3>
        {c.timeline && c.timeline.length > 0 && (
          <div className="relative pl-6 border-l-2 border-blue-200 space-y-4">
            {c.timeline.map((evt, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow-xs" />
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono text-slate-500">{evt.date}</span>
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
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            SOCRATES Clinical History
          </h3>
          <span className="text-xs text-slate-400">Hover rows to audit evidence</span>
        </div>
        <Row label="Site" value={h.site} fieldKey="site" />
        <Row label="Radiation" value={h.radiation} fieldKey="radiation" />
        <Row label="Onset" value={h.onset} fieldKey="onset" />
        <Row label="Duration" value={h.onsetDuration} fieldKey="onsetDuration" />
        <Row label="Context" value={h.onsetContext} fieldKey="onsetContext" />
        <Row label="Character" value={h.character} fieldKey="character" />
        <Row label="Time course" value={h.timeCourse} fieldKey="timeCourse" />
        <Row label="Trend" value={h.progressionTrend} fieldKey="progressionTrend" />
        <Row label="Severity" value={h.severity !== undefined ? `${h.severity}/10` : undefined} fieldKey="severity" />
        <Row label="Nausea" value={h.nausea !== undefined ? (h.nausea ? 'Yes' : 'No') : undefined} fieldKey="nausea" />
        <Row label="Vomiting" value={h.vomiting !== undefined ? (h.vomiting ? 'Yes' : 'No') : undefined} fieldKey="vomiting" />
        <Row label="Fever" value={h.fever !== undefined ? (h.fever ? `Yes${h.feverDegree ? ` (${h.feverDegree})` : ''}` : 'No') : undefined} fieldKey="fever" />
        <Row label="Diarrhoea" value={h.diarrhoea !== undefined ? (h.diarrhoea ? 'Yes' : 'No') : undefined} fieldKey="diarrhoea" />
        <Row label="Blood in stool" value={h.bloodInStool !== undefined ? (h.bloodInStool ? '⚠ Yes' : 'No') : undefined} fieldKey="bloodInStool" />
        <Row label="Jaundice" value={h.jaundice !== undefined ? (h.jaundice ? 'Yes' : 'No') : undefined} fieldKey="jaundice" />
        <Row label="Exacerbating" value={h.exacerbatingFactors?.join(', ')} fieldKey="exacerbatingFactors" />
        <Row label="Relieving" value={h.relievingFactors?.join(', ')} fieldKey="relievingFactors" />
        <Row label="Past similar" value={h.similarEpisodesBefore !== undefined ? (h.similarEpisodesBefore ? 'Yes' : 'No') : undefined} fieldKey="similarEpisodesBefore" />
        <Row label="Prior surgery" value={h.previousAbdominalSurgery !== undefined ? (h.previousAbdominalSurgery ? 'Yes' : 'No') : undefined} fieldKey="previousAbdominalSurgery" />
        <Row label="Medications" value={h.relevantMedications?.join(', ')} fieldKey="relevantMedications" />
        <Row label="Allergies" value={h.allergies} fieldKey="allergies" />
        <Row label="LMP" value={h.lastMenstrualPeriod} fieldKey="lastMenstrualPeriod" />
      </div>

      {/* AYUSH Holistic Assessment */}
      {c.ayushHistory && Object.keys(c.ayushHistory).length > 0 && (
        <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🌿</span>
            <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wide">
              AYUSH Holistic Case Assessment (Ministry of Ayush)
            </h3>
          </div>
          <Row label="Prakriti (Dosha)" value={c.ayushHistory.prakriti} fieldKey="prakriti" />
          <Row label="Agni (Digestive Fire)" value={c.ayushHistory.agni} fieldKey="agni" />
          <Row label="Dietary Habits (Ahara)" value={c.ayushHistory.dietaryHabits} fieldKey="dietaryHabits" />
          <Row label="Lifestyle (Vihara)" value={c.ayushHistory.lifestyle} fieldKey="lifestyle" />
          <Row label="Seasonal Influence (Ritu)" value={c.ayushHistory.seasonalInfluence} fieldKey="seasonalInfluence" />
          <Row
            label="Prior Ayush Treatment"
            value={
              c.ayushHistory.previousAyurvedicTreatment !== undefined
                ? c.ayushHistory.previousAyurvedicTreatment
                  ? `Yes — ${c.ayushHistory.previousAyurvedicDetails || 'Ayurvedic formulations'}`
                  : 'None reported'
                : undefined
            }
          />
        </div>
      )}

      {/* Integrated Clinical Summary */}
      {c.preliminarySummary && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Integrated Clinical Summary (Interview + Documents)
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
              Clinician Editable
            </span>
          </div>
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
          className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors text-sm shadow-xs cursor-pointer"
        >
          {confirming ? 'Confirming...' : '✓ Confirm & Sign Off Case'}
        </button>
        <button
          onClick={() => setShowFHIR(true)}
          className="px-5 py-3 border border-emerald-500 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100 rounded-xl font-semibold text-sm transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Database className="w-4 h-4" />
          <span>View ABDM FHIR Bundle</span>
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

      {/* ABDM FHIR Modal */}
      {showFHIR && (
        <AbdmModal
          isOpen={showFHIR}
          onClose={() => setShowFHIR(false)}
          consultation={c}
        />
      )}

      {/* Clinician Field Editor Modal */}
      {showEdit && (
        <EditCaseModal
          isOpen={showEdit}
          onClose={() => setShowEdit(false)}
          consultation={c}
          onSaved={() => onUpdated()}
        />
      )}

      {/* Evidence Chain Inspector Modal */}
      {selectedEvidence && (
        <EvidenceModal
          isOpen={!!selectedEvidence}
          onClose={() => setSelectedEvidence(null)}
          evidence={selectedEvidence}
          fieldName={selectedEvidenceField}
        />
      )}
    </div>
  );
}
