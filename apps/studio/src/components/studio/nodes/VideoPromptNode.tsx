'use client';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Video } from 'lucide-react';
import type { VideoPromptNodeData } from '@/lib/studio/flow-data';

export function VideoPromptNode({ data, selected }: NodeProps) {
  const d = data as unknown as VideoPromptNodeData;
  return (
    <div
      className="rounded-xl border border-[var(--studio-border)] bg-[var(--studio-bg-surface)] shadow-lg min-w-[220px] max-w-[260px] overflow-hidden"
      style={{ outline: selected ? '2px solid var(--studio-accent)' : '2px solid transparent' }}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--studio-border)] bg-[var(--studio-bg-elevated)]">
        <Video size={13} style={{ color: '#f59e0b' }} />
        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#f59e0b' }}>Video Prompt</span>
      </div>
      <div className="px-3 py-2 space-y-1">
        <p className="text-[11px] text-[var(--studio-text-dim)] line-clamp-3">{d.prompt}</p>
        <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-[var(--studio-bg-elevated)] text-[var(--studio-text-muted)] font-mono">{d.cameraMove}</span>
      </div>
      <Handle type="target" position={Position.Left} style={{ background: 'var(--studio-accent)' }} />
      <Handle type="source" position={Position.Right} style={{ background: 'var(--studio-accent)' }} />
    </div>
  );
}
