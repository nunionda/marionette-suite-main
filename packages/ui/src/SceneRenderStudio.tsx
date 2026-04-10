import React, { useState, useEffect } from "react";
import { usePipeline } from "./PipelineProvider";

const params = [
  { label: "Neural Saturation", value: "ACES_1.3" },
  { label: "Gate Weave", value: "0.04", unit: "mm" },
  { label: "Sensor Noise", value: "Organic_16mm" },
  { label: "Exposure Delta", value: "+0.2", unit: "EV" }
];

export default function SceneRenderStudio({ sceneId = "SC_001_020" }: { sceneId?: string }) {
  const [progress, setProgress] = useState(0);
  const [isRendering, setIsRendering] = useState(true);
  const { getEngineForAgent, globalHealthScore } = usePipeline();
  const assignedEngine = getEngineForAgent("GEN");

  useEffect(() => {
    if (isRendering && progress < 100) {
      const timer = setInterval(() => {
        setProgress(p => Math.min(p + 0.5, 100));
      }, 50);
      return () => clearInterval(timer);
    }
  }, [isRendering, progress]);

  return (
    <div className="flex flex-col h-full bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-[24px] overflow-hidden shadow-2xl animate-in slide-in-from-right-10 duration-700">
      
      {/* Studio Header */}
      <div className="px-8 py-6 border-b border-[var(--ms-border)] bg-black/40 flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
               <h3 className="text-xl font-serif font-bold text-[var(--ms-gold)] tracking-tight">AI Video Synthesis Hub</h3>
               <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[9px] font-mono font-bold text-green-500 uppercase tracking-widest">Neural_Sync_Active</span>
               </div>
            </div>
            <p className="text-[10px] text-[var(--ms-text-dim)] uppercase tracking-[0.4em]">AU_GEN_ENGINE // SHOT_VOLUMETRIC_SYNTHESIS</p>
         </div>

         <div className="flex items-center gap-8 px-8 py-4 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-xl">
            <div className="flex flex-col items-end gap-1">
               <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Assigned_Engine</span>
               <span className="text-xs font-mono text-[var(--ms-gold)] font-bold">{assignedEngine?.name || "Initializing..."}</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col items-end gap-1">
               <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Neural_Latency</span>
               <span className={`text-xs font-mono font-bold ${
                 (assignedEngine?.latency ?? 0) > 1000 ? "text-amber-500" : "text-green-500"
               }`}>
                 {assignedEngine ? `${Math.floor(assignedEngine.latency)}ms` : "---"}
               </span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col items-end gap-1">
               <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Global_Integrity</span>
               <span className="text-xs font-mono text-white font-bold">{globalHealthScore}%</span>
            </div>
         </div>

         <div className="flex gap-4">
            <button 
              onClick={() => { setProgress(0); setIsRendering(true); }}
              className="px-6 py-2 bg-transparent border border-[var(--ms-border)] text-[10px] font-bold text-white uppercase tracking-widest rounded-lg hover:bg-white/5 transition-all"
            >
              Terminate Synthesis
            </button>
            <button className="px-6 py-2 bg-[var(--ms-gold)] text-[var(--ms-bg)] text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-[var(--ms-gold)]/20">
              Synchronize LoRA
            </button>
         </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
         
         {/* Synthesis Canvas */}
         <div className="flex-grow bg-black relative flex flex-col items-center justify-center p-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-[var(--ms-gold)]/10 pointer-events-none" />
            
            {/* Viewport Frame */}
            <div className="w-full aspect-[21/9] bg-[#050505] rounded-xl border border-white/10 relative overflow-hidden shadow-[0_0_100px_rgba(212,175,55,0.05)] group">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center transition-all duration-3000 opacity-60 scale-110 group-hover:scale-100" />
               
               {/* Extraction Scanline Effect */}
               <div className="absolute inset-0 pointer-events-none">
                  <div 
                    className="absolute top-0 left-0 w-full h-[2px] bg-[var(--ms-gold)] shadow-[0_0_30px_var(--ms-gold)] opacity-50 z-20" 
                    style={{ top: `${progress}%` }}
                  />
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px] z-10 transition-all duration-500" style={{ clipPath: `inset(${progress}% 0 0 0)` }} />
               </div>

               {/* Overlay HUD */}
               <div className="absolute inset-0 p-10 flex flex-col justify-between z-30 pointer-events-none">
                  <div className="flex justify-between items-start">
                     <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] font-mono text-[var(--ms-gold)] uppercase tracking-[0.2em] bg-black/60 px-2 py-0.5 rounded border border-[var(--ms-gold)]/20">Node_ID: #VEO-SYNTH-9</span>
                        <span className="text-[12px] font-bold text-white uppercase tracking-widest">{sceneId} // TAKE_FINAL_GEN_3</span>
                     </div>
                     <div className="px-3 py-1.5 bg-red-600/20 border border-red-600/40 rounded flex items-center gap-2 backdrop-blur-md">
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                        <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">Synthesis_Active</span>
                     </div>
                  </div>

                  <div className="flex justify-between items-end">
                     <div className="flex gap-16">
                        <div className="flex flex-col">
                           <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest mb-1">Generated_Frame</span>
                           <span className="text-2xl font-mono text-white tracking-widest">{Math.floor(progress * 2.4).toString().padStart(3, '0')} <span className="text-[var(--ms-gold)] text-xs">/ 240</span></span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest mb-1">Temporal_Delta</span>
                           <span className="text-2xl font-mono text-white tracking-widest">∆ 0.0024s</span>
                        </div>
                     </div>
                     <div className="flex flex-col items-end gap-3">
                         <span className="text-[9px] text-[var(--ms-gold)] uppercase font-bold tracking-[0.3em]">Cinematic_Grounding_Sync</span>
                         <div className="flex gap-2">
                            {[1,1,1,1,1,0.5,0].map((v, i) => (
                               <div key={i} className="w-8 h-1 rounded-full bg-[var(--ms-gold)]" style={{ opacity: v * 0.8 }} />
                            ))}
                         </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Progress Track */}
            <div className="w-full max-w-4xl mt-16 space-y-6">
               <div className="flex justify-between items-end text-[11px] font-mono">
                  <div className="flex flex-col gap-2">
                     <span className="text-[var(--ms-text-dim)] uppercase tracking-[0.3em]">Sequential_Synthesis_Progress</span>
                     <span className="text-[var(--ms-gold)] font-bold text-lg">{progress.toFixed(1)}% EXTRACTED</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-green-500 font-bold uppercase tracking-widest">Motion_Coherence_Stable</span>
                    <span className="text-[var(--ms-text-dim)] italic">Recalculating Flow Maps...</span>
                  </div>
               </div>
               <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/10 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-[var(--ms-gold)] via-amber-400 to-[var(--ms-gold)] shadow-[0_0_20px_var(--ms-gold)] transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  />
               </div>
            </div>
         </div>

         {/* Tuning Sidebar */}
         <div className="w-80 border-l border-[var(--ms-border)] bg-[var(--ms-bg-base)] p-10 space-y-12">
            <section className="space-y-8">
               <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--ms-gold)]">Synthesis_Context</h4>
               <div className="space-y-6">
                  {params.map(p => (
                    <div key={p.label} className="flex flex-col gap-2">
                       <span className="text-[9px] text-[var(--ms-text-dim)] uppercase font-bold tracking-[0.2em]">{p.label}</span>
                       <div className="flex items-baseline gap-2 group cursor-help">
                          <span className="text-sm font-bold text-white transition-colors group-hover:text-[var(--ms-gold)]">{p.value}</span>
                          {p.unit && <span className="text-[9px] text-[var(--ms-gold)] font-mono font-bold">{p.unit}</span>}
                       </div>
                    </div>
                  ))}
               </div>
            </section>

            <section className="space-y-8 pt-10 border-t border-[var(--ms-border)]">
               <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">Neural_Grounding</h4>
               <div className="p-6 bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-2xl space-y-4 shadow-xl group hover:border-[var(--ms-gold)]/30 transition-all">
                  <p className="text-[11px] text-[var(--ms-text-dim)] italic leading-relaxed font-serif">
                    "Injecting Auteur_DNA_V3: High contrast, anamorphic distortion patterns, and grain-aware temporal noise reduction."
                  </p>
                  <div className="flex gap-2 items-center">
                     <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                     <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest">Coherence_Locked</span>
                  </div>
               </div>
            </section>

            <section className="pt-10 border-t border-[var(--ms-border)]">
               <button className="w-full py-4 bg-[var(--ms-bg-2)] border border-[var(--ms-border)] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:border-[var(--ms-gold)] transition-all shadow-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.05)]">
                  Neural_Engine_Logs
               </button>
            </section>
         </div>
      </div>
    </div>
  );
}
