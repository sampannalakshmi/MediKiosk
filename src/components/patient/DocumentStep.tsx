'use client';
// ─────────────────────────────────────────────────────────────────────────────
// MediKiosk — Patient Medical Document Intelligence Screen (Phase 3)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from 'react';
import { t } from '@/i18n/translations';
import type { Language } from '@/types/clinical';
import type {
  DocumentType,
  MedicalDocument,
} from '@/types/document';
import { SYNTHETIC_DEMO_DOCUMENTS } from '@/services/documents/demoDocuments';

interface Props {
  caseId: string;
  language: Language;
  onSkip: () => void;
  onProceed: () => void;
}

interface StagedFile {
  file?: File;
  demoDocId?: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  previewUrl: string;
  documentType: DocumentType;
}

export default function DocumentStep({ caseId, language, onSkip, onProceed }: Props) {
  const [stagedFile, setStagedFile] = useState<StagedFile | null>(null);
  const [processedDocs, setProcessedDocs] = useState<MedicalDocument[]>([]);
  const [processingState, setProcessingState] = useState<
    'idle' | 'reading' | 'finding_info' | 'preparing' | 'ready' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeReviewDoc, setActiveReviewDoc] = useState<MedicalDocument | null>(null);
  const [editingExtractionId, setEditingExtractionId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // ── Document Type Options (Item 3) ─────────────────────────────────────────
  const DOC_TYPE_OPTIONS: { type: DocumentType; label: string }[] = [
    { type: 'prescription', label: 'Prescription' },
    { type: 'lab_report', label: 'Lab Report' },
    { type: 'imaging_report', label: 'Scan / Imaging Report' },
    { type: 'discharge_summary', label: 'Discharge Summary' },
    { type: 'previous_consultation', label: 'Previous Consultation' },
    { type: 'medical_certificate', label: 'Medical Certificate' },
    { type: 'other', label: 'Other' },
    { type: 'not_sure', label: 'Not sure' },
  ];

  // ── Handle File Selection ──────────────────────────────────────────────────
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>, fallbackType: DocumentType = 'not_sure') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = file.type.startsWith('image/')
      ? URL.createObjectURL(file)
      : '';

    setStagedFile({
      file,
      filename: file.name,
      fileSize: file.size,
      mimeType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
      previewUrl,
      documentType: fallbackType,
    });
    setErrorMessage('');
    setProcessingState('idle');
    e.target.value = '';
  };

  // ── Handle Demo Document Pick ──────────────────────────────────────────────
  const handleSelectDemo = (demoId: string) => {
    const demo = SYNTHETIC_DEMO_DOCUMENTS.find((d) => d.id === demoId);
    if (!demo) return;

    setStagedFile({
      demoDocId: demo.id,
      filename: demo.filename,
      fileSize: 180000,
      mimeType: demo.mimeType,
      previewUrl: `data:image/svg+xml;utf8,${encodeURIComponent(demo.previewSvg)}`,
      documentType: demo.documentType,
    });
    setErrorMessage('');
    setProcessingState('idle');
  };

  // ── Process Staged Document (Item 5, 11) ────────────────────────────────────
  const processStagedDocument = async () => {
    if (!stagedFile) return;

    setProcessingState('reading');
    setErrorMessage('');

    try {
      let uploadedDoc: MedicalDocument;

      if (stagedFile.demoDocId) {
        // Upload via demoDocId
        const res = await fetch('/api/documents/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caseId,
            demoDocId: stagedFile.demoDocId,
            documentType: stagedFile.documentType,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        uploadedDoc = data.document;
      } else if (stagedFile.file) {
        // Upload via FormData
        const formData = new FormData();
        formData.append('caseId', caseId);
        formData.append('documentType', stagedFile.documentType);
        formData.append('file', stagedFile.file);

        const res = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        uploadedDoc = data.document;
      } else {
        throw new Error('No document data available');
      }

      // Simulate step 2: finding medical info
      setProcessingState('finding_info');
      await new Promise((r) => setTimeout(r, 600));

      // Trigger document processing
      setProcessingState('preparing');
      const processRes = await fetch(`/api/documents/${uploadedDoc.id}/process`, {
        method: 'POST',
      });
      const processData = await processRes.json();

      if (!processRes.ok) {
        throw new Error(processData.error || t(language, 'unreadableDocError'));
      }

      const completedDoc: MedicalDocument = processData.document;
      setProcessingState('ready');

      setProcessedDocs((prev) => [...prev, completedDoc]);
      setStagedFile(null);

      // Open review modal if extractions exist
      if (completedDoc.extractions && completedDoc.extractions.length > 0) {
        setActiveReviewDoc(completedDoc);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t(language, 'unreadableDocError');
      setProcessingState('error');
      setErrorMessage(msg);
    }
  };

  // ── Update extraction during patient review ────────────────────────────────
  const handleUpdateExtraction = async (extractionId: string, status: 'confirmed' | 'needs_review', newVal?: string) => {
    if (!activeReviewDoc) return;
    try {
      await fetch(`/api/document-extractions/${extractionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: activeReviewDoc.id,
          status,
          ...(newVal && { value: newVal }),
        }),
      });

      // Update local state
      setActiveReviewDoc((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          extractions: prev.extractions.map((e) =>
            e.id === extractionId
              ? { ...e, status, ...(newVal && { value: newVal }) }
              : e
          ),
        };
      });
      setEditingExtractionId(null);
    } catch {
      // silent
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-6">
      {/* Title & Subtitle (Item 2) */}
      <div className="text-center space-y-2">
        <div className="text-4xl">📄</div>
        <h2 className="text-2xl font-bold text-gray-900">{t(language, 'addDocumentsTitle')}</h2>
        <p className="text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
          {t(language, 'addDocumentsSubtitle')}
        </p>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileSelected(e, 'prescription')}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={(e) => handleFileSelected(e, 'prescription')}
      />
      <input
        ref={pdfInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => handleFileSelected(e, 'lab_report')}
      />

      {/* Primary Actions (Item 2: A, B, C) */}
      {!stagedFile && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
            >
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📷</span>
              <span className="font-semibold text-gray-800 text-sm">{t(language, 'takePhoto')}</span>
              <span className="text-xs text-gray-400 mt-1">Camera capture</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
            >
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🖼️</span>
              <span className="font-semibold text-gray-800 text-sm">{t(language, 'uploadImage')}</span>
              <span className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP</span>
            </button>

            <button
              onClick={() => pdfInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
            >
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📑</span>
              <span className="font-semibold text-gray-800 text-sm">{t(language, 'uploadPdf')}</span>
              <span className="text-xs text-gray-400 mt-1">Medical PDF</span>
            </button>
          </div>

          {/* Quick Synthetic Demo Document Pills (Item 26) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                🧪 Or select a synthetic demo record:
              </span>
              <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                For SIH Demo
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {SYNTHETIC_DEMO_DOCUMENTS.map((demo) => (
                <button
                  key={demo.id}
                  onClick={() => handleSelectDemo(demo.id)}
                  className="text-left p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-white transition-all bg-white/70"
                >
                  <div className="font-semibold text-xs text-blue-900 truncate">{demo.title}</div>
                  <div className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{demo.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Document Staged Preview (Item 4) */}
      {stagedFile && (
        <div className="bg-white border-2 border-blue-200 rounded-2xl p-5 shadow-sm space-y-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                {t(language, 'readyToProcess')}
              </span>
              <h3 className="font-bold text-gray-900 text-base">{stagedFile.filename}</h3>
              <p className="text-xs text-gray-500">
                {stagedFile.mimeType} • {formatFileSize(stagedFile.fileSize)}
              </p>
            </div>
            <button
              onClick={() => {
                setStagedFile(null);
                setProcessingState('idle');
              }}
              className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded-lg border border-gray-200"
            >
              ✕ Remove
            </button>
          </div>

          {/* Visual Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden max-h-60 flex items-center justify-center p-3">
            {stagedFile.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={stagedFile.previewUrl}
                alt="Document Preview"
                className="max-h-52 object-contain rounded"
              />
            ) : (
              <div className="text-center py-8 text-gray-400">
                <span className="text-4xl block mb-2">📑</span>
                <span className="text-sm font-medium">{stagedFile.filename}</span>
              </div>
            )}
          </div>

          {/* Classification Selector (Item 3) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700">
              Document Type (Optional):
            </label>
            <select
              value={stagedFile.documentType}
              onChange={(e) =>
                setStagedFile({
                  ...stagedFile,
                  documentType: e.target.value as DocumentType,
                })
              }
              className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {DOC_TYPE_OPTIONS.map((opt) => (
                <option key={opt.type} value={opt.type}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Processing Status Banner (Item 11) */}
          {processingState !== 'idle' && processingState !== 'error' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
              <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full shrink-0" />
              <div className="text-sm font-medium text-blue-900">
                {processingState === 'reading' && t(language, 'readingDocument')}
                {processingState === 'finding_info' && t(language, 'findingMedicalInfo')}
                {processingState === 'preparing' && t(language, 'preparingHistory')}
                {processingState === 'ready' && t(language, 'readyForReview')}
              </div>
            </div>
          )}

          {/* Error Banner & Graceful Fallback (Item 12) */}
          {processingState === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-red-700 text-sm font-semibold">
                <span>⚠️</span>
                <span>{errorMessage || t(language, 'unreadableDocError')}</span>
              </div>
              <p className="text-xs text-red-600">
                The document is safely preserved. You can try again, upload another copy, or proceed without this document.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={processStagedDocument}
                  className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                >
                  {t(language, 'tryAgain')}
                </button>
                <button
                  onClick={() => setStagedFile(null)}
                  className="text-xs px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white"
                >
                  {t(language, 'continueWithoutDoc')}
                </button>
              </div>
            </div>
          )}

          {/* Action Button */}
          {processingState === 'idle' && (
            <button
              onClick={processStagedDocument}
              className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-sm transition-colors text-sm"
            >
              {t(language, 'processDocument')} →
            </button>
          )}
        </div>
      )}

      {/* List of Processed Documents */}
      {processedDocs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
              Processed Records ({processedDocs.length})
            </h3>
            <button
              onClick={() => setStagedFile(null)}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              + Add another record
            </button>
          </div>
          <div className="space-y-2">
            {processedDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900">{doc.filename}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium">
                      ✓ {doc.extractions.length} clinical facts
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {doc.summary || 'Clinical details structured for doctor review.'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveReviewDoc(doc)}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors"
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patient Review Modal / Flow (Item 13) */}
      {activeReviewDoc && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-xl overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  {t(language, 'reviewExtractedTitle')}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{activeReviewDoc.filename}</p>
              </div>
              <button
                onClick={() => setActiveReviewDoc(null)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <p className="text-xs text-gray-600">
                Please confirm or edit the key medical details our system identified in your document:
              </p>

              {activeReviewDoc.extractions.map((ext) => (
                <div
                  key={ext.id}
                  className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 uppercase">
                      {ext.category} • {ext.field.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        ext.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {ext.status === 'confirmed' ? 'Verified' : 'Needs check'}
                    </span>
                  </div>

                  {editingExtractionId === ext.id ? (
                    <div className="flex gap-2">
                      <input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 text-sm border border-gray-300 rounded-lg px-2.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                      <button
                        onClick={() => handleUpdateExtraction(ext.id, 'confirmed', editValue)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="font-medium text-gray-900">{ext.value}</div>
                  )}

                  <div className="text-[11px] text-gray-400 italic">
                    Source text: &quot;{ext.sourceText}&quot;
                  </div>

                  {/* Actions: Confirm, Edit, Not sure */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleUpdateExtraction(ext.id, 'confirmed')}
                      className={`text-xs px-2.5 py-1 rounded-md border font-medium ${
                        ext.status === 'confirmed'
                          ? 'bg-green-600 text-white border-green-600'
                          : 'border-gray-200 hover:bg-green-50 text-gray-700'
                      }`}
                    >
                      ✓ {t(language, 'confirmAction')}
                    </button>
                    <button
                      onClick={() => {
                        setEditingExtractionId(ext.id);
                        setEditValue(ext.value);
                      }}
                      className="text-xs px-2.5 py-1 rounded-md border border-gray-200 hover:bg-gray-100 text-gray-700 font-medium"
                    >
                      ✎ {t(language, 'editAction')}
                    </button>
                    <button
                      onClick={() => handleUpdateExtraction(ext.id, 'needs_review')}
                      className="text-xs px-2.5 py-1 rounded-md border border-gray-200 hover:bg-yellow-50 text-gray-700 font-medium"
                    >
                      ? {t(language, 'notSure')}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setActiveReviewDoc(null)}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700"
              >
                Done Reviewing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={onSkip}
          className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5 rounded-xl border border-gray-200"
        >
          {processedDocs.length > 0 ? 'Skip adding more' : 'Skip for now'}
        </button>
        <button
          onClick={onProceed}
          className="px-7 py-3 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 shadow-sm transition-colors"
        >
          {processedDocs.length > 0 ? 'Proceed with Records' : 'Next'} →
        </button>
      </div>
    </div>
  );
}
