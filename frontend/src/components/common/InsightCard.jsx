import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function InsightCard({ title, insightText, recommendation, type = 'info' }) {
  return (
    <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/20 shadow-lg shadow-cyan-500/5 relative overflow-hidden">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">{title || "Judge Business Insight"}</h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Executive Summary</span>
          </div>

          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{insightText}</p>

          {recommendation && (
            <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              <span><strong>Action:</strong> {recommendation}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
