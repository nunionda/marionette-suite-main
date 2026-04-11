'use client';

import { useEffect } from 'react';
import type { AgentWithQueue } from '@/lib/studio/types';
import { useAgentStore } from '@/lib/studio/agent-store';
import { AgentCard } from './AgentCard';
import { AgentDetailPanel } from './AgentDetailPanel';

interface Props {
  initialAgents: AgentWithQueue[];
  projectId: string;
}

export function AgentDashboard({ initialAgents, projectId }: Props) {
  const { agents, selectedAgentId, selectAgent, init } = useAgentStore();

  // Initialize store on mount
  useEffect(() => {
    init(initialAgents);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) ?? null;

  // Summary stats
  const totalProcessed = agents.reduce((acc, a) => acc + a.stats.processed, 0);
  const totalErrors = agents.reduce((acc, a) => acc + a.stats.errors, 0);
  const totalQueue = agents.reduce(
    (acc, a) => acc + a.queue.filter((q) => q.status === 'pending' || q.status === 'processing').length,
    0,
  );
  const runningCount = agents.filter((a) => a.status === 'running').length;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-5 border-b border-[var(--studio-border)]"
        style={{ height: 52, background: 'var(--studio-bg-elevated)', flexShrink: 0 }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-[14px] font-bold text-[var(--studio-text)]">에이전트 대시보드</h1>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-[var(--studio-text-muted)]">Live</span>
          </div>
        </div>
        <div className="flex gap-5 text-[11px] text-[var(--studio-text-muted)]">
          <span>
            Running <span className="font-mono text-amber-400">{runningCount}</span>
          </span>
          <span>
            Processed <span className="font-mono text-[var(--studio-text-dim)]">{totalProcessed}</span>
          </span>
          <span>
            Errors <span className="font-mono text-red-400">{totalErrors}</span>
          </span>
          <span>
            Queue <span className="font-mono text-[var(--studio-text-dim)]">{totalQueue}</span>
          </span>
        </div>
      </div>

      {/* Split panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Agent list */}
        <div
          className="overflow-y-auto p-3 space-y-2"
          style={{ flex: '0 0 35%', background: 'var(--studio-bg-base)' }}
        >
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              selected={agent.id === selectedAgentId}
              onClick={() => selectAgent(agent.id)}
            />
          ))}
        </div>

        {/* Right: Detail panel */}
        <div
          style={{
            flex: '0 0 65%',
            borderLeft: '1px solid var(--studio-border)',
            background: 'var(--studio-bg-surface)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <AgentDetailPanel agent={selectedAgent} />
        </div>
      </div>
    </div>
  );
}
