'use client';

import React, { useState, useEffect } from 'react';
import type { ConsultationCase } from '@/types/clinical';
import {
  X,
  Copy,
  Check,
  FileCode,
  AlertCircle,
  Database,
} from 'lucide-react';

interface AbdmModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultation: ConsultationCase;
  bundleData?: object | null;
}

export const AbdmModal: React.FC<AbdmModalProps> = ({
  isOpen,
  onClose,
  consultation,
  bundleData: initialBundle,
}) => {
  const [copied, setCopied] = useState(false);
  const [bundle, setBundle] = useState<object | null>(initialBundle || null);
  const [loading, setLoading] = useState(!initialBundle);

  useEffect(() => {
    if (!isOpen) return;
    if (initialBundle) {
      setBundle(initialBundle);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/abdm/simulate?caseId=${consultation.id}`)
      .then((res) => res.json())
      .then((data) => {
        setBundle(data);
      })
      .catch((err) => {
        console.error('Failed to load FHIR bundle:', err);
      })
      .finally(() => setLoading(false));
  }, [isOpen, consultation.id, initialBundle]);

  if (!isOpen) return null;

  const jsonString = bundle ? JSON.stringify(bundle, null, 2) : '';
  const entriesCount = (bundle as { entry?: unknown[] })?.entry?.length || 4;

  const handleCopy = () => {
    if (!jsonString) return;
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-300">
                  ABDM &amp; HL7 FHIR Integration Layer
                </h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  PROTOTYPE SIMULATION
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Ayushman Bharat Digital Mission (Milestone 3 Bridge Simulator)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Explicit Boundary Notice */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-xs text-amber-900">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Integration Boundary Clarification:</span> This screen visualizes the structured HL7 FHIR R4 Bundle generated from the patient&apos;s intake. In accordance with SIH prototype guidelines, this represents a local contract simulation and does NOT push data to live external government servers.
            </div>
          </div>

          {/* Simulation Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">ABHA Identifier</span>
              <span className="text-xs font-mono font-bold text-slate-900">
                {consultation.patientId || 'ABHA-DEMO-2026-8941'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Facility HIP ID</span>
              <span className="text-xs font-mono font-bold text-slate-900">
                IN-HIP-MEDIKIOSK-001
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Bundle Resource Count</span>
              <span className="text-xs font-bold text-emerald-700">
                {entriesCount} FHIR R4 Resources
              </span>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="relative">
            <div className="flex items-center justify-between bg-slate-800 text-slate-300 px-4 py-2 rounded-t-xl text-xs font-mono">
              <div className="flex items-center space-x-2">
                <FileCode className="w-3.5 h-3.5 text-teal-400" />
                <span>FHIR-R4-ClinicalArtifact-Bundle.json</span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                disabled={loading}
                className="flex items-center space-x-1 hover:text-white transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-b-xl overflow-x-auto max-h-72 border-x border-b border-slate-800">
              {loading ? '// Loading FHIR R4 simulation bundle...' : jsonString}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AbdmModal;
