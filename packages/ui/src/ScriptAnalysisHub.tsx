import React, { useState } from "react";
import { usePipeline } from "./PipelineProvider";

export default function ScriptAnalysisHub() {
  const [activeSegment, setActiveSegment] = useState("Scene 1");
  const { getEngineForAgent, globalHealthScore, getAgentMeta } = usePipeline();
  const assignedEngine = getEngineForAgent("SCRP");
  const meta = getAgentMeta("SCRP");

  return (
    <div className="flex flex-col h-full bg-[var(--ms-bg-base)] border border-[var(--ms-border)] rounded-3xl overflow-hidden shadow-3xl animate-in fade-in duration-1000 group">
      <div className="flex items-center justify-between px-10 py-8 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-10">
          <div className="flex flex-col gap-1">
             <h3 className="font-serif text-3xl font-bold text-white tracking-tighter uppercase">Screenplay Synthesis Lab</h3>
             <div className="flex items-center gap-3">
               <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-mono italic">AU_SCRP_PROTOCOL // NARRATIVE_EXTRACTION</span>
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
          <button className="px-6 py-2 bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-bold uppercase tracking-widest rounded-lg hover:border-zinc-700 transition-all">
            Full Breakdown
          </button>
          <button className="px-8 py-2 bg-[var(--ms-gold)] text-black text-[10px] font-bold uppercase tracking-[0.2em] rounded-lg shadow-xl shadow-[var(--ms-gold)]/10 hover:scale-105 transition-all">
            Lock_SC_Map
          </button>
        </div>
      </div>

      <div className="flex flex-grow h-[550px]">
        {/* Left: Scene Inventory */}
        <div className="w-72 border-r border-[var(--ms-border)] bg-[var(--ms-bg-base)] overflow-y-auto">
          {[
            { id: "SC_001", slug: "INT. SEOUL APT - NIGHT" },
            { id: "SC_002", slug: "EXT. GANGNAM STREET - NIGHT" },
            { id: "SC_003", slug: "MOV. TAXI CAB - RAIN" },
            { id: "SC_004", slug: "INT. DATA HUB - DAY" }
          ].map(s => (
            <button 
              key={s.id}
              onClick={() => setActiveSegment(s.id)}
              className={`w-full px-8 py-6 text-left border-b border-[var(--ms-border)] transition-all ${
                activeSegment === s.id ? "bg-[var(--ms-gold)]/5 border-l-4 border-l-[var(--ms-gold)]" : "opacity-40 hover:opacity-100"
              }`}
            >
              <h4 className="text-[10px] font-mono font-bold text-[var(--ms-gold)] mb-1 uppercase tracking-tighter">{s.id}</h4>
              <span className="text-[9px] text-[var(--ms-text-dim)] uppercase leading-tight block">{s.slug}</span>
            </button>
          ))}
        </div>

        {/* Main: Analysis View */}
        <div className="flex-grow p-12 overflow-y-auto space-y-12 bg-[var(--ms-bg-base)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="bg-[var(--ms-bg-2)] border border-[var(--ms-border)] p-8 rounded-2xl relative overflow-hidden group hover:border-[var(--ms-gold)]/20 transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--ms-gold)]/5 blur-3xl rounded-full" />
                <h4 className="text-[10px] font-bold text-[var(--ms-gold)] uppercase tracking-[0.4em] mb-8 block">Narrative_Density_Breakdown</h4>
                <div className="space-y-6">
                   <div className="flex justify-between border-b border-[var(--ms-border)] pb-4">
                     <span className="text-[10px] text-[var(--ms-text-dim)] uppercase font-bold tracking-widest">Dialogue_Weight</span>
                     <span className="text-[10px] font-mono text-[var(--ms-green)]">HEAVY [82%]</span>
                   </div>
                   <div className="flex justify-between border-b border-[var(--ms-border)] pb-4">
                     <span className="text-[10px] text-[var(--ms-text-dim)] uppercase font-bold tracking-widest">Action_Pace</span>
                     <span className="text-[10px] font-mono text-blue-400">STEADY [V2]</span>
                   </div>
                   <div className="flex justify-between border-b border-[var(--ms-border)] pb-4">
                     <span className="text-[10px] text-[var(--ms-text-dim)] uppercase font-bold tracking-widest">Symbolic_Density</span>
                     <span className="text-[10px] font-mono text-amber-500">OPTIMIZED</span>
                   </div>
                </div>
             </div>

             <div className="bg-[var(--ms-bg-2)] border border-[var(--ms-border)] p-8 rounded-2xl relative overflow-hidden group hover:border-blue-400/20 transition-all">
                <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.4em] mb-8 block">Technical_Cue_Extraction</h4>
                <div className="space-y-4">
                   {[
                     { cat: "VFX", cue: "Digital artifacts on mirror reflection", pri: "HIGH" },
                     { cat: "Sound", cue: "Distant K-Pop muffled by rain", pri: "ATMOS" },
                     { cat: "Prop", cue: "Modified Bio-Key v2", pri: "HERO" }
                   ].map(cue => (
                     <div key={cue.cue} className="flex flex-col gap-1 py-3 border-b border-[var(--ms-border)] last:border-0 opacity-60 hover:opacity-100 transition-opacity">
                        <div className="flex justify-between items-center">
                           <span className="text-[8px] font-mono font-bold text-blue-500 uppercase tracking-widest">{cue.cat}</span>
                           <span className="text-[7px] font-mono text-white/40">{cue.pri}</span>
                        </div>
                        <span className="text-[11px] text-[var(--ms-text)] font-serif italic">"{cue.cue}"</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          <div>
             <h4 className="text-[10px] font-bold text-[var(--ms-text-dim)] uppercase tracking-[0.2em] mb-6 block">Thematic_DNA_Tags</h4>
             <div className="flex flex-wrap gap-3">
                {["Neon Noir", "Cyber-Sociology", "Rain-Drenched Seoul", "Techno-Paranoia", "Verticality"].map(tag => (
                   <span key={tag} className="px-5 py-3 bg-[var(--ms-bg-2)] border border-[var(--ms-border)] text-[var(--ms-gold)] text-[9px] font-mono font-bold rounded-sm hover:border-[var(--ms-gold)] transition-all cursor-pointer uppercase tracking-widest">
                     #{tag.replace(" ", "_")}
                   </span>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
