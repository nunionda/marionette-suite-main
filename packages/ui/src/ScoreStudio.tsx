import React, { useState, useEffect } from "react";
import { usePipeline } from "./PipelineProvider";

export default function ScoreStudio() {
  const [activeMotif, setActiveMotif] = useState("MOTIF_A");
  const { getEngineForAgent, globalHealthScore, getAgentMeta } = usePipeline();
  const assignedEngine = getEngineForAgent("SCOR");
  const meta = getAgentMeta("SCOR");

  return (
    <div className="flex flex-col h-full bg-[var(--ms-bg-base)] border border-[var(--ms-border)] rounded-3xl overflow-hidden shadow-3xl animate-in fade-in duration-1000 group">
      <div className="flex items-center justify-between px-10 py-8 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-10">
          <div className="flex flex-col gap-1">
             <h3 className="font-serif text-3xl font-bold text-white tracking-tighter uppercase">Cinematic Scoring & Orchestration</h3>
             <div className="flex items-center gap-3">
               <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-mono italic">AU_SCOR_PROTOCOL // AUTEUR_COMPOSER_ENGINE</span>
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
          <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-mono font-bold rounded-lg flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            SCORE_SYNC_95BPM
          </div>
          <button className="px-8 py-2 bg-[var(--ms-gold)] text-black text-[10px] font-bold uppercase tracking-[0.2em] rounded-lg shadow-xl shadow-[var(--ms-gold)]/10 hover:scale-105 transition-all">
            Finalize_Motif
          </button>
        </div>
      </div>

      <div className="flex flex-grow h-[550px]">
        {/* Left: Motif / Score Tree */}
        <div className="w-80 border-r border-[var(--ms-border)] bg-[var(--ms-bg-base)] overflow-y-auto">
           {[
             { id: "MOTIF_A", name: "Aeon Solitude (Solo Cello)" },
             { id: "ACT_01", name: "Infiltration (7/8 Synth)" },
             { id: "THEME_MAIN", name: "Seoul Sunrise (Orchestral)" },
             { id: "NIS_05", name: "Techno-Paranoia (Glitch)" }
           ].map(motif => (
             <button 
               key={motif.id}
               onClick={() => setActiveMotif(motif.id)}
               className={`w-full p-8 text-left border-b border-[var(--ms-border)] transition-all ${
                 activeMotif === motif.id ? "bg-[var(--ms-gold)]/5 border-l-4 border-l-[var(--ms-gold)]" : "opacity-40 hover:opacity-100"
               }`}
             >
               <h4 className="text-[10px] font-mono font-bold text-[var(--ms-gold)] mb-1 uppercase tracking-tighter">{motif.id}</h4>
               <span className="text-[9px] text-[var(--ms-text)] uppercase font-bold tracking-widest leading-tight block">{motif.name}</span>
             </button>
           ))}
        </div>

        {/* Main: Composition Workspace */}
        <div className="flex-grow p-12 overflow-y-auto bg-[var(--ms-bg-base)]">
           <div className="space-y-12">
              <div>
                 <h4 className="text-[10px] font-bold text-[var(--ms-gold)] uppercase tracking-[0.4em] mb-8 block">Orchestral_Hybrid_Palette</h4>
                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { inst: "Cello (Solo)", type: "Emotional Core" },
                      { inst: "Analog Synth", type: "Seoul Undercurrent" },
                      { inst: "Modular Glitch", type: "Digital Corruption" },
                      { inst: "Taiko (Hybrid)", type: "Urban Tension" }
                    ].map(item => (
                      <div key={item.inst} className="p-5 bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-xl flex flex-col items-center text-center group hover:border-[var(--ms-gold)] transition-all cursor-pointer">
                         <span className="text-[10px] text-[var(--ms-text)] font-serif font-bold mb-1">{item.inst}</span>
                         <span className="text-[8px] text-[var(--ms-text-dim)] uppercase tracking-widest">{item.type}</span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="p-10 bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--ms-gold)]/5 blur-3xl rounded-full" />
                    <h4 className="text-[10px] font-bold text-[var(--ms-gold)] uppercase tracking-[0.2em] mb-6 block">Compositional_Logic_v4</h4>
                    <p className="text-[11px] text-[var(--ms-text-dim)] leading-relaxed italic border-l border-[var(--ms-gold)]/30 pl-6 font-serif">
                      "Utilizing a 7/8 time signature to create aesthetic disorientation. The Cello provides a human connection to the 'Seoul Night' sequence, while granular synths represent the encroaching digital corruption."
                    </p>
                 </div>

                 <div className="space-y-8">
                    <h4 className="text-[10px] font-bold text-[var(--ms-text-dim)] uppercase tracking-widest mb-6 block">Technical Scoring Ops</h4>
                    <div className="grid grid-cols-1 gap-4">
                       {[
                         { label: "Tempo / BPM", value: "95 BPM (LOCKED)", stat: "SYNC" },
                         { label: "Time Signature", value: "7/8 (Asymmetric)", stat: "ACTIVE" },
                         { label: "Hybrid Mix", value: "Orchestral 60% / Synth 40%", stat: "BALANCED" }
                       ].map(op => (
                         <div key={op.label} className="p-5 bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-xl flex justify-between items-center group hover:border-[var(--ms-gold)] transition-colors">
                            <div className="flex flex-col">
                               <span className="text-[9px] uppercase font-bold text-[var(--ms-text-dim)] mb-1 tracking-widest">{op.label}</span>
                               <span className="text-[10px] font-mono text-[var(--ms-text)] uppercase">{op.value}</span>
                            </div>
                            <span className="text-[8px] font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-sm">{op.stat}</span>
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
