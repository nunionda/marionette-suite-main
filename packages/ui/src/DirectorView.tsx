"use client";

import React, { useState } from "react";

interface ApprovalItem {
  id: string;
  department: "Art" | "Costume" | "Script" | "Camera";
  title: string;
  thumbnail?: string;
  status: "Pending" | "Approved" | "Revision";
  submittedAt: string;
  description: string;
}

const mockApprovalQueue: ApprovalItem[] = [
  { 
    id: "ap-1", 
    department: "Art", 
    title: "Main Lab Set (3D Render)", 
    submittedAt: "10:15 AM", 
    status: "Pending",
    description: "Proposed layout for the cyber-noir server room. Focus on anamorphic lens flares."
  },
  { 
    id: "ap-2", 
    department: "Costume", 
    title: "Aeon - Tactical Suit v2", 
    submittedAt: "09:30 AM", 
    status: "Pending",
    description: "Fiber optic integrated tactical vest for the night chase sequence."
  },
  { 
    id: "ap-3", 
    department: "Script", 
    title: "Scene 12 Dialogue Revision", 
    submittedAt: "Yesterday", 
    status: "Revision",
    description: "Tightened the confrontation between Aeon and the Hacker."
  }
];

export default function DirectorView() {
  const [activeTab, setActiveTab] = useState<"Approvals" | "Storyboards" | "Notes">("Approvals");

  return (
    <div className="flex flex-col h-full bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-sm overflow-hidden shadow-2xl">
      {/* Header / Workflow Selector */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--ms-border)] bg-[var(--ms-bg)]">
        <div className="flex items-center gap-6">
          <h3 className="font-mono text-xl font-bold text-[var(--ms-green)] tracking-tighter">DIRECTOR.COMMAND_NODE</h3>
          <nav className="flex gap-1">
            {(["Approvals", "Storyboards", "Notes"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-[10px] font-mono font-bold tracking-widest uppercase rounded-sm transition-all border ${
                  activeTab === tab 
                    ? "bg-[var(--ms-green)] text-[var(--ms-bg)] border-[var(--ms-green)]" 
                    : "text-[var(--ms-text-dim)] border-transparent hover:border-[var(--ms-border)]"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-1.5 text-[10px] font-mono font-bold text-[var(--ms-green)] border border-[var(--ms-green-border)] rounded-sm uppercase tracking-widest hover:bg-[var(--ms-green-dim)]">
            FINAL_LOCK
          </button>
        </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
        {/* Main Approval/Review Area */}
        <div className="flex-grow p-8 overflow-y-auto">
          {activeTab === "Approvals" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6 px-2">
                <span className="text-[10px] font-mono uppercase font-bold tracking-[0.2em] text-[var(--ms-text-dim)]">ACTION_REQUIRED</span>
                <span className="text-[10px] font-mono text-[var(--ms-green)]">[{mockApprovalQueue.length}] PENDING_REVIEW</span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {mockApprovalQueue.map((item) => (
                  <div key={item.id} className="bg-[var(--ms-bg)] border border-[var(--ms-border)] rounded-sm p-6 hover:border-[var(--ms-green-border)] transition-all group flex gap-6">
                    <div className="w-40 aspect-video bg-[var(--ms-bg-2)] rounded-sm flex items-center justify-center text-[10px] text-[var(--ms-text-dim)] font-mono border border-[var(--ms-border)]">
                      {item.department === "Art" ? "RENDER.MOCK" : item.department === "Costume" ? "SKETCH.TS" : "TRANSCRIPT.TXT"}
                    </div>
                    
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                         <div className="flex justify-between items-start mb-2">
                           <h4 className="text-xl font-mono font-bold text-[var(--ms-text)] group-hover:text-[var(--ms-green)] transition-colors">{item.title}</h4>
                           <span className="text-[9px] font-mono text-[var(--ms-text-dim)]">{item.submittedAt}</span>
                         </div>
                         <p className="text-xs font-mono text-[var(--ms-text-dim)] leading-relaxed max-w-xl">{item.description}</p>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button className="px-5 py-2 bg-[var(--ms-green-dim)] text-[var(--ms-green)] border border-[var(--ms-green-border)] text-[9px] font-mono font-bold uppercase tracking-widest rounded-sm hover:bg-[var(--ms-green)] hover:text-[var(--ms-bg)] transition-all">
                          APPROVE
                        </button>
                        <button className="px-5 py-2 bg-[var(--ms-red)]/10 text-[var(--ms-red)] border border-[var(--ms-red)]/40 text-[9px] font-mono font-bold uppercase tracking-widest rounded-sm hover:bg-[var(--ms-red)] hover:text-white transition-all">
                          REVISION
                        </button>
                        <button className="px-5 py-2 bg-[var(--ms-bg-3)] text-[var(--ms-text-dim)] border border-[var(--ms-border)] text-[9px] font-mono font-bold uppercase tracking-widest rounded-sm hover:text-[var(--ms-text)] transition-all">
                          EXPLORE_ASSET
                        </button>
                      </div>
                    </div>

                    <div className="w-32 border-l border-[var(--ms-border)] pl-6 flex flex-col items-center justify-center">
                       <span className="text-[8px] font-mono uppercase font-bold text-[var(--ms-text-dim)] mb-2">DEPT_TAG</span>
                       <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm ${
                         item.department === "Art" ? "bg-amber-900/20 text-amber-400" :
                         item.department === "Costume" ? "bg-blue-900/20 text-blue-400" : "bg-[var(--ms-bg-2)] text-[var(--ms-text-dim)]"
                       }`}>
                         {item.department}
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Storyboards" && (
             <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="aspect-video bg-[var(--ms-bg)] rounded-sm overflow-hidden relative group cursor-pointer border border-[var(--ms-border)]">
                    <div className="absolute inset-0 bg-[var(--ms-green-dim)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <span className="text-xs text-[var(--ms-green)] font-mono font-bold uppercase tracking-widest">OPEN_SCENE_0{i}</span>
                    </div>
                    <div className="w-full h-full flex items-center justify-center font-mono text-[var(--ms-green)] opacity-20 text-[10px] tracking-tighter">
                       CONCEPT_BUFFER_0{i}.DAT
                    </div>
                  </div>
                ))}
             </div>
          )}

          {activeTab === "Notes" && (
            <div className="max-w-2xl mx-auto space-y-6 text-[var(--ms-text)]">
              <textarea 
                placeholder="INPUT DIRECTOR_NOTES >>"
                className="w-full h-48 bg-[var(--ms-bg)] border border-[var(--ms-border)] p-6 rounded-sm text-[var(--ms-green)] font-mono text-sm focus:outline-none focus:border-[var(--ms-green-border)] transition-all resize-none shadow-inner"
              />
              <div className="flex justify-between items-center text-[10px] font-mono text-[var(--ms-text-dim)] uppercase">
                 <span>SYNC_STATUS: CLOUD_STABLE</span>
                 <button className="text-[var(--ms-green)] hover:underline">HISTORY_LOG</button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Vision & Tone */}
        <div className="w-80 border-l border-[var(--ms-border)] bg-[var(--ms-bg)]/50 p-8 space-y-12">
           <div>
             <span className="text-[10px] font-mono text-[var(--ms-green)] font-bold uppercase tracking-widest block mb-4">PROJECT_PHASE</span>
             <div className="space-y-2">
               <div className="flex justify-between items-center text-[10px] font-mono">
                 <span className="text-[var(--ms-text-dim)]">PRE_VIZ.STATUS</span>
                 <span className="text-[var(--ms-green)]">72%</span>
               </div>
               <div className="w-full h-0.5 bg-[var(--ms-border)] rounded-none overflow-hidden">
                 <div className="w-[72%] h-full bg-[var(--ms-green)] shadow-[0_0_8px_var(--ms-green)]" />
               </div>
             </div>
           </div>

           <div className="pt-8 border-t border-[var(--ms-border)] space-y-6">
              <div>
                <span className="text-[10px] font-mono text-[var(--ms-green)] font-bold uppercase tracking-widest block mb-4">GROUNDING_SYNC</span>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-mono text-[var(--ms-text-dim)] uppercase tracking-tighter">DNA_INTEGRITY</span>
                  <span className="text-[11px] font-mono text-[var(--ms-green)] shadow-[0_0_10px_var(--ms-green-dim)]">94.2%</span>
                </div>
                <div className="w-full h-1 bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-none overflow-hidden">
                  <div className="w-[94%] h-full bg-gradient-to-r from-[var(--ms-green)] to-[var(--ms-green-dim)]" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-none bg-[var(--ms-green)] animate-pulse shadow-[0_0_5px_var(--ms-green)]" />
                   <span className="text-[10px] font-mono text-[var(--ms-text)] font-bold uppercase tracking-widest">DNA_ACTIVE: CHAR</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-none bg-[var(--ms-green)] animate-pulse shadow-[0_0_5px_var(--ms-green)]" />
                   <span className="text-[10px] font-mono text-[var(--ms-text)] font-bold uppercase tracking-widest">SYSC_LOCKED: SET</span>
                </div>
              </div>
           </div>

           <div className="pt-8 border-t border-[var(--ms-border)]">
              <span className="text-[10px] font-mono text-[var(--ms-green)] font-bold uppercase tracking-widest block mb-5">COLOR_SPACE</span>
              <div className="grid grid-cols-4 gap-2">
                <div className="w-full aspect-square rounded-sm bg-[#050A14] border border-white/5" title="ZERO_NOIR" />
                <div className="w-full aspect-square rounded-sm bg-[var(--ms-green)] border border-white/5" title="CORE_GREEN" />
                <div className="w-full aspect-square rounded-sm bg-[#1A3A5F] border border-white/5" title="DEP_COVE" />
                <div className="w-full aspect-square rounded-sm bg-[#3D0A0A] border border-white/5" title="S_RED" />
              </div>
           </div>

           <div className="pt-8 border-t border-[var(--ms-border)]">
              <span className="text-[10px] font-mono text-[var(--ms-green)] font-bold uppercase tracking-widest block mb-4">DIRECTOR_MANIFEST</span>
              <p className="text-[10px] font-mono text-[var(--ms-text-dim)] leading-relaxed uppercase">
                "TARGET: CLAUSTROPHOBIC_DEPTH. REQ: EMBED_BINARY_SYMBOLS. STATUS: CRITICAL."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
