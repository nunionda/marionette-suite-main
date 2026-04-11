# Studio Phase 3 — Cut Node Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Phase 3 cut page placeholder with a React Flow–based node editor that visualises the 8-step AI production pipeline for each cut.

**Architecture:** Split-panel layout — `@xyflow/react` canvas (65 %) on the left, `NodePreviewPanel` (35 %) on the right. Eight custom node types form a linear pipeline (ScriptNode → … → FinalCutNode). Node positions persisted to `localStorage` per cutSlug. All data from mock-data layer; no real backend calls.

**Tech Stack:** `@xyflow/react` v12, Next.js 16 App Router, Zustand v5, Tailwind v4, bun:test, TypeScript strict.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Install | — | `@xyflow/react` package |
| Create | `src/lib/studio/flow-data.ts` | Node/edge factory for a cut; localStorage helpers |
| Create | `src/components/studio/nodes/ScriptNode.tsx` | Script source node (read-only) |
| Create | `src/components/studio/nodes/ImagePromptNode.tsx` | Editable image prompt |
| Create | `src/components/studio/nodes/ImageGenNode.tsx` | Image generation status + thumbnails |
| Create | `src/components/studio/nodes/ImagePickNode.tsx` | Pick 1 of 4 generated variants |
| Create | `src/components/studio/nodes/VideoPromptNode.tsx` | Video prompt + camera move select |
| Create | `src/components/studio/nodes/VideoGenNode.tsx` | Video generation status |
| Create | `src/components/studio/nodes/AudioNode.tsx` | TTS / narration status |
| Create | `src/components/studio/nodes/FinalCutNode.tsx` | Approval toggle (approved / pending) |
| Create | `src/components/studio/NodePreviewPanel.tsx` | Right panel — preview image/video for selected node |
| Create | `src/components/studio/CutNodeEditor.tsx` | Main editor component (ReactFlow + toolbar + bottom nav) |
| Modify | `src/app/projects/[projectId]/scenes/[sceneSlug]/cuts/[cutSlug]/page.tsx` | Replace placeholder with CutNodeEditor |

---

## Task 1: Install @xyflow/react

**Files:**
- Modify: `apps/studio/package.json`

- [ ] **Step 1: Install the package**

```bash
cd apps/studio && pnpm add @xyflow/react
```

Expected output: `+ @xyflow/react …` with no errors.

- [ ] **Step 2: Verify typecheck passes**

```bash
cd apps/studio && pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add apps/studio/package.json apps/studio/pnpm-lock.yaml
git commit -m "feat(studio): install @xyflow/react for Phase 3 node editor"
```

---

## Task 2: Flow data factory + localStorage helpers

**Files:**
- Create: `apps/studio/src/lib/studio/flow-data.ts`

`★ Insight` — React Flow stores nodes as `Node<TData>[]` where `TData` is your custom payload. Defining a discriminated union `CutNodeData` keeps TypeScript honest when rendering each node type.

- [ ] **Step 1: Create `flow-data.ts`**

```ts
// apps/studio/src/lib/studio/flow-data.ts
import type { Node, Edge } from '@xyflow/react';

/* ── Payload types per node ── */
export interface ScriptNodeData      { script: string }
export interface ImagePromptNodeData { prompt: string; style: string }
export interface ImageGenNodeData    { provider: string; status: 'idle' | 'running' | 'done' | 'error'; imageUrls: string[] }
export interface ImagePickNodeData   { selectedIndex: number | null; imageUrls: string[] }
export interface VideoPromptNodeData { prompt: string; cameraMove: string }
export interface VideoGenNodeData    { provider: string; status: 'idle' | 'running' | 'done' | 'error'; videoUrl?: string }
export interface AudioNodeData       { text: string; voice: string; status: 'idle' | 'running' | 'done' | 'error'; audioUrl?: string }
export interface FinalCutNodeData    { approved: boolean; displayId: string }

export type CutNodeType =
  | 'scriptNode' | 'imagePromptNode' | 'imageGenNode' | 'imagePickNode'
  | 'videoPromptNode' | 'videoGenNode' | 'audioNode' | 'finalCutNode';

/* ── Default X positions for the linear pipeline ── */
const PIPE_X = 320;
const positions: Record<CutNodeType, { x: number; y: number }> = {
  scriptNode:      { x: 0,          y: 0 },
  imagePromptNode: { x: PIPE_X,     y: 0 },
  imageGenNode:    { x: PIPE_X * 2, y: 0 },
  imagePickNode:   { x: PIPE_X * 3, y: 0 },
  videoPromptNode: { x: PIPE_X * 4, y: 0 },
  videoGenNode:    { x: PIPE_X * 5, y: 0 },
  audioNode:       { x: PIPE_X * 6, y: 0 },
  finalCutNode:    { x: PIPE_X * 7, y: 0 },
};

const PIPE: CutNodeType[] = [
  'scriptNode', 'imagePromptNode', 'imageGenNode', 'imagePickNode',
  'videoPromptNode', 'videoGenNode', 'audioNode', 'finalCutNode',
];

/* ── Factory: build initial nodes for a cut ── */
export function buildInitialNodes(
  cutSlug: string,
  displayId: string,
  script: string,
): Node[] {
  const sampleImages = [
    'https://picsum.photos/seed/img1/400/225',
    'https://picsum.photos/seed/img2/400/225',
    'https://picsum.photos/seed/img3/400/225',
    'https://picsum.photos/seed/img4/400/225',
  ];

  const dataMap: Record<CutNodeType, object> = {
    scriptNode:      { script } satisfies ScriptNodeData,
    imagePromptNode: { prompt: `Cinematic establishing shot for ${displayId}`, style: 'photorealistic' } satisfies ImagePromptNodeData,
    imageGenNode:    { provider: 'Midjourney', status: 'done', imageUrls: sampleImages } satisfies ImageGenNodeData,
    imagePickNode:   { selectedIndex: 0, imageUrls: sampleImages } satisfies ImagePickNodeData,
    videoPromptNode: { prompt: `Slow zoom in, golden hour lighting`, cameraMove: 'zoom_in' } satisfies VideoPromptNodeData,
    videoGenNode:    { provider: 'Runway', status: 'idle', videoUrl: undefined } satisfies VideoGenNodeData,
    audioNode:       { text: script.slice(0, 120), voice: 'ko-KR-Standard-A', status: 'idle' } satisfies AudioNodeData,
    finalCutNode:    { approved: false, displayId } satisfies FinalCutNodeData,
  };

  return PIPE.map((type) => ({
    id: `${cutSlug}-${type}`,
    type,
    position: positions[type],
    data: dataMap[type],
  }));
}

/* ── Factory: build edges connecting the pipeline ── */
export function buildInitialEdges(cutSlug: string): Edge[] {
  return PIPE.slice(0, -1).map((type, i) => ({
    id: `${cutSlug}-edge-${i}`,
    source: `${cutSlug}-${type}`,
    target: `${cutSlug}-${PIPE[i + 1]}`,
    animated: true,
    style: { stroke: 'var(--studio-accent)', strokeWidth: 2 },
  }));
}

/* ── localStorage helpers ── */
const storageKey = (cutSlug: string) => `studio-flow-positions-${cutSlug}`;

export function loadNodePositions(cutSlug: string): Record<string, { x: number; y: number }> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKey(cutSlug));
    return raw ? (JSON.parse(raw) as Record<string, { x: number; y: number }>) : null;
  } catch {
    return null;
  }
}

export function saveNodePositions(cutSlug: string, nodes: Node[]): void {
  if (typeof window === 'undefined') return;
  const positions: Record<string, { x: number; y: number }> = {};
  for (const n of nodes) positions[n.id] = n.position;
  localStorage.setItem(storageKey(cutSlug), JSON.stringify(positions));
}
```

- [ ] **Step 2: Verify typecheck**

```bash
cd apps/studio && pnpm typecheck
```

Expected: zero errors.

---

## Task 3: Eight custom node components

**Files:**
- Create: `apps/studio/src/components/studio/nodes/ScriptNode.tsx`
- Create: `apps/studio/src/components/studio/nodes/ImagePromptNode.tsx`
- Create: `apps/studio/src/components/studio/nodes/ImageGenNode.tsx`
- Create: `apps/studio/src/components/studio/nodes/ImagePickNode.tsx`
- Create: `apps/studio/src/components/studio/nodes/VideoPromptNode.tsx`
- Create: `apps/studio/src/components/studio/nodes/VideoGenNode.tsx`
- Create: `apps/studio/src/components/studio/nodes/AudioNode.tsx`
- Create: `apps/studio/src/components/studio/nodes/FinalCutNode.tsx`

`★ Insight` — React Flow custom nodes receive `NodeProps<TData>` which includes `data`, `selected`, `id`. All custom nodes MUST render `<Handle type="source" …>` / `<Handle type="target" …>` from `@xyflow/react` so edges connect correctly. Wrapping each node in a shared `NodeShell` component keeps padding/border/shadow consistent.

- [ ] **Step 1: Create shared node shell style (inline in each node — no separate file)**

All nodes use this CSS pattern (Tailwind v4 + CSS vars):
```
rounded-xl border border-[var(--studio-border)] bg-[var(--studio-bg-surface)]
shadow-lg min-w-[220px] max-w-[260px] overflow-hidden
ring-2 ring-transparent data-[selected=true]:ring-[var(--studio-accent)]
```

- [ ] **Step 2: Create ScriptNode**

```tsx
// apps/studio/src/components/studio/nodes/ScriptNode.tsx
'use client';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { FileText } from 'lucide-react';
import type { ScriptNodeData } from '@/lib/studio/flow-data';

export function ScriptNode({ data, selected }: NodeProps<ScriptNodeData & Record<string, unknown>>) {
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
          {(data as ScriptNodeData).script}
        </p>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: 'var(--studio-accent)' }} />
    </div>
  );
}
```

- [ ] **Step 3: Create ImagePromptNode**

```tsx
// apps/studio/src/components/studio/nodes/ImagePromptNode.tsx
'use client';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Pencil } from 'lucide-react';
import type { ImagePromptNodeData } from '@/lib/studio/flow-data';

export function ImagePromptNode({ data, selected }: NodeProps<ImagePromptNodeData & Record<string, unknown>>) {
  const d = data as ImagePromptNodeData;
  return (
    <div
      className="rounded-xl border border-[var(--studio-border)] bg-[var(--studio-bg-surface)] shadow-lg min-w-[220px] max-w-[260px] overflow-hidden"
      style={{ outline: selected ? '2px solid var(--studio-accent)' : '2px solid transparent' }}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--studio-border)] bg-[var(--studio-bg-elevated)]">
        <Pencil size={13} style={{ color: '#f59e0b' }} />
        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#f59e0b' }}>Image Prompt</span>
      </div>
      <div className="px-3 py-2 space-y-1">
        <p className="text-[11px] text-[var(--studio-text-dim)] line-clamp-3">{d.prompt}</p>
        <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-[var(--studio-bg-elevated)] text-[var(--studio-text-muted)]">{d.style}</span>
      </div>
      <Handle type="target" position={Position.Left} style={{ background: 'var(--studio-accent)' }} />
      <Handle type="source" position={Position.Right} style={{ background: 'var(--studio-accent)' }} />
    </div>
  );
}
```

- [ ] **Step 4: Create ImageGenNode**

```tsx
// apps/studio/src/components/studio/nodes/ImageGenNode.tsx
'use client';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import type { ImageGenNodeData } from '@/lib/studio/flow-data';

const statusColor: Record<string, string> = {
  idle: 'var(--studio-text-muted)',
  running: '#f59e0b',
  done: '#22c55e',
  error: '#ef4444',
};

export function ImageGenNode({ data, selected }: NodeProps<ImageGenNodeData & Record<string, unknown>>) {
  const d = data as ImageGenNodeData;
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
        <span className="text-[10px]" style={{ color: statusColor[d.status] }}>●{' '}{d.status}</span>
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
```

- [ ] **Step 5: Create ImagePickNode**

```tsx
// apps/studio/src/components/studio/nodes/ImagePickNode.tsx
'use client';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { CheckSquare } from 'lucide-react';
import Image from 'next/image';
import type { ImagePickNodeData } from '@/lib/studio/flow-data';

export function ImagePickNode({ data, selected }: NodeProps<ImagePickNodeData & Record<string, unknown>>) {
  const d = data as ImagePickNodeData;
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
```

- [ ] **Step 6: Create VideoPromptNode**

```tsx
// apps/studio/src/components/studio/nodes/VideoPromptNode.tsx
'use client';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Video } from 'lucide-react';
import type { VideoPromptNodeData } from '@/lib/studio/flow-data';

export function VideoPromptNode({ data, selected }: NodeProps<VideoPromptNodeData & Record<string, unknown>>) {
  const d = data as VideoPromptNodeData;
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
```

- [ ] **Step 7: Create VideoGenNode**

```tsx
// apps/studio/src/components/studio/nodes/VideoGenNode.tsx
'use client';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Film } from 'lucide-react';
import type { VideoGenNodeData } from '@/lib/studio/flow-data';

const statusColor: Record<string, string> = {
  idle: 'var(--studio-text-muted)', running: '#f59e0b', done: '#22c55e', error: '#ef4444',
};

export function VideoGenNode({ data, selected }: NodeProps<VideoGenNodeData & Record<string, unknown>>) {
  const d = data as VideoGenNodeData;
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
        <span className="text-[10px]" style={{ color: statusColor[d.status] }}>● {d.status}</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-[10px] text-[var(--studio-text-muted)]">{d.provider}</p>
        {d.videoUrl && (
          <div className="mt-2 aspect-video rounded bg-[var(--studio-bg-elevated)] flex items-center justify-center">
            <span className="text-[10px] text-[var(--studio-text-muted)]">▶ Preview</span>
          </div>
        )}
        {!d.videoUrl && d.status === 'idle' && (
          <div className="mt-2 aspect-video rounded bg-[var(--studio-bg-elevated)] flex items-center justify-center">
            <span className="text-[10px] text-[var(--studio-text-muted)]">Not started</span>
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Left} style={{ background: 'var(--studio-accent)' }} />
      <Handle type="source" position={Position.Right} style={{ background: 'var(--studio-accent)' }} />
    </div>
  );
}
```

- [ ] **Step 8: Create AudioNode**

```tsx
// apps/studio/src/components/studio/nodes/AudioNode.tsx
'use client';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Mic } from 'lucide-react';
import type { AudioNodeData } from '@/lib/studio/flow-data';

const statusColor: Record<string, string> = {
  idle: 'var(--studio-text-muted)', running: '#f59e0b', done: '#22c55e', error: '#ef4444',
};

export function AudioNode({ data, selected }: NodeProps<AudioNodeData & Record<string, unknown>>) {
  const d = data as AudioNodeData;
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
        <span className="text-[10px]" style={{ color: statusColor[d.status] }}>● {d.status}</span>
      </div>
      <div className="px-3 py-2 space-y-1">
        <p className="text-[11px] text-[var(--studio-text-dim)] line-clamp-2">{d.text}</p>
        <span className="text-[10px] font-mono text-[var(--studio-text-muted)]">{d.voice}</span>
      </div>
      <Handle type="target" position={Position.Left} style={{ background: 'var(--studio-accent)' }} />
      <Handle type="source" position={Position.Right} style={{ background: 'var(--studio-accent)' }} />
    </div>
  );
}
```

- [ ] **Step 9: Create FinalCutNode**

```tsx
// apps/studio/src/components/studio/nodes/FinalCutNode.tsx
'use client';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { CheckCircle } from 'lucide-react';
import type { FinalCutNodeData } from '@/lib/studio/flow-data';

export function FinalCutNode({ data, selected }: NodeProps<FinalCutNodeData & Record<string, unknown>>) {
  const d = data as FinalCutNodeData;
  return (
    <div
      className="rounded-xl border-2 bg-[var(--studio-bg-surface)] shadow-xl min-w-[220px] max-w-[260px] overflow-hidden"
      style={{
        borderColor: d.approved ? '#22c55e' : 'var(--studio-border)',
        outline: selected ? '2px solid var(--studio-accent)' : '2px solid transparent',
      }}
    >
      <div
        className="flex items-center gap-2 px-3 py-2 border-b border-[var(--studio-border)]"
        style={{ background: d.approved ? 'rgba(34,197,94,0.15)' : 'var(--studio-bg-elevated)' }}
      >
        <CheckCircle size={13} style={{ color: d.approved ? '#22c55e' : 'var(--studio-text-muted)' }} />
        <span
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color: d.approved ? '#22c55e' : 'var(--studio-text-muted)' }}
        >
          Final Cut
        </span>
      </div>
      <div className="px-3 py-3 text-center">
        <p className="font-mono text-[11px] text-[var(--studio-text-dim)] mb-2">{d.displayId}</p>
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold"
          style={{
            background: d.approved ? 'rgba(34,197,94,0.2)' : 'var(--studio-bg-elevated)',
            color: d.approved ? '#22c55e' : 'var(--studio-text-muted)',
          }}
        >
          {d.approved ? '✓ 승인됨' : '대기 중'}
        </div>
      </div>
      <Handle type="target" position={Position.Left} style={{ background: 'var(--studio-accent)' }} />
    </div>
  );
}
```

- [ ] **Step 10: Verify typecheck**

```bash
cd apps/studio && pnpm typecheck
```

Expected: zero errors.

---

## Task 4: NodePreviewPanel component

**Files:**
- Create: `apps/studio/src/components/studio/NodePreviewPanel.tsx`

- [ ] **Step 1: Create NodePreviewPanel**

```tsx
// apps/studio/src/components/studio/NodePreviewPanel.tsx
'use client';
import Image from 'next/image';
import type { Node } from '@xyflow/react';
import type {
  ScriptNodeData, ImageGenNodeData, ImagePickNodeData,
  VideoGenNodeData, AudioNodeData, FinalCutNodeData,
} from '@/lib/studio/flow-data';

interface Props {
  node: Node | null;
}

export function NodePreviewPanel({ node }: Props) {
  if (!node) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full"
        style={{ background: 'var(--studio-bg-surface)', borderLeft: '1px solid var(--studio-border)' }}
      >
        <p className="text-[12px] text-[var(--studio-text-muted)]">노드를 선택하면 미리보기가 표시됩니다</p>
      </div>
    );
  }

  const d = node.data;
  const type = node.type as string;

  return (
    <div
      className="flex flex-col h-full overflow-y-auto"
      style={{ background: 'var(--studio-bg-surface)', borderLeft: '1px solid var(--studio-border)' }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 border-b border-[var(--studio-border)] sticky top-0 z-10"
        style={{ background: 'var(--studio-bg-elevated)' }}
      >
        <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--studio-accent)]">{type.replace('Node', '')}</p>
        <p className="text-[12px] text-[var(--studio-text-dim)] font-mono mt-0.5">{node.id}</p>
      </div>

      {/* Content */}
      <div className="px-5 py-4 space-y-4">
        {/* Script */}
        {type === 'scriptNode' && (
          <div>
            <p className="text-[11px] font-bold text-[var(--studio-text-muted)] uppercase mb-2">스크립트 원문</p>
            <p className="text-[13px] text-[var(--studio-text)] leading-relaxed whitespace-pre-wrap">
              {(d as ScriptNodeData).script}
            </p>
          </div>
        )}

        {/* Image gen grid */}
        {(type === 'imageGenNode' || type === 'imagePickNode') && (
          <div>
            <p className="text-[11px] font-bold text-[var(--studio-text-muted)] uppercase mb-2">생성 이미지</p>
            <div className="grid grid-cols-2 gap-2">
              {((d as ImageGenNodeData | ImagePickNodeData).imageUrls ?? []).map((url: string, i: number) => (
                <div key={i} className="relative aspect-video rounded-lg overflow-hidden bg-[var(--studio-bg-elevated)]">
                  <Image src={url} alt={`Image ${i + 1}`} fill sizes="200px" className="object-cover" />
                  <div className="absolute bottom-1 left-1 text-[9px] font-mono bg-black/60 px-1 rounded text-white">#{i + 1}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video */}
        {type === 'videoGenNode' && (
          <div>
            <p className="text-[11px] font-bold text-[var(--studio-text-muted)] uppercase mb-2">영상 미리보기</p>
            {(d as VideoGenNodeData).videoUrl ? (
              <video
                src={(d as VideoGenNodeData).videoUrl}
                controls
                className="w-full rounded-lg"
              />
            ) : (
              <div className="aspect-video rounded-lg bg-[var(--studio-bg-elevated)] flex items-center justify-center">
                <p className="text-[12px] text-[var(--studio-text-muted)]">영상이 아직 생성되지 않았습니다</p>
              </div>
            )}
          </div>
        )}

        {/* Audio */}
        {type === 'audioNode' && (
          <div>
            <p className="text-[11px] font-bold text-[var(--studio-text-muted)] uppercase mb-2">오디오 미리보기</p>
            {(d as AudioNodeData).audioUrl ? (
              <audio src={(d as AudioNodeData).audioUrl} controls className="w-full" />
            ) : (
              <div className="rounded-lg bg-[var(--studio-bg-elevated)] p-4 text-center">
                <p className="text-[12px] text-[var(--studio-text-muted)]">오디오가 아직 생성되지 않았습니다</p>
              </div>
            )}
            <p className="mt-3 text-[12px] text-[var(--studio-text-dim)] leading-relaxed">{(d as AudioNodeData).text}</p>
          </div>
        )}

        {/* Final cut */}
        {type === 'finalCutNode' && (
          <div className="text-center py-4">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold"
              style={{
                background: (d as FinalCutNodeData).approved ? 'rgba(34,197,94,0.2)' : 'var(--studio-bg-elevated)',
                color: (d as FinalCutNodeData).approved ? '#22c55e' : 'var(--studio-text-muted)',
              }}
            >
              {(d as FinalCutNodeData).approved ? '✓ 승인됨' : '승인 대기 중'}
            </div>
            <p className="mt-2 font-mono text-[12px] text-[var(--studio-text-dim)]">{(d as FinalCutNodeData).displayId}</p>
          </div>
        )}

        {/* Default — show raw data for other node types */}
        {!['scriptNode','imageGenNode','imagePickNode','videoGenNode','audioNode','finalCutNode'].includes(type) && (
          <pre className="text-[10px] text-[var(--studio-text-dim)] whitespace-pre-wrap">
            {JSON.stringify(d, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

```bash
cd apps/studio && pnpm typecheck
```

Expected: zero errors.

---

## Task 5: CutNodeEditor main component

**Files:**
- Create: `apps/studio/src/components/studio/CutNodeEditor.tsx`

`★ Insight` — React Flow's `ReactFlow` component MUST be wrapped in a `<div>` with an explicit `height` — otherwise the canvas renders with zero height. The outer container should be `position: relative; height: 100%` and the `ReactFlow` fills it. The `nodeTypes` prop MUST be defined **outside** the render function (or in `useMemo`) to avoid re-registering on every render (causes edge flicker).

- [ ] **Step 1: Create CutNodeEditor**

```tsx
// apps/studio/src/components/studio/CutNodeEditor.tsx
'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ScriptNode }      from '@/components/studio/nodes/ScriptNode';
import { ImagePromptNode } from '@/components/studio/nodes/ImagePromptNode';
import { ImageGenNode }    from '@/components/studio/nodes/ImageGenNode';
import { ImagePickNode }   from '@/components/studio/nodes/ImagePickNode';
import { VideoPromptNode } from '@/components/studio/nodes/VideoPromptNode';
import { VideoGenNode }    from '@/components/studio/nodes/VideoGenNode';
import { AudioNode }       from '@/components/studio/nodes/AudioNode';
import { FinalCutNode }    from '@/components/studio/nodes/FinalCutNode';
import { NodePreviewPanel } from '@/components/studio/NodePreviewPanel';
import {
  buildInitialNodes, buildInitialEdges,
  loadNodePositions, saveNodePositions,
} from '@/lib/studio/flow-data';
import type { CutMeta, SceneMeta } from '@/lib/studio/types';

/* ── nodeTypes MUST be stable (outside component or useMemo) ── */
const NODE_TYPES: NodeTypes = {
  scriptNode:      ScriptNode,
  imagePromptNode: ImagePromptNode,
  imageGenNode:    ImageGenNode,
  imagePickNode:   ImagePickNode,
  videoPromptNode: VideoPromptNode,
  videoGenNode:    VideoGenNode,
  audioNode:       AudioNode,
  finalCutNode:    FinalCutNode,
};

interface Props {
  cut: CutMeta;
  scene: SceneMeta;
  projectId: string;
  prevCut: CutMeta | null;
  nextCut: CutMeta | null;
  script: string;
}

export function CutNodeEditor({ cut, scene, projectId, prevCut, nextCut, script }: Props) {
  const initialNodes = useMemo(
    () => {
      const base = buildInitialNodes(cut.slug, cut.displayId, script);
      const saved = loadNodePositions(cut.slug);
      if (saved) {
        return base.map(n => ({ ...n, position: saved[n.id] ?? n.position }));
      }
      return base;
    },
    [cut.slug, cut.displayId, script],
  );
  const initialEdges = useMemo(() => buildInitialEdges(cut.slug), [cut.slug]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  /* Persist positions on every node move */
  useEffect(() => {
    saveNodePositions(cut.slug, nodes);
  }, [cut.slug, nodes]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(prev => (prev?.id === node.id ? null : node));
  }, []);

  const onPaneClick = useCallback(() => setSelectedNode(null), []);

  const prevHref = prevCut
    ? `/projects/${projectId}/scenes/${scene.slug}/cuts/${prevCut.slug}`
    : null;
  const nextHref = nextCut
    ? `/projects/${projectId}/scenes/${scene.slug}/cuts/${nextCut.slug}`
    : null;

  return (
    <div className="flex flex-col" style={{ height: '100vh', background: 'var(--studio-bg-base)' }}>
      {/* Top toolbar */}
      <div
        className="flex items-center gap-3 px-5 py-3 border-b border-[var(--studio-border)] shrink-0"
        style={{ background: 'var(--studio-bg-elevated)' }}
      >
        <Link
          href={`/projects/${projectId}/scenes/${scene.slug}`}
          className="text-[12px] text-[var(--studio-text-dim)] hover:text-[var(--studio-text)]"
        >
          ← {scene.displayId}
        </Link>
        <span className="text-[var(--studio-border)]">/</span>
        <span className="font-mono text-[12px] text-[var(--studio-text)]">{cut.displayId}</span>
        <div
          className="ml-auto text-[10px] px-2 py-1 rounded font-mono"
          style={{ background: 'var(--studio-bg-base)', color: 'var(--studio-text-muted)' }}
        >
          {cut.duration}s
        </div>
      </div>

      {/* Main area: canvas + preview */}
      <div className="flex flex-1 min-h-0">
        {/* React Flow canvas */}
        <div style={{ flex: '0 0 65%', position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={NODE_TYPES}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.3}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
            style={{ background: 'var(--studio-bg-base)' }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1}
              color="var(--studio-border)"
            />
            <Controls
              style={{ background: 'var(--studio-bg-elevated)', border: '1px solid var(--studio-border)' }}
            />
            <MiniMap
              style={{ background: 'var(--studio-bg-elevated)', border: '1px solid var(--studio-border)' }}
              nodeColor="var(--studio-accent)"
            />
          </ReactFlow>
        </div>

        {/* Preview panel */}
        <div style={{ flex: '0 0 35%' }}>
          <NodePreviewPanel node={selectedNode} />
        </div>
      </div>

      {/* Bottom navigation bar */}
      <div
        className="flex items-center justify-between px-5 py-3 border-t border-[var(--studio-border)] shrink-0"
        style={{ background: 'var(--studio-bg-elevated)' }}
      >
        {prevHref ? (
          <Link
            href={prevHref}
            className="flex items-center gap-1.5 text-[12px] text-[var(--studio-text-dim)] hover:text-[var(--studio-text)]"
          >
            <ChevronLeft size={14} /> {prevCut!.displayId}
          </Link>
        ) : (
          <span />
        )}
        <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--studio-text-muted)]">
          Cut {cut.number} / {scene.cutCount}
        </span>
        {nextHref ? (
          <Link
            href={nextHref}
            className="flex items-center gap-1.5 text-[12px] text-[var(--studio-text-dim)] hover:text-[var(--studio-text)]"
          >
            {nextCut!.displayId} <ChevronRight size={14} />
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

```bash
cd apps/studio && pnpm typecheck
```

Expected: zero errors.

---

## Task 6: Wire up the cut page

**Files:**
- Modify: `apps/studio/src/app/projects/[projectId]/scenes/[sceneSlug]/cuts/[cutSlug]/page.tsx`

- [ ] **Step 1: Replace placeholder with actual page**

The page fetches `sceneDetail` (which contains `cuts[]`) then finds the current cut, prev/next cuts, and renders `CutNodeEditor`. The script is derived from the scene summary for mock purposes.

```tsx
// apps/studio/src/app/projects/[projectId]/scenes/[sceneSlug]/cuts/[cutSlug]/page.tsx
import { notFound } from 'next/navigation';
import { fetchSceneDetail } from '@/lib/studio/api';
import { CutNodeEditor } from '@/components/studio/CutNodeEditor';

interface Props {
  params: Promise<{ projectId: string; sceneSlug: string; cutSlug: string }>;
}

export default async function CutPage({ params }: Props) {
  const { projectId, sceneSlug, cutSlug } = await params;

  const scene = await fetchSceneDetail(projectId, sceneSlug);
  if (!scene) notFound();

  const cutIndex = scene.cuts.findIndex(c => c.slug === cutSlug);
  if (cutIndex === -1) notFound();

  const cut = scene.cuts[cutIndex];
  const prevCut = cutIndex > 0 ? scene.cuts[cutIndex - 1] : null;
  const nextCut = cutIndex < scene.cuts.length - 1 ? scene.cuts[cutIndex + 1] : null;

  /* Derive a mock script from the scene summary */
  const script = scene.synopsis ?? scene.summary;

  return (
    <CutNodeEditor
      cut={cut}
      scene={scene}
      projectId={projectId}
      prevCut={prevCut}
      nextCut={nextCut}
      script={script}
    />
  );
}
```

- [ ] **Step 2: Verify typecheck**

```bash
cd apps/studio && pnpm typecheck
```

Expected: zero errors.

---

## Task 7: Final verification + commit

- [ ] **Step 1: Typecheck**

```bash
cd apps/studio && pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 2: Test naming utilities still pass**

```bash
cd apps/studio && bun test src/lib/studio/naming.test.ts
```

Expected: 10 tests pass.

- [ ] **Step 3: Manual smoke test**

Open in browser:
- `http://localhost:3001/projects/tdk/scenes/sc001/cuts/cut001` — should show node canvas with 8 nodes + preview panel

- [ ] **Step 4: Commit**

```bash
git add apps/studio/src/lib/studio/flow-data.ts \
        apps/studio/src/components/studio/nodes/ \
        apps/studio/src/components/studio/NodePreviewPanel.tsx \
        apps/studio/src/components/studio/CutNodeEditor.tsx \
        apps/studio/src/app/projects/[projectId]/scenes/[sceneSlug]/cuts/[cutSlug]/page.tsx \
        apps/studio/package.json apps/studio/pnpm-lock.yaml
git commit -m "feat(studio): Phase 3 — Cut Node Editor with @xyflow/react"
```

---

*Plan complete. 7 tasks, ~12 files, linear pipeline of 8 custom React Flow node types.*
