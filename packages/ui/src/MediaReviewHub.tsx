"use client";

import React, { useState } from "react";

interface MediaVersion {
  id: string;
  version: number;
  thumbnail: string;
  status: "Approved" | "Pending" | "Rejected";
  timestamp: string;
  note: string;
}

interface MediaReviewHubProps {
  shotId?: string;
  onClose?: () => void;
}

const mockVersions: MediaVersion[] = [
  { id: "v1", version: 1, thumbnail: "", status: "Rejected", timestamp: "2026-04-07 10:00", note: "Lighting too bright" },
  { id: "v2", version: 2, thumbnail: "", status: "Pending", timestamp: "2026-04-08 14:00", note: "Improved contrast, check bloom" },
  { id: "v3", version: 3, thumbnail: "", status: "Pending", timestamp: "2026-04-09 09:30", note: "Latest Veo 3.1 attempt" },
];

export default function MediaReviewHub({ shotId = "SC_001_010", onClose }: MediaReviewHubProps) {
  const [selectedVersion, setSelectedVersion] = useState(mockVersions[mockVersions.length - 1]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/90 backdrop-blur-sm">
      <div className="w-full max-w-7xl h-full flex flex-col bg-[var(--ms-bg)] border border-[var(--ms-border)] rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--ms-border)]">
          <div className="flex items-center gap-6">
             <div className="flex flex-col">
               <span className="text-[10px] text-[var(--ms-gold)] font-mono font-bold uppercase tracking-widest">Reviewing Shot</span>
               <h3 className="text-2xl font-serif font-bold text-[var(--ms-text)]">{shotId}</h3>
             </div>
             <div className="h-10 w-[1px] bg-[var(--ms-border)]" />
             <div className="flex gap-2">
                <span className="px-3 py-1 bg-blue-900/30 text-blue-400 text-[10px] font-bold rounded-full border border-blue-900/50">VIDEO STEP</span>
                <span className="px-3 py-1 bg-gray-800 text-gray-400 text-[10px] font-bold rounded-full border border-white/5">SCENE 01</span>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors text-2xl">×</button>
        </div>

        {/* Main Review Area */}
        <div className="flex-grow flex overflow-hidden">
          {/* Player (Mock) */}
          <div className="flex-grow bg-black flex flex-col relative">
            <div className="flex-grow flex items-center justify-center">
               <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center border-b border-white/5">
                  <div className="w-24 h-24 rounded-full bg-[var(--ms-gold)]/10 border border-[var(--ms-gold)]/30 flex items-center justify-center text-3xl animate-pulse">
                     ▶
                  </div>
                  <p className="mt-8 text-[var(--ms-text-dim)] font-serif italic text-lg opacity-40">
                    Media Player Canvas: {selectedVersion.id}
                  </p>
               </div>
            </div>
            
            {/* Playback Controls */}
            <div className="px-8 py-6 flex items-center justify-between bg-[var(--ms-bg-2)]">
               <div className="flex gap-6 items-center">
                 <button className="text-xl">⏪</button>
                 <button className="text-2xl text-[var(--ms-gold)]">▶</button>
                 <button className="text-xl">⏩</button>
                 <div className="h-1.5 w-96 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--ms-gold)] w-1/3 shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                 </div>
               </div>
               <div className="flex gap-4">
                 <button className="px-6 py-2 bg-red-950/40 text-red-500 border border-red-900/30 text-[10px] font-bold uppercase tracking-widest rounded hover:bg-red-900/60">REJECT</button>
                 <button className="px-6 py-2 bg-green-900/40 text-green-500 border border-green-900/30 text-[10px] font-bold uppercase tracking-widest rounded hover:bg-green-900/60">APPROVE</button>
               </div>
            </div>
          </div>

          {/* Version Sidebar */}
          <div className="w-80 border-l border-[var(--ms-border)] bg-[var(--ms-bg-2)]/50 flex flex-col">
            <div className="p-6 border-b border-[var(--ms-border)]">
              <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-[var(--ms-text-dim)]">Version History</h4>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {mockVersions.slice().reverse().map((v) => (
                <div 
                  key={v.id}
                  onClick={() => setSelectedVersion(v)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedVersion.id === v.id 
                      ? "bg-[var(--ms-gold)]/10 border-[var(--ms-gold)]" 
                      : "bg-[var(--ms-bg)] border-[var(--ms-border)] hover:border-[var(--ms-gold)]/30"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-[var(--ms-text)]">Version {v.version}</span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter ${
                      v.status === "Approved" ? "bg-green-900/40 text-green-400" :
                      v.status === "Rejected" ? "bg-red-900/40 text-red-400" : "bg-blue-900/40 text-blue-400"
                    }`}>{v.status}</span>
                  </div>
                  <div className="aspect-video bg-black/40 rounded border border-white/5 mb-3" />
                  <p className="text-[10px] text-[var(--ms-text-dim)] leading-relaxed italic">"{v.note}"</p>
                  <div className="mt-3 text-[8px] font-mono text-gray-500">{v.timestamp}</div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-[var(--ms-border)]">
               <button className="w-full py-3 bg-[var(--ms-gold)] text-[var(--ms-bg)] text-[10px] font-bold uppercase tracking-widest rounded shadow-lg">Submit Feedback</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
