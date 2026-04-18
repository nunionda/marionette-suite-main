'use client';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { CheckCircle2 } from 'lucide-react';
import type { FinalCutNodeData } from '@/lib/studio/flow-data';

export function FinalCutNode({ data, selected }: NodeProps) {
  const d = data as unknown as FinalCutNodeData;
  return (
    <div
      className="rounded-xl border bg-[var(--studio-bg-surface)] shadow-lg min-w-[220px] max-w-[260px] overflow-hidden"
      style={{
        borderColor: d.approved ? '#22c55e' : 'var(--studio-border)',
        outline: selected ? '2px solid var(--studio-accent)' : '2px solid transparent',
      }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--studio-border)] bg-[var(--studio-bg-elevated)]">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={13} style={{ color: d.approved ? '#22c55e' : 'var(--studio-text-muted)' }} />
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: d.approved ? '#22c55e' : 'var(--studio-text-muted)' }}>
            Final Cut
          </span>
        </div>
        <span className="text-[10px] font-mono text-[var(--studio-text-muted)]">{d.displayId}</span>
      </div>
      <div className="px-3 py-3 flex items-center justify-center">
        <span
          className="text-[11px] font-bold px-3 py-1 rounded-full"
          style={{
            background: d.approved ? '#22c55e22' : 'var(--studio-bg-elevated)',
            color: d.approved ? '#22c55e' : 'var(--studio-text-muted)',
          }}
        >
          {d.approved ? '✓ Approved' : '○ Pending'}
        </span>
      </div>
      <Handle type="target" position={Position.Left} style={{ background: 'var(--studio-accent)' }} />
    </div>
  );
}
