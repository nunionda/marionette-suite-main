'use client';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Mic } from 'lucide-react';
import type { AudioNodeData } from '@/lib/studio/flow-data';

const STATUS_COLOR: Record<string, string> = {
  idle: 'var(--studio-text-muted)',
  running: '#f59e0b',
  done: '#22c55e',
  error: '#ef4444',
};

export function AudioNode({ data, selected }: NodeProps) {
  const d = data as unknown as AudioNodeData;
  return (
    <div
      className="rounded-xl border border-[var(--studio-border)] bg-[var(--studio-bg-surface)] shadow-lg min-w-[220px] max-w-[260px] overflow-hidden"
      style={{ outline: selected ? '2px solid var(--studio-accent)' : '2px solid transparent' }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--studio-border)] bg-[var(--studio-bg-elevated)]">
        <div className="flex items-center gap-2">
          <Mic size={13} style={{ color: '#34d399' }} />
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#34d399' }}>Audio</span>
        </div>
        <span className="text-[10px]" style={{ color: STATUS_COLOR[d.status] }}>● {d.status}</span>
      </div>
      <div className="px-3 py-2 space-y-1">
        <p className="text-[11px] text-[var(--studio-text-dim)] line-clamp-2">{d.text}</p>
        <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-[var(--studio-bg-elevated)] text-[var(--studio-text-muted)] font-mono">{d.voice}</span>
      </div>
      <Handle type="target" position={Position.Left} style={{ background: 'var(--studio-accent)' }} />
      <Handle type="source" position={Position.Right} style={{ background: 'var(--studio-accent)' }} />
    </div>
  );
}
