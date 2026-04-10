import React, { useState, useEffect } from "react";
import { usePipeline } from "./PipelineProvider";

interface ScriptVersion {
  id: string;
  version: string;
  date: string;
  author: string;
  changes: string;
}

const mockVersions: ScriptVersion[] = [
  { id: "v1-aeon", version: "Draft 0.8", date: "2026-04-05", author: "AI Assistant", changes: "Refined Act 2 dialogue" },
  { id: "v2-aeon", version: "Draft 1.0 (Locked)", date: "2026-04-08", author: "Lead Writer", changes: "Locked for production design" },
];

export default function DevelopmentView() {
  const [activeTab, setActiveTab] = useState<"Drafts" | "Characters" | "World">("Drafts");
  const { getEngineForAgent, globalHealthScore, getAgentMeta } = usePipeline();
  const assignedEngine = getEngineForAgent("WRIT");
  const meta = getAgentMeta("WRIT");

  return (
    <div className="flex flex-col h-full bg-[var(--ms-bg-base)] border border-[var(--ms-border)] rounded-3xl overflow-hidden shadow-3xl animate-in fade-in duration-1000 group">
      <div className="flex items-center justify-between px-10 py-8 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-10">
          <div className="flex flex-col gap-1">
             <h3 className="font-serif text-3xl font-bold text-white tracking-tighter uppercase">Scenario Development</h3>
             <div className="flex items-center gap-3">
               <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-mono italic">AU_WRIT_PROTOCOL // NARRATIVE_SYNTHESIS</span>
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

        <nav className="flex gap-4">
          {(["Drafts", "Characters", "World"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 text-[10px] font-bold tracking-widest uppercase rounded-lg transition-all border ${
                activeTab === tab 
                  ? "bg-[var(--ms-gold)] text-black border-[var(--ms-gold)]" 
                  : "text-zinc-500 border-white/5 hover:border-white/20 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
        <div className="flex gap-3">
          <button className="px-4 py-1.5 bg-[#1a1a1a] text-[10px] text-[var(--ms-gold)] font-bold uppercase tracking-widest border border-[var(--ms-gold)]/30 rounded hover:bg-[var(--ms-gold)]/10">
            Open Script Writer
          </button>
          <button className="px-4 py-1.5 bg-[var(--ms-gold)] text-[var(--ms-bg)] text-[10px] font-bold uppercase tracking-widest rounded shadow-lg">
            New Version
          </button>
        </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
        {/* Main Workspace */}
        <div className="flex-grow p-8 overflow-y-auto">
          {activeTab === "Drafts" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockVersions.map((v) => (
                  <div key={v.id} className="bg-[var(--ms-bg)] border border-[var(--ms-border)] p-6 rounded-xl hover:border-[var(--ms-gold)]/50 transition-all group relative">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-mono text-[var(--ms-gold)] font-bold">{v.date}</span>
                      <span className="text-[9px] uppercase tracking-widest text-[var(--ms-text-dim)]">{v.author}</span>
                    </div>
                    <h4 className="text-xl font-serif font-bold text-[var(--ms-text)] mb-2">{v.version}</h4>
                    <p className="text-xs text-[var(--ms-text-dim)] italic mb-6">"{v.changes}"</p>
                    <div className="flex justify-between items-center">
                      <button className="text-[10px] text-[var(--ms-gold)] border-b border-[var(--ms-gold)]/30 pb-0.5 uppercase tracking-widest font-bold">Review Script</button>
                      <button className="text-[10px] text-[var(--ms-text-dim)] hover:text-[var(--ms-text)] uppercase tracking-widest font-bold">Download (.fountain)</button>
                    </div>
                  </div>
                ))}

                {/* AI Brainstorming Card */}
                <div className="bg-gradient-to-br from-[var(--ms-bg)] to-blue-900/10 border border-blue-900/40 p-6 rounded-xl relative overflow-hidden group">
                  <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-blue-500/10 blur-[40px] rounded-full" />
                  <div className="relative z-10">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 block">AI Insight Agent</span>
                    <h4 className="text-lg font-serif font-bold text-[var(--ms-text)] mb-3">Narrative Consistency Audit</h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed mb-6">
                      I've detected a conflict in Aeon's motivation in Act 2, Scene 4 compared to the original character dossier.
                    </p>
                    <button className="w-full py-2 bg-blue-900/30 border border-blue-900/50 text-blue-300 text-[10px] uppercase font-bold tracking-widest rounded hover:bg-blue-900/40">
                      View AI Recommendations
                    </button>
                  </div>
                </div>
              </div>

              {/* Storyboard Preview Section */}
              <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--ms-text-dim)]">Storyboard Preview (Sync: storyboard-maker)</h4>
                  <button className="text-[10px] text-[var(--ms-gold)] hover:underline">Manage All Frames</button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-video bg-[var(--ms-bg)] border border-[var(--ms-border)] rounded-lg overflow-hidden group relative cursor-pointer">
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[10px] text-white font-bold uppercase tracking-widest">Frame {i}</span>
                      </div>
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-xs text-gray-600 font-serif">
                        Scene Frame {i}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "Characters" && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--ms-text-dim)]">Character Archetype Deep-Dive</h3>
                 <div className="flex gap-3">
                   <button className="text-[9px] text-[var(--ms-gold)] border border-[var(--ms-gold)]/30 px-3 py-1 rounded hover:bg-[var(--ms-gold)]/10">Run Psychology Audit</button>
                   <button className="text-[9px] bg-[var(--ms-gold)] text-[var(--ms-bg)] px-3 py-1 rounded font-bold uppercase tracking-widest">Character Visual Studio</button>
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {["Aeon (Protagonist)", "The Pyongyang Hacker", "Minister of NIS"].map(name => (
                    <div key={name} className="p-5 bg-[var(--ms-bg)] border border-[var(--ms-border)] rounded-xl hover:border-[var(--ms-gold)]/50 transition-all">
                       <h4 className="text-xl font-serif font-bold text-[var(--ms-text)] mb-2">{name}</h4>
                       <span className="text-[8px] font-mono text-blue-400 uppercase tracking-widest block mb-4">Core Paradox: Differentiated</span>
                       <p className="text-[10px] text-[var(--ms-text-dim)] leading-relaxed italic border-l-2 border-[var(--ms-gold)]/30 pl-3">
                         Motivation: Survival mixed with computational obsession. Unique flaw: Periodic digital hallucinations.
                       </p>
                    </div>
                  ))}
               </div>
            </div>
          )}
          {activeTab === "World" && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--ms-text-dim)]">Techno-Political World Rules</h3>
                 <button className="text-[9px] text-[var(--ms-gold)] border border-[var(--ms-gold)]/30 px-3 py-1 rounded">Stress-test Economy</button>
               </div>
               <div className="bg-[var(--ms-bg)] border border-[var(--ms-border)] p-8 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--ms-gold)]/5 blur-3xl rounded-full" />
                  <div className="space-y-6 relative z-10">
                     <div className="pb-4 border-b border-[var(--ms-border)]">
                        <h4 className="text-sm font-bold text-[var(--ms-gold)] uppercase tracking-widest mb-2">The Apex Exchange Law</h4>
                        <p className="text-xs text-[var(--ms-text-dim)] leading-relaxed italic">
                          "In the world of Bit-Savior, all financial transactions are governed by the APEX ledger—a hidden quantum blockchain that pre-calculates social credit based on digital obedience."
                        </p>
                     </div>
                     <div className="pb-4 border-b border-[var(--ms-border)]">
                        <h4 className="text-sm font-bold text-[var(--ms-gold)] uppercase tracking-widest mb-2">North-South Digital DMZ</h4>
                        <p className="text-xs text-[var(--ms-text-dim)] leading-relaxed italic">
                          "A literal firewall constructed of massive satellite arrays that prevents unauthorized computational exports between Pyongyang and Seoul."
                        </p>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Sidebar: Development Stats */}
        <div className="w-72 border-l border-[var(--ms-border)] bg-[var(--ms-bg)]/30 p-8 space-y-12">
           <div>
             <span className="text-[10px] text-[var(--ms-gold)] font-bold uppercase tracking-widest block mb-4">Dev Status</span>
             <div className="space-y-3">
               <div className="flex justify-between items-center text-xs">
                 <span className="text-[var(--ms-text-dim)]">Current Goal</span>
                 <span className="text-[var(--ms-text)]">Draft 1.0</span>
               </div>
               <div className="w-full h-1 bg-[var(--ms-border)] rounded-full overflow-hidden">
                 <div className="w-[85%] h-full bg-[var(--ms-gold)]" />
               </div>
               <div className="flex justify-between text-[10px] text-[var(--ms-text-dim)] uppercase">
                 <span>85% Complete</span>
                 <span className="text-[var(--ms-gold)]">Final Review</span>
               </div>
             </div>
           </div>

           <div className="pt-8 border-t border-[var(--ms-border)]">
              <span className="text-[10px] text-[var(--ms-gold)] font-bold uppercase tracking-widest block mb-4">Recent Feedback</span>
              <div className="text-[11px] text-[var(--ms-text-dim)] space-y-4 italic leading-relaxed">
                <p>"The dialogue in the cafe scene feels too modern. Let's push for more noir stylization." — Director</p>
                <p>"We need to emphasize the visual contrast between the two locations more." — Prod Designer</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
