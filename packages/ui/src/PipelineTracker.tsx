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
  { phase: "Pre-Production", name: "Script", agent: "Scripter", status: "Queue", progress: 0 },
  { phase: "Pre-Production", name: "Concept", agent: "ConceptArtist", status: "Queue", progress: 0 },
  { phase: "Pre-Production", name: "Previs", agent: "Previsualizer", status: "Queue", progress: 0 },
  { phase: "Pre-Production", name: "Casting", agent: "CastingDirector", status: "Queue", progress: 0 },
  { phase: "Pre-Production", name: "Location", agent: "LocationScout", status: "Queue", progress: 0 },
  { phase: "Main Production", name: "DP Ref", agent: "Cinematographer", status: "Queue", progress: 0 },
  { phase: "Main Production", name: "Video", agent: "Generalist (Veo)", status: "Queue", progress: 0 },
  { phase: "Main Production", name: "Asset", agent: "AssetDesigner", status: "Queue", progress: 0 },
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
    <div className="w-full max-w-7xl mx-auto px-6 mb-12">
      <div className="bg-[var(--ms-bg-elevated)]/60 backdrop-blur-2xl border border-[var(--ms-gold-border)] rounded-[var(--ms-radius-lg)] p-8 gstack-glass shadow-[var(--ms-glass-shadow)]">
        <div className="flex items-center justify-between mb-10">
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--ms-gold)] animate-pulse shadow-[0_0_12px_var(--ms-gold)]" />
                <h4 className="text-[12px] uppercase tracking-[0.4em] font-mono font-bold text-[var(--ms-gold)]">Global Pipeline Orchestration</h4>
             </div>
             <p className="text-[10px] text-[var(--ms-text-dim)] font-mono uppercase tracking-widest pl-5">Monitoring {activeAgents} Autonomous Agents</p>
          </div>
          <div className="text-[11px] font-mono text-[var(--ms-gold)] border border-[var(--ms-gold-border)] px-4 py-1.5 rounded-full bg-[var(--ms-gold-haze)] tracking-tighter">
            SYSTEM INTEGRITY: {systemHealth}%
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector Lines (Visual) */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--ms-gold-border)] to-transparent pointer-events-none opacity-20" />

          {phases.map((phase) => (
            <div key={phase} className="relative bg-[var(--ms-bg-surface)]/40 rounded-[var(--ms-radius-lg)] p-6 border border-[var(--ms-gold-border)]/30 backdrop-blur-xl">
              <h5 className="text-sm font-serif text-[var(--ms-gold)] mb-8 text-center border-b border-[var(--ms-gold-border)]/20 pb-4 tracking-tight">
                {phase}
              </h5>
              
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                {steps
                  .filter((s) => s.phase === phase)
                  .map((step, idx) => (
                    <div key={step.name} className="flex flex-col items-center group relative w-full">
                      {/* Step Ring HUD */}
                      <div className="relative">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-700 ${
                          step.status === "Completed" ? "bg-[var(--ms-gold)]/10 border-[var(--ms-gold)] text-[var(--ms-gold)] shadow-[0_0_20px_var(--ms-gold-glint)]" :
                          step.status === "Processing" ? "bg-[var(--ms-gold-haze)] border-[var(--ms-blue)] text-white shadow-[0_0_25px_rgba(52,152,219,0.3)] scale-110" :
                          step.status === "Error" ? "bg-[var(--ms-crimson)]/20 border-[var(--ms-crimson)] text-white" :
                          "bg-[var(--ms-bg-elevated)] border-[var(--ms-text-ghost)]/30 text-[var(--ms-text-dim)]"
                        }`}>
                          {/* Inner Decorative Ring */}
                          <div className={`absolute inset-1 rounded-full border border-dashed opacity-30 ${
                            step.status === "Processing" ? "animate-spin-slow border-[var(--ms-blue)]" : "border-current"
                          }`} />
                          
                           {step.status === "Completed" ? (
                              <span className="text-xl font-serif">●</span>
                           ) : (
                              <span className={`text-[11px] font-mono font-bold ${
                                step.status === "Processing" ? "text-white" : "text-[var(--ms-text-dim)]"
                              }`}>
                                {(idx + 1).toString().padStart(2, '0')}
                              </span>
                           )}
                        </div>

                        {/* SOQ Badge HUD */}
                        {step.soq !== undefined && (
                           <div className="absolute -top-1 -right-2 px-1.5 py-0.5 rounded-sm text-[8px] font-mono font-bold bg-[var(--ms-gold)] text-[var(--ms-bg-base)] shadow-lg ring-1 ring-black/50">
                             {step.soq}%
                           </div>
                        )}
                      </div>

                      {/* Info & Metadata */}
                      <div className="mt-4 flex flex-col items-center text-center px-1">
                         <span className={`text-[10px] font-serif uppercase tracking-widest mb-1 transition-colors ${
                           step.status === "Queue" ? "text-[var(--ms-text-dim)]" : 
                           step.status === "Error" ? "text-[var(--ms-crimson)]" :
                           "text-[var(--ms-text-bright)] group-hover:text-[var(--ms-gold)]"
                         }`}>{step.name}</span>
                         <span className="text-[8px] font-mono text-[var(--ms-text-ghost)] group-hover:text-[var(--ms-text-dim)] uppercase tracking-[0.2em] truncate w-full">{step.agent}</span>
                      </div>

                      {/* HUD Scanning Line for Active Agents */}
                      {step.status === "Processing" && (
                         <div className="absolute -top-12 w-full flex flex-col items-center z-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
                            <span className="text-[7px] font-mono font-bold text-[var(--ms-blue)] bg-black/40 px-2 py-0.5 rounded-full border border-[var(--ms-blue)]/50 mb-2 animate-pulse">ORCHESTRATING_STREAM</span>
                            <div className="w-12 h-[1px] bg-[var(--ms-blue)] shadow-[0_0_10px_var(--ms-blue)] animate-progress-glow" />
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
