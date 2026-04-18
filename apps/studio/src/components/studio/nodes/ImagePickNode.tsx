'use client';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { CheckSquare } from 'lucide-react';
import Image from 'next/image';
import type { ImagePickNodeData } from '@/lib/studio/flow-data';

export function ImagePickNode({ data, selected }: NodeProps) {
  const d = data as unknown as ImagePickNodeData;
  return (
    <div
      className="rounded-xl border border-[var(--studio-border)] bg-[var(--studio-bg-surface)] shadow-lg min-w-[220px] max-w-[260px] overflow-hidden"
      style={{ outline: selected ? '2px solid var(--studio-accent)' : '2px solid transparent' }}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--studio-border)] bg-[var(--studio-bg-elevated)]">
        <CheckSquare size={13} style={{ color: 'var(--studio-accent)' }} />
        <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--studio-accent)]">Pick Image</span>
      </div>
      <div className="px-3 py-2">
        <div className="grid grid-cols-2 gap-1">
          {d.imageUrls.slice(0, 4).map((url, i) => (
            <div
              key={i}
              className="relative aspect-video rounded overflow-hidden"
              style={{
                outline: d.selectedIndex === i ? '2px solid var(--studio-accent)' : '2px solid transparent',
                background: 'var(--studio-bg-elevated)',
              }}
            >
              <Image src={url} alt="" fill sizes="100px" className="object-cover" />
            </div>
          ))}
        </div>
        {d.selectedIndex !== null && (
          <p className="text-[10px] text-[var(--studio-accent)] mt-1 font-mono">Selected: #{d.selectedIndex + 1}</p>
        )}
      </div>
      <Handle type="target" position={Position.Left} style={{ background: 'var(--studio-accent)' }} />
      <Handle type="source" position={Position.Right} style={{ background: 'var(--studio-accent)' }} />
    </div>
  );
}
