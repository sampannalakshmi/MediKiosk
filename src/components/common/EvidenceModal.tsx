'use client';

import React from 'react';
import type { EvidenceSource } from '@/types/clinical';
import {
  FileText,
  Mic,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Search,
} from 'lucide-react';

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: EvidenceSource | null;
  fieldName?: string;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  isOpen,
  onClose,
  evidence,
  fieldName = 'Extracted Clinical Fact',
}) => {
  if (!isOpen || !evidence) return null;

  const sourceStr = String(evidence.source || '').toLowerCase();
  const isInterview = sourceStr.includes('interview');
  const isDocument = sourceStr.includes('document');
  const isAyush = sourceStr.includes('ayush');

  const confNum = typeof evidence.confidence === 'number' ? evidence.confidence : (evidence.confidence === 'HIGH' ? 0.95 : 0.7);
  const isHighConf = confNum >= 0.8;

  const quote = evidence.snippet || evidence.original_response || String(evidence.value || '');
  const sourceLabel = isInterview ? 'Patient Interview' : isDocument ? 'Uploaded Document' : isAyush ? 'AYUSH Intake' : 'Clinical System';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-wide uppercase text-teal-300">Clinical Evidence Chain</h3>
              <p className="text-xs text-slate-300">Transparent Source & Traceability Audit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Field being audited */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Clinical Field Audited</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">{fieldName || evidence.field}</div>
            {evidence.value !== undefined && (
              <div className="mt-1 text-xs text-slate-700 font-mono bg-white p-1.5 rounded border border-slate-200">
                Recorded Value: {String(evidence.value)}
              </div>
            )}
          </div>

          {/* Source Type & Badge */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <div className="text-xs text-slate-500 font-medium">Source Type</div>
              <div className="flex items-center space-x-1.5 mt-1 font-semibold text-xs text-slate-800">
                {isInterview && <Mic className="w-3.5 h-3.5 text-teal-600" />}
                {isDocument && <FileText className="w-3.5 h-3.5 text-indigo-600" />}
                {isAyush && <Sparkles className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{sourceLabel}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <div className="text-xs text-slate-500 font-medium">Extraction Confidence</div>
              <div className="flex items-center space-x-1.5 mt-1">
                {isHighConf ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    High ({Math.round(confNum * 100)}%)
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Needs Verification ({Math.round(confNum * 100)}%)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Origin / Provenance Details */}
          {(evidence.document_id || evidence.question_id || evidence.page_number) && (
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Provenance Origin
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono">
                {evidence.document_id && <div>Document ID: {evidence.document_id}</div>}
                {evidence.page_number && <div>Page: {evidence.page_number}</div>}
                {evidence.question_id && <div>Question ID: {evidence.question_id}</div>}
              </div>
            </div>
          )}

          {/* Raw Extracted Statement / Quote */}
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Raw Extracted Statement / Provenance Quote
            </div>
            <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-200/70 text-sm text-teal-950 font-mono leading-relaxed break-words">
              &quot;{quote}&quot;
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              Recorded: {evidence.timestamp ? new Date(evidence.timestamp).toLocaleString() : 'Live Session'}
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              Lang: {(evidence.language || 'en').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvidenceModal;
