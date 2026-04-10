import React, { useState, useEffect } from "react";
import { usePipeline, MasteringMode } from "./PipelineProvider";

const PRESETS = [
  { id: "master_blockbuster", name: "Blockbuster Master", tone: "Cyan/Orange", spec: "P3, 4K, J2K @ 250Mbps" },
  { id: "master_noir", name: "80s Film Noir", tone: "Monochrome Low", spec: "Linear, 4K, Rec.2020" },
  { id: "master_classic", name: "Technicolor Classic", tone: "Saturated", spec: "HDR10, Rec.709 ODT" },
];

export default function MasteringForge() {
  const { masteringMode, setMasteringMode, approve4K, is4KApproved, getEngineForAgent, globalHealthScore, getAgentMeta } = usePipeline();
  const assignedEngine = getEngineForAgent("MSTR");
  const meta = getAgentMeta("MSTR");
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if ((masteringMode === "2K_PREVIEW" || masteringMode === "MASTERING_4K") && progress < 100) {
      const timer = setInterval(() => {
        setProgress(p => Math.min(p + 0.8, 100));
      }, 50);
      return () => clearInterval(timer);
    } else if (progress >= 100) {
      if (masteringMode === "2K_PREVIEW") setMasteringMode("AWAITING_4K_APPROVAL");
      if (masteringMode === "MASTERING_4K") setMasteringMode("COMPLETE");
    }
  }, [masteringMode, progress, setMasteringMode]);

  const handleStart2K = () => {
    setProgress(0);
    setMasteringMode("2K_PREVIEW");
  };

  const handleRequest4K = () => {
    // In a real app, this would show a confirmation dialog
    approve4K();
    setProgress(0);
  };

  return (
    <div className="flex flex-col gap-8 p-12 bg-[var(--ms-bg-base)] border border-[var(--ms-border)] rounded-[48px] shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden h-full animate-in fade-in duration-1000 group">
      
      {/* Mastering Status Overlay */}
      <div className={`absolute top-0 right-0 z-30 px-8 py-3 text-[10px] font-mono font-bold uppercase tracking-[0.5em] rounded-bl-3xl border-l border-b backdrop-blur-3xl transition-all duration-500 ${
        masteringMode === "COMPLETE" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
      }`}>
        {masteringMode === "IDLE" && "Status: Standby"}
        {masteringMode === "2K_PREVIEW" && "Status: Synthesizing_2K_Proxy"}
        {masteringMode === "AWAITING_4K_APPROVAL" && "Status: Awaiting_Final_4K_Approval"}
        {masteringMode === "MASTERING_4K" && "Status: Executing_Theatrical_DCP_Forge"}
        {masteringMode === "COMPLETE" && "Status: Master_Locked_DCP_Ready"}
      </div>

      {/* Header */}
      <div className="flex justify-between items-start z-20">
         <div className="flex items-center gap-10">
            <div className="flex flex-col gap-3">
               <div className="flex items-center gap-4">
                  <span className="text-[11px] font-bold uppercase tracking-[0.6em] text-[var(--ms-gold)] opacity-80">Finishing_Orchestrator_v4.5</span>
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
                  <div className={`w-2 h-2 rounded-full shadow-[0_0_15px_var(--ms-gold)] ${masteringMode !== "IDLE" ? 'bg-[var(--ms-gold)] animate-pulse' : 'bg-zinc-800'}`} />
               </div>
               <h2 className="text-4xl font-serif font-bold text-white tracking-tighter uppercase">Mastering & Delivery Forge</h2>
            </div>

            <div className="flex items-center gap-8 px-6 py-3 bg-white/[0.02] border border-white/10 rounded-2xl ml-4 mt-6">
               <div className="flex flex-col items-end gap-1">
                  <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Master_Engine</span>
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
         {masteringMode === "AWAITING_4K_APPROVAL" && (
            <div className="px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-4 animate-bounce">
               <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Explicit Approval Required</span>
            </div>
         )}
      </div>

      <div className="grid grid-cols-12 gap-12 flex-grow z-10">
        
        {/* Left: Final Preview & Scopes */}
        <div className="col-span-8 flex flex-col gap-8">
           <div className="relative aspect-video bg-black rounded-[40px] border border-white/5 overflow-hidden group shadow-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/40 via-transparent to-black" />
              
              {/* Rendering Scanline */}
              {(masteringMode === "2K_PREVIEW" || masteringMode === "MASTERING_4K") && (
                <div className="absolute inset-0 z-20 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--ms-gold)] shadow-[0_0_40px_var(--ms-gold)]" style={{ top: `${progress}%` }} />
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-md" style={{ clipPath: `inset(${progress}% 0 0 0)` }} />
                </div>
              )}

              {/* Mastering Metadata Overlays */}
              <div className="absolute top-10 left-10 flex flex-col gap-3 text-[11px] font-mono text-[var(--ms-gold)] opacity-90 bg-black/60 p-6 rounded-2xl border border-white/10 backdrop-blur-xl z-30">
                 <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Mastering_Node</span>
                    <span className="text-white">NODE_DX_9 // {masteringMode === "MASTERING_4K" ? '4K_FLUX' : '2K_PROXY'}</span>
                 </div>
                 <div className="flex flex-col gap-1 mt-2">
                    <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Color_Odometry</span>
                    <span className="text-white">ACES_v1.3 // P3-D65_ODT</span>
                 </div>
              </div>

              {/* Progress Indicator */}
              {(masteringMode === "2K_PREVIEW" || masteringMode === "MASTERING_4K") && (
                <div className="absolute inset-0 flex items-center justify-center z-40">
                   <div className="flex flex-col items-center gap-4">
                      <span className="text-6xl font-mono font-bold text-white tracking-tighter">{Math.floor(progress)}%</span>
                      <span className="text-[10px] font-mono text-[var(--ms-gold)] uppercase tracking-[0.5em] animate-pulse">
                        {masteringMode === "MASTERING_4K" ? 'Synthesizing_4K_DCP_Packet' : 'Extracting_2K_Production_Proxy'}
                      </span>
                   </div>
                </div>
              )}
           </div>

           {/* Final Delivery QC List */}
           <div className="grid grid-cols-3 gap-6">
              {[
                { label: "Temporal Accuracy", status: progress > 40 ? "VERIFIED" : "PENDING" },
                { label: "Loudness Compliant", status: progress > 70 ? "PASSED" : "PENDING" },
                { label: "Neural Grain Sync", status: masteringMode === "COMPLETE" ? "LOCKED" : "WAITING" }
              ].map(qc => (
                <div key={qc.label} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex justify-between items-center group hover:border-[var(--ms-gold)]/20 transition-all">
                   <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">{qc.label}</span>
                   <span className={`text-[9px] font-mono font-bold ${qc.status === "VERIFIED" || qc.status === "PASSED" || qc.status === "LOCKED" ? 'text-green-500' : 'text-zinc-600'}`}>{qc.status}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Right: Finishing Control Panel */}
        <div className="col-span-4 flex flex-col gap-8 bg-black/40 border border-white/5 rounded-[40px] p-10 shadow-3xl backdrop-blur-md">
           
           {/* Mastering Path Presets */}
           <div className="flex flex-col gap-6">
              <h4 className="text-[11px] text-[var(--ms-gold)] font-bold uppercase tracking-[0.4em]">Delivery_Profiles</h4>
              <div className="grid grid-cols-1 gap-4">
                 {PRESETS.map(p => (
                   <button 
                     key={p.id}
                     onClick={() => setSelectedPreset(p)}
                     className={`p-6 rounded-3xl border text-left transition-all relative overflow-hidden group ${selectedPreset.id === p.id ? 'bg-[var(--ms-gold)]/10 border-[var(--ms-gold)]/40 shadow-2xl' : 'bg-transparent border-white/5 hover:border-white/10'}`}
                   >
                     <div className="text-sm font-bold text-white mb-1 uppercase tracking-tight">{p.name}</div>
                     <div className="text-[10px] text-zinc-500 font-mono tracking-tighter">{p.spec}</div>
                     {selectedPreset.id === p.id && <div className="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--ms-gold)] shadow-[0_0_12px_var(--ms-gold)]" />}
                   </button>
                 ))}
              </div>
           </div>

           {/* Dynamic Actions */}
           <div className="mt-auto flex flex-col gap-4">
              {masteringMode === "IDLE" && (
                <button 
                  onClick={handleStart2K}
                  className="w-full py-6 bg-[var(--ms-gold)] text-black font-bold uppercase tracking-[0.4em] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-[var(--ms-gold)]/20 text-[11px]"
                >
                   Generate_2K_Proxy_Default
                </button>
              )}

              {masteringMode === "AWAITING_4K_APPROVAL" && (
                <button 
                  onClick={handleRequest4K}
                  className="w-full py-6 bg-red-600 text-white font-bold uppercase tracking-[0.4em] rounded-2xl hover:bg-red-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-red-600/20 text-[11px]"
                >
                   Approve_4K_Theatrical_DCP
                </button>
              )}

              {masteringMode === "COMPLETE" && (
                <button className="w-full py-6 bg-zinc-800 border border-green-500/40 text-green-500 font-bold uppercase tracking-[0.4em] rounded-2xl transition-all text-[11px] flex items-center justify-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-green-500" />
                   Master_DCP_Verified
                </button>
              )}

              {(masteringMode === "2K_PREVIEW" || masteringMode === "MASTERING_4K") && (
                <div className="w-full py-6 bg-zinc-900 border border-white/5 text-zinc-600 font-bold uppercase tracking-[0.4em] rounded-2xl text-[11px] text-center italic">
                   Synthesis_In_Progress...
                </div>
              )}
           </div>

           <p className="text-[9px] text-zinc-600 italic leading-relaxed text-center px-4 font-serif">
             "Notice: 2K proxies are generated automatically for review. 4K high-resolution mastering requires explicit human approval as per Auteur_Protocol_v4."
           </p>
        </div>

      </div>
    </div>
  );
}
