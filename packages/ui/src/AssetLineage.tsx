"use client";

import React from "react";

interface LineageNode {
  id: string;
  label: string;
  type: string;
  version: string;
  thumbnail?: string;
}

const MOCK_NODES: LineageNode[] = [
  { id: "1", label: "Neo-Seoul Script", type: "Script", version: "V2.4" },
  { id: "2", label: "Cyber-Street Concept", type: "Image", version: "V1.2" },
  { id: "3", label: "Street_Block_A", type: "3D Asset", version: "V3.0" },
  { id: "4", label: "Final_Comp_Shot_01", type: "Video", version: "V1.0" },
];

export default function AssetLineage() {
  return (
    <div className="p-6 bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-xl space-y-4 animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex justify-between items-center">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--ms-text-dim)]">Asset Lineage Tracking</h3>
        <span className="text-[8px] font-mono text-[var(--ms-gold)]">UUID: 88-X-0912</span>
      </div>

      <div className="relative flex items-center justify-between py-8">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-[var(--ms-border)] via-[var(--ms-gold)]/30 to-[var(--ms-border)] -translate-y-1/2" />

        {MOCK_NODES.map((node, i) => (
          <div key={node.id} className="relative z-10 flex flex-col items-center group">
            {/* Visual Node */}
            <div className="w-16 h-16 rounded-lg bg-[var(--ms-bg)] border border-[var(--ms-border)] flex items-center justify-center group-hover:border-[var(--ms-gold)] transition-all overflow-hidden shadow-2xl relative">
               <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
               <span className="text-[14px] opacity-20 group-hover:opacity-40 transition-opacity">
                  {i === 0 ? "📄" : i === 1 ? "🖼️" : i === 2 ? "🧊" : "🎬"}
               </span>
               
               {/* Version Badge */}
               <div className="absolute bottom-1 right-1 px-1 bg-black/60 rounded text-[6px] font-mono text-[var(--ms-gold)] border border-[var(--ms-gold)]/30">
                  {node.version}
               </div>
            </div>

            {/* Labels */}
            <div className="mt-3 text-center">
              <div className="text-[9px] font-bold text-[var(--ms-text)] group-hover:text-[var(--ms-gold)] transition-colors line-clamp-1 w-24">
                {node.label}
              </div>
              <div className="text-[7px] text-[var(--ms-text-dim)] uppercase tracking-widest mt-0.5">
                {node.type}
              </div>
            </div>

            {/* Checkmark indicator for completion */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--ms-bg-2)] flex items-center justify-center shadow-lg">
               <div className="w-1 h-1.5 border-r-2 border-b-2 border-white rotate-45 -translate-y-[1px]" />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-[var(--ms-border)]/50 flex justify-between items-center">
         <button className="text-[8px] font-bold text-[var(--ms-text-dim)] hover:text-[var(--ms-gold)] transition-colors uppercase tracking-widest">
            View Full Manifest →
         </button>
         <div className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[8px] text-[var(--ms-text-dim)] uppercase font-medium">Tracking Live Updates</span>
         </div>
      </div>
    </div>
  );
}
