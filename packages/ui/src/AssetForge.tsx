import React, { useState, useEffect } from "react";
import { usePipeline } from "./PipelineProvider";

export default function AssetForge() {
  const [activeAsset, setActiveAsset] = useState("Prop_Bio_Key_01");
  const { getEngineForAgent, globalHealthScore, getAgentMeta } = usePipeline();
  const assignedEngine = getEngineForAgent("ASST");
  const meta = getAgentMeta("ASST");

  return (
    <div className="flex flex-col h-full bg-[var(--ms-bg-base)] border border-[var(--ms-border)] rounded-3xl overflow-hidden shadow-3xl animate-in fade-in duration-1000 group">
      <div className="flex items-center justify-between px-10 py-8 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-10">
          <div className="flex flex-col gap-1">
             <h3 className="font-serif text-3xl font-bold text-white tracking-tighter uppercase">Art Dept & Asset Forge</h3>
             <div className="flex items-center gap-3">
               <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-mono italic">AU_ASST_PROTOCOL // MATERIAL_FABRICATION</span>
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
                <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Neural_Forge</span>
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
          <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono font-bold rounded-lg flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            ASSET_READY_v1.4
          </div>
          <button className="px-8 py-2 bg-[var(--ms-gold)] text-black text-[10px] font-bold uppercase tracking-[0.2em] rounded-lg shadow-xl shadow-[var(--ms-gold)]/10 hover:scale-105 transition-all">
            Approve_Design
          </button>
        </div>
      </div>

      <div className="flex flex-grow h-[550px]">
        {/* Left: Component Inventory */}
        <div className="w-72 border-r border-[var(--ms-border)] bg-[var(--ms-bg-base)] overflow-y-auto">
           {[
             { id: "PROP_001", name: "Bio-Key Crystal" },
             { id: "COST_012", name: "Cyber-Merc Jacket" },
             { id: "ENV_045", name: "Neon Billboard Kit" },
             { id: "PROP_089", name: "Seoul-Data Ledger" }
           ].map(asset => (
             <button 
               key={asset.id}
               onClick={() => setActiveAsset(asset.id)}
               className={`w-full p-8 text-left border-b border-[var(--ms-border)] transition-all ${
                 activeAsset === asset.id ? "bg-[var(--ms-gold)]/5 border-l-4 border-l-[var(--ms-gold)]" : "opacity-40 hover:opacity-100"
               }`}
             >
               <h4 className="text-[10px] font-mono font-bold text-[var(--ms-gold)] mb-1 uppercase tracking-tighter">{asset.id}</h4>
               <span className="text-[9px] text-[var(--ms-text)] uppercase font-bold tracking-widest leading-tight block">{asset.name}</span>
             </button>
           ))}
        </div>

        {/* Main: Design Workspace */}
        <div className="flex-grow p-12 overflow-y-auto bg-[var(--ms-bg-base)]">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                 <div>
                    <h4 className="text-[10px] font-bold text-[var(--ms-gold)] uppercase tracking-[0.4em] mb-8 block">Material_DNA_Directives</h4>
                    <div className="space-y-4">
                       {[
                         { label: "Surface Texture", value: "Carbon Fiber with Seoul-Dust", conf: "98%" },
                         { label: "Subsurface", value: "Bio-Luminescent Pulse (Gold)", conf: "92%" },
                         { label: "Weathering", value: "Post-Rain Humidity Residue", conf: "100%" }
                       ].map(mat => (
                         <div key={mat.label} className="p-6 bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-xl relative overflow-hidden group">
                            <div className="flex justify-between items-center mb-2">
                               <span className="text-[9px] uppercase text-[var(--ms-text-dim)] font-bold tracking-widest">{mat.label}</span>
                               <span className="text-[9px] font-mono text-[var(--ms-gold)]">{mat.conf}</span>
                            </div>
                            <span className="text-sm font-serif text-[var(--ms-text)] italic leading-relaxed">"{mat.value}"</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="pt-8 border-t border-[var(--ms-border)]">
                    <h4 className="text-[10px] font-bold text-[var(--ms-text-dim)] uppercase tracking-widest mb-6 block">Art_Director_Guidance</h4>
                    <div className="p-8 bg-black/40 border-l-2 border-l-blue-500 text-[11px] text-gray-400 italic font-serif leading-relaxed">
                      "Ensure the weathered edges show the 'Seoul-Dust' texture clearly. The contrast between the matte black carbon and the gold internal core is key for the SC_001 protagonist interaction."
                    </div>
                 </div>
              </div>

              <div className="space-y-8">
                 <h4 className="text-[10px] font-bold text-[var(--ms-text-dim)] uppercase tracking-widest mb-8 block">Visual_Asset_Blueprint</h4>
                 <div className="aspect-square bg-black border border-[var(--ms-gold-border)]/20 rounded-2xl flex items-center justify-center relative shadow-2xl overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-amber-900/10 opacity-30" />
                    <div className="absolute top-6 right-6 flex flex-col gap-1 items-end">
                       <span className="text-[10px] font-mono text-[var(--ms-gold)] font-bold">PROMPT_COHESION: 96.4%</span>
                       <span className="text-[8px] text-white/40 uppercase font-mono tracking-widest">Model: XL_CINEMA_Prop_v2</span>
                    </div>
                    <div className="text-[10px] font-mono text-white/10 uppercase tracking-[2em] rotate-45 select-none pointer-events-none scale-150">
                       ASSET_FORGE_LOCKED
                    </div>
                    <div className="absolute bottom-8 left-8 right-8 h-16 bg-black/80 backdrop-blur-3xl rounded-sm border border-white/10 flex items-center justify-between px-8 group-hover:border-[var(--ms-gold)] transition-colors">
                       <span className="text-[10px] text-white uppercase font-bold tracking-[0.2em] font-mono">Blueprint // PROP_001_v3</span>
                       <button className="text-[9px] text-[var(--ms-gold)] uppercase font-bold border border-[var(--ms-gold)]/30 px-4 py-2 hover:bg-[var(--ms-gold)] hover:text-black transition-all">EXTRACT_PROMPT</button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
