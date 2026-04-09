"use client";

import React from "react";

interface ShotStatus {
  sceneId: string;
  shotId: string;
  steps: Record<string, "Queued" | "Running" | "Complete" | "Error">;
  versions: Record<string, string>;
}

const AGENTS = [
  "Scripter", "Concept", "Previs", "Casting", "Location", 
  "Cinemato", "Gen", "Asset", "VFX", "Edit", 
  "Color", "Sound", "Music", "Mixing"
];

const MOCK_SHOTS: ShotStatus[] = Array.from({ length: 12 }, (_, i) => ({
  sceneId: `S${i + 1}`,
  shotId: `Shot ${i + 1}`,
  steps: AGENTS.reduce((acc, agent, idx) => {
    const states: any[] = ["Complete", "Complete", "Complete", "Running", "Queued"];
    acc[agent] = i < 4 ? "Complete" : idx < 5 ? "Complete" : idx === 5 ? "Running" : "Queued";
    return acc;
  }, {} as any),
  versions: AGENTS.reduce((acc, agent) => {
    acc[agent] = "V1";
    return acc;
  }, {} as any),
}));

export default function ProductionMatrix() {
  return (
    <div className="bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-xl overflow-hidden animate-in fade-in duration-700">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[var(--ms-border)]">
        <table className="w-full border-collapse border-spacing-0">
          <thead>
            <tr className="bg-[var(--ms-bg)]/80 backdrop-blur-md sticky top-0 z-10 border-b border-[var(--ms-border)]">
              <th className="px-4 py-3 text-left text-[9px] font-bold text-[var(--ms-text-dim)] uppercase tracking-wider border-r border-[var(--ms-border)] sticky left-0 bg-[var(--ms-bg)]">
                Scene | Shot
              </th>
              {AGENTS.map((agent) => (
                <th key={agent} className="px-3 py-3 text-center text-[8px] font-bold text-[var(--ms-text-dim)] uppercase tracking-tighter min-w-[80px]">
                  {agent}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--ms-border)]">
            {MOCK_SHOTS.map((shot) => (
              <tr key={shot.sceneId} className="hover:bg-[var(--ms-gold)]/5 transition-colors group">
                <td className="px-4 py-2 border-r border-[var(--ms-border)] sticky left-0 bg-[var(--ms-bg-2)] group-hover:bg-[var(--ms-bg)]/80 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[var(--ms-text)]">{shot.sceneId}</span>
                    <span className="text-[7px] text-[var(--ms-text-dim)] uppercase">{shot.shotId}</span>
                  </div>
                </td>
                {AGENTS.map((agent) => {
                  const status = shot.steps[agent];
                  const version = shot.versions[agent];
                  
                  return (
                    <td key={agent} className="px-2 py-2 text-center relative group/cell">
                      <div className={`mx-auto w-full max-w-[60px] h-6 rounded flex items-center justify-center border transition-all cursor-pointer ${
                        status === "Complete" ? "bg-green-500/10 border-green-500/20 text-green-400" :
                        status === "Running" ? "bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse" :
                        status === "Error" ? "bg-red-500/10 border-red-500/30 text-red-400" :
                        "bg-white/5 border-transparent text-[var(--ms-text-dim)] opacity-40"
                      }`}>
                        <span className="text-[8px] font-mono font-bold tracking-tighter">
                          {status === "Complete" ? version : status === "Running" ? "..." : "-"}
                        </span>
                      </div>
                      
                      {/* Hover Action Indicator */}
                      <div className="absolute top-1 right-1 opacity-0 group-hover/cell:opacity-100 transition-opacity">
                         <div className="w-1.5 h-1.5 rounded-full bg-[var(--ms-gold)]" />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Matrix Footer / Summary */}
      <div className="px-6 py-3 bg-[var(--ms-bg)]/50 border-t border-[var(--ms-border)] flex justify-between items-center">
        <div className="flex gap-4">
           {["Queued", "Running", "Complete", "Error"].map(s => (
             <div key={s} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-sm ${
                   s === "Complete" ? "bg-green-500" : 
                   s === "Running" ? "bg-amber-500" : 
                   s === "Error" ? "bg-red-500" : "bg-white/20"
                }`} />
                <span className="text-[8px] text-[var(--ms-text-dim)] uppercase font-bold">{s}</span>
             </div>
           ))}
        </div>
        <span className="text-[8px] text-[var(--ms-text-dim)] font-mono">14 Agents • 168 Tasks Tracked</span>
      </div>
    </div>
  );
}
