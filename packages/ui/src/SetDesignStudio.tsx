import React, { useState, useEffect } from "react";
import { usePipeline } from "./PipelineProvider";

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
  const { getEngineForAgent, globalHealthScore, getAgentMeta } = usePipeline();
  const assignedEngine = getEngineForAgent("SETD");
  const meta = getAgentMeta("SETD");

  const [sets] = useState<SetEnvironment[]>([
    { id: "ENV_001", name: "Apex Server Floor", type: "Interior", status: "Pre-viz Ready", tags: ["Volumetric", "Neon", "Brutalist"] },
    { id: "ENV_002", name: "Pyongyang Satellite Array", type: "Exterior", status: "Neural Synthesis Ready", tags: ["Anamorphic", "Satellite", "Cold"] },
    { id: "ENV_003", name: "Seol-hee's Condo", type: "Interior", status: "Draft", tags: ["Minimalist", "Ray-Depth", "Lonely"] },
  ]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSync = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave({ sets });
      console.log("✅ ENVIRONMENT_DNA_SYNC: SUCCESS");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--ms-bg-base)] border border-[var(--ms-border)] rounded-3xl overflow-hidden shadow-3xl animate-in fade-in duration-1000 group">
      <div className="flex items-center justify-between px-10 py-8 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-10">
          <div className="flex flex-col gap-1">
             <h3 className="font-serif text-3xl font-bold text-white tracking-tighter uppercase">Set Design & Scouting Suite</h3>
             <div className="flex items-center gap-3">
               <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-mono italic">AU_SETD_PROTOCOL // SPATIAL_ARCHITECTURE</span>
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
            Export Manifest
          </button>
          <button className="px-8 py-2 bg-[var(--ms-gold)] text-black text-[10px] font-bold uppercase tracking-[0.2em] rounded-lg shadow-xl shadow-[var(--ms-gold)]/10 hover:scale-105 transition-all">
            Sync_Virtual_Sets
          </button>
        </div>
      </div>

      <div className="p-12 space-y-12 overflow-y-auto">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {sets.map((set) => (
          <div key={set.id} className="bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-2xl overflow-hidden group hover:border-[var(--ms-gold)]/40 transition-all shadow-2xl relative">
             <div className="aspect-video bg-black flex items-center justify-center relative border-b border-[var(--ms-border)] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-transparent to-black/20 z-10" />
                <div className="absolute inset-0 bg-zinc-900 group-hover:scale-110 transition-transform duration-1000" />
                <span className="text-[10px] font-mono text-[var(--ms-gold)] uppercase tracking-[0.3em] z-20 opacity-40">ENV_NODE: {set.id}</span>
                <div className="absolute top-6 right-6 flex gap-2 z-20">
                   {set.tags.map(tag => (
                     <span key={tag} className="px-2 py-1 bg-black/60 text-[8px] text-[var(--ms-gold)] rounded border border-[var(--ms-gold)]/30 uppercase font-mono backdrop-blur-md">{tag}</span>
                   ))}
                </div>
             </div>
             
             <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                   <div className="space-y-1">
                      <h3 className="text-xl font-serif font-bold text-white uppercase tracking-tight">{set.name}</h3>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-bold">{set.type} // SPATIAL.DNA</span>
                   </div>
                   <span className={`px-3 py-1 rounded-lg text-[9px] font-mono font-bold uppercase tracking-widest border ${
                     set.status === "Pre-viz Ready" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                   }`}>
                     {set.status}
                   </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                   <button className="py-3 bg-[var(--ms-bg-base)] border border-[var(--ms-border)] rounded-xl text-[9px] font-bold text-zinc-400 hover:text-[var(--ms-gold)] hover:border-[var(--ms-gold)]/30 transition-all uppercase tracking-widest">
                     Spatial_Scout
                   </button>
                   <button className="py-3 bg-[var(--ms-bg-base)] border border-[var(--ms-border)] rounded-xl text-[9px] font-bold text-zinc-400 hover:text-[var(--ms-gold)] hover:border-[var(--ms-gold)]/30 transition-all uppercase tracking-widest">
                     Texture_Map
                   </button>
                </div>
                
                <button 
                   onClick={handleSync}
                   disabled={isSaving}
                   className="w-full py-4 bg-[var(--ms-gold)]/10 border border-[var(--ms-gold)]/30 text-[10px] font-bold text-[var(--ms-gold)] rounded-xl hover:bg-[var(--ms-gold)] hover:text-black transition-all uppercase tracking-[0.3em] disabled:opacity-50 shadow-lg"
                >
                   {isSaving ? "SYNCING_NODE..." : "SYNC_ENVIRONMENT_DNA"}
                </button>
             </div>
          </div>
        ))}

        {/* Add New Set Card */}
        <div className="aspect-square border border-dashed border-[var(--ms-border)] rounded-2xl flex flex-col items-center justify-center group hover:border-[var(--ms-gold)]/30 transition-all cursor-pointer bg-[var(--ms-bg-2)]/20 shadow-xl">
           <span className="text-4xl mb-4 grayscale opacity-20 group-hover:opacity-100 transition-all font-serif text-[var(--ms-gold)]">⊕</span>
           <span className="text-[10px] font-mono font-bold uppercase tracking-[0.5em] text-zinc-600 group-hover:text-[var(--ms-gold)]">INITIALIZE_ENV_NODE</span>
        </div>
        </div>
      </div>
    </div>
  );
}
