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

/* ── Backend persistence (script-writer :3006) ── */
const BACKEND_URL =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_PRODUCTION_API_URL ?? 'http://localhost:3006')
    : (process.env.INTERNAL_SCRIPT_ENGINE_URL ?? "http://localhost:3006");

/**
 * Extract pipeline-relevant fields from ReactFlow nodes → flat DB fields.
 * Maps node data to the PATCH /api/cuts/:cutId payload.
 */
function extractCutPatchFromNodes(cutSlug: string, nodes: Node[]): Record<string, string | undefined> {
  const find = (type: string) => nodes.find(n => n.id === `${cutSlug}-${type}`)?.data as Record<string, unknown> | undefined;
  const scriptData = find('scriptNode');
  const imgPromptData = find('imagePromptNode');
  const imgGenData = find('imageGenNode');
  const vidPromptData = find('videoPromptNode');
  const vidGenData = find('videoGenNode');
  const audioData = find('audioNode');
  return {
    scriptText: scriptData?.script as string | undefined,
    imagePrompt: imgPromptData?.prompt as string | undefined,
    imageUrl: (imgGenData?.imageUrls as string[] | undefined)?.[0],
    videoPrompt: vidPromptData?.prompt as string | undefined,
    videoUrl: vidGenData?.videoUrl as string | undefined,
    audioUrl: audioData?.audioUrl as string | undefined,
  };
}

/**
 * Save node pipeline data to script-writer backend.
 * Uses PATCH /api/cuts/:cutId with flat fields.
 */
export async function saveNodeGraphToBackend(
  projectId: string,
  cutSlug: string,
  nodes: Node[],
  edges: Edge[],
  cutId?: string,
): Promise<void> {
  if (!cutId) return; // Need DB id to save
  const patch = extractCutPatchFromNodes(cutSlug, nodes);
  await fetch(`${BACKEND_URL}/api/cuts/${cutId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
}

/**
 * Load cut pipeline data from script-writer backend and return as node data overrides.
 * Returns a map of nodeId → data overrides for buildInitialNodes.
 */
export async function loadNodeGraphFromBackend(
  projectId: string,
  cutSlug: string,
  cutId?: string,
): Promise<{ nodes: Node[]; edges: Edge[] } | null> {
  if (!cutId) return null;
  try {
    const res = await fetch(`${BACKEND_URL}/api/cuts/${cutId}`);
    if (!res.ok) return null;
    const cut = await res.json();
    if (!cut) return null;
    // Return null to signal "use buildInitialNodes with DB data" — handled by caller
    return null;
  } catch {
    return null;
  }
}

/**
 * Load cut data from backend and return as savedData map for buildInitialNodes.
 */
export async function loadCutDataFromBackend(cutId: string): Promise<Record<string, Record<string, unknown>> | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/cuts/${cutId}`);
    if (!res.ok) return null;
    const cut = await res.json();
    if (!cut) return null;
    const cutSlug = cut.slug ?? '';
    const data: Record<string, Record<string, unknown>> = {};
    if (cut.scriptText ?? cut.script_text) {
      data[`${cutSlug}-scriptNode`] = { script: cut.scriptText ?? cut.script_text };
    }
    if (cut.imagePrompt ?? cut.image_prompt) {
      data[`${cutSlug}-imagePromptNode`] = { prompt: cut.imagePrompt ?? cut.image_prompt, style: 'photorealistic' };
    }
    if (cut.imageUrl ?? cut.image_url) {
      const url = cut.imageUrl ?? cut.image_url;
      data[`${cutSlug}-imageGenNode`] = { provider: 'Pollinations', status: 'done', imageUrls: [url] };
      data[`${cutSlug}-imagePickNode`] = { selectedIndex: 0, imageUrls: [url] };
    }
    if (cut.videoPrompt ?? cut.video_prompt) {
      data[`${cutSlug}-videoPromptNode`] = { prompt: cut.videoPrompt ?? cut.video_prompt, cameraMove: '' };
    }
    if (cut.videoUrl ?? cut.video_url) {
      data[`${cutSlug}-videoGenNode`] = { provider: 'Runway', status: 'done', videoUrl: cut.videoUrl ?? cut.video_url };
    }
    if (cut.audioUrl ?? cut.audio_url) {
      data[`${cutSlug}-audioNode`] = { text: cut.scriptText ?? cut.script_text ?? '', voice: 'ko-KR-Standard-A', status: 'done', audioUrl: cut.audioUrl ?? cut.audio_url };
    }
    return Object.keys(data).length > 0 ? data : null;
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
