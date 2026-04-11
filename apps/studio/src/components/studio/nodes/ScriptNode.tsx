'use client';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { FileText } from 'lucide-react';
import type { ScriptNodeData } from '@/lib/studio/flow-data';

export function ScriptNode({ data, selected }: NodeProps) {
  return (
    <div
      className="rounded-xl border border-[var(--studio-border)] bg-[var(--studio-bg-surface)] shadow-lg min-w-[220px] max-w-[260px] overflow-hidden"
      style={{ outline: selected ? '2px solid var(--studio-accent)' : '2px solid transparent' }}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--studio-border)] bg-[var(--studio-bg-elevated)]">
        <FileText size={13} style={{ color: 'var(--studio-accent)' }} />
        <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--studio-accent)]">Script</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-[11px] text-[var(--studio-text-dim)] leading-relaxed line-clamp-4">
          {(data as unknown as ScriptNodeData).script}
        </p>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: 'var(--studio-accent)' }} />
    </div>
  );
}
