'use client';

import React, { useState } from 'react';
import type { ConsultationCase } from '@/types/clinical';
import { Edit3, X, Save, Sparkles } from 'lucide-react';

interface EditCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultation: ConsultationCase;
  onSaved: () => void;
}

export const EditCaseModal: React.FC<EditCaseModalProps> = ({
  isOpen,
  onClose,
  consultation,
  onSaved,
}) => {
  const h = consultation.socratesHistory;
  const [complaint, setComplaint] = useState(consultation.chiefComplaint);
  const [severity, setSeverity] = useState(h.severity ?? 7);
  const [site, setSite] = useState(h.site ?? '');
  const [onsetDuration, setOnsetDuration] = useState(h.onsetDuration ?? '');
  const [character, setCharacter] = useState(h.character ?? '');
  const [timeCourse, setTimeCourse] = useState(h.timeCourse ?? '');
  const [doctorNotes, setDoctorNotes] = useState(consultation.doctorReview?.notes ?? '');
  const [regenerate, setRegenerate] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updatedSocrates = {
        ...h,
        site,
        onsetDuration,
        character,
        severity,
        timeCourse,
      };

      let newSummary = consultation.preliminarySummary;
      if (regenerate) {
        newSummary = `CLINICAL HISTORY & PRE-CONSULTATION SUMMARY (DOCTOR REVISED)
Patient: ${consultation.patient?.name ?? 'Unknown'} (${consultation.patient?.age ?? '??'}y, ${consultation.patient?.gender ?? '??'})
Chief Complaint: ${complaint}

SOCRATES SYMPTOM PROFILE:
- Site: ${site || 'Not specified'}
- Duration / Onset: ${onsetDuration || 'Not specified'}
- Character: ${character || 'Not specified'}
- Severity Score: ${severity}/10
- Time Course: ${timeCourse || 'Not specified'}

CLINICIAN BEDSIDE NOTES:
${doctorNotes || 'None recorded'}

Reviewed and validated by attending clinician.`;
      }

      await fetch(`/api/consultations/${consultation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chiefComplaint: complaint,
          socratesHistory: updatedSocrates,
          preliminarySummary: newSummary,
          doctorReview: {
            reviewedAt: new Date().toISOString(),
            reviewedBy: 'Dr. (Verified Clinician)',
            notes: doctorNotes,
            confirmed: false,
            edits: { site, onsetDuration, character, severity, timeCourse },
          },
        }),
      });

      onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to update case:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wide uppercase text-teal-300">Clinician Field Editor</h3>
              <p className="text-xs text-slate-300">Modify Structured Intake &amp; Recalibrate Summary</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Chief Complaint
            </label>
            <input
              type="text"
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Pain Severity (0-10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Duration / Onset
              </label>
              <input
                type="text"
                value={onsetDuration}
                onChange={(e) => setOnsetDuration(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Site / Location
              </label>
              <input
                type="text"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Character
              </label>
              <input
                type="text"
                value={character}
                onChange={(e) => setCharacter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Time Course (Constant / Intermittent / Colicky)
            </label>
            <input
              type="text"
              value={timeCourse}
              onChange={(e) => setTimeCourse(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Clinician Clinical Notes &amp; Bedside Observations
            </label>
            <textarea
              rows={3}
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="e.g. Murphy sign negative. Mild tenderness over epigastrium. Advised LFT and USG correlation."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
            />
          </div>

          {/* Regenerate AI Summary Option */}
          <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-semibold text-teal-900">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Regenerate AI Draft Summary with updated values</span>
            </div>
            <input
              type="checkbox"
              checked={regenerate}
              onChange={(e) => setRegenerate(e.target.checked)}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving Changes...' : 'Save & Update Case'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCaseModal;
