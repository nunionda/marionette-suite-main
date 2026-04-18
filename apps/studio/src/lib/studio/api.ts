import type {
  Project,
  SceneMeta,
  SceneDetail,
  SceneListResponse,
  AgentWithQueue,
  CutMeta,
  Sequence,
} from './types';
import {
  MOCK_PROJECTS,
  makeMockScenes,
  makeMockSceneDetail,
  makeMockSequences,
  makeYouTubeSections,
} from './mock-data';
import { makeMockAgents } from './agent-mock';

/** script-writer backend (:3006) */
const SCRIPT_WRITER_API = process.env.NEXT_PUBLIC_PRODUCTION_API_URL ?? 'http://localhost:3006';

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

/* ─── Adapters: script-writer DB → studio types ─── */

const CATEGORY_MAP: Record<string, Project['category']> = {
  'Feature Film': 'film',
  'Short Film': 'film',
  'Netflix Original': 'drama_series',
  'Commercial': 'commercial',
  'YouTube': 'youtube_short',
};

const STATUS_MAP: Record<string, Project['status']> = {
  'Active': 'development',
  'In Progress': 'production',
  'Completed': 'post',
};

function makeInitials(title: string): string {
  return title
    .replace(/[^a-zA-Z가-힣\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 3) || 'UNK';
}

function adaptProject(raw: any): Project {
  return {
    id: String(raw.id),
    initials: makeInitials(raw.title),
    title: raw.title,
    titleKo: raw.title,
    status: STATUS_MAP[raw.status] ?? 'development',
    category: CATEGORY_MAP[raw.category] ?? 'film',
    posterUrl: '',
    totalScenes: raw.totalScenes ?? 0,
    completedScenes: raw.completedScenes ?? 0,
    totalCuts: raw.totalCuts ?? 0,
    completedCuts: raw.completedCuts ?? 0,
    createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
  };
}

/** Map cut status from script-writer pipeline stages to studio's simpler status */
function adaptCutStatus(status: string): CutMeta['status'] {
  if (status === 'pending') return 'pending';
  if (status === 'done') return 'done';
  if (status === 'approved') return 'approved';
  // script-writer stages: script, image_prompt, image_gen, video, audio → all "generating"
  return 'generating';
}

function adaptScene(raw: any): SceneMeta {
  const chars = typeof raw.characters === 'string'
    ? JSON.parse(raw.characters || '[]')
    : (raw.characters ?? []);
  return {
    id: String(raw.id),
    slug: raw.slug,
    displayId: raw.displayId ?? raw.display_id ?? raw.slug,
    number: raw.sceneNumber ?? raw.scene_number ?? 0,
    sequenceId: `act-${raw.act ?? 1}`,
    title: raw.heading ?? '',
    location: raw.location ?? '',
    timeOfDay: raw.timeOfDay ?? raw.time_of_day ?? '',
    summary: raw.summary ?? '',
    coverImageUrl: '',
    cutCount: raw.cutCount ?? raw.cut_count ?? 0,
    completedCutCount: raw.completedCutCount ?? raw.completed_cut_count ?? 0,
    status: (raw.status as SceneMeta['status']) ?? 'pending',
  };
}

function adaptCut(raw: any): CutMeta {
  return {
    id: String(raw.id),
    slug: raw.slug,
    displayId: raw.displayId ?? raw.display_id ?? raw.slug,
    number: raw.cutNumber ?? raw.cut_number ?? 0,
    sceneId: String(raw.sceneId ?? raw.scene_id ?? ''),
    duration: (raw.duration === 3 || raw.duration === 5) ? raw.duration : 4,
    status: adaptCutStatus(raw.status ?? 'pending'),
    thumbnailUrl: raw.thumbnailUrl ?? raw.thumbnail_url ?? undefined,
    description: raw.description ?? raw.scriptText ?? raw.script_text ?? '',
  };
}

function adaptSceneDetail(raw: any, sceneMeta: SceneMeta): SceneDetail {
  const cuts: CutMeta[] = (raw.cuts ?? []).map(adaptCut);
  const chars = typeof raw.characters === 'string'
    ? JSON.parse(raw.characters || '[]')
    : (raw.characters ?? []);
  return {
    ...sceneMeta,
    synopsis: raw.summary ?? '',
    characters: chars,
    durationSeconds: cuts.length * 4,
    cuts,
  };
}

/* ─── Projects ─── */

export async function fetchProjects(): Promise<Project[]> {
  if (USE_MOCK) return MOCK_PROJECTS;
  try {
    const res = await fetch(`${SCRIPT_WRITER_API}/api/projects`, { next: { revalidate: 30 } });
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    const list = data.projects ?? data;
    return (Array.isArray(list) ? list : []).map(adaptProject);
  } catch {
    return MOCK_PROJECTS;
  }
}

export async function fetchProject(projectId: string): Promise<Project | null> {
  if (USE_MOCK) return MOCK_PROJECTS.find(p => p.id === projectId) ?? null;
  try {
    const res = await fetch(`${SCRIPT_WRITER_API}/api/projects/${projectId}`, { next: { revalidate: 30 } });
    if (!res.ok) throw new Error(`${res.status}`);
    const raw = await res.json();
    return raw ? adaptProject(raw) : null;
  } catch {
    return MOCK_PROJECTS.find(p => p.id === projectId) ?? null;
  }
}

/* ─── Scenes ─── */

export async function fetchScenes(
  projectId: string,
  opts: { sequenceId?: string; status?: SceneMeta['status'] } = {},
): Promise<SceneListResponse> {
  const project = await fetchProject(projectId);
  const initials = project?.initials ?? 'UNK';
  const isYouTube = project?.category === 'youtube_short';

  if (USE_MOCK) {
    const data = isYouTube
      ? { scenes: makeYouTubeSections(projectId), sequences: [] as Sequence[], totalCount: 5 }
      : { scenes: makeMockScenes(projectId, initials), sequences: makeMockSequences(projectId), totalCount: 120 };
    return filterScenes(data, opts, isYouTube);
  }

  try {
    const res = await fetch(`${SCRIPT_WRITER_API}/api/projects/${projectId}/scenes`, { next: { revalidate: 30 } });
    if (!res.ok) throw new Error(`${res.status}`);
    const raw = await res.json();
    const rawScenes = raw.scenes ?? [];
    const scenes: SceneMeta[] = rawScenes.map(adaptScene);
    const sequences: Sequence[] = (raw.sequences ?? []).map((s: any) => ({
      id: s.id,
      number: s.number,
      title: s.title,
      projectId: s.projectId ?? projectId,
      sceneCount: s.sceneCount ?? 0,
      completedSceneCount: s.completedSceneCount ?? 0,
    }));
    const data: SceneListResponse = { scenes, sequences, totalCount: raw.totalCount ?? scenes.length };
    return filterScenes(data, opts, isYouTube);
  } catch {
    const fallback = isYouTube
      ? { scenes: makeYouTubeSections(projectId), sequences: [] as Sequence[], totalCount: 5 }
      : { scenes: makeMockScenes(projectId, initials), sequences: makeMockSequences(projectId), totalCount: 120 };
    return filterScenes(fallback, opts, isYouTube);
  }
}

function filterScenes(
  data: SceneListResponse,
  opts: { sequenceId?: string; status?: SceneMeta['status'] },
  isYouTube: boolean,
): SceneListResponse {
  let scenes = data.scenes ?? [];
  if (opts.sequenceId) {
    scenes = scenes.filter(s =>
      isYouTube ? s.location === opts.sequenceId : s.sequenceId === opts.sequenceId,
    );
  }
  if (opts.status) scenes = scenes.filter(s => s.status === opts.status);
  return { ...data, scenes };
}

/* ─── Agents ─── */

export async function fetchAgents(projectId: string): Promise<AgentWithQueue[]> {
  const project = await fetchProject(projectId);
  const initials = project?.initials ?? 'UNK';

  return fetchJSON<AgentWithQueue[]>(
    `${SCRIPT_WRITER_API}/api/projects/${projectId}/agents`,
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

  if (USE_MOCK) return makeMockSceneDetail(projectId, initials, sceneNumber);

  try {
    // Use slug-based lookup
    const res = await fetch(
      `${SCRIPT_WRITER_API}/api/projects/${projectId}/scenes/by-slug/${sceneSlug}`,
      { next: { revalidate: 30 } },
    );
    if (!res.ok) throw new Error(`${res.status}`);
    const raw = await res.json();
    if (!raw) return makeMockSceneDetail(projectId, initials, sceneNumber);
    const sceneMeta = adaptScene(raw);
    return adaptSceneDetail(raw, sceneMeta);
  } catch {
    return makeMockSceneDetail(projectId, initials, sceneNumber);
  }
}
