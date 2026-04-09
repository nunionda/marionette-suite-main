"use client";

import React from "react";

export default function GlobalAnalytics() {
  return (
    <div className="grid grid-cols-12 gap-8 h-full animate-in fade-in zoom-in-95 duration-700">
      
      {/* Left Column: Strategic Metrics */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
         
         {/* Total Production Cost */}
         <div className="p-10 bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-[32px] flex flex-col gap-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--ms-gold)]/5 rounded-full blur-3xl -mr-10 -mt-10" />
            <div className="flex flex-col gap-1">
               <span className="text-[10px] font-mono text-[var(--ms-gold)] font-bold uppercase tracking-[0.4em]">Total Opex</span>
               <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Cumulative API Expenditure</h3>
            </div>
            <div className="flex items-baseline gap-4">
               <span className="text-6xl font-serif font-bold text-white">$14,282</span>
               <span className="text-xs font-mono text-[var(--ms-green)] font-bold">+12% LAST_WEEK</span>
            </div>
            <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
               <div className="h-full bg-[var(--ms-gold)] w-[68%]" />
            </div>
            <p className="text-[10px] text-zinc-600 font-mono leading-relaxed">
               Current expenditure within predicted quarterly boundaries. <br/>
               High allocation on Video-Gen cluster (Veo 3.1).
            </p>
         </div>

         {/* Studio SOQ Benchmark */}
         <div className="p-10 bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-[32px] flex flex-col gap-6 shadow-2xl">
            <div className="flex flex-col gap-1">
               <span className="text-[10px] font-mono text-[var(--ms-gold)] font-bold uppercase tracking-[0.4em]">Cinematic Quality</span>
               <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Global SOQ Average</h3>
            </div>
            <div className="flex flex-col gap-4">
               <div className="flex justify-between items-end">
                  <span className="text-6xl font-serif font-bold text-white">9.42</span>
                  <div className="flex flex-col items-end">
                     <span className="text-[10px] text-[var(--ms-green)] font-bold uppercase tracking-widest">Quality High</span>
                     <span className="text-[9px] text-zinc-600 font-mono">Benchmark: 8.50</span>
                  </div>
               </div>
               <div className="grid grid-cols-5 gap-1 h-12">
                  {[80, 70, 95, 100, 85].map((h, i) => (
                    <div key={i} className="bg-zinc-900 rounded-sm relative group overflow-hidden">
                       <div 
                        className="absolute bottom-0 left-0 w-full bg-[var(--ms-gold)]/40 group-hover:bg-[var(--ms-gold)] transition-all" 
                        style={{ height: `${h}%` }} 
                       />
                    </div>
                  ))}
               </div>
            </div>
         </div>

      </div>

      {/* Right Column: Active Production Lineage */}
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
         
         {/* Live Project Pulse */}
         <div className="flex-grow p-10 bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-[40px] shadow-2xl flex flex-col">
            <div className="flex justify-between items-center mb-10">
               <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-[var(--ms-gold)] font-bold uppercase tracking-[0.4em]">Fleet Status</span>
                  <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Active Production Portfolio</h3>
               </div>
               <button className="px-6 py-2 border border-zinc-800 rounded-xl text-[9px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:border-zinc-500 transition-all">
                  Full Report
               </button>
            </div>

            <div className="space-y-8">
               {[
                 { name: "NEON_DRIFT", progress: 84, status: "IN_PRODUCTION", budget: "$4,200", soq: 9.8 },
                 { name: "BIT_SAVIOR", progress: 42, status: "PRE_PRODUCTION", budget: "$1,850", soq: 9.2 },
                 { name: "SYNTH_SOUL", progress: 12, status: "DEVELOPMENT", budget: "$420", soq: 8.7 },
               ].map((project, i) => (
                 <div key={i} className="group relative flex flex-col gap-4 p-6 bg-black/20 border border-white/5 rounded-2xl hover:border-[var(--ms-gold)]/20 transition-all">
                    <div className="flex justify-between items-center">
                       <div className="flex items-center gap-6">
                          <span className={`w-2 h-2 rounded-full ${project.status === "IN_PRODUCTION" ? "bg-[var(--ms-green)]" : "bg-amber-500"}`} />
                          <h4 className="text-lg font-serif font-bold text-white tracking-widest">{project.name}</h4>
                          <span className="px-3 py-1 bg-white/5 rounded-lg text-[8px] font-mono text-zinc-500 uppercase">{project.status}</span>
                       </div>
                       <div className="flex items-center gap-10">
                          <div className="flex flex-col items-end">
                             <span className="text-[9px] text-zinc-600 font-bold tracking-widest uppercase">Spent</span>
                             <span className="text-sm font-mono text-white">{project.budget}</span>
                          </div>
                          <div className="flex flex-col items-end">
                             <span className="text-[9px] text-zinc-600 font-bold tracking-widest uppercase">SOQ</span>
                             <span className="text-sm font-mono text-[var(--ms-gold)]">{project.soq}</span>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="flex-grow h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--ms-gold)] transition-all duration-1000" style={{ width: `${project.progress}%` }} />
                       </div>
                       <span className="text-[11px] font-mono text-zinc-500 font-bold">{project.progress}%</span>
                    </div>
                 </div>
               ))}
            </div>

            {/* Industrial Load Summary */}
            <div className="mt-12 pt-10 border-t border-white/5 grid grid-cols-3 gap-10">
               {[
                 { label: "GPU_FARMS", value: "82.4%", desc: "Cluster Alpha Maxed" },
                 { label: "STORAGE_DEPTH", value: "4.1 PB", desc: "Redundant Mirroring" },
                 { label: "WORKER_THRTHREADS", value: "256", desc: "Active AI Agents" },
               ].map((item, i) => (
                 <div key={i} className="flex flex-col gap-1">
                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{item.label}</span>
                    <span className="text-2xl font-serif font-bold text-white tracking-widest">{item.value}</span>
                    <span className="text-[8px] text-zinc-700 font-mono italic">{item.desc}</span>
                 </div>
               ))}
            </div>
         </div>

      </div>

    </div>
  );
}
