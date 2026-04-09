"use client";

import React from "react";

export interface PipelineStep {
  name: string;
  status: "Completed" | "Processing" | "Queue" | "Error";
  progress: number;
  agent: string;
  phase: "Pre-Production" | "Main Production" | "Post-Production";
  grounding?: string;
  soq?: number;
}

export const defaultPipelineSteps: PipelineStep[] = [
  // PRE-PRODUCTION
  { phase: "Pre-Production", name: "Script", agent: "Scripter", status: "Queue", progress: 0 },
  { phase: "Pre-Production", name: "Concept", agent: "ConceptArtist", status: "Queue", progress: 0 },
  { phase: "Pre-Production", name: "Previs", agent: "Previsualizer", status: "Queue", progress: 0 },
  { phase: "Pre-Production", name: "Casting", agent: "CastingDirector", status: "Queue", progress: 0 },
  { phase: "Pre-Production", name: "Location", agent: "LocationScout", status: "Queue", progress: 0 },
  
  // MAIN PRODUCTION
  { phase: "Main Production", name: "DP Ref", agent: "Cinematographer", status: "Queue", progress: 0 },
  { phase: "Main Production", name: "Video", agent: "Generalist (Veo)", status: "Queue", progress: 0 },
  { phase: "Main Production", name: "Asset", agent: "AssetDesigner", status: "Queue", progress: 0 },
  
  // POST-PRODUCTION
  { phase: "Post-Production", name: "VFX", agent: "Compositor", status: "Queue", progress: 0 },
  { phase: "Post-Production", name: "Edit", agent: "MasterEditor", status: "Queue", progress: 0 },
  { phase: "Post-Production", name: "Color", agent: "Colorist", status: "Queue", progress: 0 },
  { phase: "Post-Production", name: "Sound", agent: "SoundDesigner", status: "Queue", progress: 0 },
  { phase: "Post-Production", name: "Score", agent: "Composer", status: "Queue", progress: 0 },
  { phase: "Post-Production", name: "Mixing", agent: "MixingEngineer", status: "Queue", progress: 0 },
];

interface PipelineTrackerProps {
  steps?: PipelineStep[];
  activeAgents?: number;
  systemHealth?: number;
}

export default function PipelineTracker({ 
  steps = defaultPipelineSteps,
  activeAgents = 14,
  systemHealth = 98.4
}: PipelineTrackerProps) {
  const phases = ["Pre-Production", "Main Production", "Post-Production"] as const;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 mb-10">
      <div className="bg-[var(--ms-bg-2)]/80 backdrop-blur-xl border border-[var(--ms-border)] rounded-sm p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-[var(--ms-green)] animate-pulse shadow-[0_0_8px_var(--ms-green)]" />
             <h4 className="text-[10px] uppercase tracking-[0.4em] font-mono font-bold text-[var(--ms-green)]">Global Pipeline Orchestration</h4>
          </div>
          <div className="text-[10px] font-mono text-[var(--ms-text-dim)] uppercase tracking-widest">
            AERIAL CONTROL • Active Agents: {activeAgents} • System Health: {systemHealth}%
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {phases.map((phase) => (
            <div key={phase} className="relative bg-[var(--ms-bg)]/50 rounded-sm p-4 border border-[var(--ms-border)]">
              <h5 className="text-[9px] uppercase tracking-[0.2em] font-mono font-bold text-[var(--ms-text-dim)] mb-6 text-center border-b border-[var(--ms-border)] pb-2">
                {phase}
              </h5>
              
              <div className="flex flex-wrap justify-center gap-4">
                {steps
                  .filter((s) => s.phase === phase)
                  .map((step, idx) => (
                    <div key={step.name} className="flex flex-col items-center group relative w-16">
                      {/* Step Box (2px radius) */}
                      <div className={`w-8 h-8 rounded-sm flex items-center justify-center border transition-all duration-300 mb-2 ${
                        step.status === "Completed" ? "bg-[var(--ms-gray)]/20 border-[var(--ms-gray)]/40 text-[var(--ms-text)]" :
                        step.status === "Processing" ? "bg-[var(--ms-green-dim)] border-[var(--ms-green-border)] shadow-[0_0_10px_rgba(0,255,65,0.1)]" :
                        step.status === "Error" ? "bg-[#1A0808] border-[var(--ms-red)]/40 text-[var(--ms-red)]" :
                        "bg-[var(--ms-bg)] border-[var(--ms-border)]"
                      }`}>
                         {step.status === "Completed" ? (
                            <span className="text-[var(--ms-green)] text-[10px] font-bold">✓</span>
                         ) : (
                            <span className={`text-[9px] font-mono ${
                              step.status === "Processing" ? "text-[var(--ms-green)]" : 
                              step.status === "Error" ? "text-[var(--ms-red)]" :
                              "text-[var(--ms-text-dim)]"
                            }`}>
                              {(idx + 1).toString().padStart(2, '0')}
                            </span>
                         )}

                         {/* SOQ Badge (Seal of Quality) */}
                         {step.soq !== undefined && (
                            <div className={`absolute -top-1 -right-1 px-1 rounded-[1px] text-[7px] font-mono font-bold shadow-sm ${
                              step.soq >= 80 ? "bg-[var(--ms-green)] text-[var(--ms-bg)]" :
                              step.soq >= 60 ? "bg-amber-500 text-black" : "bg-red-600 text-white"
                            }`}>
                              {step.soq}
                            </div>
                         )}
                      </div>

                      {/* Info */}
                      <div className="flex flex-col items-center text-center">
                         <span className={`text-[8px] font-mono font-bold uppercase tracking-tighter mb-0.5 truncate w-full ${
                           step.status === "Queue" ? "text-[var(--ms-text-dim)]" : 
                           step.status === "Error" ? "text-[var(--ms-red)]" :
                           "text-[var(--ms-text)]"
                         }`}>{step.name}</span>
                         <span className="text-[7px] font-mono text-[var(--ms-text-dim)] group-hover:text-[var(--ms-green)] transition-colors uppercase truncate w-full">{step.agent}</span>
                      </div>

                      {/* Progress Mini-Bar for Processing */}
                      {step.status === "Processing" && (
                         <div className="absolute -top-7 w-full flex flex-col items-center z-10">
                            <span className="text-[6px] font-mono font-bold text-[var(--ms-green)] bg-[var(--ms-green-dim)] px-1 border border-[var(--ms-green-border)] rounded-sm mb-1 animate-pulse tracking-tighter">LIVE GROUNDING</span>
                            <span className="text-[8px] font-mono text-[var(--ms-green)]">{step.progress}%</span>
                            <div className="w-8 h-0.5 bg-[var(--ms-border)] rounded-none overflow-hidden mt-0.5">
                              <div className="h-full bg-[var(--ms-green)] transition-all duration-700 ease-out" style={{ width: `${step.progress}%` }} />
                            </div>
                         </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
