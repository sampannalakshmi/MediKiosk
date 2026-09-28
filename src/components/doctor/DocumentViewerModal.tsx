'use client';
// ─────────────────────────────────────────────────────────────────────────────
// MediKiosk — Doctor Document Viewer Modal (Phase 3)
// Zoomable document preview, page navigation, extracted facts, & provenance tracing
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import type { MedicalDocument, DocumentExtraction } from '@/types/document';

interface Props {
  document: MedicalDocument;
  onClose: () => void;
  onConfirmDocument?: () => void;
}

export default function DocumentViewerModal({ document: doc, onClose, onConfirmDocument }: Props) {
  const [activeTab, setActiveTab] = useState<'preview' | 'ocr_text' | 'facts'>('preview');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [highlightedSnippet, setHighlightedSnippet] = useState<string | null>(null);

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 200));
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 50));
  const resetZoom = () => setZoomLevel(100);

  // Jump from fact to source
  const handleJumpToSource = (fact: DocumentExtraction) => {
    setCurrentPage(fact.pageNumber || 1);
    setHighlightedSnippet(fact.sourceText);
    setActiveTab('preview');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-slate-50">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">📑</span>
              <h2 className="font-bold text-gray-900 text-base">{doc.filename}</h2>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                  doc.reviewStatus === 'verified'
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                }`}
              >
                {doc.reviewStatus === 'verified' ? '● Verified' : '● Needs review'}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Type: <strong className="capitalize">{doc.documentType.replace('_', ' ')}</strong> • Date: {doc.documentDate || 'Recent'} • Confidence: {Math.round(doc.extractionConfidence * 100)}%
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onConfirmDocument && doc.reviewStatus !== 'verified' && (
              <button
                onClick={onConfirmDocument}
                className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                ✓ Mark Verified
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Bar & Zoom Controls */}
        <div className="px-6 py-2 border-b border-gray-100 flex items-center justify-between bg-white text-xs">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === 'preview'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Document Preview
            </button>
            <button
              onClick={() => setActiveTab('facts')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === 'facts'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Extracted Facts ({doc.extractions?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('ocr_text')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === 'ocr_text'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              OCR Raw Text
            </button>
          </div>

          {activeTab === 'preview' && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Zoom:</span>
              <button
                onClick={zoomOut}
                className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 font-bold"
              >
                -
              </button>
              <span className="w-10 text-center font-mono">{zoomLevel}%</span>
              <button
                onClick={zoomIn}
                className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 font-bold"
              >
                +
              </button>
              <button
                onClick={resetZoom}
                className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-500"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto bg-slate-100 p-4">
          {/* TAB 1: PREVIEW */}
          {activeTab === 'preview' && (
            <div className="flex flex-col items-center min-h-full space-y-4">
              {/* Highlighted Evidence Snippet Callout (Item 10 & 15) */}
              {highlightedSnippet && (
                <div className="w-full max-w-2xl bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex items-start justify-between shadow-sm">
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                      <span>🔍</span> Evidence Source Snippet (Page {currentPage})
                    </div>
                    <div className="text-xs font-mono text-amber-950 bg-amber-100/70 p-2 rounded mt-1 border border-amber-200">
                      &quot;{highlightedSnippet}&quot;
                    </div>
                  </div>
                  <button
                    onClick={() => setHighlightedSnippet(null)}
                    className="text-amber-700 hover:text-amber-900 text-xs ml-3"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Zoomable Image / SVG / Preview */}
              <div
                className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-transform duration-200 max-w-3xl w-full flex items-center justify-center p-4 min-h-[480px]"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              >
                {doc.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={doc.previewUrl}
                    alt={doc.filename}
                    className="w-full object-contain max-h-[700px] rounded"
                  />
                ) : (
                  <div className="text-center p-12 space-y-3">
                    <span className="text-6xl block">📄</span>
                    <p className="font-semibold text-gray-800">{doc.filename}</p>
                    <p className="text-xs text-gray-500 font-mono">
                      PDF Document with {doc.pageCount} page(s)
                    </p>
                    <button
                      onClick={() => setActiveTab('ocr_text')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                    >
                      View Extracted Text
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: EXTRACTED FACTS */}
          {activeTab === 'facts' && (
            <div className="max-w-3xl mx-auto space-y-3">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    Structured Clinical Facts ({doc.extractions?.length || 0})
                  </h3>
                  <p className="text-xs text-gray-500">
                    Extracted medical facts with confidence scores and source links.
                  </p>
                </div>
              </div>

              {(!doc.extractions || doc.extractions.length === 0) && (
                <div className="text-center py-12 bg-white rounded-xl text-gray-400 text-sm">
                  No structured facts extracted for this document.
                </div>
              )}

              <div className="space-y-2">
                {(doc.extractions || []).map((fact) => (
                  <div
                    key={fact.id}
                    className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs hover:border-blue-300 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {fact.category} • {fact.field.replace(/_/g, ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        {fact.abnormalFlag && fact.abnormalFlag !== 'normal' && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              fact.abnormalFlag === 'critical'
                                ? 'bg-red-100 text-red-800 border border-red-300'
                                : 'bg-orange-100 text-orange-800 border border-orange-300'
                            }`}
                          >
                            {fact.abnormalFlag}
                          </span>
                        )}
                        <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {Math.round(fact.confidence * 100)}% conf.
                        </span>
                      </div>
                    </div>

                    <div className="text-sm font-semibold text-gray-900">
                      {fact.isDenied ? (
                        <span className="text-rose-700">
                          Denied / Absent: <s>{fact.field}</s>
                        </span>
                      ) : (
                        fact.value
                      )}
                    </div>

                    {fact.referenceRange && (
                      <div className="text-xs text-gray-500 font-mono">
                        Reference Range: {fact.referenceRange}
                      </div>
                    )}

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-mono truncate max-w-md italic">
                        Snippet: &quot;{fact.sourceText}&quot;
                      </span>
                      <button
                        onClick={() => handleJumpToSource(fact)}
                        className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 shrink-0 ml-2"
                      >
                        [View source] →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: OCR RAW TEXT */}
          {activeTab === 'ocr_text' && (
            <div className="max-w-3xl mx-auto bg-white rounded-xl p-5 border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-bold text-xs uppercase text-gray-500 tracking-wider">
                  Verbatim Extracted OCR Text
                </span>
                <span className="text-xs text-gray-400">
                  {doc.ocrText?.length || 0} characters
                </span>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-xs text-gray-800 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed overflow-x-auto max-h-[550px]">
                {doc.ocrText || 'No text extracted.'}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
