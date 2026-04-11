'use client';

import {
  Pause,
  Play,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Zap,
  ImageIcon,
  VideoIcon,
  Mic,
  Sparkles,
  Search,
} from 'lucide-react';
import type { AgentWithQueue, AgentType, QueueItem } from '@/lib/studio/types';
import { useAgentStore } from '@/lib/studio/agent-store';

const ICON_MAP: Record<AgentType, typeof ImageIcon> = {
  image_gen: ImageIcon,
  video_gen: VideoIcon,
  audio_gen: Mic,
  prompt: Sparkles,
  analysis: Search,
};

const STATUS_COLOR: Record<string, string> = {
  idle: 'var(--studio-text-muted)',
  running: '#f59e0b',
  done: '#22c55e',
  error: '#ef4444',
};

interface Props {
  agent: AgentWithQueue | null;
}

export function AgentDetailPanel({ agent }: Props) {
  const { retryItem, moveItem, togglePause, runItem } = useAgentStore();

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--studio-text-muted)] gap-3">
        <div className="text-4xl opacity-30">◈</div>
        <p className="text-[12px]">에이전트를 선택하세요</p>
      </div>
    );
  }

  const Icon = ICON_MAP[agent.type];
  const pendingItems = agent.queue.filter((q) => q.status === 'pending');
  const processingItem = agent.queue.find((q) => q.status === 'processing');
  const errorItems = agent.queue.filter((q) => q.status === 'error');

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 border-b border-[var(--studio-border)]"
        style={{ height: 52, background: 'var(--studio-bg-elevated)', flexShrink: 0 }}
      >
        <div className="flex items-center gap-3">
          <Icon size={16} style={{ color: 'var(--studio-accent)' }} />
          <span className="text-[13px] font-bold text-[var(--studio-text)]">{agent.label}</span>
          <span className="text-[11px] font-mono" style={{ color: STATUS_COLOR[agent.status] }}>
            ● {agent.status}
          </span>
          {agent.paused && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-900/30 text-amber-400 font-bold uppercase">
              Paused
            </span>
          )}
        </div>
        <button
          onClick={() => togglePause(agent.id)}
          className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-md border transition-colors"
          style={{
            borderColor: agent.paused ? 'var(--studio-success)' : 'var(--studio-warning)',
            color: agent.paused ? 'var(--studio-success)' : 'var(--studio-warning)',
            background: agent.paused ? '#22c55e11' : '#f59e0b11',
          }}
        >
          {agent.paused ? <Play size={12} /> : <Pause size={12} />}
          {agent.paused ? 'Resume' : 'Pause'}
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Current task */}
        {processingItem && (
          <div>
            <SectionLabel>Current Task</SectionLabel>
            <div
              className="rounded-lg border border-amber-700/40 px-4 py-3 flex items-center justify-between"
              style={{ background: '#f59e0b08' }}
            >
              <div>
                <span className="text-[12px] font-mono font-semibold text-amber-400">
                  {processingItem.displayId}
                </span>
                <span className="text-[10px] text-[var(--studio-text-muted)] ml-3">processing...</span>
              </div>
              <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
            </div>
          </div>
        )}

        {/* Queue */}
        <div>
          <SectionLabel>
            Queue
            <span className="text-[var(--studio-text-muted)] font-normal ml-2">
              {pendingItems.length + errorItems.length} items
            </span>
          </SectionLabel>
          {pendingItems.length === 0 && errorItems.length === 0 ? (
            <div className="rounded-lg border border-[var(--studio-border)] px-4 py-6 text-center" style={{ background: 'var(--studio-bg-surface)' }}>
              <span className="text-[11px] text-[var(--studio-text-muted)]">Queue empty</span>
            </div>
          ) : (
            <div className="rounded-lg border border-[var(--studio-border)] overflow-hidden" style={{ background: 'var(--studio-bg-surface)' }}>
              {/* Error items first */}
              {errorItems.map((item) => (
                <QueueRow
                  key={item.id}
                  item={item}
                  agentId={agent.id}
                  onRetry={() => {
                    // Move to history then re-add to queue via retryItem
                    retryItem(agent.id, item.id);
                  }}
                />
              ))}
              {/* Pending items */}
              {pendingItems.map((item, idx) => (
                <QueueRow
                  key={item.id}
                  item={item}
                  agentId={agent.id}
                  canMoveUp={idx > 0}
                  canMoveDown={idx < pendingItems.length - 1}
                  onMoveUp={() => moveItem(agent.id, item.id, 'up')}
                  onMoveDown={() => moveItem(agent.id, item.id, 'down')}
                  onRun={() => runItem(agent.id, item.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* History */}
        <div>
          <SectionLabel>
            Recent History
            <span className="text-[var(--studio-text-muted)] font-normal ml-2">
              {agent.history.length} items
            </span>
          </SectionLabel>
          {agent.history.length === 0 ? (
            <div className="rounded-lg border border-[var(--studio-border)] px-4 py-6 text-center" style={{ background: 'var(--studio-bg-surface)' }}>
              <span className="text-[11px] text-[var(--studio-text-muted)]">No history yet</span>
            </div>
          ) : (
            <div className="rounded-lg border border-[var(--studio-border)] overflow-hidden" style={{ background: 'var(--studio-bg-surface)' }}>
              {agent.history.slice(0, 20).map((item) => (
                <HistoryRow key={item.id} item={item} agentId={agent.id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--studio-text-muted)] mb-2">
      {children}
    </p>
  );
}

function QueueRow({
  item,
  agentId,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onRun,
  onRetry,
}: {
  item: QueueItem;
  agentId: string;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRun?: () => void;
  onRetry?: () => void;
}) {
  const isError = item.status === 'error';

  return (
    <div
      className="flex items-center justify-between px-3 py-2 border-b border-[var(--studio-border)] last:border-b-0"
      style={{ background: isError ? '#ef444408' : undefined }}
    >
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono text-[var(--studio-text-dim)]">{item.displayId}</span>
        {isError && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-900/30 text-red-400 font-bold">
            ERROR
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        {isError && onRetry && (
          <ActionBtn onClick={onRetry} title="Retry" color="var(--studio-warning)">
            <RotateCcw size={11} />
          </ActionBtn>
        )}
        {!isError && onMoveUp && canMoveUp && (
          <ActionBtn onClick={onMoveUp} title="Move up">
            <ChevronUp size={11} />
          </ActionBtn>
        )}
        {!isError && onMoveDown && canMoveDown && (
          <ActionBtn onClick={onMoveDown} title="Move down">
            <ChevronDown size={11} />
          </ActionBtn>
        )}
        {!isError && onRun && (
          <ActionBtn onClick={onRun} title="Run now" color="var(--studio-success)">
            <Zap size={11} />
          </ActionBtn>
        )}
      </div>
    </div>
  );
}

function HistoryRow({ item, agentId }: { item: QueueItem; agentId: string }) {
  const { retryItem } = useAgentStore();
  const isError = item.status === 'error';

  return (
    <div
      className="flex items-center justify-between px-3 py-2 border-b border-[var(--studio-border)] last:border-b-0"
      style={{ background: isError ? '#ef444406' : undefined }}
    >
      <div className="flex items-center gap-2">
        <span
          className="text-[11px]"
          style={{ color: isError ? '#ef4444' : '#22c55e' }}
        >
          {isError ? '✕' : '✓'}
        </span>
        <span className="text-[11px] font-mono text-[var(--studio-text-dim)]">{item.displayId}</span>
      </div>
      <div className="flex items-center gap-3">
        {item.durationMs && (
          <span className="text-[10px] font-mono text-[var(--studio-text-muted)]">
            {(item.durationMs / 1000).toFixed(1)}s
          </span>
        )}
        {isError && (
          <>
            <span className="text-[9px] text-red-400 max-w-[180px] truncate" title={item.errorMessage}>
              {item.errorMessage}
            </span>
            <ActionBtn onClick={() => retryItem(agentId, item.id)} title="Retry" color="var(--studio-warning)">
              <RotateCcw size={10} />
            </ActionBtn>
          </>
        )}
      </div>
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  title,
  color,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-1 rounded hover:bg-[var(--studio-bg-hover)] transition-colors"
      style={{ color: color ?? 'var(--studio-text-dim)' }}
    >
      {children}
    </button>
  );
}
