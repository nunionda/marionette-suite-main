import type { Project, SceneMeta, SceneDetail, CutMeta, Sequence, SceneStatus } from './types';
import { makeSceneSlug, makeCutSlug, makeSceneDisplayId, makeCutDisplayId } from './naming';

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'tdk',
    initials: 'TDK',
    title: 'The Dark Knight',
    titleKo: '다크 나이트',
    status: 'production',
    posterUrl: 'https://picsum.photos/seed/tdk/400/600',
    totalScenes: 120,
    completedScenes: 47,
    totalCuts: 2400,
    completedCuts: 940,
    createdAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 'gsc',
    initials: 'GSC',
    title: 'Gisaengchung',
    titleKo: '기생충',
    status: 'development',
    posterUrl: 'https://picsum.photos/seed/gsc/400/600',
    totalScenes: 135,
    completedScenes: 12,
    totalCuts: 2700,
    completedCuts: 240,
    createdAt: '2026-02-20T09:00:00Z',
  },
  {
    id: 'mem',
    initials: 'MEM',
    title: 'Memento',
    titleKo: '메멘토',
    status: 'post',
    posterUrl: 'https://picsum.photos/seed/mem/400/600',
    totalScenes: 89,
    completedScenes: 89,
    totalCuts: 1780,
    completedCuts: 1780,
    createdAt: '2025-11-01T09:00:00Z',
  },
  {
    id: 'ytc01',
    initials: 'YTC',
    title: 'Korean Street Food ASMR #42',
    category: 'youtube_short',
    status: 'production',
    posterUrl: 'https://picsum.photos/seed/ytc01/400/225',
    totalScenes: 5,       // 5 sections: HOOK / INTRO / MAIN / CTA / OUTRO
    completedScenes: 2,
    totalCuts: 15,        // ~3 clips per section
    completedCuts: 6,
    createdAt: '2026-04-01T09:00:00Z',
  },
];

export function makeMockSequences(projectId: string): Sequence[] {
  return [
    { id: `${projectId}-seq1`, number: 1, title: 'Act I — Setup', projectId, sceneCount: 30, completedSceneCount: 20 },
    { id: `${projectId}-seq2`, number: 2, title: 'Act II — Confrontation', projectId, sceneCount: 60, completedSceneCount: 18 },
    { id: `${projectId}-seq3`, number: 3, title: 'Act III — Resolution', projectId, sceneCount: 30, completedSceneCount: 9 },
  ];
}

export function makeMockScenes(projectId: string, initials: string, count = 120): SceneMeta[] {
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    const slug = makeSceneSlug(n);
    const completedCuts = n <= 47 ? 20 : n <= 60 ? Math.floor(Math.random() * 15) : 0;
    return {
      id: `${projectId}-${slug}`,
      slug,
      displayId: makeSceneDisplayId(initials, n),
      number: n,
      sequenceId: `${projectId}-seq${n <= 30 ? 1 : n <= 90 ? 2 : 3}`,
      title: `Scene ${n}`,
      location: ['INT. WAYNE MANOR', 'EXT. GOTHAM CITY', 'INT. POLICE PRECINCT'][n % 3],
      timeOfDay: ['DAY', 'NIGHT', 'DUSK'][n % 3],
      summary: `Scene ${n} summary. Key dramatic moment unfolds as characters react to the situation.`,
      coverImageUrl: `https://picsum.photos/seed/${projectId}-sc${n}/400/225`,
      cutCount: 20,
      completedCutCount: completedCuts,
      status: completedCuts === 20 ? 'done' : completedCuts > 0 ? 'in_progress' : 'pending',
    };
  });
}

type CutStatus = 'pending' | 'generating' | 'done' | 'approved';

export function makeMockCuts(projectId: string, initials: string, sceneNumber: number): CutMeta[] {
  return Array.from({ length: 20 }, (_, i) => {
    const n = i + 1;
    const slug = makeCutSlug(n);
    const status: CutStatus = sceneNumber <= 47 ? 'approved' : sceneNumber <= 60 && n <= 10 ? 'done' : 'pending';
    return {
      id: `${projectId}-sc${sceneNumber}-${slug}`,
      slug,
      displayId: makeCutDisplayId(initials, sceneNumber, n),
      number: n,
      sceneId: `${projectId}-${makeSceneSlug(sceneNumber)}`,
      duration: ([3, 4, 5] as const)[n % 3],
      status,
      thumbnailUrl: status !== 'pending'
        ? `https://picsum.photos/seed/${projectId}-sc${sceneNumber}-cut${n}/320/180`
        : undefined,
    };
  });
}

const YT_SECTIONS = [
  { type: 'HOOK',  title: 'Hook',  clips: 3, completedClips: 3 },
  { type: 'INTRO', title: 'Intro', clips: 3, completedClips: 3 },
  { type: 'MAIN',  title: 'Main Content', clips: 5, completedClips: 0 },
  { type: 'CTA',   title: 'Call to Action', clips: 2, completedClips: 0 },
  { type: 'OUTRO', title: 'Outro', clips: 2, completedClips: 0 },
] as const;

export function makeYouTubeSections(projectId: string): SceneMeta[] {
  return YT_SECTIONS.map((s, i) => {
    const n = i + 1;
    const slug = makeSceneSlug(n);
    const status: SceneStatus =
      s.completedClips === s.clips ? 'done'
      : s.completedClips > 0 ? 'in_progress'
      : 'pending';
    return {
      id: `${projectId}-${slug}`,
      slug,
      displayId: `YTC_${slug}`,
      number: n,
      sequenceId: `${projectId}-yt`,
      title: s.title,
      location: s.type,
      timeOfDay: '',
      summary: `${s.type} 섹션 — ${s.clips}개 클립`,
      coverImageUrl: `https://picsum.photos/seed/${projectId}-${s.type.toLowerCase()}/400/225`,
      cutCount: s.clips,
      completedCutCount: s.completedClips,
      status,
    };
  });
}

export function makeMockSceneDetail(
  projectId: string,
  initials: string,
  sceneNumber: number,
): SceneDetail {
  const scenes = makeMockScenes(projectId, initials);
  const scene = scenes[sceneNumber - 1];
  return {
    ...scene,
    characters: ['BRUCE WAYNE', 'ALFRED', 'COMMISSIONER GORDON'].slice(0, (sceneNumber % 3) + 1),
    durationSeconds: 60,
    cuts: makeMockCuts(projectId, initials, sceneNumber),
  };
}
