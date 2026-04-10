import React, { useState, useEffect } from "react";
import { usePipeline } from "./PipelineProvider";

export default function DIStudio() {
  const [activeLUT, setActiveLUT] = useState("Kodak_5219_Vision3");
  const { getEngineForAgent, globalHealthScore, getAgentMeta } = usePipeline();
  const assignedEngine = getEngineForAgent("GRDE");
  const meta = getAgentMeta("GRDE");

  return (
    <div className="flex flex-col h-full bg-[var(--ms-bg-base)] border border-[var(--ms-border)] rounded-3xl overflow-hidden shadow-3xl animate-in fade-in duration-1000 group">
      <div className="flex items-center justify-between px-10 py-8 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-10">
          <div className="flex flex-col gap-1">
             <h3 className="font-serif text-3xl font-bold text-white tracking-tighter uppercase">DI & Color Grading Suite</h3>
             <div className="flex items-center gap-3">
               <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-mono italic">AU_GRDE_PROTOCOL // ACES_OCIO_WORKFLOW</span>
               <div className="flex gap-2">
                 <div className="px-2 py-1 bg-white/5 border border-white/10 rounded flex items-center gap-1.5">
                   <div className="w-1 h-1 rounded-full bg-blue-500" />
                   <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-widest">{meta?.stage}</span>
                 </div>
                 <div className="px-2 py-1 bg-white/5 border border-white/10 rounded flex items-center gap-1.5">
                   <div className="w-1 h-1 rounded-full bg-[var(--ms-gold)]" />
                   <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-widest">{meta?.layer}</span>
                 </div>
               </div>
             </div>
          </div>

          <div className="flex items-center gap-8 px-6 py-3 bg-white/[0.02] border border-white/10 rounded-2xl">
             <div className="flex flex-col items-end gap-1">
                <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Logic_Core</span>
                <span className="text-xs font-mono text-[var(--ms-gold)] font-bold">{assignedEngine?.name || "Initializing..."}</span>
             </div>
             <div className="w-px h-6 bg-white/10" />
             <div className="flex flex-col items-end gap-1">
                <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Latency</span>
                <span className={`text-xs font-mono font-bold ${
                   (assignedEngine?.latency ?? 0) > 1000 ? "text-amber-500" : "text-green-500"
                }`}>
                   {assignedEngine ? `${Math.floor(assignedEngine.latency)}ms` : "---"}
                </span>
             </div>
             <div className="w-px h-6 bg-white/10" />
             <div className="flex flex-col items-end gap-1">
                <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Integrity</span>
                <span className="text-xs font-mono text-white font-bold">{globalHealthScore}%</span>
             </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-mono font-bold rounded-lg flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            GRADE_LOCKED_ACES
          </div>
          <button className="px-8 py-2 bg-[var(--ms-gold)] text-black text-[10px] font-bold uppercase tracking-[0.2em] rounded-lg shadow-xl shadow-[var(--ms-gold)]/10 hover:scale-105 transition-all">
            Export_Master
          </button>
        </div>
      </div>

      <div className="flex flex-grow h-[550px]">
        {/* Left: LUT / Grade Node Tree */}
        <div className="w-80 border-r border-[var(--ms-border)] bg-[var(--ms-bg)]/30 overflow-y-auto">
           {[
             "Node_01_Primary_Correction", 
             "Node_02_Secondary_Cyan_Shift", 
             "Node_03_Halation_Sim", 
             "Node_04_Look_Dev_Kodak5219",
             "Node_05_Final_Rec709_ODT"
           ].map(node => (
             <button 
               key={node}
               onClick={() => setActiveLUT(node)}
               className={`w-full p-6 text-left border-b border-[var(--ms-border)] transition-all ${
                 activeLUT === node ? "bg-[var(--ms-gold)]/5 border-l-4 border-l-[var(--ms-gold)]" : "opacity-40"
               }`}
             >
               <h4 className="text-[10px] font-bold text-[var(--ms-text)] mb-1 font-mono uppercase tracking-tighter">{node}</h4>
               <span className="text-[8px] text-[var(--ms-gold)] uppercase font-mono tracking-tighter">Status: NODE_ACTIVE</span>
             </button>
           ))}
        </div>

        {/* Main: Grading Workspace */}
        <div className="flex-grow p-12 overflow-y-auto space-y-12 bg-[var(--ms-bg-base)]">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                 <h4 className="text-[10px] font-bold text-[var(--ms-gold)] uppercase tracking-[0.4em] mb-6 block">Color_Science_Parameters</h4>
                 <div className="p-8 bg-black/60 border border-[var(--ms-gold-border)]/20 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--ms-gold)]/5 blur-3xl rounded-full" />
                    <p className="text-[11px] text-gray-400 leading-relaxed italic border-l border-[var(--ms-gold)]/40 pl-6">
                      "Utilizing a cold cyan-heavy shadow profile with warm gold highlights through a custom ACES Output Device Transform (ODT)."
                    </p>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Printer Light", value: "25-25-25", color: "text-[var(--ms-text)]" },
                      { label: "Exposure", value: "+0.45", color: "text-amber-400" },
                      { label: "White Balance", value: "5600K", color: "text-blue-200" },
                      { label: "Tint", value: "-2.4", color: "text-green-400" }
                    ].map(param => (
                      <div key={param.label} className="p-4 bg-[var(--ms-bg-elevated)] border border-[var(--ms-border)] rounded-xl">
                         <span className="text-[9px] uppercase text-[var(--ms-text-dim)] block mb-1">{param.label}</span>
                         <span className={`text-xs font-mono font-bold ${param.color}`}>{param.value}</span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="space-y-8">
                 <h4 className="text-[10px] font-bold text-[var(--ms-text-dim)] uppercase tracking-widest mb-6 block">Optical Look Ops</h4>
                 <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-[var(--ms-bg-elevated)] border border-[var(--ms-border)] rounded-xl flex justify-between items-center group hover:border-[var(--ms-gold)] transition-colors cursor-pointer">
                        <span className="text-[10px] uppercase font-bold text-[var(--ms-text)]">Halation (Gate Weave)</span>
                        <span className="text-[9px] font-mono text-red-500">ENABLED</span>
                    </div>
                    <div className="p-4 bg-[var(--ms-bg-elevated)] border border-[var(--ms-border)] rounded-xl flex justify-between items-center group hover:border-[var(--ms-gold)] transition-colors cursor-pointer">
                        <span className="text-[10px] uppercase font-bold text-[var(--ms-text)]">Film Grain (16mm Mono)</span>
                        <span className="text-[9px] font-mono text-[var(--ms-gold)]">45%_OPACITY</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
