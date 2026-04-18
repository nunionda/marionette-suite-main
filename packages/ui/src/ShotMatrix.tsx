"use client";

import React from "react";

type StepStatus = "Waiting" | "In-Progress" | "Review" | "Approved" | "Revision";

interface Shot {
  id: string;
  name: string;
  duration: string;
  steps: {
    script: StepStatus;
    concept: StepStatus;
    previs: StepStatus;
    casting: StepStatus;
    location: StepStatus;
    cinematog: StepStatus;
    video: StepStatus;
    asset: StepStatus;
    vfx: StepStatus;
    edit: StepStatus;
    color: StepStatus;
    sound: StepStatus;
    music: StepStatus;
    mixing: StepStatus;
  };
  assignee: string;
}

const mockShots: Shot[] = [
  { 
    id: "S#001", 
    name: "EXT. SINGAPORE INTL SCHOOL - AFTERNOON", 
    duration: "2:45s", 
    assignee: "DIRECTOR KIM",
    steps: {
      script: "Approved", concept: "Approved", previs: "In-Progress", casting: "Approved", location: "Approved",
      cinematog: "Waiting", video: "Waiting", asset: "Waiting",
      vfx: "Waiting", edit: "Waiting", color: "Waiting", sound: "Waiting", music: "Waiting", mixing: "Waiting"
    }
  },
  { 
    id: "S#002", 
    name: "INT. SINGAPORE APEX EXCHANGE - MORNING", 
    duration: "1:30s", 
    assignee: "C. RYAN",
    steps: {
      script: "Approved", concept: "Approved", previs: "Approved", casting: "Waiting", location: "Approved",
      cinematog: "In-Progress", video: "Waiting", asset: "In-Progress",
      vfx: "Waiting", edit: "Waiting", color: "Waiting", sound: "Waiting", music: "Waiting", mixing: "Waiting"
    }
  },
  { 
    id: "S#003", 
    name: "INT. SEOL-HEE'S CONDO - NIGHT", 
    duration: "3:12s", 
    assignee: "DIRECTOR KIM",
    steps: {
      script: "Approved", concept: "Review", previs: "Waiting", casting: "Waiting", location: "Approved",
      cinematog: "Waiting", video: "Waiting", asset: "Waiting",
      vfx: "Waiting", edit: "Waiting", color: "Waiting", sound: "Waiting", music: "Waiting", mixing: "Waiting"
    }
  },
  { 
    id: "S#004", 
    name: "INT. PYONGYANG 110 - FLASHBACK", 
    duration: "4:05s", 
    assignee: "MAJOR RI",
    steps: {
      script: "Approved", concept: "Approved", previs: "Approved", casting: "Approved", location: "Approved",
      cinematog: "Approved", video: "Approved", asset: "Approved",
      vfx: "In-Progress", edit: "Waiting", color: "Waiting", sound: "Waiting", music: "Waiting", mixing: "Waiting"
    }
  }
];

const statusStyles: Record<StepStatus, string> = {
  "Waiting": "border border-[var(--ms-text-ghost)] text-[var(--ms-text-ghost)]",
  "In-Progress": "bg-[var(--ms-blue)] text-white shadow-[0_0_10px_rgba(52,152,219,0.3)]",
  "Review": "bg-[var(--ms-amber)] text-white animate-pulse",
  "Approved": "bg-[var(--ms-gold)] text-[var(--ms-bg-base)] font-bold",
  "Revision": "bg-[var(--ms-crimson)] text-white",
};

interface ShotMatrixProps {
  onShotClick?: (id: string) => void;
}

export default function ShotMatrix({ onShotClick }: ShotMatrixProps) {
  return (
    <div className="w-full flex flex-col bg-[var(--ms-bg-surface)] border border-[var(--ms-gold-border)] rounded-[var(--ms-radius-lg)] overflow-hidden gstack-glass shadow-[var(--ms-glass-shadow)] mt-6">
      {/* Matrix Controls */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-[var(--ms-gold-border)] bg-[var(--ms-bg-elevated)]/40">
        <div className="flex flex-col gap-1">
           <h3 className="text-2xl font-serif text-[var(--ms-gold)] tracking-tight">Production Shot Matrix</h3>
           <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--ms-text-dim)] font-mono">Autonomous Orchestration Hub</p>
        </div>
        <div className="flex gap-4">
           <button className="px-5 py-2 border border-[var(--ms-gold-border)] text-[var(--ms-gold)] text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--ms-gold-haze)] transition-all rounded-[var(--ms-radius-sm)]">Filter</button>
           <button className="px-6 py-2 bg-[var(--ms-gold)] text-[var(--ms-bg-base)] text-[10px] font-bold uppercase tracking-widest rounded-[var(--ms-radius-sm)] shadow-[0_4px_12px_var(--ms-gold-glint)]">New Shot</button>
        </div>
      </div>

      {/* The Matrix Table */}
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full border-collapse">
          <thead>
            {/* Phase Headers */}
            <tr className="bg-[var(--ms-bg-elevated)]/20 border-b border-[var(--ms-gold-border)]">
              <th className="px-6 py-3 border-r border-[var(--ms-gold-border)] sticky left-0 z-20 bg-[var(--ms-bg-elevated)]"></th>
              <th colSpan={5} className="px-4 py-2 text-[9px] font-bold text-[var(--ms-gold)] uppercase tracking-widest border-r border-[var(--ms-gold-border)]">Pre-Production</th>
              <th colSpan={3} className="px-4 py-2 text-[9px] font-bold text-[#3498DB] uppercase tracking-widest border-r border-[var(--ms-gold-border)]">Main Production</th>
              <th colSpan={6} className="px-4 py-2 text-[9px] font-bold text-[#A8A9AD] uppercase tracking-widest border-r border-[var(--ms-gold-border)]">Post-Production</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--ms-gold-border)]/50">
            {mockShots.map((shot) => (
              <tr key={shot.id} onClick={() => onShotClick?.(shot.id)} className="hover:bg-[var(--ms-gold-haze)] transition-all group cursor-pointer">
                <td className="px-6 py-6 border-r border-[var(--ms-gold-border)] sticky left-0 z-10 bg-[var(--ms-bg-elevated)] group-hover:bg-[var(--ms-bg-surface)]">
                  <div className="flex flex-col min-w-[200px]">
                    <span className="text-[10px] font-mono text-[var(--ms-gold)] opacity-70 mb-1">{shot.id}</span>
                    <span className="text-xs font-serif text-[var(--ms-text-bright)] leading-snug group-hover:text-[var(--ms-gold)] transition-colors">{shot.name}</span>
                    <span className="text-[9px] text-[var(--ms-text-dim)] mt-2 uppercase tracking-tighter">Assigned: {shot.assignee}</span>
                  </div>
                </td>
                
                {Object.entries(shot.steps).map(([key, status]) => (
                  <td key={key} className="px-3 py-6 border-r border-[var(--ms-gold-border)]/10">
                    <div className="flex flex-col items-center">
                       <div className={`w-11 h-11 rounded-full flex items-center justify-center text-[8px] font-bold uppercase tracking-tighter transition-all cursor-pointer hover:scale-110 shadow-lg ${statusStyles[status as StepStatus]}`}>
                         {status === "Approved" ? "●" : status.substring(0, 1)}
                       </div>
                       <span className="text-[7px] text-[var(--ms-text-ghost)] mt-2 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity font-mono">{key}</span>
                    </div>
                  </td>
                ))}

                <td className="px-6 py-6 text-center">
                  <span className="text-[10px] font-mono text-[var(--ms-gold)] font-bold">{shot.duration}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-[var(--ms-bg-elevated)]/40 px-8 py-4 border-t border-[var(--ms-gold-border)] flex justify-between items-center text-[10px] font-mono text-[var(--ms-text-dim)]">
        <div className="flex gap-6">
           <span className="flex items-center gap-2"><div className="w-1 h-1 bg-[var(--ms-gold)] rounded-full animate-pulse" /> LIVE SYNC ACTIVE</span>
           <span>PROJECT: MARIONETTE V2</span>
        </div>
        <div className="flex gap-6">
           <span>APPROVED: 12</span>
           <span>IN REVISION: 2</span>
        </div>
      </div>
    </div>
  );
}
