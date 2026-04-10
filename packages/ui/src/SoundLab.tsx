import React, { useState, useEffect } from "react";
import { usePipeline } from "./PipelineProvider";

export default function SoundLab() {
  const [activeClip, setActiveClip] = useState("Clip_Rain_Seoul_Night");
  const { getEngineForAgent, globalHealthScore, getAgentMeta } = usePipeline();
  const assignedEngine = getEngineForAgent("SOND");
  const meta = getAgentMeta("SOND");

  return (
    <div className="flex flex-col h-full bg-[var(--ms-bg-base)] border border-[var(--ms-border)] rounded-3xl overflow-hidden shadow-3xl animate-in fade-in duration-1000 group">
      <div className="flex items-center justify-between px-10 py-8 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-10">
          <div className="flex flex-col gap-1">
             <h3 className="font-serif text-3xl font-bold text-white tracking-tighter uppercase">Audio & Foley Synthesis Lab</h3>
             <div className="flex items-center gap-3">
               <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-mono italic">AU_SOND_PROTOCOL // PRECISION_SOUND_DESIGN</span>
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
          <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-mono font-bold rounded-lg flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            48k_24BIT_MASTER
          </div>
          <button className="px-8 py-2 bg-[var(--ms-gold)] text-black text-[10px] font-bold uppercase tracking-[0.2em] rounded-lg shadow-xl shadow-[var(--ms-gold)]/10 hover:scale-105 transition-all">
            Final_Mix
          </button>
        </div>
      </div>

      <div className="flex flex-grow h-[550px]">
        {/* Left: Audio Asset Library */}
        <div className="w-80 border-r border-[var(--ms-border)] bg-[var(--ms-bg-base)] overflow-y-auto">
           {[
             { id: "ATMOS_01", type: "Seoul_Market_Hum" },
             { id: "FOLEY_02", type: "Cyber_Katana_Draw" },
             { id: "VOICE_01", type: "Protag_Inner_Monologue" },
             { id: "SFX_05", type: "Digital_Ghost_Artifact" }
           ].map(clip => (
             <button 
               key={clip.id}
               onClick={() => setActiveClip(clip.id)}
               className={`w-full p-8 text-left border-b border-[var(--ms-border)] transition-all ${
                 activeClip === clip.id ? "bg-[var(--ms-gold)]/5 border-l-4 border-l-[var(--ms-gold)]" : "opacity-40 hover:opacity-100"
               }`}
             >
               <h4 className="text-[10px] font-mono font-bold text-[var(--ms-gold)] mb-1 uppercase tracking-tighter">{clip.id}</h4>
               <span className="text-[9px] text-[var(--ms-text)] uppercase font-bold tracking-widest leading-tight block">{clip.type}</span>
             </button>
           ))}
        </div>

        {/* Main: Audio Workspace */}
        <div className="flex-grow p-12 overflow-y-auto bg-[var(--ms-bg-base)]">
           <div className="space-y-12">
              <div className="h-56 bg-black border border-[var(--ms-gold-border)]/20 rounded-2xl flex items-center justify-center relative shadow-2xl group overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.08] mix-blend-overlay" />
                 <div className="flex gap-[3px] items-center h-32 px-12">
                    {[10, 30, 80, 50, 20, 90, 40, 60, 20, 80, 50, 70, 40, 90, 30, 60, 40, 80, 40, 70, 20].map((h, i) => (
                      <div key={i} className="w-[4px] bg-[var(--ms-gold)] opacity-40 rounded-full animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 150}ms` }} />
                    ))}
                 </div>
                 <div className="absolute bottom-6 left-8 flex flex-col gap-1 items-start">
                    <span className="text-[10px] text-white/40 font-mono tracking-[0.4em] uppercase">Spectral_DNA_Mapping_Active</span>
                    <span className="text-[8px] text-[var(--ms-gold)] font-bold uppercase tracking-widest border border-[var(--ms-gold)]/30 px-2 py-0.5 rounded-sm">L-C-R-LFE-Ls-Rs // ATMOS_SYNC</span>
                 </div>
                 <div className="absolute top-6 right-8 text-[10px] font-mono text-green-500 font-bold uppercase">Ready_for_Export</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="space-y-8">
                    <h4 className="text-[10px] font-bold text-[var(--ms-gold)] uppercase tracking-[0.4em] mb-6 block">Audio_Synthesis_Directives</h4>
                    <div className="p-8 bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-2xl relative overflow-hidden group hover:border-[var(--ms-gold)]/30 transition-all">
                       <span className="text-[9px] font-mono text-blue-400 uppercase mb-4 block">Auteur_Vibe_Metadata</span>
                       <p className="text-[11px] text-[var(--ms-text-dim)] leading-relaxed italic border-l border-blue-500/30 pl-6 font-serif">
                         "The Seoul night foley must emphasize 'Techno-Paranoia' through ultrasonic interference patterns and high-frequency digital glitches hidden in the rain texture."
                       </p>
                    </div>
                 </div>

                 <div className="space-y-8">
                    <h4 className="text-[10px] font-bold text-[var(--ms-text-dim)] uppercase tracking-widest mb-6 block">Technical Engineering Ops</h4>
                    <div className="grid grid-cols-1 gap-4">
                       {[
                         { label: "Stem Separation", value: "COMPLETE (VOC/SFX/ATMOS)", stat: "SYNC" },
                         { label: "Atmos Object Pan", value: "DYNAMIC_TRACK_01", stat: "ACTIVE" },
                         { label: "Reverb Profile", value: "Wet_Gangnam_Asphalt", stat: "LOCKED" }
                       ].map(op => (
                         <div key={op.label} className="p-5 bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-xl flex justify-between items-center group hover:border-[var(--ms-gold)] transition-colors">
                            <div className="flex flex-col">
                               <span className="text-[9px] uppercase font-bold text-[var(--ms-text-dim)] mb-1 tracking-widest">{op.label}</span>
                               <span className="text-[10px] font-mono text-[var(--ms-text)] uppercase">{op.value}</span>
                            </div>
                            <span className="text-[8px] font-mono text-green-500 bg-green-500/10 px-2 py-0.5 rounded-sm">{op.stat}</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
