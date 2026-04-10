"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface ShotStatus {
  sceneId: string;
  shotId: string;
  steps: Record<string, "Queued" | "Running" | "Complete" | "Error">;
  versions: Record<string, string>;
}

import { usePipeline, AgentStatus } from "./PipelineProvider";

interface ProductionMatrixProps {
  onAgentClick?: (agent: string) => void;
}

const AGENTS = [
  "SCRP", "CNCP", "SETD", "ASST", "GEN", 
  "CINE", "VFX", "VOIC", "EDIT", "GRDE", 
  "SOND", "SCOR", "MSTR"
];

export default function ProductionMatrix() {
  const router = useRouter();
  const { agentStatus, activeShotId, activeSceneId, retryTrack } = usePipeline();

  const handleAgentClick = (agent: string) => {
    const routeMap: Record<string, string> = {
      "SCRP": "scripter",
      "CNCP": "casting",
      "SETD": "location",
      "ASST": "asset-forge",
      "GEN": "gen",
      "CINE": "cinematics",
      "VFX": "vfx",
      "VOIC": "voice",
      "EDIT": "edit",
      "GRDE": "color",
      "SOND": "sound",
      "SCOR": "score",
      "MSTR": "mixing"
    };

    const slug = routeMap[agent];
    if (slug) {
      router.push(`/studio/${slug}`);
    }
  };

  return (
    <div className="bg-[var(--ms-bg-base)] border border-[var(--ms-border)] rounded-[40px] overflow-hidden shadow-3xl animate-in fade-in duration-1000">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[var(--ms-gold-border)]/20">
        <table className="w-full border-collapse border-spacing-0">
          <thead>
            <tr className="bg-black/40 backdrop-blur-3xl sticky top-0 z-10 border-b border-[var(--ms-border)]">
              <th className="px-8 py-6 text-left text-[11px] font-bold text-[var(--ms-gold)] uppercase tracking-[0.4em] border-r border-[var(--ms-border)] sticky left-0 bg-black/60 backdrop-blur-xl">
                 Scene_Shot_Matrix
              </th>
              {AGENTS.map((agent) => (
                <th key={agent} className="px-6 py-6 text-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest min-w-[110px]">
                  {agent}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--ms-border)]">
            {[1, 2, 3].map((row) => (
              <tr key={row} className="group hover:bg-[var(--ms-gold)]/5 transition-all">
                <td className="px-8 py-6 border-r border-[var(--ms-border)] sticky left-0 bg-black/40 group-hover:bg-black/60 transition-all backdrop-blur-xl">
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-bold text-white tracking-tight">{activeSceneId}</span>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest">TK_0{row}</span>
                  </div>
                </td>
                {AGENTS.map((agent) => {
                  const status = agentStatus[agent] || "QUEUED";
                  const retries = retryTrack[agent] || 0;
                  
                  return (
                    <td key={agent} className="px-4 py-4 text-center relative group/cell">
                      <div 
                        onClick={() => handleAgentClick(agent)}
                        className={`mx-auto w-full max-w-[85px] h-10 rounded-xl flex flex-col items-center justify-center border transition-all cursor-pointer relative overflow-hidden ${
                        status === "COMPLETE" ? "bg-green-500/10 border-green-500/20 text-green-400" :
                        status === "PROCESSING" ? "bg-[var(--ms-gold)]/10 border-[var(--ms-gold)]/40 text-[var(--ms-gold)] shadow-[0_0_15px_rgba(212,175,55,0.1)]" :
                        status === "FAILED" ? "bg-red-500/10 border-red-500/30 text-red-400" :
                        status === "READY_FOR_QC" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                        "bg-white/5 border-transparent text-zinc-700 opacity-40 hover:opacity-100 hover:border-white/10"
                      }`}>
                        <span className="text-[9px] font-mono font-bold tracking-tighter z-10">
                          {status === "COMPLETE" ? "LOCKED" : status === "PROCESSING" ? "SYNC..." : status === "FAILED" ? "ERROR" : status === "READY_FOR_QC" ? "QC" : "-"}
                        </span>
                        {retries > 0 && (
                          <div className="absolute top-1 right-1">
                             <div className="w-1 h-1 rounded-full bg-red-500" />
                          </div>
                        )}
                        {status === "PROCESSING" && (
                          <div className="absolute bottom-0 left-0 h-[2px] bg-[var(--ms-gold)] animate-pulse shadow-[0_0_10px_var(--ms-gold)]" style={{ width: '100%' }} />
                        )}
                      </div>
                      
                      {/* Hover Info Tip */}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-[var(--ms-gold)] text-black text-[7px] font-bold rounded opacity-0 group-hover/cell:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                         OPEN_{agent}_STUDIO
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
      <div className="px-10 py-6 bg-black/20 border-t border-[var(--ms-border)] flex justify-between items-center backdrop-blur-xl">
        <div className="flex gap-8">
           {[
             { label: "Queued", color: "bg-zinc-800" },
             { label: "Processing", color: "bg-[var(--ms-gold)]" },
             { label: "Complete", color: "bg-green-500" },
             { label: "Error", color: "bg-red-500" }
           ].map(s => (
             <div key={s.label} className="flex items-center gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-sm ${s.color} ${s.label === "Processing" ? 'animate-pulse shadow-[0_0_10px_var(--ms-gold)]' : ''}`} />
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{s.label}</span>
             </div>
           ))}
        </div>
        <div className="flex items-center gap-6">
           <div className="flex flex-col items-end">
              <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">Active_Auteur_Protocol</span>
              <span className="text-[10px] text-[var(--ms-gold)] font-mono font-bold">MODE: AUTONOMOUS_V4</span>
           </div>
           <div className="w-px h-8 bg-[var(--ms-border)]" />
           <span className="text-[10px] text-zinc-500 font-mono font-bold tracking-[0.2em]">14_AGENTS // SYNC_LOCKED</span>
        </div>
      </div>
    </div>
  );
}
