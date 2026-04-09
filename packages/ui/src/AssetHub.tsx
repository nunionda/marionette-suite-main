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

  const filteredAssets = assets.filter(a => filter === "all" || a.type === filter);

  const stats = {
    total: assets.length,
    images: assets.filter(a => a.type === "image").length,
    videos: assets.filter(a => a.type === "video").length,
    data: assets.filter(a => a.type === "json").length,
  };

  return (
    <div className="w-full flex flex-col bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-sm overflow-hidden shadow-2xl">
      {/* Hub Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--ms-border)] bg-black/40">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--ms-green)] mb-1">Production_Asset_Hub</h3>
            <h2 className="text-xl font-bold uppercase tracking-tighter">{projectName} // Manifest</h2>
          </div>
          <div className="h-10 w-px bg-[var(--ms-border)] mx-2" />
          <div className="flex gap-4">
             {Object.entries(stats).map(([label, count]) => (
               <div key={label} className="flex flex-col">
                 <span className="text-[8px] uppercase text-[var(--ms-text-dim)] font-mono">{label}</span>
                 <span className="text-sm font-bold font-mono text-[var(--ms-text)]">{count.toString().padStart(2, '0')}</span>
               </div>
             ))}
          </div>
        </div>
        <button 
          onClick={onDownloadPackage}
          className="px-6 py-2 bg-[var(--ms-green)] text-[var(--ms-bg)] text-[10px] font-bold uppercase tracking-widest rounded-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,255,65,0.2)]"
        >
          Download_Full_Package.zip
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 px-6 py-2 border-b border-[var(--ms-border)] bg-[var(--ms-bg)]/50">
        {["all", "image", "video", "json", "audio"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest transition-all ${
              filter === f ? "bg-[var(--ms-green-dim)] text-[var(--ms-green)] border border-[var(--ms-green-border)]" : "text-[var(--ms-text-dim)] hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6 overflow-y-auto max-h-[600px] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-95">
        {filteredAssets.map((asset, idx) => (
          <div key={idx} className="group relative bg-[var(--ms-bg)] border border-[var(--ms-border)] p-3 rounded-sm hover:border-[var(--ms-green)] transition-all">
            <div className="aspect-video bg-black/40 rounded-sm mb-3 overflow-hidden border border-white/5 relative">
               {asset.type === "image" ? (
                 <img src={asset.url} alt={asset.filename} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-zinc-900 font-mono text-[20px] text-[var(--ms-text-dim)] uppercase tracking-widest">
                   {asset.type}
                 </div>
               )}
               {asset.soq_score && (
                 <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/80 backdrop-blur-md rounded-[1px] text-[8px] font-mono font-bold text-[var(--ms-green)] border border-[var(--ms-green-border)]">
                   SOQ_{asset.soq_score}
                 </div>
               )}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-mono text-[var(--ms-green)] font-bold uppercase tracking-widest">{asset.agent}</span>
                <span className="text-[7px] font-mono text-[var(--ms-text-dim)]">{asset.type.toUpperCase()}</span>
              </div>
              <h4 className="text-[11px] font-bold text-white truncate mb-2">{asset.filename}</h4>
              <div className="flex gap-2">
                <a 
                  href={asset.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex-1 py-1.5 bg-zinc-800 text-center text-[8px] font-bold uppercase tracking-widest text-[var(--ms-text-dim)] hover:text-white hover:bg-zinc-700 transition-all border border-white/5"
                >
                  View_File
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-2 border-t border-[var(--ms-border)] bg-black/60 flex justify-between items-center">
        <span className="text-[9px] font-mono text-[var(--ms-text-dim)] uppercase">System_Manifest_v0.5 // Integrity_Verified</span>
        <span className="text-[9px] font-mono text-[var(--ms-green)] animate-pulse uppercase tracking-widest">Storage_Sync: Online</span>
      </div>
    </div>
  );
}
