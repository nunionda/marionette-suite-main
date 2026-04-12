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
  makeYouTubeSections,
} from './mock-data';
import { makeMockAgents } from './agent-mock';

const PRODUCTION_API = process.env.NEXT_PUBLIC_PRODUCTION_API_URL ?? 'http://localhost:3005';

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
  return fetchJSON<Project | null>(
    `${PRODUCTION_API}/api/projects/${projectId}`,
    () => MOCK_PROJECTS.find(p => p.id === projectId) ?? null,
  );
}

/* ─── Scenes ─── */

export async function fetchScenes(
  projectId: string,
  opts: { sequenceId?: string; status?: SceneMeta['status'] } = {},
): Promise<SceneListResponse> {
  const project = await fetchProject(projectId);
  const initials = project?.initials ?? 'UNK';

  const isYouTube = project?.category === 'youtube_short';

  const data = await fetchJSON<SceneListResponse>(
    `${PRODUCTION_API}/api/projects/${projectId}/scenes`,
    () => isYouTube
      ? { scenes: makeYouTubeSections(projectId), sequences: [], totalCount: 5 }
      : { scenes: makeMockScenes(projectId, initials), sequences: makeMockSequences(projectId), totalCount: 120 },
  );

  // YouTube 섹션은 항상 5개 고정 구조 — API가 비어있거나 잘못된 형식이어도 목업 구조를 보여줌
  const effective = (isYouTube && (data.scenes ?? []).length === 0)
    ? { scenes: makeYouTubeSections(projectId), sequences: [], totalCount: 5 }
    : data;

  let scenes = effective.scenes ?? [];
  if (opts.sequenceId) {
    // YouTube: seq 파라미터 = 섹션 타입(HOOK/INTRO 등) → location 필드로 필터
    // Film: seq 파라미터 = Act sequenceId → sequenceId 필드로 필터
    scenes = scenes.filter(s =>
      isYouTube
        ? s.location === opts.sequenceId
        : s.sequenceId === opts.sequenceId,
    );
  }
  if (opts.status) scenes = scenes.filter(s => s.status === opts.status);
  return { ...effective, scenes };
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
