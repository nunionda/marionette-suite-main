'use client';

import { useEffect, useState, useTransition } from 'react';
import type { AgentWithQueue } from '@/lib/studio/types';
import { useAgentStore } from '@/lib/studio/agent-store';
import { usePipelineSocket } from '@/hooks/usePipelineSocket';
import { startPipeline } from '@/actions/projects';
import { AgentCard } from './AgentCard';
import { AgentDetailPanel } from './AgentDetailPanel';

const ALL_STEPS = [
  'script_writer',
  'concept_artist',
  'generalist',
  'asset_designer',
  'vfx_compositor',
  'master_editor',
  'sound_designer',
];

interface Preset {
  id: string;
  name: string;
  description?: string;
  agent_steps: string[];
}

interface Props {
  initialAgents: AgentWithQueue[];
  projectId: string;
  presets?: Preset[];
}

export function AgentDashboard({ initialAgents, projectId, presets = [] }: Props) {
  const { agents, selectedAgentId, selectAgent, init, applyWsUpdate, resetForPipeline } = useAgentStore();
  const [runId, setRunId] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const [selectedPresetId, setSelectedPresetId] = useState<string>('__all__');

  const { isConnected, lastMessage } = usePipelineSocket(runId);

  // Initialize store on mount
  useEffect(() => {
    init(initialAgents);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync WS messages → agent store
  useEffect(() => {
    if (!lastMessage) return;
    const msg = lastMessage as Record<string, unknown>;

    if (msg.type === 'pipeline_started') {
      resetForPipeline();
    } else if (msg.type === 'step_started') {
      applyWsUpdate(msg.step as string, 'running');
    } else if (msg.type === 'step_completed') {
      applyWsUpdate(msg.step as string, 'done', msg.duration_ms as number | undefined);
    } else if (msg.type === 'step_failed') {
      applyWsUpdate(msg.step as string, 'error');
    }
  }, [lastMessage, applyWsUpdate, resetForPipeline]);

  function handleRunPipeline() {
    const selectedPreset = presets.find((p) => p.id === selectedPresetId);
    const steps = selectedPreset ? selectedPreset.agent_steps : ALL_STEPS;

    startTransition(async () => {
      try {
        const run = await startPipeline(projectId, steps);
        setRunId(run.id);
      } catch (err) {
        console.error('파이프라인 시작 실패:', err);
      }
    });
  }

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
            <span
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : runId ? 'bg-yellow-500 animate-pulse' : 'bg-neutral-600'}`}
            />
            <span className="text-[10px] text-[var(--studio-text-muted)]">
              {isConnected ? 'Live' : runId ? '연결 중...' : '대기'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-5">
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
          {presets.length > 0 && (
            <select
              value={selectedPresetId}
              onChange={(e) => setSelectedPresetId(e.target.value)}
              disabled={isPending || runningCount > 0}
              className="px-2 py-1.5 rounded text-[11px] border border-[var(--studio-border)] outline-none focus:border-[var(--studio-accent)] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'var(--studio-bg-base)', color: 'var(--studio-text)' }}
            >
              <option value="__all__">전체 스텝</option>
              {presets.map((p) => (
                <option key={p.id} value={p.id} title={p.description}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={handleRunPipeline}
            disabled={isPending || runningCount > 0}
            className="px-3 py-1.5 rounded text-[11px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: isPending || runningCount > 0 ? 'var(--studio-bg-surface)' : 'var(--studio-accent, #6366f1)',
              color: isPending || runningCount > 0 ? 'var(--studio-text-muted)' : '#fff',
              border: '1px solid var(--studio-border)',
            }}
          >
            {isPending ? '시작 중...' : runningCount > 0 ? '실행 중' : '파이프라인 실행'}
          </button>
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
