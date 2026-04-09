"use client";

import React, { useState } from "react";

type StepStatus = "Waiting" | "In-Progress" | "Review" | "Approved" | "Revision";

interface Shot {
  id: string;
  thumbnail?: string;
  name: string;
  duration: string;
  steps: {
    // PRE
    script: StepStatus;
    concept: StepStatus;
    previs: StepStatus;
    casting: StepStatus;
    location: StepStatus;
    // MAIN
    cinematog: StepStatus;
    video: StepStatus;
    asset: StepStatus;
    // POST
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
    id: "S#1", 
    name: "EXT. Singapore Intl School - Afternoon", 
    duration: "2:45s", 
    assignee: "Director Kim",
    steps: {
      script: "Approved", concept: "Approved", previs: "In-Progress", casting: "Approved", location: "Approved",
      cinematog: "Waiting", video: "Waiting", asset: "Waiting",
      vfx: "Waiting", edit: "Waiting", color: "Waiting", sound: "Waiting", music: "Waiting", mixing: "Waiting"
    }
  },
  { 
    id: "S#2", 
    name: "INT. Singapore APEX Exchange - Morning", 
    duration: "1:30s", 
    assignee: "C. Ryan",
    steps: {
      script: "Approved", concept: "Approved", previs: "Approved", casting: "Waiting", location: "Approved",
      cinematog: "In-Progress", video: "Waiting", asset: "In-Progress",
      vfx: "Waiting", edit: "Waiting", color: "Waiting", sound: "Waiting", music: "Waiting", mixing: "Waiting"
    }
  },
  { 
    id: "S#3", 
    name: "INT. Seol-hee's Condo - Night", 
    duration: "3:12s", 
    assignee: "Director Kim",
    steps: {
      script: "Approved", concept: "Review", previs: "Waiting", casting: "Waiting", location: "Approved",
      cinematog: "Waiting", video: "Waiting", asset: "Waiting",
      vfx: "Waiting", edit: "Waiting", color: "Waiting", sound: "Waiting", music: "Waiting", mixing: "Waiting"
    }
  },
  { 
    id: "S#4", 
    name: "INT. Pyongyang 110 - Flashback", 
    duration: "4:05s", 
    assignee: "Major Ri",
    steps: {
      script: "Approved", concept: "Approved", previs: "Approved", casting: "Approved", location: "Approved",
      cinematog: "Approved", video: "Approved", asset: "Approved",
      vfx: "In-Progress", edit: "Waiting", color: "Waiting", sound: "Waiting", music: "Waiting", mixing: "Waiting"
    }
  },
  { 
    id: "S#5", 
    name: "INT. NIS Seoul - HQ Global Bureau", 
    duration: "2:20s", 
    assignee: "Jin-woo Han",
    steps: {
      script: "Approved", concept: "In-Progress", previs: "Waiting", casting: "Waiting", location: "Waiting",
      cinematog: "Waiting", video: "Waiting", asset: "Waiting",
      vfx: "Waiting", edit: "Waiting", color: "Waiting", sound: "Waiting", music: "Waiting", mixing: "Waiting"
    }
  },
  { 
    id: "S#7", 
    name: "INT. Cheongdam-dong 'Songhak재'", 
    duration: "5:40s", 
    assignee: "Director Kim",
    steps: {
      script: "Approved", concept: "Approved", previs: "Approved", casting: "Approved", location: "Approved",
      cinematog: "Approved", video: "Approved", asset: "Approved",
      vfx: "Approved", edit: "In-Progress", color: "Waiting", sound: "Waiting", music: "In-Progress", mixing: "Waiting"
    }
  }
];

const statusStyles: Record<StepStatus, string> = {
  "Waiting": "bg-gray-800/50 text-gray-500",
  "In-Progress": "bg-blue-900/40 text-blue-400 border border-blue-800/50",
  "Review": "bg-amber-900/40 text-amber-400 border border-amber-800/50 animate-pulse",
  "Approved": "bg-green-900/40 text-green-400 border border-green-800/50",
  "Revision": "bg-red-900/40 text-red-400 border border-red-800/50",
};

interface ShotMatrixProps {
  onShotClick?: (shotId: string) => void;
}

export default function ShotMatrix({ onShotClick }: ShotMatrixProps) {
  return (
    <div className="w-full flex flex-col bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-xl overflow-hidden shadow-2xl">
      {/* Matrix Controls */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--ms-border)] bg-[var(--ms-bg)]/80">
        <div className="flex items-center gap-4">
           <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--ms-gold)]">Production Shot Matrix</h3>
           <div className="flex gap-1">
             <button className="px-3 py-1 bg-[var(--ms-bg-2)] border border-[var(--ms-border)] text-[9px] font-bold text-[var(--ms-text-dim)] hover:text-[var(--ms-gold)] rounded uppercase">Filter</button>
             <button className="px-3 py-1 bg-[var(--ms-bg-2)] border border-[var(--ms-border)] text-[9px] font-bold text-[var(--ms-text-dim)] hover:text-[var(--ms-gold)] rounded uppercase">Group</button>
           </div>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-1.5 bg-[var(--ms-gold)] text-[var(--ms-bg)] text-[9px] font-bold uppercase tracking-widest rounded shadow-lg">New Shot</button>
        </div>
      </div>

      {/* The Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            {/* Phase Headers */}
            <tr className="bg-[var(--ms-bg)]/50 border-b border-[var(--ms-border)]">
              <th className="px-4 py-2 border-r border-[var(--ms-border)] sticky left-0 z-20 bg-[var(--ms-bg-2)]"></th>
              <th colSpan={5} className="px-4 py-1 text-center text-[8px] font-bold text-[var(--ms-gold)] uppercase tracking-widest border-r border-[var(--ms-border)] bg-[var(--ms-gold)]/5">Pre-Production</th>
              <th colSpan={3} className="px-4 py-1 text-center text-[8px] font-bold text-blue-400 uppercase tracking-widest border-r border-[var(--ms-border)] bg-blue-400/5">Main Production</th>
              <th colSpan={6} className="px-4 py-1 text-center text-[8px] font-bold text-purple-400 uppercase tracking-widest border-r border-[var(--ms-border)] bg-purple-400/5">Post-Production</th>
              <th className="px-4 py-2"></th>
            </tr>
            {/* Agent Headers */}
            <tr className="bg-[var(--ms-bg)]/30 border-b border-[var(--ms-border)]">
              <th className="px-4 py-2 text-left text-[9px] font-bold text-[var(--ms-text-dim)] uppercase tracking-wider border-r border-[var(--ms-border)] w-48 sticky left-0 z-20 bg-[var(--ms-bg-2)] shadow-[2px_0_5px_rgba(0,0,0,0.3)]">Shot ID / Name</th>
              
              {/* PRE */}
              <th className="px-2 py-2 text-center text-[8px] font-bold text-[var(--ms-text-dim)] uppercase tracking-tighter border-r border-[var(--ms-border)] min-w-[70px]">Script</th>
              <th className="px-2 py-2 text-center text-[8px] font-bold text-[var(--ms-text-dim)] uppercase tracking-tighter border-r border-[var(--ms-border)] min-w-[70px]">Concept</th>
              <th className="px-2 py-2 text-center text-[8px] font-bold text-[var(--ms-text-dim)] uppercase tracking-tighter border-r border-[var(--ms-border)] min-w-[70px]">Previs</th>
              <th className="px-2 py-2 text-center text-[8px] font-bold text-[var(--ms-text-dim)] uppercase tracking-tighter border-r border-[var(--ms-border)] min-w-[70px]">Casting</th>
              <th className="px-2 py-2 text-center text-[8px] font-bold text-[var(--ms-text-dim)] uppercase tracking-tighter border-r border-[var(--ms-border)] min-w-[70px]">Location</th>
              
              {/* MAIN */}
              <th className="px-2 py-2 text-center text-[8px] font-bold text-[var(--ms-text-dim)] uppercase tracking-tighter border-r border-[var(--ms-border)] min-w-[70px]">DP/Ref</th>
              <th className="px-2 py-2 text-center text-[8px] font-bold text-[var(--ms-text-dim)] uppercase tracking-tighter border-r border-[var(--ms-border)] min-w-[70px]">Video</th>
              <th className="px-2 py-2 text-center text-[8px] font-bold text-[var(--ms-text-dim)] uppercase tracking-tighter border-r border-[var(--ms-border)] min-w-[70px]">Asset</th>
              
              {/* POST */}
              <th className="px-2 py-2 text-center text-[8px] font-bold text-[var(--ms-text-dim)] uppercase tracking-tighter border-r border-[var(--ms-border)] min-w-[70px]">VFX</th>
              <th className="px-2 py-2 text-center text-[8px] font-bold text-[var(--ms-text-dim)] uppercase tracking-tighter border-r border-[var(--ms-border)] min-w-[70px]">Edit</th>
              <th className="px-2 py-2 text-center text-[8px] font-bold text-[var(--ms-text-dim)] uppercase tracking-tighter border-r border-[var(--ms-border)] min-w-[70px]">Color</th>
              <th className="px-2 py-2 text-center text-[8px] font-bold text-[var(--ms-text-dim)] uppercase tracking-tighter border-r border-[var(--ms-border)] min-w-[70px]">Sound</th>
              <th className="px-2 py-2 text-center text-[8px] font-bold text-[var(--ms-text-dim)] uppercase tracking-tighter border-r border-[var(--ms-border)] min-w-[70px]">Music</th>
              <th className="px-2 py-2 text-center text-[8px] font-bold text-[var(--ms-text-dim)] uppercase tracking-tighter border-r border-[var(--ms-border)] min-w-[70px]">Mixing</th>

              <th className="px-4 py-2 text-center text-[9px] font-bold text-[var(--ms-text-dim)] uppercase tracking-wider min-w-[60px]">Dur.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--ms-border)]">
            {mockShots.map((shot) => (
              <tr 
                key={shot.id} 
                className="hover:bg-[var(--ms-gold)]/5 transition-colors group cursor-pointer"
              >
                <td className="px-4 py-4 border-r border-[var(--ms-border)] sticky left-0 z-10 bg-[var(--ms-bg-2)] group-hover:bg-[var(--ms-bg-2)]/90 shadow-[2px_0_5px_rgba(0,0,0,0.3)]">
                  <div className="flex flex-col" onClick={() => onShotClick?.(shot.id)}>
                    <span className="text-[10px] font-mono text-[var(--ms-gold)] font-bold">{shot.id}</span>
                    <span className="text-[10px] font-bold text-[var(--ms-text)] mt-1 truncate">{shot.name}</span>
                    <span className="text-[7px] text-[var(--ms-text-dim)] mt-1 uppercase font-mono tracking-tighter">Assigned: {shot.assignee}</span>
                  </div>
                </td>
                
                {Object.entries(shot.steps).map(([key, status]) => (
                  <td key={key} className="px-1.5 py-2 border-r border-[var(--ms-border)]">
                    <div 
                      className={`w-full h-8 rounded flex items-center justify-center text-[7px] font-bold uppercase tracking-tighter transition-all cursor-pointer hover:brightness-125 ${statusStyles[status as StepStatus]}`}
                    >
                      {status}
                    </div>
                  </td>
                ))}

                <td className="px-4 py-4 text-center">
                  <span className="text-[9px] font-mono text-[var(--ms-text-dim)]">{shot.duration}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Row Count / Footer */}
      <div className="bg-[var(--ms-bg)]/50 px-6 py-2 border-t border-[var(--ms-border)] flex justify-between items-center text-[9px] font-mono text-[var(--ms-text-dim)]">
        <span>Displaying {mockShots.length} Shots</span>
        <div className="flex gap-4">
           <span>Approved: 2</span>
           <span>In Production: 10</span>
        </div>
      </div>
    </div>
  );
}
