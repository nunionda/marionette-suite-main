"use client";

import React, { useState } from "react";

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

  return (
    <div className="flex flex-col h-full bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-2xl overflow-hidden shadow-2xl animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--ms-border)] bg-[var(--ms-bg)]/80 backdrop-blur-xl">
        <div className="flex flex-col gap-1">
          <h3 className="font-serif text-xl font-bold text-[var(--ms-gold)]">Character Visual Studio</h3>
          <p className="text-[10px] text-[var(--ms-text-dim)] uppercase tracking-[0.2em]">Synchronizing Artist Intent with AI Agents</p>
        </div>
        <div className="flex gap-4">
          <button className="px-5 py-2 bg-transparent border border-[var(--ms-gold)]/30 text-[var(--ms-gold)] text-[10px] font-bold uppercase tracking-widest rounded hover:bg-[var(--ms-gold)]/10 transition-all">
            Export Visual Dossier
          </button>
          <button className="px-5 py-2 bg-[var(--ms-gold)] text-[var(--ms-bg)] text-[10px] font-bold uppercase tracking-widest rounded shadow-lg shadow-[var(--ms-gold)]/20">
            Generate Concept Art
          </button>
        </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
        {/* Character List */}
        <div className="w-80 border-r border-[var(--ms-border)] bg-[var(--ms-bg)]/40 overflow-y-auto p-6 space-y-4">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--ms-text-dim)] mb-6">Major Archetypes</h4>
          {characters.map((char) => (
            <button
              key={char.id}
              onClick={() => setSelectedId(char.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-300 group ${
                selectedId === char.id
                  ? "bg-[var(--ms-gold)]/10 border-[var(--ms-gold)]/50"
                  : "bg-transparent border-transparent hover:border-[var(--ms-border)] hover:bg-[var(--ms-bg)]"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedId === char.id ? "text-[var(--ms-gold)]" : "text-[var(--ms-text-dim)]"}`}>
                  {char.role}
                </span>
                <div className={`w-1.5 h-1.5 rounded-full ${selectedId === char.id ? "bg-[var(--ms-gold)] shadow-[0_0_8px_var(--ms-gold)]" : "bg-transparent"}`} />
              </div>
              <h5 className={`text-lg font-serif font-bold ${selectedId === char.id ? "text-[var(--ms-text)]" : "text-[var(--ms-text-dim)]"}`}>
                {char.name}
              </h5>
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
