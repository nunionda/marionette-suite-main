'use client';

import { ImageIcon, VideoIcon, Mic, Sparkles, Search } from 'lucide-react';
import type { AgentWithQueue, AgentType } from '@/lib/studio/types';

const ICON_MAP: Record<AgentType, typeof ImageIcon> = {
  image_gen: ImageIcon,
  video_gen: VideoIcon,
  audio_gen: Mic,
  prompt: Sparkles,
  analysis: Search,
};

const STATUS_DOT: Record<string, string> = {
  idle: 'bg-[var(--studio-text-muted)]',
  running: 'bg-amber-400 animate-pulse',
  done: 'bg-green-500',
  error: 'bg-red-500',
};

interface Props {
  agent: AgentWithQueue;
  selected: boolean;
  onClick: () => void;
}

export function AgentCard({ agent, selected, onClick }: Props) {
  const Icon = ICON_MAP[agent.type];
  const pendingCount = agent.queue.filter((q) => q.status === 'pending' || q.status === 'processing').length;

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg border p-3 transition-all"
      style={{
        background: selected ? 'var(--studio-bg-hover)' : 'var(--studio-bg-surface)',
        borderColor: selected ? 'var(--studio-accent)' : 'var(--studio-border)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[agent.status]}`} />
        <Icon size={14} style={{ color: 'var(--studio-accent)' }} />
        <span className="text-[12px] font-semibold text-[var(--studio-text)]">
          {agent.label}
        </span>
        {agent.paused && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-900/30 text-amber-400 font-bold uppercase">
            Paused
          </span>
        )}
      </div>

      <div className="ml-4 text-[11px] text-[var(--studio-text-dim)] mb-1.5">
        {agent.currentTask ? (
          <span className="font-mono">{agent.currentTask.displayId}</span>
        ) : (
          <span className="text-[var(--studio-text-muted)]">--</span>
        )}
      </div>

      <div className="ml-4 flex gap-4 text-[10px] text-[var(--studio-text-muted)]">
        <span>
          processed <span className="text-[var(--studio-text-dim)] font-mono">{agent.stats.processed}</span>
        </span>
        <span>
          errors{' '}
          <span className={agent.stats.errors > 0 ? 'text-red-400 font-mono' : 'text-[var(--studio-text-dim)] font-mono'}>
            {agent.stats.errors}
          </span>
        </span>
        <span>
          queue <span className="text-[var(--studio-text-dim)] font-mono">{pendingCount}</span>
        </span>
      </div>
    </button>
  );
}
