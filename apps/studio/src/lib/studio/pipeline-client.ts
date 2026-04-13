/**
 * Pipeline API client for Studio.
 *
 * Calls script-writer backend (:3006) Pipeline API
 * to execute nodes and retrieve results.
 */

const API_URL = process.env.NEXT_PUBLIC_PRODUCTION_API_URL ?? 'http://localhost:3006';

export interface ExecuteResult {
  success: boolean;
  assetId?: number;
  result?: any;
  error?: string;
}

/**
 * Execute a pipeline node for a project.
 */
export async function executeNode(
  projectId: string,
  nodeId: string,
  payload: Record<string, any> = {},
): Promise<ExecuteResult> {
  const res = await fetch(`${API_URL}/api/projects/${projectId}/pipeline/${nodeId}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

/**
 * Execute image generation for a specific cut.
 */
export async function generateCutImage(
  projectId: string,
  cutId: string,
  prompt: string,
): Promise<ExecuteResult> {
  return executeNode(projectId, 'image_gen', {
    phase: 'image_gen',
    track: 'video',
    prompt,
    cutId,
  });
}

/**
 * Execute TTS audio for a specific cut.
 */
export async function generateCutAudio(
  projectId: string,
  cutId: string,
  text: string,
  lang: string = 'ko',
): Promise<ExecuteResult> {
  return executeNode(projectId, 'audio_gen', {
    phase: 'audio',
    track: 'video',
    text,
    lang,
    cutId,
  });
}

/**
 * Batch execute a scene's cuts.
 */
export async function batchExecuteScene(
  projectId: string,
  sceneId: string,
  steps: string[] = ['image_prompt', 'image_gen'],
  maxCuts: number = 10,
): Promise<any> {
  const res = await fetch(`${API_URL}/api/projects/${projectId}/scenes/${sceneId}/batch-execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ steps, maxCuts }),
  });
  return res.json();
}
