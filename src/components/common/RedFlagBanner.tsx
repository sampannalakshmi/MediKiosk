'use client';

import React from 'react';
import type { RedFlagAlert } from '@/types/clinical';
import { AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';

interface RedFlagBannerProps {
  alerts: RedFlagAlert[];
  isDoctorView?: boolean;
  onAcknowledge?: () => void;
}

export const RedFlagBanner: React.FC<RedFlagBannerProps> = ({
  alerts,
  isDoctorView = false,
  onAcknowledge,
}) => {
  if (!alerts || alerts.length === 0) return null;

  const hasCritical = alerts.some((a) => a.severity === 'CRITICAL');

  return (
    <div
      className={`text-white rounded-2xl shadow-xl p-5 md:p-6 mb-6 border-2 transition-all ${
        hasCritical
          ? 'bg-gradient-to-r from-red-700 via-rose-600 to-red-800 shadow-red-900/20 border-red-500/50'
          : 'bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 shadow-orange-900/20 border-orange-400/50'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        {/* Left: Icon & Alert Statement */}
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
            <AlertTriangle className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{hasCritical ? 'Critical Triage Escalation Alert' : 'Priority Clinical Triage Alert'}</span>
            </div>
            <h3 className="text-lg md:text-xl font-bold tracking-tight">
              {alerts.length} Potential Concerning Symptom{alerts.length > 1 ? 's' : ''} Detected
            </h3>
            <p className="text-red-100 text-sm mt-1 max-w-2xl leading-relaxed">
              Immediate clinical assessment recommended. Triggered by deterministic safety rules during patient case intake to ensure critical conditions are prioritized.
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        {isDoctorView && onAcknowledge && (
          <div className="shrink-0 flex items-center">
            <button
              type="button"
              onClick={onAcknowledge}
              className="px-4 py-2.5 bg-white text-red-700 hover:bg-red-50 text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer"
            >
              <span>Acknowledge Triage</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Symptoms and Rationales list */}
      <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-1 md:grid-cols-2 gap-3">
        {alerts.map((alert, idx) => {
          const title = alert.label || (alert as unknown as { title?: string }).title || alert.category;
          const desc = alert.description || (alert as unknown as { rationale?: string }).rationale;
          return (
            <div key={idx} className="bg-black/20 rounded-xl p-3 border border-white/10 text-xs">
              <div className="font-bold flex items-center justify-between text-white">
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      alert.severity === 'CRITICAL' ? 'bg-red-400 animate-ping' : 'bg-amber-300'
                    }`}
                  />
                  <span>{title}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/20 text-white font-bold">
                  {alert.severity}
                </span>
              </div>
              <p className="text-red-100/90 mt-1.5 leading-relaxed">{desc}</p>
              {alert.sourceSnippet && (
                <div className="mt-1.5 text-[11px] font-mono text-white/80 bg-black/20 p-1.5 rounded">
                  Evidence: &ldquo;{alert.sourceSnippet}&rdquo;
                </div>
              )}
              {alert.recommendedAction && (
                <div className="mt-2 text-amber-200 font-medium">
                  <span className="font-semibold text-white">Action Protocol:</span> {alert.recommendedAction}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RedFlagBanner;
