"use client";

import React, { useState } from "react";

interface Asset {
  id: string;
  name: string;
  type: "Character" | "Environment" | "Prop" | "DNA";
  thumbnail: string;
  tags: string[];
  usageCount: number;
  quality: number;
  origin: string;
}

const mockAssets: Asset[] = [
  {
    id: "AST_001",
    name: "CYBER_LADY_V1",
    type: "Character",
    thumbnail: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=2666&auto=format&fit=crop",
    tags: ["cyberpunk", "protagonist", "female"],
    usageCount: 12,
    quality: 9.8,
    origin: "PROJECT_NEON_DRIFT",
  },
  {
    id: "AST_002",
    name: "RAINY_ALLEY_3D",
    type: "Environment",
    thumbnail: "https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=2756&auto=format&fit=crop",
    tags: ["urban", "rain", "night", "noir"],
    usageCount: 5,
    quality: 9.5,
    origin: "PROJECT_BIT_SAVIOR",
  },
  {
    id: "AST_003",
    name: "PLASMA_RIFLE_MARK4",
    type: "Prop",
    thumbnail: "https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?q=80&w=2672&auto=format&fit=crop",
    tags: ["weapon", "scifi", "glow"],
    usageCount: 22,
    quality: 8.9,
    origin: "SYSTEM_ASSETS",
  },
];

export default function AssetVault() {
  const [filter, setFilter] = useState("All");

  return (
    <div className="flex flex-col h-full bg-[var(--ms-bg)] rounded-[32px] border border-[var(--ms-border)] overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-700">
      
      {/* Header & Search */}
      <div className="px-10 py-10 border-b border-[var(--ms-border)] bg-black/20 flex items-center justify-between">
         <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
               <span className="text-[10px] font-mono text-[var(--ms-gold)] font-bold uppercase tracking-[0.4em]">Digital Backlot</span>
               <span className="w-1.5 h-1.5 rounded-full bg-[var(--ms-gold)] animate-pulse" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-white tracking-tight">Asset Vault</h2>
         </div>
         
         <div className="flex items-center gap-6">
            <div className="flex bg-black/50 p-1 rounded-xl border border-[var(--ms-border)]">
               {["All", "Character", "Environment", "Prop", "DNA"].map(type => (
                 <button 
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-5 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg ${
                    filter === type ? "bg-[var(--ms-gold)]/10 text-[var(--ms-gold)]" : "text-zinc-500 hover:text-white"
                  }`}
                 >
                   {type}
                 </button>
               ))}
            </div>
            <div className="relative group">
               <input 
                type="text" 
                placeholder="Search Assets..." 
                className="bg-black/40 border border-[var(--ms-border)] rounded-xl px-6 py-3 text-[11px] w-64 focus:outline-none focus:border-[var(--ms-gold)]/50 transition-all font-mono"
               />
               <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity">🔍</span>
            </div>
         </div>
      </div>

      {/* Asset Grid */}
      <div className="flex-grow overflow-y-auto p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 scrollbar-hide">
         {mockAssets.filter(a => filter === "All" || a.type === filter).map(asset => (
            <div key={asset.id} className="group relative bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-3xl overflow-hidden hover:border-[var(--ms-gold)]/40 transition-all duration-500 flex flex-col">
               
               {/* Thumbnail Overlay Controls */}
               <div className="aspect-[4/5] relative overflow-hidden">
                  <img 
                    src={asset.thumbnail} 
                    alt={asset.name} 
                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[2000ms]" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--ms-bg)] via-transparent to-transparent opacity-80" />
                  
                  {/* Floating Metadata */}
                  <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                     <span className="px-2 py-1 bg-black/80 backdrop-blur-md rounded text-[8px] font-mono text-white/50 border border-white/5 uppercase tracking-tighter">
                        {asset.id}
                     </span>
                     <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest ${
                       asset.quality >= 9.5 ? "bg-[var(--ms-gold)] text-[var(--ms-bg)]" : "bg-zinc-900 text-zinc-400"
                     }`}>
                       SOQ: {asset.quality}
                     </span>
                  </div>

                  <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 group/btn">
                     <div className="w-16 h-16 rounded-full bg-[var(--ms-gold)] text-[var(--ms-bg)] flex items-center justify-center text-2xl shadow-[0_0_50px_rgba(212,175,55,0.4)] group-hover/btn:scale-110 transition-transform">
                        ⬇️
                     </div>
                  </button>
               </div>

               {/* Asset Details */}
               <div className="p-6 flex flex-col flex-grow bg-black/20 backdrop-blur-md">
                  <div className="flex justify-between items-start mb-2">
                     <h3 className="text-sm font-bold text-white tracking-widest uppercase truncate pr-4">{asset.name}</h3>
                     <span className="text-[10px] font-mono text-[var(--ms-gold)] font-medium">{asset.usageCount}X USE</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-6">
                     {asset.tags.map(tag => (
                       <span key={tag} className="text-[8px] bg-white/5 border border-white/5 px-2 py-0.5 rounded-full text-zinc-500 uppercase tracking-tighter">
                         #{tag}
                       </span>
                     ))}
                  </div>
                  <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                     <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-600 uppercase font-bold tracking-widest">Master Project</span>
                        <span className="text-[9px] text-zinc-400 font-mono">{asset.origin.length > 20 ? asset.origin.slice(0, 18) + '...' : asset.origin}</span>
                     </div>
                     <button className="text-[10px] text-[var(--ms-gold)] font-bold uppercase tracking-widest hover:underline">Inspect</button>
                  </div>
               </div>

            </div>
         ))}

         {/* Add Asset Placeholder */}
         <button className="aspect-[4/5] rounded-3xl border-2 border-dashed border-[var(--ms-border)] flex flex-col items-center justify-center gap-4 hover:border-[var(--ms-gold)]/20 hover:bg-[var(--ms-gold)]/[0.02] transition-all group">
            <div className="w-14 h-14 rounded-full border border-zinc-800 flex items-center justify-center text-2xl text-zinc-600 group-hover:border-[var(--ms-gold)]/40 group-hover:text-[var(--ms-gold)] transition-colors">+</div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-600 group-hover:text-zinc-400">Add to Backlot</span>
         </button>
      </div>

    </div>
  );
}
