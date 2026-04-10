"use client";

import React, { useState } from "react";

interface Asset {
  agent: string;
  type: "image" | "video" | "json" | "audio";
  filename: string;
  path: string;
  url: string;
  soq_score?: number;
}

interface AssetHubProps {
  assets: Asset[];
  projectName: string;
  onDownloadPackage?: () => void;
}

export default function AssetHub({ assets, projectName, onDownloadPackage }: AssetHubProps) {
  const [filter, setFilter] = useState<string>("all");

  const stats = {
    total: assets.length,
    images: assets.filter(a => a.type === "image").length,
    videos: assets.filter(a => a.type === "video").length,
    data: assets.filter(a => a.type === "json").length,
  };

  return (
    <div className="w-full flex flex-col bg-[var(--ms-bg-base)] border border-[var(--ms-gold-border)]/30 rounded-[var(--ms-radius-lg)] overflow-hidden gstack-glass shadow-[var(--ms-glass-shadow)] transition-all duration-700">
      {/* Hub Header: Obsidian HUD */}
      <div className="flex items-center justify-between px-10 py-8 border-b border-[var(--ms-gold-border)]/20 bg-black/60 relative overflow-hidden">
        {/* Decorative Scanned Line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--ms-gold)] to-transparent opacity-20 animate-pulse" />
        
        <div className="flex items-center gap-10 relative z-10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--ms-gold)] shadow-[0_0_12px_var(--ms-gold)]" />
              <h3 className="text-[10px] font-bold uppercase tracking-[0.5em] text-[var(--ms-gold)] font-mono">Vault_Access_Stream</h3>
            </div>
            <h2 className="text-3xl font-serif text-[var(--ms-text-bright)] tracking-tight">
              {projectName} <span className="text-[var(--ms-gold)] italic opacity-80">Manifest</span>
            </h2>
          </div>
          
          <div className="h-12 w-px bg-[var(--ms-gold-border)]/30 hidden md:block" />
          
          <div className="hidden lg:flex gap-8">
             {Object.entries(stats).map(([label, count]) => (
               <div key={label} className="flex flex-col group cursor-default">
                 <span className="text-[9px] uppercase text-[var(--ms-text-dim)] font-mono tracking-widest group-hover:text-[var(--ms-gold)] transition-colors">{label}</span>
                 <span className="text-lg font-serif font-bold text-[var(--ms-text-bright)]">{count.toString().padStart(2, '0')}</span>
               </div>
             ))}
          </div>
        </div>

        <button 
          onClick={onDownloadPackage}
          className="px-8 py-3 bg-[var(--ms-gold)] text-[var(--ms-bg-base)] text-[11px] font-bold uppercase tracking-[0.3em] rounded-full hover:scale-105 transition-all shadow-[0_8px_24px_var(--ms-gold-glint)] active:scale-95"
        >
          Download Package.zip
        </button>
      </div>

      {/* Filter HUD */}
      <div className="flex items-center gap-4 px-10 py-4 border-b border-[var(--ms-gold-border)]/10 bg-black/20">
        <span className="text-[9px] font-mono text-[var(--ms-text-dim)] uppercase tracking-tighter mr-4">Filter_Nodes:</span>
        {["all", "image", "video", "json", "audio"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all rounded-sm border ${
              filter === f 
                ? "bg-[var(--ms-gold)]/10 text-[var(--ms-gold)] border-[var(--ms-gold-border)]" 
                : "text-[var(--ms-text-dim)] border-transparent hover:border-[var(--ms-gold-border)]/30 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Asset Grid: Bento Asymmetric */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 p-8 overflow-y-auto max-h-[800px] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat">
        {assets
          .filter(a => filter === "all" || a.type === filter)
          .map((asset, idx) => {
            // Asymmetric scaling for certain indices to create "Bento" feel
            const isLarge = idx % 5 === 0;
            return (
              <div 
                key={idx} 
                className={`group relative bg-[var(--ms-bg-elevated)]/40 border border-[var(--ms-gold-border)]/10 rounded-[var(--ms-radius-md)] overflow-hidden transition-all duration-500 hover:border-[var(--ms-gold-border)]/50 hover:shadow-[0_0_30px_rgba(212,175,55,0.1)] ${
                  isLarge ? "lg:col-span-8 lg:row-span-2" : "lg:col-span-4"
                }`}
              >
                {/* Immersive Preview with HUD Overlay */}
                <div className={`relative w-full overflow-hidden bg-black/60 ${isLarge ? "aspect-[21/9]" : "aspect-video"}`}>
                  {asset.type === "image" ? (
                    <img src={asset.url} alt={asset.filename} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--ms-bg-base)]">
                       <span className="font-serif text-[var(--ms-gold)]/40 text-4xl italic group-hover:scale-110 transition-transform duration-700">{asset.type}</span>
                    </div>
                  )}

                  {/* Glassmorphism Metadata HUD */}
                  <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 to-transparent translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                     <div className="flex justify-between items-end">
                        <div className="flex flex-col gap-1">
                           <span className="text-[8px] font-mono text-[var(--ms-gold)] font-bold uppercase tracking-[0.3em] mb-1">{asset.agent}</span>
                           <h4 className="text-sm font-serif text-[var(--ms-text-bright)] leading-none">{asset.filename}</h4>
                        </div>
                        {asset.soq_score && (
                          <div className="flex flex-col items-end">
                             <span className="text-[7px] font-mono text-[var(--ms-text-dim)] uppercase mb-1">SOQ_INTEGRITY</span>
                             <div className="text-lg font-serif font-bold text-[var(--ms-gold)]">{asset.soq_score}%</div>
                          </div>
                        )}
                     </div>
                  </div>

                  {/* Corner Status HUD */}
                  <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                     <div className="px-2 py-0.5 rounded-sm bg-black/60 backdrop-blur-md border border-[var(--ms-gold-border)]/30 text-[7px] font-mono font-bold text-[var(--ms-gold)]">{asset.type.toUpperCase()}</div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 bg-[var(--ms-bg-base)]/40 flex justify-between items-center border-t border-[var(--ms-gold-border)]/5">
                   <span className="text-[8px] font-mono text-[var(--ms-text-dim)] uppercase tracking-widest">{asset.path.split('/').pop()}</span>
                   <a 
                     href={asset.url} 
                     target="_blank" 
                     rel="noreferrer"
                     className="px-4 py-1.5 border border-[var(--ms-gold-border)]/20 text-[9px] font-bold uppercase tracking-widest text-[var(--ms-gold)] hover:bg-[var(--ms-gold-haze)] transition-all rounded-[var(--ms-radius-sm)]"
                   >
                     View Open
                   </a>
                </div>
              </div>
            );
          })}
      </div>

      {/* Vault Sync Footer */}
      <div className="px-10 py-4 border-t border-[var(--ms-gold-border)]/20 bg-black/60 flex justify-between items-center">
        <div className="flex items-center gap-4">
           <div className="w-1.5 h-1.5 rounded-full bg-[var(--ms-gold)] animate-pulse" />
           <span className="text-[9px] font-mono text-[var(--ms-text-dim)] uppercase tracking-[0.2em]">Digital_Vault_Monolith // AES-256_SECURED</span>
        </div>
        <div className="flex gap-6">
           <span className="text-[9px] font-mono text-[var(--ms-gold)] uppercase tracking-widest opacity-60">Hash: {Math.random().toString(36).substring(7).toUpperCase()}</span>
           <span className="text-[9px] font-mono text-[var(--ms-text-bright)] uppercase tracking-widest">Storage_Sync: Optimal</span>
        </div>
      </div>
    </div>
  );
}
