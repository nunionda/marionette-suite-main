'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
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

// Shared input styles
const INPUT =
  'w-full rounded text-[11px] px-2 py-1.5 outline-none resize-none ' +
  'bg-[var(--studio-bg-elevated)] border border-[var(--studio-border)] ' +
  'text-[var(--studio-text-dim)] focus:border-[var(--studio-accent)] transition-colors';

const STATUS_COLOR: Record<string, string> = {
  idle: 'var(--studio-text-muted)',
  running: '#f59e0b',
  done: '#22c55e',
  error: '#ef4444',
};

interface Props {
  node: Node | null;
  onDataChange?: (nodeId: string, updates: Record<string, unknown>) => void;
}

export function NodePreviewPanel({ node, onDataChange }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showSaved, setShowSaved] = useState(false);

  // Clean up timer on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const change = useCallback(
    (updates: Record<string, unknown>) => {
      if (!node || !onDataChange) return;
      onDataChange(node.id, updates);
      setShowSaved(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setShowSaved(false), 1500);
    },
    [node, onDataChange]
  );

  if (!node) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--studio-text-muted)] gap-3">
        <div className="text-4xl opacity-30">◈</div>
        <p className="text-[12px]">Click a node to edit</p>
      </div>
    );
  }

  const type = node.type as string;
  const data = node.data as Record<string, unknown>;

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--studio-text-muted)]">
          {type.replace('Node', '').replace(/([A-Z])/g, ' $1').trim()}
        </p>
        <span
          className="text-[10px] font-mono transition-opacity duration-300"
          style={{ color: 'var(--studio-accent)', opacity: showSaved ? 1 : 0 }}
        >
          ✓ saved
        </span>
      </div>

      {type === 'scriptNode' && (
        <ScriptEditor data={data as unknown as ScriptNodeData} onChange={change} />
      )}
      {type === 'imagePromptNode' && (
        <ImagePromptEditor data={data as unknown as ImagePromptNodeData} onChange={change} />
      )}
      {type === 'imageGenNode' && (
        <ImageGenEditor data={data as unknown as ImageGenNodeData} onChange={change} />
      )}
      {type === 'imagePickNode' && (
        <ImagePickEditor data={data as unknown as ImagePickNodeData} onChange={change} />
      )}
      {type === 'videoPromptNode' && (
        <VideoPromptEditor data={data as unknown as VideoPromptNodeData} onChange={change} />
      )}
      {type === 'videoGenNode' && (
        <VideoGenEditor data={data as unknown as VideoGenNodeData} onChange={change} />
      )}
      {type === 'audioNode' && (
        <AudioEditor data={data as unknown as AudioNodeData} onChange={change} />
      )}
      {type === 'finalCutNode' && (
        <FinalCutEditor data={data as unknown as FinalCutNodeData} onChange={change} />
      )}
    </div>
  );
}

/* ── Field label ── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-wider text-[var(--studio-text-muted)] mb-1">
      {children}
    </p>
  );
}

/* ── ScriptNode ── */
function ScriptEditor({
  data,
  onChange,
}: {
  data: ScriptNodeData;
  onChange: (u: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>Script</Label>
      <textarea
        className={INPUT}
        rows={8}
        value={data.script}
        onChange={(e) => onChange({ script: e.target.value })}
      />
    </div>
  );
}

/* ── ImagePromptNode ── */
const IMAGE_STYLES = ['photorealistic', 'cinematic', 'watercolor', 'anime', 'oil-painting'];

function ImagePromptEditor({
  data,
  onChange,
}: {
  data: ImagePromptNodeData;
  onChange: (u: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Prompt</Label>
        <textarea
          className={INPUT}
          rows={5}
          value={data.prompt}
          onChange={(e) => onChange({ prompt: e.target.value })}
        />
      </div>
      <div>
        <Label>Style</Label>
        <select
          className={INPUT}
          value={data.style}
          onChange={(e) => onChange({ style: e.target.value })}
        >
          {IMAGE_STYLES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/* ── ImageGenNode ── */
const IMAGE_PROVIDERS = ['Midjourney', 'Stable Diffusion', 'DALL-E 3', 'Flux'];

function ImageGenEditor({
  data,
  onChange,
}: {
  data: ImageGenNodeData;
  onChange: (u: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-3">
          <Label>Provider</Label>
          <select
            className={INPUT}
            value={data.provider}
            onChange={(e) => onChange({ provider: e.target.value })}
          >
            {IMAGE_PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="text-right shrink-0">
          <Label>Status</Label>
          <span className="text-[11px] font-mono" style={{ color: STATUS_COLOR[data.status] }}>
            ● {data.status}
          </span>
        </div>
      </div>
      {data.imageUrls.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {data.imageUrls.slice(0, 4).map((url, i) => (
            <div
              key={i}
              className="relative aspect-video rounded overflow-hidden bg-[var(--studio-bg-elevated)]"
            >
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

/* ── ImagePickNode ── */
function ImagePickEditor({
  data,
  onChange,
}: {
  data: ImagePickNodeData;
  onChange: (u: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-3">
      <Label>Pick an image</Label>
      {data.selectedIndex !== null && (
        <p className="text-[11px] text-[var(--studio-accent)] font-mono">
          Selected: #{data.selectedIndex + 1}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        {data.imageUrls.slice(0, 4).map((url, i) => (
          <button
            key={i}
            onClick={() => onChange({ selectedIndex: i })}
            className="relative aspect-video rounded overflow-hidden cursor-pointer transition-all"
            style={{
              outline: data.selectedIndex === i ? '2px solid var(--studio-accent)' : '2px solid transparent',
              background: 'var(--studio-bg-elevated)',
            }}
          >
            <Image src={url} alt={`Image option ${i + 1}`} fill sizes="150px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── VideoPromptNode ── */
const CAMERA_MOVES = ['zoom_in', 'zoom_out', 'pan_left', 'pan_right', 'static', 'dolly_in'];

function VideoPromptEditor({
  data,
  onChange,
}: {
  data: VideoPromptNodeData;
  onChange: (u: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Prompt</Label>
        <textarea
          className={INPUT}
          rows={5}
          value={data.prompt}
          onChange={(e) => onChange({ prompt: e.target.value })}
        />
      </div>
      <div>
        <Label>Camera Move</Label>
        <select
          className={INPUT}
          value={data.cameraMove}
          onChange={(e) => onChange({ cameraMove: e.target.value })}
        >
          {CAMERA_MOVES.map((m) => (
            <option key={m} value={m}>
              {m.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/* ── VideoGenNode ── */
const VIDEO_PROVIDERS = ['Runway', 'Kling', 'Pika', 'Hailuo'];

function VideoGenEditor({
  data,
  onChange,
}: {
  data: VideoGenNodeData;
  onChange: (u: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-3">
          <Label>Provider</Label>
          <select
            className={INPUT}
            value={data.provider}
            onChange={(e) => onChange({ provider: e.target.value })}
          >
            {VIDEO_PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="text-right shrink-0">
          <Label>Status</Label>
          <span className="text-[11px] font-mono" style={{ color: STATUS_COLOR[data.status] }}>
            ● {data.status}
          </span>
        </div>
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

/* ── AudioNode ── */
const VOICES = [
  'ko-KR-Standard-A',
  'ko-KR-Standard-B',
  'ko-KR-Neural2-A',
  'en-US-Neural2-C',
];

function AudioEditor({
  data,
  onChange,
}: {
  data: AudioNodeData;
  onChange: (u: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex-1 mr-3">
          <Label>Voice</Label>
          <select
            className={INPUT}
            value={data.voice}
            onChange={(e) => onChange({ voice: e.target.value })}
          >
            {VOICES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="text-right shrink-0">
          <Label>Status</Label>
          <span className="text-[11px] font-mono" style={{ color: STATUS_COLOR[data.status] }}>
            ● {data.status}
          </span>
        </div>
      </div>
      <div>
        <Label>Script</Label>
        <textarea
          className={INPUT}
          rows={6}
          value={data.text}
          onChange={(e) => onChange({ text: e.target.value })}
        />
      </div>
      {data.audioUrl && (
        <div className="rounded bg-[var(--studio-bg-elevated)] px-3 py-2">
          <span className="text-[11px] text-[var(--studio-text-muted)]">♪ Audio ready</span>
        </div>
      )}
    </div>
  );
}

/* ── FinalCutNode ── */
function FinalCutEditor({
  data,
  onChange,
}: {
  data: FinalCutNodeData;
  onChange: (u: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-4">
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
      <p className="text-[11px] text-center font-mono text-[var(--studio-text-muted)]">
        {data.displayId}
      </p>
      <button
        onClick={() => onChange({ approved: !data.approved })}
        className="w-full text-[11px] font-bold py-2 rounded-lg transition-all"
        style={{
          background: data.approved ? '#ef444422' : '#22c55e22',
          color: data.approved ? '#ef4444' : '#22c55e',
          border: `1px solid ${data.approved ? '#ef4444' : '#22c55e'}`,
        }}
      >
        {data.approved ? 'Revoke Approval' : 'Approve Cut'}
      </button>
    </div>
  );
}
