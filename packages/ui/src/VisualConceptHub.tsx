"use client";

import React, { useState } from "react";

interface StylePillar {
  id: string;
  name: string;
  intensity: number;
  description: string;
}

interface VisualConceptHubProps {
  projectId?: string;
  initialMood?: string;
  activeRunId?: string;
  onSave?: (data: any) => Promise<void>;
}

export default function VisualConceptHub({ 
  projectId = "N/A", 
  initialMood = "Seventies Paranoia meets Future Seoul",
  activeRunId,
  onSave 
}: VisualConceptHubProps) {
  const [pillars, setPillars] = useState<StylePillar[]>([
    { id: "p1", name: "Anamorphic Texture", intensity: 85, description: "Strong horizontal flares and oval bokeh." },
    { id: "p2", name: "Cyber-Noir Lighting", intensity: 90, description: "High contrast, deep shadows, and saturated neon accents." },
    { id: "p3", name: "Dystopian Brutalism", intensity: 70, description: "Focus on massive concrete structures and geometric oppression." },
    { id: "p4", name: "Binary Particles", intensity: 45, description: "Subtle computational dust and code-like light grains." },
  ]);

  const [activeMood, setActiveMood] = useState(initialMood);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave({ mood: activeMood, pillars });
      console.log("✅ DNA_GROUNDED: SUCCESS");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-mono font-bold text-[var(--ms-green)] tracking-tighter uppercase">VISUAL.CONCEPT_LAB</h2>
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-mono text-[var(--ms-text-dim)] uppercase tracking-widest">DNA_CORE_DEFINITION // PROJECT_ID: {projectId}</p>
            {activeRunId && (
              <span className="px-2 py-0.5 bg-[var(--ms-gold)]/20 text-[var(--ms-gold)] text-[8px] font-bold rounded-sm uppercase tracking-widest animate-pulse border border-[var(--ms-gold)]/30">
                Live Tweak Active
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-[var(--ms-bg-3)] border border-[var(--ms-border)] text-[var(--ms-text-dim)] text-[9px] font-mono font-bold uppercase tracking-widest rounded-sm hover:text-[var(--ms-green)] transition-all">
            KEY_SCENE_LAB
          </button>
          <button className="px-4 py-2 bg-[var(--ms-bg-3)] border border-[var(--ms-border)] text-[var(--ms-text-dim)] text-[9px] font-mono font-bold uppercase tracking-widest rounded-sm hover:text-[var(--ms-green)] transition-all">
            LOOK_DEV_SYNC
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`px-6 py-2 text-[var(--ms-bg)] text-[9px] font-mono font-bold uppercase tracking-widest rounded-sm transition-all disabled:opacity-50 ${activeRunId ? 'bg-[var(--ms-gold)] shadow-[0_0_15px_var(--ms-gold)] hover:shadow-[0_0_25px_var(--ms-gold)]' : 'bg-[var(--ms-green)] shadow-[0_0_15px_var(--ms-green-dim)] hover:shadow-[0_0_25px_var(--ms-green-dim)]'}`}
          >
            {isSaving ? (activeRunId ? "MID-FLIGHT OVERRIDE..." : "SYNC_IN_PROGRESS...") : (activeRunId ? "INJECT LIVE-TWEAK" : "SYNC_DNA_CORE")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Style Pillars */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--ms-text-dim)] border-b border-[var(--ms-border)] pb-2">STYLE_PILLARS.CFG</h3>
          <div className="space-y-6">
            {pillars.map((pillar) => (
              <div key={pillar.id} className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-mono font-bold text-[var(--ms-text)] uppercase">{pillar.name}</label>
                  <span className="text-[10px] font-mono text-[var(--ms-green)]">{pillar.intensity}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={pillar.intensity}
                  onChange={(e) => setPillars(pillars.map(p => p.id === pillar.id ? { ...p, intensity: parseInt(e.target.value) } : p))}
                  className="w-full h-1 bg-[var(--ms-border)] rounded-none appearance-none accent-[var(--ms-green)] cursor-pointer"
                />
                <p className="text-[9px] font-mono text-[var(--ms-text-dim)] leading-relaxed px-1 uppercase">{">"} {pillar.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Look Development Gallery */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center border-b border-[var(--ms-border)] pb-2">
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--ms-text-dim)]">REFERENCE_MATRIX.RAW</h3>
            <div className="flex gap-4">
               <span className="text-[10px] font-mono text-[var(--ms-green)]">BUFFER_STATE: READY</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[16/9] bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-sm overflow-hidden group relative cursor-pointer hover:border-[var(--ms-green-border)] transition-all shadow-xl">
                 <div className="absolute inset-0 bg-gradient-to-t from-[var(--ms-bg)] via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
                 <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-30 transition-opacity">
                    <span className="text-[10px] font-mono text-white tracking-widest uppercase">STYLE_REF_0{i}.DAT</span>
                 </div>
                 <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-[8px] font-mono text-[var(--ms-green)] uppercase tracking-tighter">METADATA_0{i}</span>
                    <h4 className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">LOOK_DEV_NODE_0{i}</h4>
                 </div>
                 <div className="absolute top-4 right-4 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded-sm border border-white/10 text-[7px] font-mono text-white/70 uppercase">
                    AI_GEN
                 </div>
              </div>
            ))}
            
            {/* Add New Style Card */}
            <div className="aspect-[16/9] border border-dashed border-[var(--ms-border)] rounded-sm flex flex-col items-center justify-center group hover:border-[var(--ms-green-border)] transition-all cursor-pointer bg-[var(--ms-bg-2)]/30">
               <span className="text-xl mb-2 grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all font-mono text-[var(--ms-green)]">⊕</span>
               <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[var(--ms-text-dim)] group-hover:text-[var(--ms-green)]">INJECT_REF</span>
            </div>
          </div>

          {/* Director's Intent TextArea */}
          <div className="pt-8 space-y-4">
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--ms-text-dim)]">CONCEPT_MANIFEST.TXT</h3>
            <textarea 
              value={activeMood}
              onChange={(e) => setActiveMood(e.target.value)}
              className="w-full bg-[var(--ms-bg)] border border-[var(--ms-border)] p-6 rounded-sm text-[var(--ms-green)] font-mono text-sm focus:outline-none focus:border-[var(--ms-green-border)] transition-all h-32 leading-relaxed shadow-inner"
              placeholder="DESCRIBE_A_VISUAL_SOUL >>"
            />
            <div className="flex justify-between items-center text-[8px] font-mono text-[var(--ms-text-dim)] px-2 uppercase tracking-widest">
              <span>ORCHESTRATING 14 AGENT NODES...</span>
              <span className="text-[var(--ms-green)]">INTEGRITY_LEVEL: INDUSTRIAL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
