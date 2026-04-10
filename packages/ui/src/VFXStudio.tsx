import React, { useState } from "react";
import { usePipeline } from "./PipelineProvider";

export default function VFXStudio() {
  const [activeLayer, setActiveLayer] = useState("VFX_Particle_Seoul_Rain");
  const { getEngineForAgent, globalHealthScore, getAgentMeta } = usePipeline();
  const assignedEngine = getEngineForAgent("VFX");
  const meta = getAgentMeta("VFX");

  return (
    <div className="flex flex-col h-full bg-[var(--ms-bg-base)] border border-[var(--ms-border)] rounded-3xl overflow-hidden shadow-3xl animate-in fade-in slide-in-from-bottom duration-1000 group">
      <div className="flex items-center justify-between px-10 py-8 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-10">
          <div className="flex flex-col gap-1">
             <h3 className="font-serif text-3xl font-bold text-white tracking-tighter uppercase">Technical Synthesis Studio</h3>
             <div className="flex items-center gap-3">
               <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-mono italic">AU_VFX_PROTOCOL // STABILITY_ENHANCEMENT</span>
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
                <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Neural_Engine</span>
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
          <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-mono font-bold rounded-lg flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            AI_SYNTH_LOCKED
          </div>
          <button className="px-8 py-2 bg-[var(--ms-gold)] text-black text-[10px] font-bold uppercase tracking-[0.2em] rounded-lg shadow-xl shadow-[var(--ms-gold)]/10 hover:scale-105 transition-all">
            Final_Render
          </button>
        </div>
      </div>

      <div className="flex flex-grow h-[550px]">
        {/* Left: AI Process Manager */}
        <div className="w-80 border-r border-[var(--ms-border)] bg-[var(--ms-bg)]/30 overflow-y-auto">
           {[
             "Temporal_Consistency_v2", 
             "Optical_Flow_Mapping", 
             "Stable_Denoise_Pass", 
             "Super_Res_SwinIR",
             "Grain_Matching_Kodak"
           ].map(layer => (
             <button 
               key={layer}
               onClick={() => setActiveLayer(layer)}
               className={`w-full p-6 text-left border-b border-[var(--ms-border)] transition-all ${
                 activeLayer === layer ? "bg-[var(--ms-gold)]/5 border-l-4 border-l-[var(--ms-gold)]" : "opacity-40"
               }`}
             >
               <h4 className="text-[10px] font-bold text-[var(--ms-text)] mb-1 font-mono uppercase tracking-tighter">{layer}</h4>
               <span className="text-[8px] text-[var(--ms-gold)] uppercase font-mono tracking-tighter">Engine: TITAN_RTX_P6</span>
             </button>
           ))}
        </div>

        {/* Main: AI Technical Workspace */}
        <div className="flex-grow p-12 overflow-y-auto bg-[var(--ms-bg-base)]">
           <div className="space-y-12">
              <div>
                 <h4 className="text-[10px] font-bold text-[var(--ms-gold)] uppercase tracking-[0.4em] mb-8 block">Technical_Synthesis_Directives</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 bg-[var(--ms-bg-elevated)] border border-purple-900/40 rounded-2xl relative overflow-hidden group hover:border-purple-400/50 transition-all">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-3xl rounded-full" />
                       <span className="text-[9px] font-mono text-purple-400 uppercase mb-4 block">Temporal_Stability_Engine</span>
                       <p className="text-[11px] text-gray-400 leading-relaxed italic border-l border-white/10 pl-4">
                         "Frame-to-frame consistency check at 98.4%, temporal artifact mitigation active, motion vector re-projection enabled."
                       </p>
                    </div>

                    <div className="p-8 bg-[var(--ms-bg-elevated)] border border-blue-900/40 rounded-2xl relative overflow-hidden group hover:border-blue-400/50 transition-all">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl rounded-full" />
                       <span className="text-[9px] font-mono text-blue-400 uppercase mb-4 block">AI_Upscale_Metadata</span>
                       <p className="text-[11px] text-gray-400 leading-relaxed italic border-l border-white/10 pl-4">
                         "SwinIR model at 4x scale, edge preservation alpha active, sub-pixel feature reconstruction mode: CINEMATIC_V3."
                       </p>
                    </div>
                 </div>
              </div>

              <div className="pt-8 border-t border-[var(--ms-border)]">
                 <h4 className="text-[10px] font-bold text-[var(--ms-text-dim)] uppercase tracking-widest mb-6 block">Optical_Flow_Attention_Result</h4>
                 <div className="p-6 bg-black/60 border border-[var(--ms-gold-border)]/20 rounded-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10 opacity-30" />
                    <div className="relative z-10 flex flex-col gap-4">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-[var(--ms-gold)] font-bold">FLOW_VECTOR_v2.1</span>
                          <span className="text-[8px] font-mono text-green-500">SYNC_SUCCESS</span>
                       </div>
                       <p className="text-[12px] text-gray-100 font-serif leading-relaxed italic">
                         "Intelligent vector-based motion estimation successfully predicted high-velocity Seoul rain patterns, ensuring zero flickering."
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
