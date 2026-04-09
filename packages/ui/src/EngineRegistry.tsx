"use client";

import React, { useState } from "react";

interface Engine {
  id: string;
  name: string;
  type: "Cloud" | "Local" | "Hybrid";
  provider: string;
  status: "Online" | "Offline" | "Degraded";
  description: string;
}

interface AgentBinding {
  role: string;
  engineId: string;
  phase: "Pre" | "Main" | "Post";
}

interface EngineRegistryProps {
  health?: {
    integrity_score: number;
    api_latency: Record<string, number>;
    infrastructure: any;
    logs: string[];
  };
}

export default function EngineRegistry({ health }: EngineRegistryProps) {
  const [engines] = useState<Engine[]>([
    { id: "gemini-2.5", name: "Gemini 2.5 Pro", type: "Cloud", provider: "Google", status: "Online", description: "Default reasoning & script engine." },
    { id: "gemma-2-9b", name: "Gemma 2 9B", type: "Local", provider: "Ollama", status: "Offline", description: "Privacy-focused local script generation." },
    { id: "veo-3.1", name: "Google Veo 3.1", type: "Cloud", provider: "Vertex AI", status: "Online", description: "State-of-the-art cinematic video generation." },
    { id: "midjourney-v6", name: "Midjourney v6", type: "Cloud", provider: "Discord/API", status: "Online", description: "Stylized concept art & storyboarding." },
    { id: "sora-fall", name: "OpenAI Sora", type: "Cloud", provider: "Azure", status: "Degraded", description: "Fallback high-fidelity video engine." },
    { id: "claude-seedence", name: "Claude 3.5 (Seedence)", type: "Hybrid", provider: "Anthropic/Code", status: "Online", description: "Code-based algorithmic video synthesis." },
  ]);

  const [bindings, setBindings] = useState<AgentBinding[]>([
    { role: "Scripter", engineId: "gemini-2.5", phase: "Pre" },
    { role: "Concept Artist", engineId: "midjourney-v6", phase: "Pre" },
    { role: "Previsualizer", engineId: "veo-3.1", phase: "Pre" },
    { role: "Casting Director", engineId: "gemini-2.5", phase: "Pre" },
    { role: "Location Scout", engineId: "midjourney-v6", phase: "Pre" },
    { role: "Cinematographer", engineId: "gemini-2.5", phase: "Main" },
    { role: "Generalist", engineId: "veo-3.1", phase: "Main" },
    { role: "Asset Designer", engineId: "claude-seedence", phase: "Main" },
    { role: "VFX Compositor", engineId: "claude-seedence", phase: "Post" },
    { role: "Master Editor", engineId: "gemini-2.5", phase: "Post" },
    { role: "Colorist", engineId: "midjourney-v6", phase: "Post" },
    { role: "Sound Designer", engineId: "gemini-2.5", phase: "Post" },
    { role: "Composer", engineId: "gemini-2.5", phase: "Post" },
    { role: "Mixing Engineer", engineId: "gemini-2.5", phase: "Post" },
  ]);

  const handleUpdateBinding = (role: string, engineId: string) => {
    setBindings(bindings.map(b => b.role === role ? { ...b, engineId } : b));
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-[var(--ms-gold)] tracking-tight">AI Engine Registry</h2>
        <p className="text-sm text-[var(--ms-text-dim)]">Manage and orchestrate scattered AI technologies across the 14-agent pipeline.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Strategic Infrastructure Sidebar */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--ms-text-dim)]">Infrastructure Load</h3>
              <div className="space-y-4 p-5 bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-xl">
                {/* Render Farm Load */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-tight">
                    <span className="text-[var(--ms-text-dim)]">Render Farm Load</span>
                    <span className="text-[var(--ms-green)]">82%</span>
                  </div>
                  <div className="h-12 w-full bg-black/40 rounded flex items-end gap-[1px] p-0.5 overflow-hidden">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div key={i} className="flex-1 bg-[var(--ms-green)]/30 rounded-t-[1px] transition-all duration-1000" style={{ height: `${Math.random() * 60 + 20}%` }} />
                    ))}
                  </div>
                </div>

                {/* GPU Usage */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-tight">
                    <span className="text-[var(--ms-text-dim)]">GPU Cluster Usage</span>
                    <span className="text-[var(--ms-gold)]">74%</span>
                  </div>
                  <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-[var(--ms-border)]/50">
                     <div className="h-full bg-gradient-to-r from-[var(--ms-gold)]/40 to-[var(--ms-gold)] rounded-full transition-all duration-1000" style={{ width: '74%' }} />
                  </div>
                </div>

                {/* Storage Depth */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-tight">
                    <span className="text-[var(--ms-text-dim)]">Storage Depth</span>
                    <span className="text-[var(--ms-text)]">4.1 TB / 6.0 TB</span>
                  </div>
                  <div className="flex gap-1 h-3">
                     {Array.from({ length: 12 }).map((_, i) => (
                       <div key={i} className={`flex-1 rounded-sm border border-white/5 ${i < 8 ? 'bg-[var(--ms-green)]/40' : 'bg-black/40'}`} />
                     ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--ms-text-dim)]">Available Engines</h3>
              <div className="space-y-3">
                {engines.map((engine) => (
                  <div key={engine.id} className="p-4 bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-xl group hover:border-[var(--ms-gold)]/50 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-[var(--ms-text)] group-hover:text-[var(--ms-gold)] transition-colors">{engine.name}</h4>
                        <span className="text-[8px] text-[var(--ms-text-dim)] uppercase font-mono tracking-tighter">{engine.provider} • {engine.type}</span>
                      </div>
                      <div className={`px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-widest ${
                        engine.status === "Online" ? "bg-green-500/20 text-green-400" : 
                        engine.status === "Degraded" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"
                      }`}>
                        {engine.status}
                      </div>
                    </div>
                    <p className="mt-2 text-[9px] text-[var(--ms-text-dim)] leading-relaxed italic">"{engine.description}"</p>
                  </div>
                ))}
              </div>
              <button className="w-full py-2 border border-dashed border-[var(--ms-border)] rounded-lg text-[9px] font-bold text-[var(--ms-text-dim)] hover:text-[var(--ms-gold)] hover:border-[var(--ms-gold)] transition-all uppercase tracking-widest">
                + Register New Engine
              </button>
            </div>
          </div>

        {/* Agent Orchestration Board */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--ms-text-dim)]">Agent Orchestration (14 Roles)</h3>
          <div className="bg-[var(--ms-bg-2)] border border-[var(--ms-border)] rounded-xl overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[var(--ms-bg)]/50 border-b border-[var(--ms-border)]">
                  <th className="px-6 py-3 text-left text-[9px] font-bold text-[var(--ms-text-dim)] uppercase tracking-wider">Production Agent</th>
                  <th className="px-6 py-3 text-left text-[9px] font-bold text-[var(--ms-text-dim)] uppercase tracking-wider">Phase</th>
                  <th className="px-6 py-3 text-left text-[9px] font-bold text-[var(--ms-text-dim)] uppercase tracking-wider">Assigned Engine</th>
                  <th className="px-6 py-3 text-center text-[9px] font-bold text-[var(--ms-text-dim)] uppercase tracking-wider">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ms-border)]">
                {["Scripter", "Concept Artist", "Previsualizer", "Casting Director", "Location Scout", "Cinematographer", "Generalist", "Asset Designer", "VFX Compositor", "Master Editor", "Colorist", "Sound Designer", "Composer", "Mixing Engineer"].map((role) => {
                  const binding = bindings.find(b => b.role === role);
                  const currentEngine = engines.find(e => e.id === binding?.engineId);
                  
                  return (
                    <tr key={role} className="hover:bg-[var(--ms-gold)]/5 transition-colors group">
                      <td className="px-6 py-3">
                        <span className="text-[10px] font-bold text-[var(--ms-text)]">{role}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border border-[var(--ms-border)] text-[var(--ms-text-dim)] uppercase`}>
                           {role.match(/Scripter|Artist|Visualizer|Casting|Location/) ? "PRE" : role.match(/Cinematog|General|Asset/) ? "MAIN" : "POST"}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <select 
                          className="bg-[var(--ms-bg)] border border-[var(--ms-border)] rounded px-2 py-1 text-[9px] text-[var(--ms-gold)] focus:ring-1 focus:ring-[var(--ms-gold)] outline-none w-full appearance-none cursor-pointer"
                          value={binding?.engineId || "none"}
                          onChange={(e) => handleUpdateBinding(role, e.target.value)}
                        >
                          <option value="none">Select Engine...</option>
                          {engines.map(e => <option key={e.id} value={e.id}>{e.name} ({e.type})</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`text-[9px] font-mono ${
                          (health?.api_latency?.gemini ?? 0) > 1000 ? "text-amber-400" : "text-green-400"
                        }`}>
                          {role === "Scripter" && health?.api_latency?.gemini ? `~${health.api_latency.gemini}ms` : `~${Math.floor(Math.random() * 50) + 150}ms`}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Live Diagnostic Logs (New Section) */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--ms-text-dim)]">Live Diagnostic Monitoring</h3>
        <div className="bg-black/40 border border-[var(--ms-border)] rounded-xl p-6 font-mono">
           <div className="flex justify-between items-center mb-4">
              <span className="text-[9px] text-[var(--ms-green)] font-bold uppercase tracking-widest animate-pulse">● System_Auditor_Active</span>
              <span className="text-[9px] text-[var(--ms-text-dim)] uppercase">Refresh_Cycle: 60s</span>
           </div>
           <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
              {health?.logs && health.logs.length > 0 ? (
                health.logs.map((log, i) => (
                  <div key={i} className={`text-[10px] ${
                    log.includes("CRITICAL") ? "text-red-400" : 
                    log.includes("WARNING") ? "text-amber-400" : "text-zinc-500"
                  }`}>
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-[10px] text-zinc-600 italic">Waiting for initial diagnostic data...</div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
