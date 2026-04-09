"use client";

import React, { useState, useEffect } from "react";
import { useGStack } from "./GStackProvider";

interface AgentStatus {
  name: string;
  status: "idle" | "running" | "evaluating" | "healing" | "done" | "failed";
  soq: number;
  retries: number;
  lastFeedback?: string;
}

const AGENT_SEQUENCE = [
  "Concept Artist",
  "Script Writer",
  "Location Scout",
  "Asset Designer",
  "Character Artist",
  "Storyboard Artist",
  "Director",
  "Cinematographer",
  "Generalist",
  "VFX Supervisor",
  "Lighting Lead",
  "Compositor",
  "Editor",
  "Quality Evaluator"
];

export default function SAILIntegrityMonitor() {
  const { integrity } = useGStack();
  const [agents, setAgents] = useState<AgentStatus[]>(
    AGENT_SEQUENCE.map(name => ({
      name,
      status: "idle",
      soq: 100,
      retries: 0
    }))
  );

  // Simulation: Randomly simulate pipeline activity and self-healing
  useEffect(() => {
    const timer = setInterval(() => {
      setAgents(prev => {
        const next = [...prev];
        const activeIdx = Math.floor(Math.random() * next.length);
        const agent = next[activeIdx];

        // Simulate a healing event
        if (Math.random() > 0.8) {
          agent.status = "healing";
          agent.soq = Math.floor(Math.random() * 40) + 30; // Drop SOQ below threshold
          agent.retries += 1;
          agent.lastFeedback = "Integrity violation: composition balance off. Re-generating...";
        } else if (Math.random() > 0.5) {
          agent.status = "running";
          agent.soq = Math.floor(Math.random() * 20) + 80;
        } else {
          agent.status = "done";
          agent.soq = 95 + Math.random() * 5;
        }

        return next;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-6 p-8 gstack-glass rounded-[var(--ms-radius-lg)] h-full overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col">
          <h3 className="text-xl font-title text-[var(--ms-text-bright)] flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[var(--ms-green)] animate-pulse" />
            SAIL Autonomous Integrity Loop
          </h3>
          <p className="text-xs text-[var(--ms-text-dim)] font-code mt-1">
            MONITORING 14_AGENT_SWARM_SYNC
          </p>
        </div>
        <div className="flex gap-4 items-center">
            <div className="flex flex-col items-end">
                <span className="text-[9px] font-bold text-[var(--ms-text-dim)] uppercase tracking-widest">Global Sync</span>
                <span className="text-lg font-code text-[var(--ms-green)]">{integrity.toFixed(1)}%</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 scrollbar-none">
        {agents.map((agent, i) => (
          <div 
            key={agent.name} 
            className={`p-4 rounded-xl border transition-all duration-500 ${
              agent.status === "healing" 
                ? "border-[var(--ms-amber)]/30 bg-[var(--ms-amber-haze)]" 
                : "border-[var(--ms-glass-border)] bg-white/[0.01]"
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-code text-[var(--ms-text-dim)]">0x{i.toString(16).padStart(2, '0')}</span>
                <h4 className="text-sm font-bold text-[var(--ms-text-bright)] tracking-tight">{agent.name}</h4>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-xs font-code font-bold ${
                  agent.soq < 70 ? "text-[var(--ms-amber)]" : "text-[var(--ms-green)]"
                }`}>
                  {agent.soq.toFixed(0)}%
                </span>
                <span className="text-[8px] text-[var(--ms-text-ghost)] uppercase font-bold tracking-tighter">SOQ Score</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px]">
              <div className="flex items-center gap-2">
                 <div className={`w-1.5 h-1.5 rounded-full ${
                   agent.status === "running" ? "bg-[var(--ms-blue)] animate-pulse" :
                   agent.status === "healing" ? "bg-[var(--ms-amber)] animate-pulse" :
                   agent.status === "done" ? "bg-[var(--ms-green)]" : "bg-[var(--ms-text-ghost)]"
                 }`} />
                 <span className="font-code uppercase text-[var(--ms-text-main)]">{agent.status}</span>
              </div>
              <span className="text-[var(--ms-text-dim)] font-code">{agent.retries} RETRIES</span>
            </div>

            {agent.status === "healing" && agent.lastFeedback && (
              <div className="mt-3 p-2 bg-black/40 rounded border border-[var(--ms-amber)]/20">
                <p className="text-[9px] text-[var(--ms-amber)] font-code leading-tight italic">
                   &gt; {agent.lastFeedback}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-[var(--ms-glass-border)] flex justify-between items-center text-[10px] font-code text-[var(--ms-text-ghost)]">
         <span>PROTOCOL: G_STACK_SAIL_V_4.2</span>
         <span className="animate-pulse">STREAMING_LIVE_TELEMETRY</span>
      </div>
    </div>
  );
}
