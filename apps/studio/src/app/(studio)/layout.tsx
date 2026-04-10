"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ScenarioIDManager, Project, PipelineProvider } from "@marionette/ui";
import { getProjects } from "@/actions/projects";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  useEffect(() => {
    async function load() {
      const data = await getProjects();
      setProjects(data);
      if (data.length > 0) setSelectedProjectId(data[0].id);
    }
    load();
  }, []);

  return (
    <PipelineProvider>
      <div className="min-h-screen bg-[var(--ms-bg-base)] text-[var(--ms-text-main)] selection:bg-[var(--ms-gold)] selection:text-black">
        {/* Studio Header */}
        <header className="sticky top-0 z-50 bg-[var(--ms-bg-base)]/80 backdrop-blur-xl border-b border-[var(--ms-gold-border)]/10 py-4">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-full border border-[var(--ms-gold)] flex items-center justify-center text-[var(--ms-gold)] text-xs font-serif group-hover:bg-[var(--ms-gold)] group-hover:text-black transition-all">
                    ←
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-[var(--ms-text-dim)] group-hover:text-[var(--ms-gold)] transition-colors">
                    Back_to_Matrix
                  </span>
                </Link>
                
                <div className="hidden lg:flex items-center gap-6 px-6 border-l border-[var(--ms-gold-border)]/20">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-[var(--ms-text-dim)] uppercase font-bold">Timecode</span>
                    <span className="text-xs font-mono text-[var(--ms-gold)]">00:00:00:00</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-[var(--ms-text-dim)] uppercase font-bold">FPS / Res</span>
                    <span className="text-[10px] font-mono text-[var(--ms-text-main)]">23.976 | 3840x2160</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-[var(--ms-text-dim)] uppercase font-bold">Sensor</span>
                    <span className="text-[10px] font-mono text-[var(--ms-text-main)] uppercase">AI_VEO_GEN_v2</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--ms-gold)] animate-pulse" />
                    <span className="text-[9px] font-mono text-[var(--ms-gold)] uppercase tracking-widest font-bold">Auteur_Station_v4.5</span>
                 </div>
              </div>
            </div>
            
            <ScenarioIDManager 
              projects={projects} 
              selectedProjectId={selectedProjectId}
              onSelectProject={setSelectedProjectId}
            />
          </div>
        </header>

        {/* Independent Studio Content */}
        <main className="max-w-[1600px] mx-auto px-6 md:px-12 py-12">
          {children}
        </main>

        {/* Global Metadata Footer */}
        <footer className="max-w-[1600px] mx-auto px-6 md:px-12 py-8 border-t border-[var(--ms-gold-border)]/10 text-[8px] font-mono text-[var(--ms-text-dim)] flex justify-between items-center bg-black/20">
           <span className="uppercase tracking-[0.4em] opacity-40">AU_MARIONETTE // INDEPENDENT_STUDIO_PROTOCOL</span>
           <div className="flex gap-8">
              <span className="uppercase tracking-widest">ENV: INDUSTRIAL_LAB</span>
              <span className="text-[var(--ms-gold)] uppercase tracking-widest">AUTH: LEVEL_4_ACCESS</span>
           </div>
        </footer>
      </div>
    </PipelineProvider>
  );
}
