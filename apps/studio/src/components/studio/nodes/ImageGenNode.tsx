'use client';
import { useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ImageIcon, Zap } from 'lucide-react';
import Image from 'next/image';
import type { ImageGenNodeData } from '@/lib/studio/flow-data';

const STATUS_COLOR: Record<string, string> = {
  idle: 'var(--studio-text-muted)',
  running: '#f59e0b',
  done: '#22c55e',
  error: '#ef4444',
};

export function ImageGenNode({ data, selected }: NodeProps) {
  const d = data as unknown as ImageGenNodeData & { onGenerate?: (prompt: string) => void };
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    if (d.onGenerate && !generating) {
      setGenerating(true);
      d.onGenerate('');
      // Reset after timeout (actual state update comes from parent)
      setTimeout(() => setGenerating(false), 10000);
    }
  };

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
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] text-[var(--studio-text-muted)]">{d.provider}</p>
          <button
            onClick={(e) => { e.stopPropagation(); handleGenerate(); }}
            disabled={generating}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-semibold transition-colors"
            style={{
              background: generating ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)',
              border: `1px solid ${generating ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}`,
              color: generating ? '#f59e0b' : '#22c55e',
              cursor: generating ? 'wait' : 'pointer',
            }}
          >
            <Zap size={9} />
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </div>
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
