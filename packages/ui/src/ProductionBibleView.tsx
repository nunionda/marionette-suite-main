"use client";

import React from "react";

interface EvaluationLog {
  step: string;
  score: number;
  feedback: string;
  decision: string;
}

interface ProductionBibleProps {
  project: {
    title: string;
    logline: string;
    genre: string;
    dna?: any;
    concept?: any;
    script?: string;
  };
  evaluations: EvaluationLog[];
}

export default function ProductionBibleView({ project, evaluations }: ProductionBibleProps) {
  return (
    <div className="w-full max-w-5xl mx-auto bg-white text-black p-12 shadow-2xl min-h-[1200px] border-l-8 border-[var(--ms-green)] font-sans print:p-0 print:shadow-none print:border-none">
      {/* Cover Page Logic (Simplified for View) */}
      <header className="mb-20 border-b-4 border-black pb-8">
        <div className="flex justify-between items-start mb-12">
           <div className="flex flex-col">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.6em] text-[var(--ms-green)] mb-4 bg-black px-2 py-1 inline-block w-fit">Marionette Studio // Final Deliverable</span>
              <h1 className="text-6xl font-black uppercase tracking-tighter leading-none mb-4">{project.title}</h1>
              <p className="text-xl font-medium tracking-tight border-l-4 border-[var(--ms-green)] pl-4 italic text-zinc-600">"{project.logline}"</p>
           </div>
           <div className="text-right flex flex-col items-end">
              <div className="text-4xl font-black">2026</div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest mt-2">{project.genre} / PRODUCTION_BIBLE</div>
           </div>
        </div>
      </header>

      {/* 01. Visual DNA & Grounding */}
      <section className="mb-16">
        <h2 className="text-xs font-mono font-bold uppercase tracking-[0.4em] mb-8 border-b border-zinc-200 pb-2">01. Visual_DNA_Configuration</h2>
        <div className="grid grid-cols-2 gap-10">
           <div className="space-y-4">
              <h3 className="text-sm font-black uppercase">Core Cinematic Rules</h3>
              <div className="bg-zinc-50 p-6 rounded-sm border-l-2 border-zinc-900">
                 <pre className="text-[11px] font-mono leading-relaxed whitespace-pre-wrap">
                    {JSON.stringify(project.dna || { contrast: "High", lighting: "Tactical Tech-Noir", palette: "Cold Teals & Industrial Green" }, null, 2)}
                 </pre>
              </div>
           </div>
           <div className="space-y-4">
              <h3 className="text-sm font-black uppercase">Set Design Principles</h3>
              <div className="bg-zinc-50 p-6 rounded-sm border-l-2 border-zinc-900">
                 <pre className="text-[11px] font-mono leading-relaxed whitespace-pre-wrap">
                    {JSON.stringify(project.concept || { focus: "Spatial Depth", materials: "Polished Concrete, Exposed Wiring, Neon Strips" }, null, 2)}
                 </pre>
              </div>
           </div>
        </div>
      </section>

      {/* 02. Script Master */}
      <section className="mb-16">
        <h2 className="text-xs font-mono font-bold uppercase tracking-[0.4em] mb-8 border-b border-zinc-200 pb-2">02. Screenplay_Master</h2>
        <div className="bg-zinc-50 p-10 font-serif leading-loose text-zinc-800 border border-zinc-200">
           {project.script ? (
             <div className="prose prose-sm max-w-none whitespace-pre-wrap">{project.script}</div>
           ) : (
             <p className="italic text-zinc-400">Master screenplay draft is archived in the Digital Asset Hub.</p>
           )}
        </div>
      </section>

      {/* 03. SAIL Quality Analytics */}
      <section className="mb-16">
        <h2 className="text-xs font-mono font-bold uppercase tracking-[0.4em] mb-8 border-b border-zinc-200 pb-2">03. SAIL_Integrity_Manifest</h2>
        <div className="space-y-6">
           {evaluations.map((evalLog, idx) => (
             <div key={idx} className="flex gap-8 items-start border-b border-zinc-100 pb-6">
                <div className="w-40 flex flex-col">
                   <span className="text-[10px] font-bold uppercase text-[var(--ms-green)] font-mono mb-1">{evalLog.step}</span>
                   <div className="text-2xl font-black">SOQ {evalLog.score}</div>
                   <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-sm w-fit mt-2 ${
                     evalLog.decision === "Approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                   }`}>{evalLog.decision}</span>
                </div>
                <div className="flex-grow">
                   <h4 className="text-[11px] font-bold mb-2 uppercase tracking-tight text-zinc-400">Differential Feedback Log:</h4>
                   <p className="text-sm leading-snug">{evalLog.feedback}</p>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* Footer / Authentication */}
      <footer className="mt-auto pt-20 flex justify-between items-end border-t border-zinc-200">
         <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase">Authenticated by</span>
            <span className="text-sm font-black uppercase">Marionette Studio // Autonomous Orchestrator</span>
         </div>
         <div className="flex flex-col items-end gap-2">
            <div className="w-24 h-24 bg-zinc-900 flex items-center justify-center">
               {/* QR Placeholder for Asset Hub Link */}
               <div className="text-[8px] text-white font-mono text-center px-4">SCAN FOR ASSET_HUB URL</div>
            </div>
            <span className="text-[9px] font-mono text-zinc-400">HASH: {Math.random().toString(36).substring(7).toUpperCase()}</span>
         </div>
      </footer>
    </div>
  );
}
