import React, { useState, useEffect } from "react";
import { usePipeline } from "./PipelineProvider";

interface CharacterArchetype {
  id: string;
  name: string;
  role: string;
  visualDna: string[];
  description: string;
  intensity: number;
}

const characters: CharacterArchetype[] = [
  {
    id: "aeon",
    name: "Aeon",
    role: "The Digital Ghost",
    visualDna: ["Retro-Futurist Grunge", "Monochromatic Silhouettes", "Internal Blue Glow"],
    description: "A silhouette that flickers like a corrupted video file. High contrast, sharp edges.",
    intensity: 92,
  },
  {
    id: "hacker",
    name: "The Pyongyang Ghost",
    role: "The Antagonist",
    visualDna: ["Brutalist Symmetry", "Deep Red Accents", "Obscured Facial Mesh"],
    description: "Symmetrical, imposing, and cold. Shadows that bleed into the background.",
    intensity: 88,
  },
  {
    id: "minister",
    name: "Minister of NIS",
    role: "The Puppet Master",
    visualDna: ["Synthetic Cleanliness", "Gold Filigree", "Cold Saturated Teal"],
    description: "Too perfect. Sharp tailoring mixed with subtle biomechanical enhancements.",
    intensity: 75,
  },
];

export default function CharacterConceptStudio() {
  const [selectedId, setSelectedId] = useState(characters[0].id);
  const activeChar = characters.find((c) => c.id === selectedId) || characters[0];
  const { getEngineForAgent, globalHealthScore, getAgentMeta } = usePipeline();
  const assignedEngine = getEngineForAgent("CNCP");
  const meta = getAgentMeta("CNCP");

  return (
    <div className="flex flex-col h-full bg-[var(--ms-bg-base)] border border-[var(--ms-border)] rounded-3xl overflow-hidden shadow-3xl animate-in fade-in duration-1000 group">
      {/* Header */}
      <div className="flex items-center justify-between px-10 py-8 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-10">
          <div className="flex flex-col gap-1">
             <h3 className="font-serif text-3xl font-bold text-white tracking-tighter uppercase">Character DNA & Casting Suite</h3>
             <div className="flex items-center gap-3">
               <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-mono italic">AU_CAST_PROTOCOL // ARCHETYPE_SYNTHESIS</span>
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
                <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Neural_Auteur</span>
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
            Export Dossier
          </button>
          <button className="px-8 py-2 bg-[var(--ms-gold)] text-black text-[10px] font-bold uppercase tracking-[0.2em] rounded-lg shadow-xl shadow-[var(--ms-gold)]/10 hover:scale-105 transition-all">
            Synthesize Weights
          </button>
        </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
        {/* Character List */}
        <div className="w-80 border-r border-[var(--ms-border)] bg-[var(--ms-bg-base)] overflow-y-auto p-8 space-y-6">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--ms-gold)]/60 mb-8 block">Master Digital Assets</h4>
          {characters.map((char) => (
            <button
              key={char.id}
              onClick={() => setSelectedId(char.id)}
              className={`w-full text-left p-6 rounded-2xl border transition-all duration-500 group relative overflow-hidden ${
                selectedId === char.id
                  ? "bg-[var(--ms-gold)]/10 border-[var(--ms-gold)]/40 shadow-xl"
                  : "bg-transparent border-white/5 opacity-50 hover:opacity-100 hover:border-white/10"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${selectedId === char.id ? "text-[var(--ms-gold)]" : "text-[var(--ms-text-dim)]"}`}>
                  Asset_ID: {char.id.toUpperCase()}
                </span>
                {selectedId === char.id && <div className="w-1.5 h-1.5 rounded-full bg-[var(--ms-gold)] shadow-[0_0_12px_var(--ms-gold)]" />}
              </div>
              <h5 className={`text-xl font-serif font-bold ${selectedId === char.id ? "text-white" : "text-zinc-500"}`}>
                {char.name}
              </h5>
              <p className="text-[9px] text-[var(--ms-text-dim)] mt-1 font-mono">{char.role}</p>
            </button>
          ))}
        </div>

        {/* Development Workspace */}
        <div className="flex-grow overflow-y-auto p-12 bg-gradient-to-br from-transparent to-[var(--ms-gold)]/5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Visual DNA Table */}
            <div className="space-y-8">
              <section className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--ms-gold)]/70">Visual DNA Pillars</h4>
                <div className="flex flex-wrap gap-2">
                  {activeChar.visualDna.map((dna) => (
                    <span key={dna} className="px-3 py-1 bg-[var(--ms-bg)] border border-[var(--ms-border)] text-[var(--ms-gold)] text-[9px] font-bold uppercase tracking-widest rounded-full shadow-sm">
                      {dna}
                    </span>
                  ))}
                  <button className="px-3 py-1 bg-[var(--ms-gold)]/10 border border-dashed border-[var(--ms-gold)]/30 text-[var(--ms-gold)] text-[9px] rounded-full">+</button>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--ms-gold)]/70">Auteur Insight</h4>
                <div className="p-6 bg-[var(--ms-bg)]/80 border border-[var(--ms-border)] rounded-2xl shadow-inner">
                  <p className="text-sm text-[var(--ms-text)] italic leading-relaxed font-light">
                    "{activeChar.description}"
                  </p>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--ms-gold)]/70">Atmospheric Density</h4>
                  <span className="text-[10px] font-mono text-[var(--ms-gold)]">{activeChar.intensity}%</span>
                </div>
                <div className="w-full h-1 bg-[var(--ms-border)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--ms-gold)] shadow-[0_0_15px_var(--ms-gold)]" style={{ width: `${activeChar.intensity}%` }} />
                </div>
              </section>
            </div>

            {/* Concept Art Preview */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--ms-gold)]/70">Concept Art Generation</h4>
              <div className="aspect-[3/4] bg-[var(--ms-bg)] border border-[var(--ms-border)] rounded-2xl relative overflow-hidden group cursor-crosshair shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent z-10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center gap-4 group-hover:scale-105 transition-transform duration-700">
                    <span className="text-4xl opacity-20 group-hover:opacity-40 transition-opacity">📸</span>
                    <span className="text-[10px] font-serif italic text-gray-500 tracking-widest">
                       Initializing Archetype Render...
                    </span>
                  </div>
                </div>
                
                {/* Overlay Metadata */}
                <div className="absolute bottom-6 left-6 right-6 z-20">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[8px] font-mono text-[var(--ms-gold)] uppercase block mb-1">Dossier #472-X</span>
                      <h5 className="text-xl font-serif font-bold text-white uppercase tracking-wider">{activeChar.name}</h5>
                    </div>
                    <div className="px-2 py-1 bg-[var(--ms-gold)] text-[var(--ms-bg)] text-[7px] font-bold rounded uppercase">
                      Vibe Locked
                    </div>
                  </div>
                </div>
                
                 {/* Generation Markers */}
                <div className="absolute top-6 right-6 z-20 flex flex-col gap-2">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="w-1.5 h-1.5 rounded-full bg-[var(--ms-gold)]/30 animate-pulse" style={{ animationDelay: `${i * 300}ms` }} />
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
