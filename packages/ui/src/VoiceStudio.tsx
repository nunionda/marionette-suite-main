import React, { useState, useEffect } from "react";
import { usePipeline } from "./PipelineProvider";

interface VoiceStem {
  id: string;
  character: string;
  status: "Aligned" | "Processing" | "Ready";
  sampleRate: string;
  phonemeCount: number;
}

const stems: VoiceStem[] = [
  { id: "STEM_001", character: "Aeon (Primary)", status: "Aligned", sampleRate: "48kHz", phonemeCount: 1240 },
  { id: "STEM_002", character: "Hacker (Voice-Overlay)", status: "Processing", sampleRate: "48kHz", phonemeCount: 842 },
  { id: "STEM_003", character: "Narrator (Oracle)", status: "Ready", sampleRate: "44.1kHz", phonemeCount: 2310 }
];

export default function VoiceStudio() {
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);
  const { getEngineForAgent, globalHealthScore, getAgentMeta } = usePipeline();
  const assignedEngine = getEngineForAgent("VOIC");
  const meta = getAgentMeta("VOIC");

  useEffect(() => {
    if (isProcessing && progress < 100) {
      const timer = setInterval(() => {
        setProgress(p => Math.min(p + 0.4, 100));
      }, 50);
      return () => clearInterval(timer);
    }
  }, [isProcessing, progress]);

  return (
    <div className="flex flex-col h-full bg-[var(--ms-bg-base)] border border-[var(--ms-border)] rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-right-10 duration-700 group">
      
      {/* Studio Header */}
      <div className="px-10 py-8 border-b border-[var(--ms-border)] bg-black/40 flex items-center justify-between backdrop-blur-3xl">
         <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-serif font-bold text-[var(--ms-gold)] tracking-tight">Voice Synthesis Lab</h3>
            <div className="flex items-center gap-3">
               <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em]">Neural_Vocal_Reconstruction_Node_v9</p>
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

         <div className="flex items-center gap-8 px-8 py-4 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-xl">
            <div className="flex flex-col items-end gap-1">
               <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Neural_Auteur</span>
               <span className="text-xs font-mono text-[var(--ms-gold)] font-bold">{assignedEngine?.name || "Initializing..."}</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col items-end gap-1">
               <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Phonic_Latency</span>
               <span className={`text-xs font-mono font-bold ${
                 (assignedEngine?.latency ?? 0) > 1000 ? "text-amber-500" : "text-green-500"
               }`}>
                 {assignedEngine ? `${Math.floor(assignedEngine.latency)}ms` : "---"}
               </span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col items-end gap-1">
               <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Integrity</span>
               <span className="text-xs font-mono text-white font-bold">{globalHealthScore}%</span>
            </div>
         </div>

         <div className="flex gap-4">
            <button className="px-6 py-2.5 bg-transparent border border-[var(--ms-gold)]/30 text-[var(--ms-gold)] text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-[var(--ms-gold)]/10 transition-all">
              Clone LoRA Weights
            </button>
            <button className="px-6 py-2.5 bg-[var(--ms-gold)] text-black text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-2xl shadow-[var(--ms-gold)]/20">
              Execute Phonic Sync
            </button>
         </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
         
         {/* Vocal Visualization Area */}
         <div className="flex-grow bg-black relative flex flex-col items-center justify-center p-16 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-[var(--ms-gold)]/10 pointer-events-none" />
            
            {/* Waveform Viewport */}
            <div className="w-full aspect-[21/9] bg-[var(--ms-bg-base)] rounded-3xl border border-white/5 relative overflow-hidden shadow-[0_0_100px_rgba(212,175,55,0.05)] group">
               <div className="absolute inset-0 flex items-center justify-center p-12">
                  <div className="w-full h-32 flex items-center justify-between gap-1">
                    {Array.from({ length: 120 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="w-1 bg-[var(--ms-gold)] rounded-full transition-all duration-300 opacity-40 group-hover:opacity-80"
                        style={{ 
                          height: `${Math.random() * 80 + 10}%`,
                          animationDelay: `${i * 20}ms`,
                          animation: 'pulse 1.5s infinite ease-in-out'
                        }}
                      />
                    ))}
                  </div>
               </div>

               {/* Overlay HUD */}
               <div className="absolute inset-0 p-10 flex flex-col justify-between z-30 pointer-events-none">
                  <div className="flex justify-between items-start">
                     <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-mono text-[var(--ms-gold)] uppercase tracking-[0.2em] bg-black/60 px-3 py-1 rounded border border-[var(--ms-gold)]/20">PROSODY_ANALYSIS: ACTIVE</span>
                        <span className="text-sm font-bold text-white uppercase tracking-widest">AEON_MASTER_SYNTH // TAKE_08</span>
                     </div>
                     <div className="flex gap-4">
                        <div className="px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2 backdrop-blur-md">
                           <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                           <span className="text-[9px] font-mono font-bold text-green-500 uppercase tracking-widest">PHONEME_LOCK</span>
                        </div>
                        <div className="px-3 py-1.5 bg-[var(--ms-gold)]/10 border border-[var(--ms-gold)]/30 rounded-lg flex items-center gap-2 backdrop-blur-md">
                           <span className="text-[9px] font-mono font-bold text-[var(--ms-gold)] uppercase tracking-widest">48kHz / 24-BIT</span>
                        </div>
                     </div>
                  </div>

                  <div className="flex justify-between items-end">
                     <div className="flex gap-16">
                        <div className="flex flex-col">
                           <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Synthesized_Samples</span>
                           <span className="text-2xl font-mono text-white tracking-widest">{Math.floor(progress * 12840).toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Neural_Density</span>
                           <span className="text-2xl font-mono text-white tracking-widest">∆ 0.94x</span>
                        </div>
                     </div>
                     <div className="flex flex-col items-end gap-3">
                         <span className="text-[9px] text-[var(--ms-gold)] uppercase font-bold tracking-[0.3em]">Larynx_Thermal_Balance</span>
                         <div className="flex gap-2">
                            {[1,1,1,1,0.8,0.4,0.1].map((v, i) => (
                               <div key={i} className="w-8 h-1 rounded-full bg-[var(--ms-gold)]" style={{ opacity: v * 0.8 }} />
                            ))}
                         </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Progress Track */}
            <div className="w-full max-w-4xl mt-16 space-y-6">
               <div className="flex justify-between items-end text-[11px] font-mono">
                  <div className="flex flex-col gap-2">
                     <span className="text-zinc-500 uppercase tracking-[0.4em]">Neural_Vocal_Extraction</span>
                     <span className="text-[var(--ms-gold)] font-bold text-lg">{progress.toFixed(1)}% RECONSTRUCTED</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-green-500 font-bold uppercase tracking-widest">Prosody_Optimized</span>
                    <span className="text-zinc-600 italic">Syncing Phonetic Drift...</span>
                  </div>
               </div>
               <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/10 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-[var(--ms-gold)] via-amber-400 to-[var(--ms-gold)] shadow-[0_0_25px_var(--ms-gold)] transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  />
               </div>
            </div>
         </div>

         {/* Tuning Sidebar */}
         <div className="w-96 border-l border-[var(--ms-border)] bg-[var(--ms-bg-base)] p-12 space-y-12">
            <section className="space-y-8">
               <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--ms-gold)]">Session_Voice_Assets</h4>
               <div className="space-y-4">
                  {stems.map((s) => (
                    <div key={s.id} className="p-5 bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-2xl group hover:border-[var(--ms-gold)]/40 transition-all cursor-pointer shadow-xl">
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-widest">{s.id}</span>
                          <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded border ${
                            s.status === "Aligned" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
                          }`}>{s.status}</span>
                       </div>
                       <h5 className="text-base font-serif font-bold text-white group-hover:text-[var(--ms-gold)] transition-colors">{s.character}</h5>
                       <div className="flex gap-4 mt-3">
                          <div className="flex flex-col">
                             <span className="text-[8px] uppercase text-zinc-600 font-bold">Res</span>
                             <span className="text-[10px] text-zinc-300 font-mono">{s.sampleRate}</span>
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[8px] uppercase text-zinc-600 font-bold">Phonemes</span>
                             <span className="text-[10px] text-zinc-300 font-mono">{s.phonemeCount}</span>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </section>

            <section className="space-y-8 pt-10 border-t border-[var(--ms-border)]">
               <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500">Auteur_Vocal_Direction</h4>
               <div className="p-8 bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-[40px] relative overflow-hidden group shadow-2xl">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--ms-gold)] opacity-50" />
                  <p className="text-[11px] text-zinc-400 italic leading-relaxed font-serif pl-4">
                    "Injecting Cold_Symmetry_v4: Reduce mid-range warmth by 15%, increase syllabic sharp-cutoff. Final result should feel clinically detached but biologically present."
                  </p>
                  <div className="flex gap-2 items-center mt-6 pl-4">
                     <div className="w-2 h-2 rounded-full bg-[var(--ms-gold)] shadow-[0_0_10px_var(--ms-gold)]" />
                     <span className="text-[9px] font-bold text-[var(--ms-gold)] uppercase tracking-widest">LoRA_Vibe_Locked</span>
                  </div>
               </div>
            </section>
         </div>
      </div>
    </div>
  );
}
