"use client";

import React, { useState } from "react";

interface ScriptImportUIProps {
  onImportComplete: (scenes: any[]) => void;
  onCancel: () => void;
}

export default function ScriptImportUI({ onImportComplete, onCancel }: ScriptImportUIProps) {
  const [isParsing, setIsParsing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parseStatus, setParseStatus] = useState("");

  const handleStartImport = () => {
    setIsParsing(true);
    setProgress(0);
    
    // Simulate Intelligent Parsing Flow
    setParseStatus("Analyzing script structure...");
    setTimeout(() => { setProgress(20); setParseStatus("Identifying Scene Headings..."); }, 1000);
    setTimeout(() => { setProgress(45); setParseStatus("Extracting Characters and Locations..."); }, 2000);
    setTimeout(() => { setProgress(70); setParseStatus("Analyzing Production Design requirements (Sets/Props)..."); }, 3500);
    setTimeout(() => { setProgress(90); setParseStatus("Finalizing Production Scene Database..."); }, 5000);
    setTimeout(() => { 
      setProgress(100); 
      setParseStatus("Parsing Complete."); 
      setTimeout(() => onImportComplete([]), 500);
    }, 6000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-6">
      <div className="w-full max-w-2xl bg-[var(--ms-bg-elevated)] border border-[var(--ms-gold-border)]/40 rounded-[var(--ms-radius-lg)] p-12 shadow-[var(--ms-glass-shadow)] relative overflow-hidden">
        {/* Decorative Scanned Line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--ms-gold)] to-transparent opacity-20" />
        
        <h2 className="text-3xl font-serif text-[var(--ms-gold)] mb-2 tracking-tight">Import Production Scenario</h2>
        <p className="text-[var(--ms-text-dim)] text-[9px] font-mono uppercase tracking-[0.4em] mb-10">Protocols: PDF // FOUNTAIN // FDX</p>

        {!isParsing ? (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-[var(--ms-border)] rounded-xl py-12 flex flex-col items-center justify-center bg-[var(--ms-bg)]/50 hover:border-[var(--ms-gold)]/50 transition-all group">
              <span className="text-4xl mb-4 opacity-50 group-hover:opacity-100 transition-opacity">📄</span>
              <p className="text-[var(--ms-text)] font-bold mb-1">Drag and drop your script here</p>
              <p className="text-[10px] text-[var(--ms-text-dim)] uppercase">or click to browse files</p>
              <input type="file" className="hidden" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-[var(--ms-gold)] uppercase tracking-widest">Metadata Context</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[var(--ms-bg)] border border-[var(--ms-border)] p-3 rounded-lg">
                  <span className="text-[8px] text-[var(--ms-text-dim)] block mb-1">Project Category</span>
                  <select className="bg-transparent text-xs text-[var(--ms-text)] w-full focus:outline-none">
                    <option>Internal Development</option>
                    <option>External Acquisition</option>
                  </select>
                </div>
                <div className="bg-[var(--ms-bg)] border border-[var(--ms-border)] p-3 rounded-lg">
                  <span className="text-[8px] text-[var(--ms-text-dim)] block mb-1">Language</span>
                  <select className="bg-transparent text-xs text-[var(--ms-text)] w-full focus:outline-none">
                    <option>Korean (KO)</option>
                    <option>English (EN)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <button 
                onClick={onCancel}
                className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--ms-text-dim)] hover:text-[var(--ms-text)] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleStartImport}
                className="px-8 py-3 bg-[var(--ms-gold)] text-[var(--ms-bg)] text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all"
              >
                Begin Intelligent Import
              </button>
            </div>
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center">
            <div className="w-24 h-24 mb-8 relative">
              <div className="absolute inset-0 border-4 border-[var(--ms-border)] rounded-full" />
              <div 
                className="absolute inset-0 border-4 border-[var(--ms-gold)] rounded-full transition-all duration-300" 
                style={{ clipPath: `inset(0 0 0 ${100 - progress}%)`, borderRightColor: 'transparent', borderBottomColor: 'transparent' }}
              />
              <div className="absolute inset-0 flex items-center justify-center font-serif text-2xl font-bold text-[var(--ms-gold)]">
                {progress}%
              </div>
            </div>
            
            <h3 className="text-[var(--ms-text)] font-bold mb-2 animate-pulse">{parseStatus}</h3>
            <p className="text-[10px] text-[var(--ms-text-dim)] uppercase tracking-tighter">Marionette AI is analyzing narrative structure and departmental assets...</p>
            
            <div className="w-full max-w-sm mt-8 h-1 bg-[var(--ms-border)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--ms-gold)] transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
