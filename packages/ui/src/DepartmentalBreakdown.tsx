"use client";

import React, { useState } from "react";

interface SceneAsset {
  id: string;
  name: string;
  category: "Set" | "Costume" | "Prop" | "Vehicle" | "VFX";
  status: "Draft" | "Approved" | "Acquired" | "On-Set";
  description: string;
}

interface SceneData {
  number: number;
  slugline: string;
  assets: SceneAsset[];
}

const mockScenes: SceneData[] = [
  {
    number: 1,
    slugline: "EXT. BEACH - DAY",
    assets: [
      { id: "s1-a1", name: "Life Guard Tower", category: "Set", status: "Approved", description: "Weathered wood, primary location" },
      { id: "s1-a2", name: "Hero Swimwear (Aeon)", category: "Costume", status: "Acquired", description: "Tactical blue fabric" },
      { id: "s1-a3", name: "Binary Tablet", category: "Prop", status: "Draft", description: "Glowing screen with code" },
    ]
  },
  {
    number: 2,
    slugline: "INT. CAFE - NIGHT",
    assets: [
      { id: "s2-a1", name: "Rainy Window Background", category: "Set", status: "Approved", description: "Projected neon rain on glass" },
      { id: "s2-a2", name: "Cafe Uniform", category: "Costume", status: "Approved", description: "Standard black apron" },
      { id: "s2-a3", name: "Broken Coffee Cup", category: "Prop", status: "On-Set", description: "Ceramic pieces for table" },
    ]
  }
];

export default function DepartmentalBreakdown() {
  const [activeTab, setActiveTab] = useState<"Set" | "Costume" | "Prop">("Set");
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);

  const activeScene = mockScenes[selectedSceneIndex];
  const filteredAssets = activeScene.assets.filter(a => a.category === activeTab);

  return (
    <div className="flex flex-col h-full bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-xl overflow-hidden shadow-2xl">
      {/* Header / Department Selector */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--ms-border)] bg-[var(--ms-bg)]">
        <div className="flex items-center gap-6">
          <h3 className="font-serif text-xl font-bold text-[var(--ms-gold)]">Production Design</h3>
          <nav className="flex gap-2">
            {(["Set", "Costume", "Prop"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase rounded-full transition-all border ${
                  activeTab === tab 
                    ? "bg-[var(--ms-gold)] text-[var(--ms-bg)] border-[var(--ms-gold)]" 
                    : "text-[var(--ms-text-dim)] border-transparent hover:border-[var(--ms-border)]"
                }`}
              >
                {tab}s
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] text-[var(--ms-text-dim)] uppercase">Scene Selector</span>
           <div className="flex gap-1">
             {mockScenes.map((s, idx) => (
               <button 
                 key={s.number}
                 onClick={() => setSelectedSceneIndex(idx)}
                 className={`w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold border ${
                   selectedSceneIndex === idx 
                     ? "border-[var(--ms-gold)] text-[var(--ms-gold)] bg-[var(--ms-gold)]/10" 
                     : "border-[var(--ms-border)] text-[var(--ms-text-dim)] hover:border-[var(--ms-text)]"
                 }`}
               >
                 {s.number}
               </button>
             ))}
           </div>
        </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
        {/* Scene Info Sidebar */}
        <div className="w-64 border-r border-[var(--ms-border)] p-6 bg-[var(--ms-bg)]/50">
          <div className="mb-8">
            <span className="text-[10px] text-[var(--ms-gold)] font-bold uppercase tracking-widest block mb-2">Selected Scene</span>
            <div className="text-3xl font-serif font-bold text-[var(--ms-text)] mb-1">#{activeScene.number}</div>
            <div className="text-xs font-mono text-[var(--ms-text-dim)] uppercase">{activeScene.slugline}</div>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-[var(--ms-bg)] border border-[var(--ms-border)] rounded-lg">
              <span className="text-[9px] uppercase text-[var(--ms-text-dim)] block mb-1">Characters Present</span>
              <div className="flex gap-1 flex-wrap">
                <span className="px-1.5 py-0.5 bg-blue-900/30 text-blue-300 text-[9px] rounded">AEON</span>
                <span className="px-1.5 py-0.5 bg-gray-800 text-gray-400 text-[9px] rounded">CLIENT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Assets Grid */}
        <div className="flex-grow p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map((asset) => (
              <div key={asset.id} className="bg-[var(--ms-bg)] border border-[var(--ms-border)] rounded-xl p-4 hover:border-[var(--ms-gold)]/50 transition-all group shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-[var(--ms-text)] group-hover:text-[var(--ms-gold)] transition-colors">{asset.name}</h4>
                  <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    asset.status === "Approved" ? "bg-green-900/30 text-green-400" : 
                    asset.status === "Acquired" ? "bg-blue-900/30 text-blue-400" : "bg-yellow-900/30 text-yellow-400"
                  }`}>
                    {asset.status}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--ms-text-dim)] leading-relaxed mb-4">{asset.description}</p>
                <div className="flex justify-between items-center pt-3 border-t border-[var(--ms-border)]">
                  <button className="text-[9px] uppercase tracking-wider text-[var(--ms-gold)] hover:underline">Edit Details</button>
                  <button className="text-[9px] uppercase tracking-wider text-[var(--ms-text-dim)] hover:text-red-400">Remove</button>
                </div>
              </div>
            ))}
            
            {/* Add New Asset Card */}
            <button className="border-2 border-dashed border-[var(--ms-border)] rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-[var(--ms-gold)] hover:bg-[var(--ms-gold)]/5 transition-all group min-h-[140px]">
              <span className="text-2xl text-[var(--ms-text-dim)] group-hover:text-[var(--ms-gold)] transition-colors">+</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--ms-text-dim)] group-hover:text-[var(--ms-gold)]">Add {activeTab}</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer / Summary */}
      <div className="px-6 py-3 border-t border-[var(--ms-border)] bg-[var(--ms-bg)] flex justify-between items-center text-[10px] font-mono text-[var(--ms-text-dim)] uppercase">
        <span>Total Assets for Scene #{activeScene.number}: {activeScene.assets.length} items</span>
        <div className="flex gap-4">
          <span className="text-green-400">Approved: 4</span>
          <span className="text-blue-400">Acquired: 2</span>
          <span className="text-yellow-400">Pending: 1</span>
        </div>
      </div>
    </div>
  );
}
