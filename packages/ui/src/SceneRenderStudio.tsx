"use client";

import React, { useState, useEffect } from "react";

interface RenderParam {
  label: string;
  value: string | number;
  unit?: string;
}

export default function SceneRenderStudio({ sceneId = "SC_001_020" }: { sceneId?: string }) {
  const [progress, setProgress] = useState(0);
  const [isRendering, setIsRendering] = useState(true);

  useEffect(() => {
    if (isRendering && progress < 100) {
      const timer = setInterval(() => {
        setProgress(p => Math.min(p + 0.5, 100));
      }, 50);
      return () => clearInterval(timer);
    }
  }, [isRendering, progress]);

  const params: RenderParam[] = [
    { label: "Engine Provider", value: "Veo 3.1 Artist" },
    { label: "Motion Bucket", value: 127 },
    { label: "CFG Scale", value: 7.5 },
    { label: "Sampling Steps", value: 50 },
    { label: "Internal Res", value: "3840x1634", unit: "HDR" },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-[24px] overflow-hidden shadow-2xl animate-in slide-in-from-right-10 duration-700">
      
      {/* Studio Header */}
      <div className="px-8 py-6 border-b border-[var(--ms-border)] bg-black/40 flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h3 className="text-xl font-serif font-bold text-[var(--ms-gold)] tracking-tight">Active Render Studio</h3>
            <p className="text-[10px] text-[var(--ms-text-dim)] uppercase tracking-[0.2em]">High-Fidelity Frame Extraction Hub</p>
         </div>
         <div className="flex gap-4">
            <button 
              onClick={() => { setProgress(0); setIsRendering(true); }}
              className="px-6 py-2 bg-transparent border border-[var(--ms-border)] text-[10px] font-bold text-white uppercase tracking-widest rounded-lg hover:bg-white/5 transition-all"
            >
              Abort Render
            </button>
            <button className="px-6 py-2 bg-[var(--ms-gold)] text-[var(--ms-bg)] text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-[var(--ms-gold)]/20">
              Optimize Node
            </button>
         </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
         
         {/* Render Canvas */}
         <div className="flex-grow bg-black relative flex flex-col items-center justify-center p-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-[var(--ms-gold)]/5 pointer-events-none" />
            
            {/* Viewport Frame */}
            <div className="w-full aspect-[21/9] bg-[#050505] rounded-xl border border-white/10 relative overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] group">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center transition-all duration-3000 opacity-40 scale-110 group-hover:scale-100" />
               
               {/* Rendering Scanline Effect */}
               <div className="absolute inset-0 pointer-events-none">
                  <div 
                    className="absolute top-0 left-0 w-full h-1 bg-[var(--ms-gold)] shadow-[0_0_20px_var(--ms-gold)] opacity-30 animate-pulse" 
                    style={{ top: `${progress}%` }}
                  />
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" style={{ clipPath: `inset(${progress}% 0 0 0)` }} />
               </div>

               {/* Overlay HUD */}
               <div className="absolute inset-0 p-8 flex flex-col justify-between z-10 pointer-events-none">
                  <div className="flex justify-between items-start">
                     <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-mono text-white/40 uppercase">Rendering Node: #AX-742</span>
                        <span className="text-[10px] font-bold text-[var(--ms-gold)]">{sceneId} // TAKE_04_FINAL</span>
                     </div>
                     <div className="px-2 py-1 bg-black/60 border border-white/10 rounded flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                        <span className="text-[9px] font-mono text-white/80">LIVE EXTRACTION</span>
                     </div>
                  </div>

                  <div className="flex justify-between items-end">
                     <div className="flex gap-12">
                        <div className="flex flex-col">
                           <span className="text-[8px] text-white/40 uppercase mb-1">Frame</span>
                           <span className="text-xl font-mono text-white tracking-widest">{Math.floor(progress * 2.4).toString().padStart(3, '0')}</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[8px] text-white/40 uppercase mb-1">Time Elapsed</span>
                           <span className="text-xl font-mono text-white tracking-widest">00:04:12</span>
                        </div>
                     </div>
                     <div className="flex flex-col items-end">
                         <span className="text-[8px] text-[var(--ms-gold)] uppercase font-bold mb-2 tracking-widest">Auteur Engine Sync</span>
                         <div className="flex gap-1">
                            {[1,1,1,1,1,0.5,0].map((v, i) => (
                               <div key={i} className="w-6 h-1 rounded-full bg-[var(--ms-gold)]" style={{ opacity: v }} />
                            ))}
                         </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Progress Track */}
            <div className="w-full max-w-4xl mt-12 space-y-4">
               <div className="flex justify-between items-end text-[10px] font-mono">
                  <div className="flex flex-col gap-1">
                     <span className="text-[var(--ms-text-dim)] uppercase tracking-widest">Sequence Generation</span>
                     <span className="text-[var(--ms-gold)] font-bold">{progress.toFixed(1)}% COMPLETE</span>
                  </div>
                  <span className="text-[var(--ms-text-dim)] italic">Stabilizing Motion Vibe...</span>
               </div>
               <div className="w-full h-1 bg-gray-900 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-[var(--ms-gold)] to-orange-500 shadow-[0_0_15px_var(--ms-gold)]" 
                    style={{ width: `${progress}%` }}
                  />
               </div>
            </div>
         </div>

         {/* Tuning Sidebar */}
         <div className="w-80 border-l border-[var(--ms-border)] bg-black/30 p-8 space-y-10">
            <section className="space-y-6">
               <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--ms-gold)]/80">Engine Context</h4>
               <div className="space-y-4">
                  {params.map(p => (
                    <div key={p.label} className="flex flex-col gap-1">
                       <span className="text-[8px] text-[var(--ms-text-dim)] uppercase tracking-widest">{p.label}</span>
                       <div className="flex items-baseline gap-2">
                          <span className="text-sm font-bold text-[var(--ms-text)]">{p.value}</span>
                          {p.unit && <span className="text-[9px] text-[var(--ms-gold)] font-mono">{p.unit}</span>}
                       </div>
                    </div>
                  ))}
               </div>
            </section>

            <section className="space-y-6 pt-10 border-t border-[var(--ms-border)]">
               <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--ms-gold)]/80">Visual DNA Grounding</h4>
               <div className="p-4 bg-[var(--ms-bg)]/80 border border-[var(--ms-border)] rounded-xl space-y-3 shadow-inner">
                  <p className="text-[10px] text-[var(--ms-text-dim)] italic leading-relaxed">
                    "Injecting Cyber-Noir Lighting from Project Planning Hub. Contrast locked at 1.4x."
                  </p>
                  <div className="flex gap-1.5">
                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                     <span className="text-[8px] font-bold text-green-400 uppercase">Synchronized</span>
                  </div>
               </div>
            </section>

            <section className="pt-10 border-t border-[var(--ms-border)]">
               <button className="w-full py-3 bg-[var(--ms-bg)] border border-[var(--ms-gold)]/30 text-[var(--ms-gold)] text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-[var(--ms-gold)]/10 transition-all">
                  Open Engine Logs
               </button>
            </section>
         </div>
      </div>
    </div>
  );
}
