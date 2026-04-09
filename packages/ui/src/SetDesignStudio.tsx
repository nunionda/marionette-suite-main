"use client";

import React, { useState } from "react";

interface SetEnvironment {
  id: string;
  name: string;
  type: "Interior" | "Exterior" | "Studio";
  status: "Draft" | "3D Render" | "Pre-viz Ready";
  tags: string[];
}

interface SetDesignStudioProps {
  projectId?: string;
  onSave?: (data: any) => Promise<void>;
}

export default function SetDesignStudio({ projectId = "N/A", onSave }: SetDesignStudioProps) {
  const [sets] = useState<SetEnvironment[]>([
    { id: "set-01", name: "Apex Server Floor", type: "Interior", status: "Pre-viz Ready", tags: ["Industrial", "Neon", "Brutalist"] },
    { id: "set-02", name: "Pyongyang Satellite Array", type: "Exterior", status: "3D Render", tags: ["Massive", "Satellite", "Cold"] },
    { id: "set-03", name: "Seol-hee's Condo", type: "Interior", status: "Draft", tags: ["Minimalist", "High-tech", "Lonely"] },
  ]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSync = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave({ sets });
      console.log("✅ SET_DNA_SYNC: SUCCESS");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-mono font-bold text-[var(--ms-green)] tracking-tighter uppercase">SET_DESIGN.ORCHESTRATOR</h2>
        <p className="text-[10px] font-mono text-[var(--ms-text-dim)] uppercase tracking-widest">SPATIAL_ARCHITECTURE // PROJECT: {projectId}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sets.map((set) => (
          <div key={set.id} className="bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-sm overflow-hidden group hover:border-[var(--ms-green-border)] transition-all shadow-xl">
             <div className="aspect-video bg-[var(--ms-bg)] flex items-center justify-center relative border-b border-[var(--ms-border)]">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--ms-bg)]/80 to-transparent" />
                <span className="text-[9px] font-mono text-[var(--ms-text-dim)] uppercase tracking-widest z-10">ENV_MODEL_NODE: {set.id}</span>
                <div className="absolute top-4 right-4 flex gap-1">
                   {set.tags.map(tag => (
                     <span key={tag} className="px-1.5 py-0.5 bg-black/60 text-[7px] text-[var(--ms-green)] rounded-sm border border-[var(--ms-green-border)] uppercase font-mono">{tag}</span>
                   ))}
                </div>
             </div>
             
             <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                   <div>
                      <h3 className="text-lg font-mono font-bold text-[var(--ms-text)] uppercase">{set.name}</h3>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--ms-text-dim)]">{set.type}.DAT</span>
                   </div>
                   <span className={`px-2 py-0.5 rounded-sm text-[8px] font-mono font-bold uppercase tracking-widest ${
                     set.status === "Pre-viz Ready" ? "bg-[var(--ms-green-dim)] text-[var(--ms-green)]" : "bg-amber-500/10 text-amber-400"
                   }`}>
                     {set.status}
                   </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                   <button className="py-2 bg-[var(--ms-bg-3)] border border-[var(--ms-border)] rounded-sm text-[8px] font-mono font-bold text-[var(--ms-text-dim)] hover:text-[var(--ms-green)] hover:border-[var(--ms-green-border)] transition-all uppercase tracking-widest">
                     BLUEPRINT_VIEW
                   </button>
                   <button className="py-2 bg-[var(--ms-bg-3)] border border-[var(--ms-border)] rounded-sm text-[8px] font-mono font-bold text-[var(--ms-text-dim)] hover:text-[var(--ms-green)] hover:border-[var(--ms-green-border)] transition-all uppercase tracking-widest">
                     BREAKDOWN.SHR
                   </button>
                </div>
                
                <button 
                   onClick={handleSync}
                   disabled={isSaving}
                   className="w-full py-2 bg-[var(--ms-green-dim)] border border-[var(--ms-green-border)] text-[9px] font-mono font-bold text-[var(--ms-green)] rounded-sm hover:bg-[var(--ms-green)] hover:text-[var(--ms-bg)] transition-all uppercase tracking-widest disabled:opacity-50"
                >
                   {isSaving ? "SYNCING_NODE..." : "SYNC_SET_DNA"}
                </button>
             </div>
          </div>
        ))}

        {/* Add New Set Card */}
        <div className="aspect-square border border-dashed border-[var(--ms-border)] rounded-sm flex flex-col items-center justify-center group hover:border-[var(--ms-green-border)] transition-all cursor-pointer bg-[var(--ms-bg-2)]/30">
           <span className="text-2xl mb-3 grayscale opacity-30 group-hover:opacity-100 transition-all font-mono text-[var(--ms-green)]">⊕</span>
           <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[var(--ms-text-dim)] group-hover:text-[var(--ms-green)]">INITIALIZE_SET_NODE</span>
        </div>
      </div>
    </div>
  );
}
