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
    id: string;
    title: string;
    logline: string;
    genre: string;
    dna?: any;
    concept?: any;
    script?: string;
    is_4k_approved?: boolean;
    master_2k_path?: string;
    master_4k_path?: string;
  };
  evaluations: EvaluationLog[];
  onApprove4K?: (projectId: string) => void;
}

export default function ProductionBibleView({ project, evaluations, onApprove4K }: ProductionBibleProps) {
  return (
    <div className="w-full bg-[var(--ms-bg-base)] text-[var(--ms-text-main)] overflow-hidden rounded-[var(--ms-radius-lg)] border border-[var(--ms-gold-border)]/20 shadow-[var(--ms-glass-shadow)] transition-all duration-1000">
      {/* Cinematic Cover Section: Landscape Layout */}
      <div className="relative h-[600px] w-full flex items-center justify-center overflow-hidden border-b border-[var(--ms-gold-border)]/20 bg-black">
        {/* Background Texture & Glow */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--ms-gold-haze)] rounded-full blur-[120px] opacity-10" />
        
        <div className="relative z-10 flex flex-col items-center text-center px-12 max-w-4xl">
           <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-[1px] bg-[var(--ms-gold)]" />
              <span className="text-[12px] font-mono font-bold uppercase tracking-[0.8em] text-[var(--ms-gold)]">Final Deliverable</span>
              <div className="w-12 h-[1px] bg-[var(--ms-gold)]" />
           </div>
           
           <h1 className="text-8xl font-serif text-[var(--ms-text-bright)] tracking-tight mb-6">
             {project.title}
           </h1>
           
           <p className="text-2xl font-serif italic text-[var(--ms-gold)] opacity-70 mb-12 leading-relaxed">
             "{project.logline}"
           </p>
           
           <div className="flex gap-12 border-t border-[var(--ms-gold-border)]/20 pt-8 w-full justify-center">
              <div className="flex flex-col gap-1">
                 <span className="text-[9px] font-mono text-[var(--ms-text-dim)] uppercase tracking-widest">Metadata / Genre</span>
                 <span className="text-sm font-bold uppercase tracking-tighter text-[var(--ms-text-bright)]">{project.genre}</span>
              </div>
              <div className="flex flex-col gap-1">
                 <span className="text-[9px] font-mono text-[var(--ms-text-dim)] uppercase tracking-widest">Master / Release</span>
                 <span className="text-sm font-bold uppercase tracking-tighter text-[var(--ms-text-bright)]">2026 // PROD_BIBLE</span>
              </div>
           </div>
        </div>
      </div>

      {/* Magazine Content: Two Column Layout */}
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 p-20">
        
        {/* Left Column: Visual DNA & SAIL integrity */}
        <div className="lg:col-span-4 space-y-16">
           <section>
              <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.5em] text-[var(--ms-gold)] mb-8 flex items-center gap-4">
                <span className="opacity-50">01</span> Visual DNA Configuration
              </h2>
              <div className="space-y-8">
                 <div className="flex flex-col gap-3 group">
                    <span className="text-[9px] uppercase tracking-widest text-[var(--ms-text-dim)] border-l-2 border-[var(--ms-gold)] pl-3">Cinematic_Rules</span>
                    <div className="bg-black/40 p-6 border border-[var(--ms-gold-border)]/10 rounded-sm font-mono text-[11px] leading-relaxed text-[var(--ms-text-dim)]">
                       {JSON.stringify(project.dna || { contrast: "High", lighting: "Tactical Tech-Noir", palette: "Cold Teals & Industrial Green" }, null, 2)}
                    </div>
                 </div>
                 <div className="flex flex-col gap-3 group">
                    <span className="text-[9px] uppercase tracking-widest text-[var(--ms-text-dim)] border-l-2 border-[var(--ms-gold)] pl-3">Set_Design_Principles</span>
                    <div className="bg-black/40 p-6 border border-[var(--ms-gold-border)]/10 rounded-sm font-mono text-[11px] leading-relaxed text-[var(--ms-text-dim)]">
                       {JSON.stringify(project.concept || { focus: "Spatial Depth", materials: "Polished Concrete, Exposed Wiring, Neon Strips" }, null, 2)}
                    </div>
                 </div>
              </div>
           </section>

           <section>
              <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.5em] text-[var(--ms-gold)] mb-8 flex items-center gap-4">
                <span className="opacity-50">02</span> SAIL Integrity Manifest
              </h2>
              <div className="space-y-6">
                 {evaluations.map((evalLog, idx) => (
                   <div key={idx} className="flex flex-col p-4 bg-black/20 border border-[var(--ms-gold-border)]/5 hover:border-[var(--ms-gold-border)]/20 transition-all rounded-sm">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-[9px] font-bold text-[var(--ms-gold)] font-mono uppercase tracking-widest">{evalLog.step}</span>
                         <span className="text-lg font-serif font-bold text-[var(--ms-text-bright)]">SOQ_{evalLog.score}</span>
                      </div>
                      <p className="text-[10px] text-[var(--ms-text-dim)] uppercase tracking-tighter line-clamp-2">{evalLog.feedback}</p>
                   </div>
                 ))}
              </div>
           </section>
        </div>

        {/* Right Column: Screenplay Master */}
        <div className="lg:col-span-8">
           <section className="h-full flex flex-col">
              <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.5em] text-[var(--ms-gold)] mb-8 flex items-center gap-4">
                <span className="opacity-50">03</span> Screenplay Master Data
              </h2>
              <div className="flex-1 bg-black/40 p-16 font-serif leading-loose text-[var(--ms-text-dim)] border border-[var(--ms-gold-border)]/10 relative overflow-hidden">
                 {/* Decorative Corner HUD */}
                 <div className="absolute top-0 right-0 p-4 font-mono text-[7px] text-[var(--ms-gold)]/40 uppercase tracking-widest border-b border-l border-[var(--ms-gold-border)]/10">Archive_Encrypted_v7.2</div>
                 
                 {project.script ? (
                   <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap selection:bg-[var(--ms-gold)] selection:text-black">{project.script}</div>
                 ) : (
                   <div className="flex flex-col items-center justify-center h-full gap-4 py-20 grayscale opacity-40">
                      <div className="w-16 h-16 border-t-2 border-[var(--ms-gold)] rounded-full animate-spin" />
                      <p className="italic text-lg">Master screenplay stream is being synchronized from the Vault...</p>
                   </div>
                 )}
              </div>
           </section>
        </div>
      </div>

      {/* Authentication Footer */}
      <footer className="px-20 py-12 border-t border-[var(--ms-gold-border)]/20 bg-black/60 flex justify-between items-center">
         <div className="flex flex-col gap-2">
            <span className="text-[9px] font-mono text-[var(--ms-text-dim)] uppercase tracking-[0.4em]">AUTHENTICATED_ORCHESTRATOR</span>
            <span className="text-xl font-serif text-[var(--ms-text-bright)]">Marionette Studio <span className="text-[var(--ms-gold)] italic">Elite</span></span>
         </div>

         {/* Phase 7: Mastering & Approval Hub */}
         <div className="flex bg-[var(--ms-bg-base)] border border-[var(--ms-gold-border)]/20 rounded-lg p-6 gap-10 items-center shadow-inner">
            <div className="flex flex-col gap-1">
               <span className="text-[8px] font-mono text-[var(--ms-text-ghost)] uppercase tracking-widest">Mastering_Status</span>
               <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${project.is_4k_approved ? 'bg-green-500' : 'bg-[var(--ms-gold)]'} animate-pulse`} />
                  <span className="text-xs font-bold uppercase tracking-tighter text-[var(--ms-text-bright)]">
                    {project.is_4k_approved ? "4K_APPROVED" : "2K_PREVIEW_READY"}
                  </span>
               </div>
            </div>
            
            <div className="h-10 w-[1px] bg-[var(--ms-gold-border)]/20" />

            <div className="flex gap-4">
               {project.is_4k_approved ? (
                  <div className="flex flex-col gap-1">
                     <span className="text-[8px] font-mono text-[var(--ms-gold)] uppercase tracking-widest">Final_Asset</span>
                     <button className="px-6 py-2 bg-green-900/30 border border-green-500/50 text-green-400 text-[9px] font-bold uppercase tracking-widest rounded-sm">
                        Download 4K Master
                     </button>
                  </div>
               ) : (
                  <button 
                    onClick={() => onApprove4K?.(project.id)}
                    className="px-8 py-3 bg-gradient-to-r from-[var(--ms-gold)] to-[#F5E6B3] text-black text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm hover:scale-105 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                  >
                    Approve 4K Mastering
                  </button>
               )}
            </div>
         </div>

         <div className="flex items-center gap-12">
            <div className="flex flex-col items-end gap-1">
               <span className="text-[8px] font-mono text-[var(--ms-gold)] uppercase tracking-widest">Block_Hash</span>
               <span className="text-[10px] font-mono text-[var(--ms-text-dim)]">{Math.random().toString(36).substring(7).toUpperCase()}</span>
            </div>
            <div className="w-20 h-20 bg-[var(--ms-gold)]/5 border border-[var(--ms-gold-border)]/30 flex items-center justify-center p-2 relative">
               <div className="absolute inset-0 bg-gradient-to-br from-[var(--ms-gold)]/10 to-transparent pointer-events-none" />
               <div className="text-[7px] text-[var(--ms-gold)] font-mono text-center uppercase tracking-tighter font-bold">SCAN_FOR_VAULT_PROVENANCE</div>
            </div>
         </div>
      </footer>
    </div>
  );
}
