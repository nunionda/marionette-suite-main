import React, { useState, useEffect } from "react";
import { usePipeline } from "./PipelineProvider";

interface EditSequence {
  id: string;
  scene: string;
  duration: string;
  status: string;
  continuityScore: number;
}

export default function EditSuite() {
  const [progress, setProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const { getEngineForAgent, globalHealthScore, getAgentMeta } = usePipeline();
  const assignedEngine = getEngineForAgent("EDIT");
  const meta = getAgentMeta("EDIT");

  useEffect(() => {
    if (isAnalyzing && progress < 100) {
      const timer = setInterval(() => {
        setProgress(p => Math.min(p + 0.5, 100));
      }, 50);
      return () => clearInterval(timer);
    }
  }, [isAnalyzing, progress]);

  const sequences: EditSequence[] = [
    { id: "SEQ_01", scene: "SC_001_020", duration: "00:42:12", status: "Optimal", continuityScore: 98 },
    { id: "SEQ_02", scene: "SC_001_021", duration: "01:12:04", status: "Analyzing", continuityScore: 84 },
    { id: "SEQ_03", scene: "SC_001_022", duration: "00:24:18", status: "Sync_Drift", continuityScore: 72 },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--ms-bg-base)] border border-[var(--ms-border)] rounded-[40px] overflow-hidden shadow-2xl animate-in fade-in duration-1000 group">
      
      {/* Studio Header */}
      <div className="px-12 py-10 border-b border-[var(--ms-border)] bg-black/40 flex items-center justify-between backdrop-blur-3xl">
         <div className="flex flex-col gap-2">
            <h3 className="text-3xl font-serif font-bold text-[var(--ms-gold)] tracking-tighter uppercase">Cinematic Continuity Hub</h3>
            <div className="flex items-center gap-3">
               <p className="text-[10px] text-zinc-500 uppercase tracking-[0.5em]">Neural_Edit_Sequence_Architect_v2</p>
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

         <div className="flex items-center gap-10 px-10 py-5 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-3xl">
            <div className="flex flex-col items-end gap-1">
               <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Master_Auteur_Engine</span>
               <span className="text-sm font-mono text-[var(--ms-gold)] font-bold">{assignedEngine?.name || "Initializing..."}</span>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="flex flex-col items-end gap-1">
               <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Neural_Latency</span>
               <span className={`text-sm font-mono font-bold ${
                 (assignedEngine?.latency ?? 0) > 1000 ? "text-amber-500" : "text-green-500"
               }`}>
                 {assignedEngine ? `${Math.floor(assignedEngine.latency)}ms` : "---"}
               </span>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="flex flex-col items-end gap-1">
               <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Global_Integrity</span>
               <span className="text-sm font-mono text-white font-bold">{globalHealthScore}%</span>
            </div>
         </div>

         <div className="flex gap-4">
            <button className="px-8 py-3 bg-transparent border border-[var(--ms-gold)]/30 text-[var(--ms-gold)] text-[10px] font-bold uppercase tracking-[0.2em] rounded-2xl hover:bg-[var(--ms-gold)]/10 transition-all">
              Analyze Rhythm
            </button>
            <button className="px-8 py-3 bg-[var(--ms-gold)] text-black text-[10px] font-bold uppercase tracking-[0.2em] rounded-2xl shadow-3xl shadow-[var(--ms-gold)]/30">
              Commit_Master_Edit
            </button>
         </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
         
         {/* Timeline / Visual Workspace */}
         <div className="flex-grow bg-black relative flex flex-col items-center justify-center p-20 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05),transparent)] pointer-events-none" />
            
            {/* Timeline Viewport */}
            <div className="w-full h-96 bg-[var(--ms-bg-base)] rounded-[48px] border border-white/5 relative overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.8)] group p-1">
               <div className="absolute inset-0 flex items-center justify-center gap-[2px]">
                  {Array.from({ length: 60 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-32 transition-all duration-300 border-x border-black/20 ${
                        i % 5 === 0 ? "w-12 bg-zinc-800" : "w-16 bg-zinc-900"
                      } ${i < progress / 1.6 ? "opacity-100 group-hover:bg-[var(--ms-gold)]/20" : "opacity-20 translate-y-4"}`}
                    >
                       <div className="h-4 bg-black/40 w-full mb-1" />
                       <div className="h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
                    </div>
                  ))}
               </div>

               {/* Playhead */}
               <div 
                 className="absolute top-0 bottom-0 w-[2px] bg-[var(--ms-gold)] shadow-[0_0_30px_var(--ms-gold)] z-40 transition-all duration-300"
                 style={{ left: `${progress}%` }}
               >
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[var(--ms-gold)] rotate-45" />
               </div>

               {/* Overlay HUD */}
               <div className="absolute inset-0 p-12 flex flex-col justify-between z-50 pointer-events-none">
                  <div className="flex justify-between items-start">
                     <div className="flex flex-col gap-2">
                        <span className="text-[11px] font-mono text-[var(--ms-gold)] uppercase tracking-widest bg-black/80 px-4 py-1.5 rounded-full border border-[var(--ms-gold)]/30 backdrop-blur-xl">Neural_Pacing_Check</span>
                        <div className="flex flex-col">
                           <span className="text-xl font-serif font-bold text-white uppercase tracking-widest">MASTER_ASSEMBLY_v9</span>
                           <span className="text-[9px] text-zinc-500 font-mono">HASH: 4x9f_cc2_9a</span>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 backdrop-blur-2xl">
                           <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_green]" />
                           <span className="text-[10px] font-mono font-bold text-green-500 uppercase tracking-widest">CONTINUITY_LOCKED</span>
                        </div>
                     </div>
                  </div>

                  <div className="flex justify-between items-end">
                     <div className="flex gap-20">
                        <div className="flex flex-col">
                           <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-[0.3em] mb-2">Timecode_Assembly</span>
                           <span className="text-3xl font-mono text-white tracking-widest">00:{Math.floor(progress * 0.4).toString().padStart(2, '0')}:12:04</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-[0.3em] mb-2">Pacing_Coefficient</span>
                           <span className="text-3xl font-mono text-white tracking-widest">124.8 BPM</span>
                        </div>
                     </div>
                     <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-mono text-[var(--ms-gold)] font-bold uppercase mb-4 tracking-[0.5em]">RHYTHM_INTEGRITY</span>
                        <div className="flex gap-1">
                           {Array.from({ length: 12 }).map((_, i) => (
                             <div key={i} className="w-1.5 h-6 bg-[var(--ms-gold)]" style={{ opacity: 1 - (i * 0.08) }} />
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Sequence Health Track */}
            <div className="w-full max-w-4xl mt-20 space-y-8">
               <div className="flex justify-between items-end text-[12px] font-mono">
                  <div className="flex flex-col gap-3">
                     <span className="text-zinc-500 uppercase tracking-[0.5em]">Sequential_Continuity_Progress</span>
                     <span className="text-[var(--ms-gold)] font-bold text-2xl">{progress.toFixed(1)}% ANALYZED</span>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-green-500 font-bold uppercase tracking-widest px-3 py-1 bg-green-500/10 rounded-lg">Spatial_Vibe_Optimal</span>
                    <span className="text-zinc-600 italic">Validating L-Cuts & Transitional Flow...</span>
                  </div>
               </div>
               <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden p-[2px] border border-white/10 shadow-2xl">
                  <div 
                    className="h-full bg-gradient-to-r from-[var(--ms-gold)] via-amber-400 to-[var(--ms-gold)] shadow-[0_0_30px_var(--ms-gold)] transition-all duration-300 rounded-full" 
                    style={{ width: `${progress}%` }}
                  />
               </div>
            </div>
         </div>

         {/* Continuity Sidebar */}
         <div className="w-[450px] border-l border-[var(--ms-border)] bg-[var(--ms-bg-base)] p-16 space-y-16">
            <section className="space-y-10">
               <h4 className="text-[11px] font-bold uppercase tracking-[0.5em] text-[var(--ms-gold)]">Sequence_Inventory</h4>
               <div className="space-y-6">
                  {sequences.map((s) => (
                    <div key={s.id} className="p-8 bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-3xl group hover:border-[var(--ms-gold)]/40 transition-all cursor-pointer shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--ms-gold)]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                       <div className="flex justify-between items-start mb-4">
                          <span className="text-[10px] font-mono text-zinc-600 font-bold uppercase tracking-widest">{s.id} // {s.scene}</span>
                          <span className={`text-[9px] font-mono font-bold px-3 py-1 rounded-full border ${
                            s.status === "Optimal" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
                          }`}>{s.status}</span>
                       </div>
                       <h5 className="text-lg font-serif font-bold text-white group-hover:text-[var(--ms-gold)] transition-colors tracking-tight">Assembly_04_Cinematic</h5>
                       <div className="flex justify-between items-end mt-6">
                          <div className="flex gap-8">
                             <div className="flex flex-col">
                                <span className="text-[9px] uppercase text-zinc-600 font-bold mb-1">Duration</span>
                                <span className="text-[11px] text-zinc-300 font-mono">{s.duration}</span>
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[9px] uppercase text-zinc-600 font-bold mb-1">Continuity</span>
                                <span className="text-[11px] text-[var(--ms-gold)] font-mono font-bold">{s.continuityScore}%</span>
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </section>

            <section className="space-y-10 pt-16 border-t border-[var(--ms-border)]">
               <h4 className="text-[11px] font-bold uppercase tracking-[0.5em] text-zinc-600">Continuity_Directives</h4>
               <div className="p-10 bg-[var(--ms-bg-base)] border border-[var(--ms-border)] rounded-[48px] relative overflow-hidden group shadow-inner">
                  <div className="absolute top-0 left-0 w-2 h-full bg-[var(--ms-gold)] opacity-30" />
                  <p className="text-[12px] text-zinc-400 italic leading-relaxed font-serif pl-6">
                    "Maintain Temporal_Coldness: All cuts must occur on sub-harmonic rhythm peaks. Ensure Seol-hee's eye-line continuity remains within 0.04% deviance across neural upscales."
                  </p>
                  <div className="flex gap-3 items-center mt-10 pl-6">
                     <div className="w-3 h-3 rounded-full bg-[var(--ms-gold)] shadow-[0_0_15px_var(--ms-gold)] animate-pulse" />
                     <span className="text-[11px] font-bold text-[var(--ms-gold)] uppercase tracking-[0.3em]">AI_Rhythm_Locked</span>
                  </div>
               </div>
            </section>
         </div>
      </div>
    </div>
  );
}
