"use client";

import React, { useState } from "react";
import { useGStack } from "./GStackProvider";

interface VaultAsset {
  id: string;
  type: "concept" | "model" | "environment" | "take";
  title: string;
  creator: string;
  timestamp: string;
  reliability: number; // 0-100
  lineage?: string[]; // Parent IDs
}

const MOCK_ASSETS: VaultAsset[] = [
  { id: "A1", type: "concept", title: "Rivendell Master Plan", creator: "ConceptArtist", timestamp: "2026-04-09 10:00", reliability: 98 },
  { id: "A2", type: "environment", title: "Rivendell Bridge (Night)", creator: "EnvironmentDesigner", timestamp: "2026-04-09 11:30", reliability: 95, lineage: ["A1"] },
  { id: "A3", type: "take", title: "Final Scene 08 Take 02", creator: "Generalist", timestamp: "2026-04-09 14:20", reliability: 92, lineage: ["A2"] },
  { id: "B1", type: "concept", title: "Aragorn Suit v3", creator: "CharacterArtist", timestamp: "2026-04-09 09:15", reliability: 99 },
  { id: "B2", type: "model", title: "Aragorn High-Res Mesh", creator: "AssetDesigner", timestamp: "2026-04-09 12:45", reliability: 97, lineage: ["B1"] }
];

export default function VaultLineageExplorer() {
  const { integrity } = useGStack();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6 p-8 gstack-glass rounded-[var(--ms-radius-lg)] h-full overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col">
          <h3 className="text-xl font-title text-[var(--ms-text-bright)] flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[var(--ms-blue)] animate-pulse" />
            Vault Asset Lineage
          </h3>
          <p className="text-xs text-[var(--ms-text-dim)] font-code mt-1">
            EXPLORING_DIGITAL_BACKLOT_PROVENANCE
          </p>
        </div>
        <div className="px-3 py-1 bg-[var(--ms-blue)]/10 border border-[var(--ms-blue)]/30 rounded-full">
           <span className="text-[10px] font-code text-[var(--ms-blue)]">VERIFIED_ARCHIVE</span>
        </div>
      </div>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto pr-2 scrollbar-none">
        {/* Asset List */}
        <div className="space-y-4">
          <span className="text-[10px] text-[var(--ms-text-ghost)] font-bold uppercase tracking-widest">Master Assets</span>
          {MOCK_ASSETS.map((asset) => (
            <div 
              key={asset.id}
              onClick={() => setSelectedId(asset.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                selectedId === asset.id 
                  ? "border-[var(--ms-blue)] bg-[var(--ms-blue)]/5" 
                  : "border-[var(--ms-glass-border)] bg-white/[0.01] hover:bg-white/[0.03]"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[8px] font-code text-[var(--ms-blue)] uppercase">{asset.type}</span>
                  <h4 className="text-sm font-bold text-[var(--ms-text-bright)]">{asset.title}</h4>
                </div>
                <div className="flex flex-col items-end">
                   <div className="flex items-center gap-1">
                      <span className="text-[10px] font-code text-[var(--ms-text-bright)]">{asset.reliability}%</span>
                      <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-[var(--ms-blue)]" style={{ width: `${asset.reliability}%` }} />
                      </div>
                   </div>
                   <span className="text-[8px] text-[var(--ms-text-ghost)] uppercase font-bold">Reliability</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lineage Detail */}
        <div className="p-6 bg-black/40 rounded-2xl border border-[var(--ms-glass-border)] flex flex-col gap-6 relative">
          {selectedId ? (
            <>
              <div className="flex flex-col gap-1">
                 <span className="text-[10px] text-[var(--ms-text-dim)] font-code">LINEAGE_TRACKER</span>
                 <h4 className="text-lg font-title text-white">Provenance Tree</h4>
              </div>

              <div className="flex flex-col gap-4">
                {MOCK_ASSETS.find(a => a.id === selectedId)?.lineage?.map(parentId => {
                  const parent = MOCK_ASSETS.find(a => a.id === parentId);
                  return (
                    <div key={parentId} className="flex flex-col items-center gap-2">
                      <div className="p-3 bg-white/5 border border-white/10 rounded-lg w-full">
                        <span className="text-[8px] text-[var(--ms-text-dim)] uppercase">Parent Asset</span>
                        <p className="text-xs text-[var(--ms-text-main)] font-bold">{parent?.title}</p>
                      </div>
                      <div className="w-px h-6 bg-gradient-to-b from-[var(--ms-blue)] to-transparent" />
                    </div>
                  );
                })}
                <div className="p-4 bg-[var(--ms-blue)]/10 border border-[var(--ms-blue)]/40 rounded-xl w-full ring-2 ring-[var(--ms-blue)]/20">
                   <span className="text-[8px] text-[var(--ms-blue)] font-bold uppercase">Active Subject</span>
                   <p className="text-sm text-white font-bold">{MOCK_ASSETS.find(a => a.id === selectedId)?.title}</p>
                   <div className="mt-4 flex justify-between items-center text-[9px] font-code">
                      <span className="text-[var(--ms-text-dim)]">CREATED_BY: {MOCK_ASSETS.find(a => a.id === selectedId)?.creator}</span>
                      <span className="text-[var(--ms-text-dim)]">{MOCK_ASSETS.find(a => a.id === selectedId)?.timestamp}</span>
                   </div>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-white/5 flex gap-4">
                 <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-white transition-colors">
                    PROMOTE_TO_GLOBAL
                 </button>
                 <button className="px-4 py-2 bg-[var(--ms-blue)]/20 hover:bg-[var(--ms-blue)]/30 border border-[var(--ms-blue)]/40 rounded-lg text-[10px] font-bold text-[var(--ms-blue)] transition-colors">
                    INJECT_INTO_PIPELINE
                 </button>
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center opacity-20 grayscale">
               <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/40 animate-spin" />
               <span className="text-[10px] font-code mt-4">SELECT_ASSET_TO_TRACE</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
