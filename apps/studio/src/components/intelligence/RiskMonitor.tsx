"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldAlert, TrendingDown, Target, Zap } from "lucide-react";

interface RiskMonitorProps {
  data: {
    divergenceIndex: number;
    commercialScore: number;
    status: string;
    resourceAllocation?: {
      vfx: number;
      cast: number;
      marketing: number;
      contingency: number;
    };
  };
}

export const RiskMonitor: React.FC<RiskMonitorProps> = ({ data }) => {
  const { divergenceIndex, commercialScore, status, resourceAllocation } = data;

  const getStatusColor = (s: string) => {
    switch (s) {
      case "STABLE": return "var(--ms-gold)";
      case "CAUTION": return "#f59e0b";
      case "CRITICAL": return "#ef4444";
      case "HALTED": return "#7f1d1d";
      default: return "var(--ms-text-dim)";
    }
  };

  return (
    <div className="flex flex-col gap-6 p-8 bg-[var(--ms-bg-elevated)]/30 border border-[var(--ms-gold-border)]/20 rounded-[var(--ms-radius-lg)] gstack-glass overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--ms-gold)]/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-[var(--ms-gold)]/10 transition-all duration-700" />
      
      <div className="flex justify-between items-center border-b border-[var(--ms-gold-border)]/10 pb-6 mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--ms-gold)]/10 rounded-lg">
            <ShieldAlert size={18} className="text-[var(--ms-gold)]" />
          </div>
          <h3 className="text-lg font-serif text-[var(--ms-text-bright)] tracking-tight">Intelligence Audit</h3>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] opacity-40 mb-1">Status</span>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]" style={{ color: getStatusColor(status) }}>
            {status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Gauge: Divergence Index */}
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24 mb-3">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
              <motion.circle 
                cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="4" 
                className="text-[var(--ms-gold)]"
                strokeDasharray="251.2"
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 251.2 * (1 - divergenceIndex) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-mono font-bold text-[var(--ms-text-bright)]">{(divergenceIndex * 100).toFixed(0)}</span>
              <span className="text-[8px] font-mono uppercase tracking-widest opacity-40">Div%</span>
            </div>
          </div>
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--ms-text-dim)]">Alignment</span>
        </div>

        {/* Gauge: Commercial Score */}
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24 mb-3">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
              <motion.circle 
                cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="4" 
                className="text-amber-500"
                strokeDasharray="251.2"
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 251.2 * (1 - commercialScore / 100) }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-mono font-bold text-[var(--ms-text-bright)]">{commercialScore.toFixed(0)}</span>
              <span className="text-[8px] font-mono uppercase tracking-widest opacity-40">ROI%</span>
            </div>
          </div>
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--ms-text-dim)]">Predictive</span>
        </div>
      </div>

      {/* Kelly Fraction Allocation */}
      {resourceAllocation && (
        <div className="mt-4 pt-6 border-t border-[var(--ms-gold-border)]/10">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} className="text-[var(--ms-gold)]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-[var(--ms-gold)]">Asset_Allocation (Kelly)</span>
          </div>
          
          <div className="flex h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-3">
            <motion.div initial={{ width: 0 }} animate={{ width: `${resourceAllocation.vfx * 100}%` }} transition={{ duration: 1, delay: 0.6 }} className="bg-[var(--ms-gold)] h-full" />
            <motion.div initial={{ width: 0 }} animate={{ width: `${resourceAllocation.cast * 100}%` }} transition={{ duration: 1, delay: 0.7 }} className="bg-amber-600 h-full opacity-80" />
            <motion.div initial={{ width: 0 }} animate={{ width: `${resourceAllocation.marketing * 100}%` }} transition={{ duration: 1, delay: 0.8 }} className="bg-amber-800 h-full opacity-60" />
          </div>

          <div className="grid grid-cols-4 gap-2 text-[8px] font-mono uppercase tracking-tight opacity-50">
            <div className="flex flex-col"><span className="text-[var(--ms-gold)]">VFX</span><span>{(resourceAllocation.vfx * 100).toFixed(0)}%</span></div>
            <div className="flex flex-col"><span className="text-amber-600">Cast</span><span>{(resourceAllocation.cast * 100).toFixed(0)}%</span></div>
            <div className="flex flex-col"><span className="text-amber-800">Mktg</span><span>{(resourceAllocation.marketing * 100).toFixed(0)}%</span></div>
            <div className="flex flex-col"><span>Cont</span><span>{(resourceAllocation.contingency * 100).toFixed(0)}%</span></div>
          </div>
        </div>
      )}

      <button className="mt-4 py-3 border border-[var(--ms-gold-border)]/10 text-[9px] font-mono font-bold uppercase tracking-[0.4em] text-[var(--ms-text-ghost)] hover:text-[var(--ms-gold)] hover:border-[var(--ms-gold)]/40 transition-all group-hover:bg-[var(--ms-gold)]/5">
        Run_Intelligence_Audit
      </button>
    </div>
  );
};
