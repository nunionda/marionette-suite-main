'use client';
import type { Node } from '@xyflow/react';
import Image from 'next/image';
import type {
  ScriptNodeData,
  ImagePromptNodeData,
  ImageGenNodeData,
  ImagePickNodeData,
  VideoPromptNodeData,
  VideoGenNodeData,
  AudioNodeData,
  FinalCutNodeData,
} from '@/lib/studio/flow-data';

interface Props {
  node: Node | null;
}

export function NodePreviewPanel({ node }: Props) {
  if (!node) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--studio-text-muted)] gap-3">
        <div className="text-4xl opacity-30">◈</div>
        <p className="text-[12px]">Click a node to preview</p>
      </div>
    );
  }

  const type = node.type as string;
  const data = node.data as Record<string, unknown>;

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--studio-text-muted)]">
        {type.replace('Node', '').replace(/([A-Z])/g, ' $1').trim()}
      </p>

      {type === 'scriptNode' && (
        <ScriptPreview data={data as unknown as ScriptNodeData} />
      )}
      {type === 'imagePromptNode' && (
        <ImagePromptPreview data={data as unknown as ImagePromptNodeData} />
      )}
      {type === 'imageGenNode' && (
        <ImageGenPreview data={data as unknown as ImageGenNodeData} />
      )}
      {type === 'imagePickNode' && (
        <ImagePickPreview data={data as unknown as ImagePickNodeData} />
      )}
      {type === 'videoPromptNode' && (
        <VideoPromptPreview data={data as unknown as VideoPromptNodeData} />
      )}
      {type === 'videoGenNode' && (
        <VideoGenPreview data={data as unknown as VideoGenNodeData} />
      )}
      {type === 'audioNode' && (
        <AudioPreview data={data as unknown as AudioNodeData} />
      )}
      {type === 'finalCutNode' && (
        <FinalCutPreview data={data as unknown as FinalCutNodeData} />
      )}
    </div>
  );
}

function ScriptPreview({ data }: { data: ScriptNodeData }) {
  return (
    <p className="text-[13px] text-[var(--studio-text-dim)] leading-relaxed whitespace-pre-wrap">
      {data.script}
    </p>
  );
}

function ImagePromptPreview({ data }: { data: ImagePromptNodeData }) {
  return (
    <div className="space-y-3">
      <p className="text-[13px] text-[var(--studio-text-dim)] leading-relaxed">{data.prompt}</p>
      <span className="inline-block text-[11px] px-2 py-0.5 rounded bg-[var(--studio-bg-elevated)] text-[var(--studio-text-muted)]">
        Style: {data.style}
      </span>
    </div>
  );
}

function ImageGenPreview({ data }: { data: ImageGenNodeData }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[var(--studio-text-muted)]">{data.provider}</span>
        <span className="text-[11px] font-mono" style={{ color: data.status === 'done' ? '#22c55e' : data.status === 'error' ? '#ef4444' : '#f59e0b' }}>
          ● {data.status}
        </span>
      </div>
      {data.imageUrls.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {data.imageUrls.slice(0, 4).map((url, i) => (
            <div key={i} className="relative aspect-video rounded overflow-hidden bg-[var(--studio-bg-elevated)]">
              <Image src={url} alt={`Generated image ${i + 1}`} fill sizes="150px" className="object-cover" />
            </div>
          ))}
        </div>
      ) : (
        <div className="aspect-video rounded bg-[var(--studio-bg-elevated)] flex items-center justify-center">
          <span className="text-[11px] text-[var(--studio-text-muted)]">No images yet</span>
        </div>
      )}
    </div>
  );
}

function ImagePickPreview({ data }: { data: ImagePickNodeData }) {
  return (
    <div className="space-y-3">
      {data.selectedIndex !== null && (
        <p className="text-[11px] text-[var(--studio-accent)] font-mono">Selected: #{data.selectedIndex + 1}</p>
      )}
      <div className="grid grid-cols-2 gap-2">
        {data.imageUrls.slice(0, 4).map((url, i) => (
          <div
            key={i}
            className="relative aspect-video rounded overflow-hidden"
            style={{
              outline: data.selectedIndex === i ? '2px solid var(--studio-accent)' : '2px solid transparent',
              background: 'var(--studio-bg-elevated)',
            }}
          >
            <Image src={url} alt={`Image option ${i + 1}`} fill sizes="150px" className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoPromptPreview({ data }: { data: VideoPromptNodeData }) {
  return (
    <div className="space-y-3">
      <p className="text-[13px] text-[var(--studio-text-dim)] leading-relaxed">{data.prompt}</p>
      <span className="inline-block text-[11px] px-2 py-0.5 rounded bg-[var(--studio-bg-elevated)] text-[var(--studio-text-muted)]">
        Camera: {data.cameraMove}
      </span>
    </div>
  );
}

function VideoGenPreview({ data }: { data: VideoGenNodeData }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[var(--studio-text-muted)]">{data.provider}</span>
        <span className="text-[11px] font-mono" style={{ color: data.status === 'done' ? '#22c55e' : data.status === 'error' ? '#ef4444' : '#f59e0b' }}>
          ● {data.status}
        </span>
      </div>
      <div className="aspect-video rounded bg-[var(--studio-bg-elevated)] flex items-center justify-center">
        {data.videoUrl ? (
          <span className="text-[12px] text-[var(--studio-text-dim)]">▶ Video ready</span>
        ) : (
          <span className="text-[11px] text-[var(--studio-text-muted)]">Not generated yet</span>
        )}
      </div>
    </div>
  );
}

function AudioPreview({ data }: { data: AudioNodeData }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[var(--studio-text-muted)] font-mono">{data.voice}</span>
        <span className="text-[11px] font-mono" style={{ color: data.status === 'done' ? '#22c55e' : data.status === 'error' ? '#ef4444' : '#f59e0b' }}>
          ● {data.status}
        </span>
      </div>
      <p className="text-[13px] text-[var(--studio-text-dim)] leading-relaxed">{data.text}</p>
      {data.audioUrl && (
        <div className="rounded bg-[var(--studio-bg-elevated)] px-3 py-2">
          <span className="text-[11px] text-[var(--studio-text-muted)]">♪ Audio ready</span>
        </div>
      )}
    </div>
  );
}

function FinalCutPreview({ data }: { data: FinalCutNodeData }) {
  return (
    <div className="space-y-3">
      <div className="text-center py-4">
        <span
          className="text-[14px] font-bold px-4 py-2 rounded-full"
          style={{
            background: data.approved ? '#22c55e22' : 'var(--studio-bg-elevated)',
            color: data.approved ? '#22c55e' : 'var(--studio-text-muted)',
          }}
        >
          {data.approved ? '✓ Approved' : '○ Pending Approval'}
        </span>
      </div>
      <p className="text-[11px] text-center font-mono text-[var(--studio-text-muted)]">{data.displayId}</p>
    </div>
  );
}
