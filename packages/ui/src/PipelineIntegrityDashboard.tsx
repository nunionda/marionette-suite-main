"use client";

import React from "react";
import { usePipeline, AGENT_METADATA } from "./PipelineProvider";

export default function PipelineIntegrityDashboard() {
  const { getEngineForAgent, globalHealthScore } = usePipeline();

  const stages = [
    { id: "ST1", name: "Creative / Development", desc: "Scripting, Concept, Architecture" },
    { id: "ST2", name: "Greenlight / Finance", desc: "Executive Review, Budgeting, Legal" },
    { id: "ST3", name: "Production", desc: "Scene Synthesis, Cinematography" },
    { id: "ST4", name: "Post-Production", desc: "VFX, Voice, Edit, Grade, Sound" },
    { id: "ST5", name: "Distribution", desc: "Global DCP Delivery, Platforms" },
    { id: "ST6", name: "Marketing", desc: "Trailer Synthesis, Social Push" },
  ];

  const getAgentsForStage = (stageId: string) => {
    return Object.entries(AGENT_METADATA).filter(([, meta]) => meta.stage === stageId);
  };

  const getStageHealth = (stageId: string) => {
    const agents = getAgentsForStage(stageId);
    if (agents.length === 0) return 100; // Placeholder
    // In a real app, this would be computed from agent health
    return globalHealthScore; 
  };

  return (
    <div className="space-y-10 group">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.5em] text-[var(--ms-gold)]">Global Pipeline Integrity</h4>
          <p className="text-[11px] text-zinc-500 font-serif italic">Synchronizing 14 AI Agents with Disney GSS & 5-Layer R&R Framework</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
             <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest leading-none mb-1">Total_Integrity</span>
             <span className="text-xl font-mono text-white font-bold leading-none">{globalHealthScore}%</span>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-[var(--ms-gold)] border-t-transparent animate-spin-slow flex items-center justify-center">
             <div className="w-8 h-8 rounded-full bg-[var(--ms-gold)]/10 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-[var(--ms-gold)] animate-ping" />
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stages.map((stage) => {
          const agents = getAgentsForStage(stage.id);
          const health = getStageHealth(stage.id);
          
          return (
            <div 
              key={stage.id} 
              className="p-6 bg-black/40 border border-white/5 rounded-2xl hover:border-[var(--ms-gold)]/30 transition-all duration-500 group/stage relative overflow-hidden"
            >
              {/* Background ID */}
              <div className="absolute -right-2 -bottom-4 text-7xl font-mono font-black text-white/[0.02] pointer-events-none group-hover/stage:text-[var(--ms-gold)]/[0.05] transition-colors">
                {stage.id}
              </div>

              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-[var(--ms-gold)] font-bold">{stage.id}</span>
                    <h5 className="text-sm font-bold text-white uppercase tracking-tight">{stage.name}</h5>
                  </div>
                  <span className={`text-[10px] font-mono font-bold ${health > 90 ? 'text-green-500' : 'text-amber-500'}`}>
                    {health}%
                  </span>
                </div>

                <div className="h-0.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
                   <div 
                     className={`h-full transition-all duration-1000 ease-out ${health > 90 ? 'bg-green-500' : 'bg-amber-500'}`}
                     style={{ width: `${health}%` }}
                   />
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {agents.map(([id, meta]) => {
                    const engine = getEngineForAgent(id);
                    return (
                      <div 
                        key={id} 
                        className="px-2 py-1 bg-white/[0.02] border border-white/10 rounded flex items-center gap-1.5 group/agent cursor-default hover:bg-white/[0.05] transition-all"
                        title={`${meta.stageName} (${meta.layer})`}
                      >
                        <div className={`w-1 h-1 rounded-full ${engine ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`} />
                        <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-widest">{id}</span>
                        <div className="w-px h-2 bg-white/10" />
                        <span className="text-[7px] font-mono text-zinc-600 uppercase">{meta.layer}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
