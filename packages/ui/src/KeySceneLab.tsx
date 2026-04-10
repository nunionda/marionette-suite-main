"use client";

import React, { useState } from "react";
import { usePipeline } from "./PipelineProvider";

interface KeyScene {
  id: string;
  title: string;
  location: string;
  lightingKey: string;
  mood: string;
  colorPalette: string[];
}

const keyScenes: KeyScene[] = [
  {
    id: "apex-exchange",
    title: "The Apex Exchange Hall",
    location: "Main Financial Hub",
    lightingKey: "Chiaroscuro with Neon Contours",
    mood: "Overwhelming Bureaucracy",
    colorPalette: ["#000000", "#1a1a1a", "#ffd700", "#00ffff"],
  },
  {
    id: "dmz-firewall",
    title: "The Digital DMZ Firewall",
    location: "Outer Orbit Hub",
    lightingKey: "Stark Atmospheric Haze",
    mood: "Desolate Isolation",
    colorPalette: ["#0a0a0a", "#222222", "#ff0000", "#ffffff"],
  },
  {
    id: "pyongyang-data-well",
    title: "Pyongyang Core Data Well",
    location: "Underground Server Hive",
    lightingKey: "Low-Frequency Red Pulsing",
    mood: "Computational Claustrophobia",
    colorPalette: ["#0f0000", "#330000", "#660000", "#ff3333"],
  },
];

export default function KeySceneLab() {
  const [selectedId, setSelectedId] = useState(keyScenes[0].id);
  const activeScene = keyScenes.find((s) => s.id === selectedId) || keyScenes[0];
  const { getAgentMeta } = usePipeline();
  const meta = getAgentMeta("GEN");

  return (
    <div className="flex flex-col h-full bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-700 group">
      {/* Header */}
      <div className="flex items-center justify-between px-10 py-8 border-b border-[var(--ms-border)] bg-[var(--ms-bg)]/90 backdrop-blur-3xl">
        <div className="flex flex-col gap-2">
          <h3 className="font-serif text-2xl font-bold text-[var(--ms-gold)] tracking-tight">Key Scene Visual Lab</h3>
          <div className="flex items-center gap-3">
            <p className="text-xs text-[var(--ms-text-dim)] uppercase tracking-[0.3em]">Orchestrating Cinematic Vibe per Sequence</p>
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
        <div className="flex gap-4">
          <button className="px-6 py-2.5 bg-transparent border border-[var(--ms-gold)]/30 text-[var(--ms-gold)] text-[10px] font-bold uppercase tracking-widest rounded hover:bg-[var(--ms-gold)]/10 transition-all">
            Open Storyboarder
          </button>
          <button className="px-6 py-2.5 bg-[var(--ms-gold)] text-[var(--ms-bg)] text-[10px] font-bold uppercase tracking-widest rounded shadow-[0_0_20px_var(--ms-gold)]/20">
            Paint Concept Key
          </button>
        </div>
      </div>

      <div className="flex flex-grow items-stretch overflow-hidden">
        {/* Scene Selector */}
        <div className="w-96 border-r border-[var(--ms-border)] bg-[var(--ms-bg)]/60 overflow-y-auto p-10 space-y-8">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--ms-text-dim)] border-b border-[var(--ms-border)] pb-4">Major Set Pieces</h4>
          <div className="space-y-6">
            {keyScenes.map((scene) => (
              <button
                key={scene.id}
                onClick={() => setSelectedId(scene.id)}
                className={`w-full text-left transition-all duration-500 group relative ${
                  selectedId === scene.id ? "translate-x-2" : ""
                }`}
              >
                <div className="flex flex-col gap-1">
                  <span className={`text-[9px] uppercase tracking-widest transition-colors ${selectedId === scene.id ? "text-[var(--ms-gold)]" : "text-[var(--ms-text-dim)]"}`}>
                    {scene.location}
                  </span>
                  <h5 className={`text-lg font-serif transition-all ${selectedId === scene.id ? "text-[var(--ms-text)] font-bold mb-1" : "text-[var(--ms-text-dim)]"}`}>
                    {scene.title}
                  </h5>
                  {selectedId === scene.id && (
                    <div className="flex gap-1">
                      {scene.colorPalette.map((color, i) => (
                        <div key={i} className="w-4 h-1 rounded-full" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  )}
                </div>
                {selectedId === scene.id && (
                  <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--ms-gold)] rounded-full shadow-[0_0_10px_var(--ms-gold)]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Canvas */}
        <div className="flex-grow p-16 overflow-y-auto bg-[var(--ms-bg)] flex flex-col gap-12">
          {/* Main Concept Art Slider Placeholder */}
          <section className="space-y-6">
            <div className="flex justify-between items-end">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.5em] text-[var(--ms-gold)]/80">Cinematic Concept Art</h4>
              <span className="text-[9px] font-mono text-[var(--ms-text-dim)] italic">Iteration 0.94 // Artist Guided</span>
            </div>
            
            <div className="aspect-[21/9] bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-3xl overflow-hidden shadow-2xl relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 z-10" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1510511459019-5dee997ddfdf?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity duration-1000 group-hover:scale-105" />
                 <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <div className="flex flex-col items-center gap-6">
                       <span className="text-[10px] uppercase font-bold tracking-[1em] text-[var(--ms-gold)] animate-pulse">Initializing Visual Key</span>
                       <div className="w-64 h-px bg-gradient-to-r from-transparent via-[var(--ms-gold)]/50 to-transparent" />
                    </div>
                 </div>
              </div>

              {/* Composition Markers */}
              <div className="absolute top-8 left-8 p-4 border-l border-t border-[var(--ms-gold)]/20 w-12 h-12 z-20" />
              <div className="absolute top-8 right-8 p-4 border-r border-t border-[var(--ms-gold)]/20 w-12 h-12 z-20" />
              <div className="absolute bottom-12 left-10 z-20">
                 <div className="flex flex-col gap-1">
                   <h6 className="text-2xl font-serif font-bold text-white tracking-wider uppercase mb-1">{activeScene.title}</h6>
                   <div className="flex items-center gap-4">
                      <span className="text-[10px] text-[var(--ms-gold)] uppercase font-bold tracking-widest">{activeScene.lightingKey}</span>
                      <span className="w-1 h-1 rounded-full bg-white/30" />
                      <span className="text-[10px] text-white/60 uppercase font-bold tracking-widest">{activeScene.mood}</span>
                   </div>
                 </div>
              </div>
            </div>
          </section>

          {/* Color & Mood Breakdown */}
          <div className="grid grid-cols-3 gap-10">
             <div className="space-y-6">
                <h5 className="text-[9px] font-bold uppercase tracking-widest text-[var(--ms-gold)]">Color Theory</h5>
                <div className="flex items-stretch h-12 rounded-xl border border-[var(--ms-border)] overflow-hidden shadow-xl">
                   {activeScene.colorPalette.map((color, i) => (
                     <div key={i} className="flex-grow group relative transition-all hover:flex-[2]" style={{ backgroundColor: color }}>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                     </div>
                   ))}
                </div>
             </div>
             <div className="space-y-4 col-span-2">
                <h5 className="text-[9px] font-bold uppercase tracking-widest text-[var(--ms-gold)]">Director's Visual Intent</h5>
                <p className="text-xs text-[var(--ms-text-dim)] leading-relaxed font-light italic bg-[var(--ms-bg-2)]/50 p-6 rounded-2xl border border-[var(--ms-border)] shadow-inner">
                   "We need to emphasize the scale of the architecture while keeping the character feeling small and technologically vulnerable. The {activeScene.lightingKey} should create a sense of constant surveillance and pressure."
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
