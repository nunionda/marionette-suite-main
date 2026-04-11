"use client";

import React, { useState } from "react";
import { usePipeline, Engine } from "./PipelineProvider";

interface AgentBinding {
  role: string;
  engineId: string;
  phase: "Pre" | "Main" | "Post";
}

interface EngineRegistryProps {
  health?: {
    integrity_score: number;
    api_latency: Record<string, number>;
    infrastructure: any;
    logs: string[];
  };
  benchmarks?: {
    agents: Record<string, Record<string, unknown>>;
    benchmark_metadata: Record<string, unknown>;
  } | null;
}

const ROLE_ACRONYM_MAP: Record<string, string> = {
  "Scripter": "SCRP",
  "Concept Artist": "CNCP",
  "Previsualizer": "GEN",
  "Casting Director": "CNCP",
  "Location Scout": "SETD",
  "Cinematographer": "CINE",
  "Generalist": "GEN",
  "Asset Designer": "ASST",
  "VFX Compositor": "VFX",
  "Master Editor": "EDIT",
  "Colorist": "GRDE",
  "Sound Designer": "SOND",
  "Composer": "SCOR",
  "Mixing Engineer": "MSTR",
};

export default function EngineRegistry({ health, benchmarks }: EngineRegistryProps) {
  const { engines, agentBindings, updateBinding, globalHealthScore } = usePipeline();

  const handleUpdateBinding = (role: string, engineId: string) => {
    const acronym = ROLE_ACRONYM_MAP[role];
    if (acronym) {
      updateBinding(acronym, engineId);
    }
  };

  const ROLES = [
    "Scripter", "Concept Artist", "Previsualizer", "Casting Director", 
    "Location Scout", "Cinematographer", "Generalist", "Asset Designer", 
    "VFX Compositor", "Master Editor", "Colorist", "Sound Designer", 
    "Composer", "Mixing Engineer"
  ];

  return (
    <div className="p-12 space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-1000 bg-[var(--ms-bg-base)] min-h-full">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
           <h2 className="text-4xl font-serif font-bold text-white tracking-tighter uppercase">AI Engine Orchestration</h2>
           <div className="px-4 py-1.5 bg-[var(--ms-gold)]/10 border border-[var(--ms-gold)]/30 rounded-full flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[var(--ms-gold)] animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-[var(--ms-gold)] uppercase tracking-widest">Global_Integrity: {globalHealthScore}%</span>
           </div>
        </div>
        <p className="text-[11px] text-zinc-500 uppercase tracking-[0.4em] font-mono italic">Hyper-Scale_Neural_Resource_Management_v9.2</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Strategic Infrastructure Sidebar */}
          <div className="lg:col-span-4 space-y-12">
            <div className="space-y-6">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.5em] text-zinc-400">Compute_Load_Analysis</h3>
              <div className="space-y-8 p-10 bg-white/[0.02] border border-white/5 rounded-3xl shadow-2xl backdrop-blur-3xl">
                {/* Render Farm Load */}
                <div className="space-y-4 text-center">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-zinc-500">Render_Farm_Integrity</span>
                    <span className="text-green-500">82.4%</span>
                  </div>
                  <div className="h-20 w-full bg-black/40 rounded-2xl flex items-end gap-[2px] p-2 overflow-hidden border border-white/5">
                    {Array.from({ length: 32 }).map((_, i) => (
                      <div key={i} className="flex-1 bg-green-500/20 rounded-t-sm transition-all duration-1000" style={{ height: `${Math.random() * 70 + 30}%` }} />
                    ))}
                  </div>
                </div>

                {/* GPU Usage */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-zinc-500">GPU_Accelerator_Saturation</span>
                    <span className="text-[var(--ms-gold)] text-xs">74%</span>
                  </div>
                  <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-[1px]">
                     <div className="h-full bg-gradient-to-r from-[var(--ms-gold)]/40 to-[var(--ms-gold)] rounded-full transition-all duration-1000 shadow-[0_0_15px_var(--ms-gold)]" style={{ width: '74%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
               <h3 className="text-[11px] font-bold uppercase tracking-[0.5em] text-zinc-400">Registered_Neural_Engines</h3>
               <div className="space-y-4">
                 {engines.map((engine) => (
                   <div key={engine.id} className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-[var(--ms-gold)]/40 transition-all cursor-pointer shadow-xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--ms-gold)]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                     <div className="flex justify-between items-start relative z-10">
                       <div className="flex flex-col gap-1">
                         <h4 className="text-lg font-serif font-bold text-white group-hover:text-[var(--ms-gold)] transition-colors">{engine.name}</h4>
                         <span className="text-[10px] text-zinc-600 uppercase font-mono tracking-widest leading-none">{engine.provider} // {engine.type}</span>
                       </div>
                       <div className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-widest border ${
                         engine.status === "Online" ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                         engine.status === "Degraded" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                       }`}>
                         {engine.status}
                       </div>
                     </div>
                     <div className="mt-8 flex justify-between items-end relative z-10">
                        <div className="flex flex-col gap-1">
                           <span className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest">API_LATENCY</span>
                           <span className="text-xl font-mono text-white tracking-tighter">{Math.floor(engine.latency)}ms</span>
                        </div>
                        <div className="w-12 h-6 flex items-end gap-1">
                           {[1,0.8,0.4,1,0.6].map((v, i) => (
                              <div key={i} className="flex-1 bg-[var(--ms-gold)]/40" style={{ height: `${v * 100}%` }} />
                           ))}
                        </div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>

        {/* Agent Orchestration Board */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.5em] text-zinc-400 font-mono">High-Integrity_Agent_Binding_Matrix</h3>
          <div className="bg-black/40 border border-white/5 rounded-[40px] overflow-hidden shadow-3xl backdrop-blur-3xl p-1">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-10 py-8 text-left text-[11px] font-bold text-zinc-500 uppercase tracking-[0.4em]">Engine_Orchestrator_Node</th>
                  <th className="px-10 py-8 text-left text-[11px] font-bold text-zinc-500 uppercase tracking-[0.4em]">Assigned_Neural_Model</th>
                  <th className="px-10 py-8 text-center text-[11px] font-bold text-zinc-500 uppercase tracking-[0.4em]">Latency_Flux</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ROLES.map((role) => {
                  const acronym = ROLE_ACRONYM_MAP[role];
                  const engineId = agentBindings[acronym];
                  const currentEngine = engines.find(e => e.id === engineId);
                  
                  return (
                    <tr key={role} className="hover:bg-white/[0.04] transition-all group">
                      <td className="px-10 py-6">
                        <div className="flex flex-col gap-1">
                           <span className="text-base font-serif font-bold text-white group-hover:text-[var(--ms-gold)] transition-all">{role}</span>
                           <span className="text-[9px] font-mono text-zinc-600 font-bold uppercase tracking-widest">{acronym || "SYSTEM"} // AGENT_ID_{Math.floor(Math.random() * 900) + 100}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="relative group/select">
                           <select 
                              className="bg-black/60 border border-white/5 rounded-2xl px-6 py-3.5 text-xs text-[var(--ms-gold)] font-bold tracking-widest focus:ring-2 focus:ring-[var(--ms-gold)]/40 outline-none w-full appearance-none cursor-pointer transition-all hover:border-[var(--ms-gold)]/40 hover:bg-black uppercase"
                              value={engineId || "none"}
                              onChange={(e) => handleUpdateBinding(role, e.target.value)}
                           >
                              <option value="none">Select_Engine_Cluster...</option>
                              {engines.map(e => <option key={e.id} value={e.id}>{e.name} ({e.type})</option>)}
                           </select>
                           <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                              <div className="w-2 h-2 border-r-2 border-b-2 border-[var(--ms-gold)] rotate-45" />
                           </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <div className="flex flex-col items-center gap-1">
                           <span className={`text-xl font-mono font-bold tracking-tighter ${
                              (currentEngine?.latency ?? 0) > 1000 ? "text-amber-500" : "text-green-500"
                           }`}>
                              {currentEngine ? `~${Math.floor(currentEngine.latency)}ms` : "NaN"}
                           </span>
                           <span className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">REAL_TIME_PULSE</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Live Diagnostic Logs */}
      <div className="space-y-6">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.5em] text-zinc-400">Synthetic_Diagnostic_Stream</h3>
        <div className="bg-black/60 border border-white/5 rounded-[32px] p-12 font-mono shadow-inner relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-2 h-full bg-[var(--ms-gold)] opacity-30 group-hover:opacity-100 transition-opacity" />
           <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                 <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_15px_green] animate-pulse" />
                 <span className="text-[11px] text-green-500 font-bold uppercase tracking-[0.4em]">System_Auditor_Active // 23:12:04</span>
              </div>
              <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest italic group-hover:text-[var(--ms-gold)] transition-colors cursor-pointer">Clear_Audit_History()</span>
           </div>
           <div className="space-y-4 max-h-64 overflow-y-auto scrollbar-hide">
              {[
                "Establishing Neural_Link with Vertex AI Cluster / VEO-3.1...",
                "Latency spike detected in Azure-East-2 / Sora-Fallback Node.",
                "INFO: Sub-Surface Scattering weights synchronized for Character_ID: AEON.",
                "SUCCESS: Final Mastering DCP Package Integrity Verified (MD5: 2x9a...)",
                "WARNING: Local GStack cluster reporting 88% VRAM saturation.",
                "Neural Calibration Complete for [VOIC] Agent Synthesis Lab."
              ].map((log, i) => (
                <div key={i} className={`text-xs pl-6 border-l border-white/5 transition-all hover:translate-x-1 hover:text-white group-hover:border-[var(--ms-gold)]/20 ${
                  log.includes("WARNING") ? "text-amber-500/80" : 
                  log.includes("SUCCESS") ? "text-green-500/80" : "text-zinc-500"
                }`}>
                  <span className="text-[9px] opacity-40 mr-4">[{i.toString().padStart(2, '0')}]</span>
                  {log}
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
