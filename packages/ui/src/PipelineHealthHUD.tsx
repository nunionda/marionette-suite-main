"use client";

import React, { useState, useEffect } from "react";

interface HealingEvent {
  id: string;
  step: string;
  score: number;
  retry: number;
  feedback: string;
  timestamp: string;
}

export default function PipelineHealthHUD() {
  const [events, setEvents] = useState<HealingEvent[]>([]);
  const [integrity, setIntegrity] = useState(94.2);

  // Mock: 시뮬레이션을 위한 데이터 자동 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setIntegrity(prev => Math.min(100, Math.max(90, prev + (Math.random() - 0.5))));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-6 p-10 gstack-glass rounded-[var(--ms-radius-lg)] shadow-2xl relative overflow-hidden h-full animate-in fade-in slide-in-from-right-10 duration-700">
      
      {/* Background Pulse Layer */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--ms-green)] rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="relative z-10">
         <div className="flex justify-between items-start mb-10">
            <div className="flex flex-col gap-2">
               <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--ms-green)]">Autonomous Monitor</span>
                  <div className="w-2 h-2 rounded-full bg-[var(--ms-green)] shadow-[0_0_10px_var(--ms-green)] animate-ping" />
               </div>
               <h2 className="text-3xl font-serif font-bold text-white tracking-tight">Pipeline Health</h2>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-4xl font-code font-bold text-[var(--ms-text-bright)]">{integrity.toFixed(1)}%</span>
                <span className="text-[9px] text-[var(--ms-text-dim)] font-bold uppercase tracking-widest">Global Integrity</span>
            </div>
         </div>

         {/* Health Indicators */}
         <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="p-6 bg-black/30 border border-white/5 rounded-2xl flex flex-col gap-2">
               <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Self-Healing Swarm</span>
               <div className="flex items-center justify-between">
                  <span className="text-xl font-mono text-white">ACTIVE</span>
                  <span className="px-2 py-0.5 bg-[var(--ms-green)]/10 text-[var(--ms-green)] text-[9px] font-bold rounded">LEVEL_4</span>
               </div>
            </div>
            <div className="p-6 bg-black/30 border border-white/5 rounded-2xl flex flex-col gap-2">
               <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Correction Sync</span>
               <div className="flex items-center justify-between">
                  <span className="text-xl font-mono text-white">99.8%</span>
                  <div className="flex gap-1">
                     {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[var(--ms-green)]" />)}
                  </div>
               </div>
            </div>
         </div>

         {/* Healing Event Log */}
         <div className="flex-grow flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2 px-2">
               <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Diagnostic Reflection Log</span>
               <span className="text-[10px] text-zinc-700 font-mono">SC_08_02_CORRECTION</span>
            </div>
            
            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 scrollbar-hide">
               {[
                 { step: "ConceptArtist", score: 54, retry: 1, feedback: "Insufficient atmospheric haze. Increase volumetric fog particles.", status: "healing" },
                 { step: "LocationScout", score: 82, retry: 1, feedback: "Urban density verified. Adjusted rainy reflections.", status: "success" },
                 { step: "Generalist", score: 42, retry: 2, feedback: "Temporal jitter detected in frame 24-48. Re-stabilizing cadence.", status: "healing" },
               ].map((log, i) => (
                 <div key={i} className="group p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-[var(--ms-green)]/20 transition-all flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                       <div className="flex items-center gap-3">
                          <span className={`w-1.5 h-1.5 rounded-full ${log.status === "healing" ? "bg-amber-500 animate-pulse" : "bg-[var(--ms-green)]"}`} />
                          <span className="text-[11px] font-bold text-white uppercase tracking-widest">{log.step}</span>
                          <span className="text-[9px] text-zinc-600 font-mono">#{log.retry} RETRY</span>
                       </div>
                       <span className={`text-[10px] font-mono font-bold ${log.score < 60 ? "text-amber-500" : "text-[var(--ms-green)]"}`}>
                          SOQ: {log.score}%
                       </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono leading-relaxed italic group-hover:text-zinc-300 transition-colors">
                       "{log.feedback}"
                    </p>
                    {log.status === "healing" && (
                      <div className="mt-1 w-full h-0.5 bg-zinc-900 rounded-full overflow-hidden">
                         <div className="h-full bg-amber-500/50 w-[60%] animate-pulse" />
                      </div>
                    )}
                 </div>
               ))}
            </div>
         </div>

         {/* Master Intelligence Status */}
         <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
            <div className="flex flex-col">
               <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Core Awareness</span>
               <span className="text-[10px] text-white font-mono tracking-tighter">SWARM_SYNC_ESTABLISHED</span>
            </div>
            <div className="flex items-center gap-4 text-[9px] font-bold text-zinc-500">
               <span className="hover:text-white cursor-pointer transition-colors">DUMP_LOG</span>
               <span className="text-[var(--ms-green)] cursor-pointer hover:underline">RE-CALIBRATE</span>
            </div>
         </div>
      </div>
    </div>
  );
}
