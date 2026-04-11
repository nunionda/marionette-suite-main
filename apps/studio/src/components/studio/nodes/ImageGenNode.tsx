'use client';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ImageIcon } from 'lucide-react';
import Image from 'next/image';
import type { ImageGenNodeData } from '@/lib/studio/flow-data';

const STATUS_COLOR: Record<string, string> = {
  idle: 'var(--studio-text-muted)',
  running: '#f59e0b',
  done: '#22c55e',
  error: '#ef4444',
};

export function ImageGenNode({ data, selected }: NodeProps) {
  const d = data as unknown as ImageGenNodeData;
  return (
    <div
      className="rounded-xl border border-[var(--studio-border)] bg-[var(--studio-bg-surface)] shadow-lg min-w-[220px] max-w-[260px] overflow-hidden"
      style={{ outline: selected ? '2px solid var(--studio-accent)' : '2px solid transparent' }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--studio-border)] bg-[var(--studio-bg-elevated)]">
        <div className="flex items-center gap-2">
          <ImageIcon size={13} style={{ color: '#22c55e' }} />
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#22c55e' }}>Image Gen</span>
        </div>
        <span className="text-[10px]" style={{ color: STATUS_COLOR[d.status] }}>● {d.status}</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-[10px] text-[var(--studio-text-muted)] mb-2">{d.provider}</p>
        {d.imageUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-1">
            {d.imageUrls.slice(0, 4).map((url, i) => (
              <div key={i} className="relative aspect-video rounded overflow-hidden bg-[var(--studio-bg-elevated)]">
                <Image src={url} alt="" fill sizes="100px" className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Left} style={{ background: 'var(--studio-accent)' }} />
      <Handle type="source" position={Position.Right} style={{ background: 'var(--studio-accent)' }} />
    </div>
  );
}
