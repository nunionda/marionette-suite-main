"use client";

import React, { useState } from "react";

const PRESETS = [
  { id: "master_blockbuster", name: "Blockbuster Master", tone: "Cyan/Orange", grain: "Fine" },
  { id: "master_noir", name: "80s Film Noir", tone: "Monochrome Low", grain: "Heavy" },
  { id: "master_classic", name: "Technicolor Classic", tone: "Saturated", grain: "Organic" },
  { id: "master_bleach", name: "Bleach Bypass", tone: "High Contrast", grain: "Harsh" },
];

export default function MasteringForge() {
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [intensity, setIntensity] = useState(85);
  const [grain, setGrain] = useState(40);
  const [distortion, setDistortion] = useState(12);
  const [economyMode, setEconomyMode] = useState(true);

  return (
    <div className="flex flex-col gap-6 p-10 bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-[40px] shadow-2xl relative overflow-hidden h-full animate-in fade-in slide-in-from-bottom-10 duration-700">
      
      {/* Economy Mode Indicator Overlay */}
      {economyMode && (
        <div className="absolute top-0 right-0 z-20 px-4 py-1.5 bg-green-500/20 text-green-400 text-[8px] font-bold uppercase tracking-[0.3em] rounded-bl-xl border-l border-b border-green-500/30 backdrop-blur-md">
          Economy Mode Active (Free API)
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
         <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
               <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--ms-gold)]">Mastering Engine v4.2</span>
               <div className="w-1.5 h-1.5 rounded-full bg-[var(--ms-gold)] shadow-[0_0_8px_var(--ms-gold)] animate-pulse" />
               <button 
                 onClick={() => setEconomyMode(!economyMode)}
                 className={`ml-4 px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest transition-all ${economyMode ? 'bg-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-zinc-800 text-zinc-500 hover:text-white'}`}
               >
                 {economyMode ? "Mode: Economy" : "Mode: Production"}
               </button>
            </div>
            <h2 className="text-3xl font-serif font-bold text-white tracking-tight">Mastering Forge</h2>
         </div>
         <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
            <span className="text-[10px] text-zinc-500 font-bold uppercase">Ready to Forge</span>
            <div className="w-4 h-4 rounded-full border-2 border-[var(--ms-gold)] border-t-transparent animate-spin" />
         </div>
      </div>

      <div className="grid grid-cols-12 gap-8 flex-grow">
        
        {/* Left: Master Viewer Simulation */}
        <div className="col-span-8 flex flex-col gap-4">
           <div className="relative aspect-video bg-black rounded-3xl border border-white/10 overflow-hidden group shadow-inner">
              {/* Mock Video Placeholder with Post-processing overlays */}
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center">
                 <div className="w-full h-full opacity-30 mix-blend-overlay pointer-events-none" 
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`, opacity: grain / 100 }} />
                 <div className="text-zinc-800 font-serif text-8xl italic select-none">Master Forge View</div>
              </div>
              
              {/* Diagnostic Overlays */}
              <div className="absolute top-6 left-6 flex flex-col gap-1 text-[9px] font-mono text-[var(--ms-gold)] opacity-70">
                 <span>RES: 3840 x 2160 (4K Uncompressed)</span>
                 <span>FPS: 23.976 | BT.2020 PQ</span>
                 <span>MASTERING_INTENSITY: {intensity}%</span>
              </div>

              {/* Scope Simulation */}
              <div className="absolute bottom-6 right-6 w-32 h-20 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 p-2 overflow-hidden">
                 <div className="w-full h-full flex items-end gap-[1px]">
                    {[...Array(20)].map((_, i) => (
                      <div key={i} className="flex-1 bg-[var(--ms-gold)]/30" style={{ height: `${Math.random() * 80 + 20}%` }} />
                    ))}
                 </div>
                 <div className="absolute top-1 left-1 text-[6px] text-white opacity-40 uppercase">Waveform</div>
              </div>
           </div>

           {/* Shot Selector Bar */}
           <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`flex-shrink-0 w-32 aspect-video rounded-xl border-2 transition-all cursor-pointer ${i === 1 ? 'border-[var(--ms-gold)] scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                   <div className="w-full h-full bg-zinc-800 rounded-lg flex items-center justify-center text-[10px] font-mono">SHOT_{i.toString().padStart(2, '0')}</div>
                </div>
              ))}
           </div>
        </div>

        {/* Right: Master Control Panel */}
        <div className="col-span-4 flex flex-col gap-6 bg-white/[0.02] border border-white/5 rounded-[32px] p-6">
           
           {/* Preset Selection */}
           <div className="flex flex-col gap-3">
              <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Mastering Presets</span>
              <div className="grid grid-cols-1 gap-2">
                 {PRESETS.map(p => (
                   <button 
                     key={p.id}
                     onClick={() => setSelectedPreset(p)}
                     className={`p-4 rounded-2xl border text-left transition-all ${selectedPreset.id === p.id ? 'bg-[var(--ms-gold)]/10 border-[var(--ms-gold)]' : 'bg-transparent border-white/5 hover:border-white/20'}`}
                   >
                     <div className="text-[11px] font-bold text-white mb-1">{p.name}</div>
                     <div className="text-[9px] text-zinc-500 font-mono tracking-tight">{p.tone} • {p.grain} Grain</div>
                   </button>
                 ))}
              </div>
           </div>

           {/* Optical Parameters */}
           <div className="flex flex-col gap-6 mt-4">
              <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Optical Forge Parameters</span>
              
              <div className="space-y-6">
                 {/* Mastering Intensity */}
                 <div className="flex flex-col gap-3">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                       <span>GRADE_STRENGTH</span>
                       <span>{intensity}%</span>
                    </div>
                    <input type="range" value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} className="w-full accent-[var(--ms-gold)]" />
                 </div>

                 {/* Grain */}
                 <div className="flex flex-col gap-3">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                       <span>FILM_GRAIN</span>
                       <span>{grain}%</span>
                    </div>
                    <input type="range" value={grain} onChange={(e) => setGrain(Number(e.target.value))} className="w-full accent-[var(--ms-gold)]" />
                 </div>

                 {/* Distortion */}
                 <div className="flex flex-col gap-3">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                       <span>LENS_DISTORTION</span>
                       <span>{distortion}%</span>
                    </div>
                    <input type="range" value={distortion} onChange={(e) => setDistortion(Number(e.target.value))} className="w-full accent-[var(--ms-gold)]" />
                 </div>
              </div>
           </div>

           {/* Action */}
           <button 
             onClick={() => alert(`🚀 Representative Test Run Started!\nMode: ${economyMode ? 'Economy (Free API)' : 'Production'}\nTargets: 8 Key Sequences`)}
             className={`mt-auto w-full py-5 text-black font-bold uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl ${economyMode ? 'bg-green-500 shadow-green-500/20' : 'bg-[var(--ms-gold)] shadow-[var(--ms-gold)]/20'}`}
           >
              {economyMode ? "Forge Representative Test" : "Forge Master Production"}
           </button>
        </div>

      </div>
    </div>
  );
}
