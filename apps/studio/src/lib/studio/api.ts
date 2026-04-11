import type {
  Project,
  SceneMeta,
  SceneDetail,
  SceneListResponse,
  AgentWithQueue,
} from './types';
import {
  MOCK_PROJECTS,
  makeMockScenes,
  makeMockSceneDetail,
  makeMockSequences,
} from './mock-data';
import { makeMockAgents } from './agent-mock';

const PRODUCTION_API = process.env.NEXT_PUBLIC_PRODUCTION_API_URL ?? 'http://localhost:4000';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

/* ─── Helper ─── */

async function fetchJSON<T>(url: string, fallback: () => T): Promise<T> {
  if (USE_MOCK) return fallback();
  try {
    const res = await fetch(url, { next: { revalidate: 30 } });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return (await res.json()) as T;
  } catch {
    return fallback();
  }
}

/* ─── Projects ─── */

export async function fetchProjects(): Promise<Project[]> {
  return fetchJSON<Project[]>(
    `${PRODUCTION_API}/api/projects`,
    () => MOCK_PROJECTS,
  );
}

export async function fetchProject(projectId: string): Promise<Project | null> {
  const projects = await fetchProjects();
  return projects.find(p => p.id === projectId) ?? null;
}

/* ─── Scenes ─── */

export async function fetchScenes(
  projectId: string,
  opts: { sequenceId?: string; status?: SceneMeta['status'] } = {},
): Promise<SceneListResponse> {
  const project = await fetchProject(projectId);
  const initials = project?.initials ?? 'UNK';

  const data = await fetchJSON<SceneListResponse>(
    `${PRODUCTION_API}/api/projects/${projectId}/scenes`,
    () => ({
      scenes: makeMockScenes(projectId, initials),
      sequences: makeMockSequences(projectId),
      totalCount: 120,
    }),
  );

  let scenes = data.scenes;
  if (opts.sequenceId) scenes = scenes.filter(s => s.sequenceId === opts.sequenceId);
  if (opts.status) scenes = scenes.filter(s => s.status === opts.status);
  return { ...data, scenes };
}

/* ─── Agents ─── */

export async function fetchAgents(projectId: string): Promise<AgentWithQueue[]> {
  const project = await fetchProject(projectId);
  const initials = project?.initials ?? 'UNK';

  return fetchJSON<AgentWithQueue[]>(
    `${PRODUCTION_API}/api/projects/${projectId}/agents`,
    () => makeMockAgents(projectId, initials),
  );
}

/* ─── Scene Detail ─── */

export async function fetchSceneDetail(
  projectId: string,
  sceneSlug: string,
): Promise<SceneDetail | null> {
  const project = await fetchProject(projectId);
  const initials = project?.initials ?? 'UNK';
  const sceneNumber = parseInt(sceneSlug.replace('sc', ''), 10);

  return fetchJSON<SceneDetail | null>(
    `${PRODUCTION_API}/api/projects/${projectId}/scenes/${sceneSlug}`,
    () => makeMockSceneDetail(projectId, initials, sceneNumber),
  );
}
