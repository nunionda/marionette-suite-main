"use client";

import React from "react";

export interface Project {
  id: string;
  title: string;
  genre?: string;
  status: string;
  updated_at: string;
}

interface ScenarioIDManagerProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
  onImportScript?: () => void;
}

export default function ScenarioIDManager({ projects, selectedProjectId, onSelectProject, onImportScript }: ScenarioIDManagerProps) {
  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 mb-6">
      <div className="bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-full p-2 flex items-center justify-between shadow-lg">
        {/* Project Selector Trigger */}
        <div className="flex items-center gap-4 px-6 py-2 border-r border-[var(--ms-border)]">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-[var(--ms-gold)] font-bold">
              Active Project
            </span>
            <select 
              value={selectedProjectId}
              onChange={(e) => onSelectProject(e.target.value)}
              className="bg-transparent text-[var(--ms-text)] font-serif font-bold focus:outline-none cursor-pointer text-lg appearance-none pr-6"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23D4AF37\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '12px' }}
            >
              {projects.length > 0 ? (
                projects.map(p => (
                  <option key={p.id} value={p.id} className="bg-[var(--ms-bg-2)] text-[var(--ms-text)]">
                    {p.title}
                  </option>
                ))
              ) : (
                <option value="">No Projects Found</option>
              )}
            </select>
          </div>
        </div>

        {/* Project Details Badge */}
        <div className="hidden md:flex flex-grow items-center gap-8 px-8">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-tighter text-[var(--ms-text-dim)] mb-0.5">Project ID</span>
            <span className="text-xs font-mono text-[var(--ms-text)]">{selectedProject?.id || "N/A"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-tighter text-[var(--ms-text-dim)] mb-0.5">Genre</span>
            <span className="text-xs font-bold text-amber-400">
              {selectedProject?.genre || "Unknown"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-tighter text-[var(--ms-text-dim)] mb-0.5">Phase</span>
            <span className="text-xs text-[var(--ms-text)] uppercase">{selectedProject?.status || "N/A"}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 px-4">
          <button className="p-2 text-[var(--ms-text-dim)] hover:text-[var(--ms-gold)] transition-colors" title="Project Settings">
            ⚙️
          </button>
          <button 
            onClick={onImportScript}
            className="px-5 py-2 bg-[var(--ms-gold)] text-[var(--ms-bg)] text-[10px] font-bold tracking-widest rounded-full uppercase hover:opacity-90 transition-all"
          >
            Import Script
          </button>
        </div>
      </div>
    </div>
  );
}
