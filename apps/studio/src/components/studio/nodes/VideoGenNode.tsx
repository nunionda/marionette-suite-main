'use client';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Film } from 'lucide-react';
import type { VideoGenNodeData } from '@/lib/studio/flow-data';

const STATUS_COLOR: Record<string, string> = {
  idle: 'var(--studio-text-muted)',
  running: '#f59e0b',
  done: '#22c55e',
  error: '#ef4444',
};

export function VideoGenNode({ data, selected }: NodeProps) {
  const d = data as unknown as VideoGenNodeData;
  return (
    <div
      className="rounded-xl border border-[var(--studio-border)] bg-[var(--studio-bg-surface)] shadow-lg min-w-[220px] max-w-[260px] overflow-hidden"
      style={{ outline: selected ? '2px solid var(--studio-accent)' : '2px solid transparent' }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--studio-border)] bg-[var(--studio-bg-elevated)]">
        <div className="flex items-center gap-2">
          <Film size={13} style={{ color: '#a78bfa' }} />
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#a78bfa' }}>Video Gen</span>
        </div>
        <span className="text-[10px]" style={{ color: STATUS_COLOR[d.status] }}>● {d.status}</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-[10px] text-[var(--studio-text-muted)]">{d.provider}</p>
        <div className="mt-2 aspect-video rounded bg-[var(--studio-bg-elevated)] flex items-center justify-center">
          {d.videoUrl ? (
            <span className="text-[10px] text-[var(--studio-text-muted)]">▶ Preview</span>
          ) : (
            <span className="text-[10px] text-[var(--studio-text-muted)]">Not started</span>
          )}
        </div>
      </div>
      <Handle type="target" position={Position.Left} style={{ background: 'var(--studio-accent)' }} />
      <Handle type="source" position={Position.Right} style={{ background: 'var(--studio-accent)' }} />
    </div>
  );
}
