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
const NODE_POSITIONS: Record<CutNodeType, { x: number; y: number }> = {
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

const SAMPLE_IMAGES = [
  'https://picsum.photos/seed/img1/400/225',
  'https://picsum.photos/seed/img2/400/225',
  'https://picsum.photos/seed/img3/400/225',
  'https://picsum.photos/seed/img4/400/225',
];

/* ── Factory: build initial nodes for a cut ── */
export function buildInitialNodes(
  cutSlug: string,
  displayId: string,
  script: string,
  savedData?: Record<string, Record<string, unknown>>,
): Node[] {
  const dataMap: Record<CutNodeType, Record<string, unknown>> = {
    scriptNode:      { script } satisfies ScriptNodeData,
    imagePromptNode: { prompt: `Cinematic establishing shot for ${displayId}`, style: 'photorealistic' } satisfies ImagePromptNodeData,
    imageGenNode:    { provider: 'Midjourney', status: 'done', imageUrls: SAMPLE_IMAGES } satisfies ImageGenNodeData,
    imagePickNode:   { selectedIndex: 0, imageUrls: SAMPLE_IMAGES } satisfies ImagePickNodeData,
    videoPromptNode: { prompt: 'Slow zoom in, golden hour lighting', cameraMove: 'zoom_in' } satisfies VideoPromptNodeData,
    videoGenNode:    { provider: 'Runway', status: 'idle', videoUrl: undefined } satisfies VideoGenNodeData,
    audioNode:       { text: script.slice(0, 120), voice: 'ko-KR-Standard-A', status: 'idle' } satisfies AudioNodeData,
    finalCutNode:    { approved: false, displayId } satisfies FinalCutNodeData,
  };

  return PIPE.map((type) => {
    const nodeId = `${cutSlug}-${type}`;
    const defaults = dataMap[type];
    const saved = savedData?.[nodeId];
    return {
      id: nodeId,
      type,
      position: NODE_POSITIONS[type],
      data: saved ? { ...defaults, ...saved } : defaults,
    };
  });
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

/* ── Backend persistence ── */
const BACKEND_URL =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_PRODUCTION_API_URL ?? 'http://localhost:3005')
    : 'http://localhost:3005';

export async function saveNodeGraphToBackend(
  projectId: string,
  cutSlug: string,
  nodes: Node[],
  edges: Edge[],
): Promise<void> {
  const serialisedNodes = nodes.map(({ id, type, position, data }) => ({ id, type, position, data }));
  const serialisedEdges = edges.map(({ id, source, target, animated, style }) => ({ id, source, target, animated, style }));
  await fetch(`${BACKEND_URL}/api/projects/${projectId}/cuts/${cutSlug}/graph`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodes: serialisedNodes, edges: serialisedEdges }),
  });
}

export async function loadNodeGraphFromBackend(
  projectId: string,
  cutSlug: string,
): Promise<{ nodes: Node[]; edges: Edge[] } | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/projects/${projectId}/cuts/${cutSlug}/graph`);
    if (!res.ok) return null;
    const data = (await res.json()) as { nodes: Node[]; edges: Edge[] };
    return { nodes: data.nodes, edges: data.edges };
  } catch {
    return null;
  }
}

/* ── localStorage helpers ── */
const storageKey = (cutSlug: string) => `studio-flow-positions-${cutSlug}`;
const dataKey    = (cutSlug: string) => `studio-flow-data-${cutSlug}`;

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

export function loadNodeData(cutSlug: string): Record<string, Record<string, unknown>> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(dataKey(cutSlug));
    return raw ? (JSON.parse(raw) as Record<string, Record<string, unknown>>) : null;
  } catch {
    return null;
  }
}

export function saveNodeData(cutSlug: string, nodes: Node[]): void {
  if (typeof window === 'undefined') return;
  const map: Record<string, Record<string, unknown>> = {};
  for (const n of nodes) map[n.id] = n.data as Record<string, unknown>;
  localStorage.setItem(dataKey(cutSlug), JSON.stringify(map));
}
