# Studio Frontend Phase 1-2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the navigation foundation of `apps/studio` — project grid, project hub, scene list (150씬 virtual scroll), and scene detail (filmstrip) — giving the team a fully browsable project hierarchy.

**Architecture:** New route segments are added under `apps/studio/src/app/projects/` without touching the existing home page. All data is served by a typed API client (pointing to `:4005` / `:4000`) with a mock-data fallback so the UI works before the API is ready. A Zustand store holds the current project context; React Query manages server state.

**Tech Stack:** Next.js 16 (App Router), TypeScript strict, Tailwind CSS v4, `@tanstack/react-virtual` (virtual scroll), `zustand`, `@tanstack/react-query`, `lucide-react`, `framer-motion`

**Scope note:** This plan covers **Phase 1 (App setup + Home + Project Hub)** and **Phase 2 (Scene List + Scene Detail)**. The Cut Node Editor (Phase 3, requires `@xyflow/react`) is a separate plan.

---

## File Map

```
apps/studio/src/
  app/
    projects/
      layout.tsx                           # Projects shell layout (nav + breadcrumb)
      page.tsx                             # Home: project grid
      [projectId]/
        layout.tsx                         # Project layout (sidebar tabs)
        page.tsx                           # Project Hub (redirect to ?tab=overview)
        scenes/
          page.tsx                         # Scene list (virtual scroll grid)
          [sceneSlug]/
            page.tsx                       # Scene detail (filmstrip)
  lib/
    studio/
      types.ts                             # All shared TypeScript interfaces
      mock-data.ts                         # Dev mock data (120 scenes, 20 cuts each)
      api.ts                               # Typed API client (fetch + mock fallback)
      naming.ts                            # Naming convention utilities
      naming.test.ts                       # bun:test unit tests for naming utilities
  store/
    studio.ts                              # Zustand store (current project/scene)
  components/
    studio/
      ProjectCard.tsx                      # Netflix-style project poster card
      SceneCard.tsx                        # Scene thumbnail card (cover image + progress)
      CutStrip.tsx                         # Horizontal filmstrip of cut cards
      CutCard.tsx                          # Single cut card in filmstrip
      StudioNav.tsx                        # Top nav bar
      Breadcrumb.tsx                       # Path breadcrumb
      ProgressBar.tsx                      # Thin progress bar with percentage
      StatusBadge.tsx                      # pending / in_progress / done / approved badge
  app/
    studio-tokens.css                      # CSS variable design tokens (cinematic dark)
```

---

## Task 1: Install dependencies + add typecheck script

**Files:**
- Modify: `apps/studio/package.json`

- [ ] **Step 1: Add missing packages**

```bash
cd /Users/daniel/dev/claude-dev/marionette-suite/apps/studio
pnpm add @tanstack/react-virtual zustand @tanstack/react-query
```

Expected: packages added to `package.json` dependencies, lockfile updated.

- [ ] **Step 2: Add typecheck script to package.json**

Open `apps/studio/package.json`. Add `"typecheck": "tsc --noEmit"` to `scripts`:

```json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "typecheck": "tsc --noEmit"
  }
}
```

- [ ] **Step 3: Verify typecheck passes on existing code**

```bash
cd /Users/daniel/dev/claude-dev/marionette-suite/apps/studio
pnpm typecheck
```

Expected: Zero errors (existing code is already strict-typed).

- [ ] **Step 4: Commit**

```bash
cd /Users/daniel/dev/claude-dev/marionette-suite/apps/studio
git add package.json pnpm-lock.yaml
git commit -m "feat(studio): add react-virtual, zustand, react-query deps"
```

---

## Task 2: CSS design tokens

**Files:**
- Create: `apps/studio/src/app/studio-tokens.css`
- Modify: `apps/studio/src/app/globals.css`

- [ ] **Step 1: Create the cinematic dark token file**

Create `apps/studio/src/app/studio-tokens.css`:

```css
/* ─── Studio Cinematic Dark Tokens ─── */
:root {
  /* Backgrounds */
  --studio-bg-base:     #0a0a0f;
  --studio-bg-surface:  #111118;
  --studio-bg-elevated: #1a1a24;
  --studio-bg-hover:    #22223a;

  /* Borders */
  --studio-border:      #2a2a3a;
  --studio-border-accent: #3f3f5a;

  /* Text */
  --studio-text:        #f0f0f8;
  --studio-text-dim:    #8888aa;
  --studio-text-muted:  #55556a;

  /* Accent */
  --studio-accent:      #6366f1;
  --studio-accent-dim:  rgba(99, 102, 241, 0.15);
  --studio-accent-glow: rgba(99, 102, 241, 0.4);

  /* Status */
  --studio-success:     #22c55e;
  --studio-warning:     #f59e0b;
  --studio-danger:      #ef4444;
  --studio-info:        #38bdf8;

  /* Layout */
  --studio-nav-h:       56px;
  --studio-sidebar-w:   220px;
  --studio-radius:      8px;
  --studio-radius-sm:   4px;
}
```

- [ ] **Step 2: Import tokens into globals.css**

Open `apps/studio/src/app/globals.css`. Add this at the very top (before any existing content):

```css
@import './studio-tokens.css';
```

- [ ] **Step 3: Verify dev server still starts**

```bash
cd /Users/daniel/dev/claude-dev/marionette-suite/apps/studio
pnpm dev &
sleep 5
curl -s http://localhost:3001 | head -5
kill %1
```

Expected: HTML response (200 OK), no CSS import errors in terminal.

- [ ] **Step 4: Commit**

```bash
git add src/app/studio-tokens.css src/app/globals.css
git commit -m "feat(studio): add cinematic dark design tokens"
```

---

## Task 3: TypeScript type definitions

**Files:**
- Create: `apps/studio/src/lib/studio/types.ts`

- [ ] **Step 1: Create the shared types file**

Create `apps/studio/src/lib/studio/types.ts`:

```typescript
/* ─── Project ─── */
export type ProjectStatus = 'development' | 'production' | 'post';

export interface Project {
  id: string;
  initials: string;         // 'TDK' — naming convention prefix
  title: string;
  titleKo?: string;
  status: ProjectStatus;
  posterUrl: string;
  totalScenes: number;
  completedScenes: number;
  totalCuts: number;
  completedCuts: number;
  createdAt: string;        // ISO 8601
}

/* ─── Sequence ─── */
export interface Sequence {
  id: string;
  number: number;
  title: string;
  projectId: string;
  sceneCount: number;
  completedSceneCount: number;
}

/* ─── Scene ─── */
export type SceneStatus = 'pending' | 'in_progress' | 'done';

export interface SceneMeta {
  id: string;
  slug: string;             // 'sc001'
  displayId: string;        // 'TDK_sc001'
  number: number;
  sequenceId: string;
  title: string;
  location: string;
  timeOfDay: string;
  summary: string;
  coverImageUrl: string;    // 'TDK_sc001_cover.jpg'
  cutCount: number;
  completedCutCount: number;
  status: SceneStatus;
}

export interface SceneDetail extends SceneMeta {
  characters: string[];
  durationSeconds: number;
  cuts: CutMeta[];
}

/* ─── Cut ─── */
export type CutStatus = 'pending' | 'generating' | 'done' | 'approved';

export interface CutMeta {
  id: string;
  slug: string;             // 'cut001'
  displayId: string;        // 'TDK_sc001_cut001'
  number: number;
  sceneId: string;
  duration: 3 | 4 | 5;     // seconds
  status: CutStatus;
  thumbnailUrl?: string;
}

/* ─── Asset ─── */
export type AssetType = 'image' | 'video' | 'audio';

export interface Asset {
  id: string;
  cutId: string;
  type: AssetType;
  filename: string;         // 'TDK_sc001_cut001_img001.jpg'
  url: string;
  version: number;
  provider: string;
  approved: boolean;
}

/* ─── Agent ─── */
export type AgentType = 'image_gen' | 'video_gen' | 'audio_gen' | 'prompt' | 'analysis';
export type AgentStatus = 'idle' | 'running' | 'done' | 'error';

export interface AgentCurrentTask {
  sceneSlug: string;
  cutSlug: string;
  displayId: string;
}

export interface Agent {
  id: string;
  type: AgentType;
  projectId: string;
  status: AgentStatus;
  currentTask?: AgentCurrentTask;
  stats: {
    processed: number;
    errors: number;
    queueSize: number;
  };
}

/* ─── API responses ─── */
export interface ProjectListResponse {
  projects: Project[];
}

export interface SceneListResponse {
  scenes: SceneMeta[];
  sequences: Sequence[];
  totalCount: number;
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/daniel/dev/claude-dev/marionette-suite/apps/studio
pnpm typecheck
```

Expected: Zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/studio/types.ts
git commit -m "feat(studio): add shared TypeScript type definitions"
```

---

## Task 4: Naming convention utilities + tests

**Files:**
- Create: `apps/studio/src/lib/studio/naming.ts`
- Create: `apps/studio/src/lib/studio/naming.test.ts`

- [ ] **Step 1: Write failing tests first**

Create `apps/studio/src/lib/studio/naming.test.ts`:

```typescript
import { describe, it, expect } from 'bun:test';
import {
  makeSceneSlug,
  makeCutSlug,
  makeSceneDisplayId,
  makeCutDisplayId,
  makeAssetFilename,
  makeSceneCoverFilename,
  generateInitials,
} from './naming';

describe('makeSceneSlug', () => {
  it('zero-pads to 3 digits', () => {
    expect(makeSceneSlug(1)).toBe('sc001');
    expect(makeSceneSlug(23)).toBe('sc023');
    expect(makeSceneSlug(150)).toBe('sc150');
  });
});

describe('makeCutSlug', () => {
  it('zero-pads to 3 digits', () => {
    expect(makeCutSlug(1)).toBe('cut001');
    expect(makeCutSlug(7)).toBe('cut007');
    expect(makeCutSlug(20)).toBe('cut020');
  });
});

describe('makeSceneDisplayId', () => {
  it('combines initials and scene slug', () => {
    expect(makeSceneDisplayId('TDK', 1)).toBe('TDK_sc001');
    expect(makeSceneDisplayId('GSC', 23)).toBe('GSC_sc023');
  });
});

describe('makeCutDisplayId', () => {
  it('combines initials, scene slug, and cut slug', () => {
    expect(makeCutDisplayId('TDK', 1, 7)).toBe('TDK_sc001_cut007');
    expect(makeCutDisplayId('GSC', 23, 1)).toBe('GSC_sc023_cut001');
  });
});

describe('makeAssetFilename', () => {
  it('formats image asset filename', () => {
    expect(makeAssetFilename('TDK', 1, 7, 'img', 1, 'jpg')).toBe('TDK_sc001_cut007_img001.jpg');
  });

  it('formats video asset filename', () => {
    expect(makeAssetFilename('TDK', 1, 7, 'vid', 1, 'mp4')).toBe('TDK_sc001_cut007_vid001.mp4');
  });

  it('appends version suffix when version > 1', () => {
    expect(makeAssetFilename('TDK', 1, 7, 'img', 2, 'jpg')).toBe('TDK_sc001_cut007_img001_v2.jpg');
  });
});

describe('makeSceneCoverFilename', () => {
  it('formats scene cover image filename', () => {
    expect(makeSceneCoverFilename('TDK', 1)).toBe('TDK_sc001_cover.jpg');
  });
});

describe('generateInitials', () => {
  it('takes first letter of each English word', () => {
    expect(generateInitials('The Dark Knight')).toBe('TDK');
  });

  it('handles single word', () => {
    expect(generateInitials('Parasite')).toBe('P');
  });

  it('caps at 5 characters', () => {
    expect(generateInitials('A B C D E F G').length).toBeLessThanOrEqual(5);
  });

  it('uppercases result', () => {
    expect(generateInitials('the dark knight')).toBe('TDK');
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd /Users/daniel/dev/claude-dev/marionette-suite/apps/studio
bun test src/lib/studio/naming.test.ts
```

Expected: FAIL — `Cannot find module './naming'`

- [ ] **Step 3: Write the implementation**

Create `apps/studio/src/lib/studio/naming.ts`:

```typescript
/** Zero-pad a number to 3 digits. */
function pad3(n: number): string {
  return String(n).padStart(3, '0');
}

/** 'sc001', 'sc023', 'sc150' */
export function makeSceneSlug(sceneNumber: number): string {
  return `sc${pad3(sceneNumber)}`;
}

/** 'cut001', 'cut007', 'cut020' */
export function makeCutSlug(cutNumber: number): string {
  return `cut${pad3(cutNumber)}`;
}

/** 'TDK_sc001' */
export function makeSceneDisplayId(initials: string, sceneNumber: number): string {
  return `${initials}_${makeSceneSlug(sceneNumber)}`;
}

/** 'TDK_sc001_cut007' */
export function makeCutDisplayId(
  initials: string,
  sceneNumber: number,
  cutNumber: number,
): string {
  return `${initials}_${makeSceneSlug(sceneNumber)}_${makeCutSlug(cutNumber)}`;
}

/**
 * 'TDK_sc001_cut007_img001.jpg'
 * 'TDK_sc001_cut007_img001_v2.jpg' (version > 1)
 */
export function makeAssetFilename(
  initials: string,
  sceneNumber: number,
  cutNumber: number,
  assetType: 'img' | 'vid' | 'aud',
  assetIndex: number,
  ext: string,
  version = 1,
): string {
  const base = `${makeCutDisplayId(initials, sceneNumber, cutNumber)}_${assetType}${pad3(assetIndex)}`;
  const versionSuffix = version > 1 ? `_v${version}` : '';
  return `${base}${versionSuffix}.${ext}`;
}

/** 'TDK_sc001_cover.jpg' */
export function makeSceneCoverFilename(initials: string, sceneNumber: number): string {
  return `${makeSceneDisplayId(initials, sceneNumber)}_cover.jpg`;
}

/**
 * Generate project initials from title.
 * 'The Dark Knight' → 'TDK'
 * '기생충' → 'GSC' (romanized first letter approach — caller should romanize first)
 * Max 5 characters.
 */
export function generateInitials(title: string): string {
  return title
    .split(/\s+/)
    .map(word => word[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 5);
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd /Users/daniel/dev/claude-dev/marionette-suite/apps/studio
bun test src/lib/studio/naming.test.ts
```

Expected: All 10 tests PASS.

- [ ] **Step 5: Typecheck**

```bash
pnpm typecheck
```

Expected: Zero errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/studio/naming.ts src/lib/studio/naming.test.ts
git commit -m "feat(studio): add naming convention utilities with tests"
```

---

## Task 5: Mock data layer

**Files:**
- Create: `apps/studio/src/lib/studio/mock-data.ts`
- Create: `apps/studio/src/lib/studio/api.ts`

- [ ] **Step 1: Create mock data**

Create `apps/studio/src/lib/studio/mock-data.ts`:

```typescript
import type { Project, SceneMeta, SceneDetail, CutMeta, Sequence } from './types';
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
];

export function makeMockSequences(projectId: string): Sequence[] {
  return [
    { id: `${projectId}-seq1`, number: 1, title: 'Act I — Setup', projectId, sceneCount: 30, completedSceneCount: 20 },
    { id: `${projectId}-seq2`, number: 2, title: 'Act II — Confrontation', projectId, sceneCount: 60, completedSceneCount: 18 },
    { id: `${projectId}-seq3`, number: 3, title: 'Act III — Resolution', projectId, sceneCount: 30, completedSceneCount: 9 },
  ];
}

export function makeMockScenes(projectId: string, initials: string, count = 120): SceneMeta[] {
  const statuses: SceneMeta['status'][] = ['pending', 'in_progress', 'done'];
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

export function makeMockCuts(projectId: string, initials: string, sceneNumber: number): CutMeta[] {
  const statuses: CutStatus[] = ['pending', 'generating', 'done', 'approved'];
  return Array.from({ length: 20 }, (_, i) => {
    const n = i + 1;
    const slug = makeCutSlug(n);
    const status = sceneNumber <= 47 ? 'approved' : sceneNumber <= 60 && n <= 10 ? 'done' : 'pending';
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

type CutStatus = 'pending' | 'generating' | 'done' | 'approved';

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
```

- [ ] **Step 2: Create the API client**

Create `apps/studio/src/lib/studio/api.ts`:

```typescript
import type {
  Project,
  SceneMeta,
  SceneDetail,
  ProjectListResponse,
  SceneListResponse,
} from './types';
import {
  MOCK_PROJECTS,
  makeMockScenes,
  makeMockSceneDetail,
  makeMockSequences,
} from './mock-data';

const SCENARIO_API = process.env.NEXT_PUBLIC_SCENARIO_API_URL ?? 'http://localhost:4005';
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
```

- [ ] **Step 3: Typecheck**

```bash
cd /Users/daniel/dev/claude-dev/marionette-suite/apps/studio
pnpm typecheck
```

Expected: Zero errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/studio/mock-data.ts src/lib/studio/api.ts
git commit -m "feat(studio): add mock data + typed API client"
```

---

## Task 6: Zustand store

**Files:**
- Create: `apps/studio/src/store/studio.ts`

- [ ] **Step 1: Create the store**

Create `apps/studio/src/store/studio.ts`:

```typescript
import { create } from 'zustand';
import type { Project, SceneMeta } from '@/lib/studio/types';

interface StudioState {
  /* Current context */
  currentProject: Project | null;
  currentScene: SceneMeta | null;

  /* Actions */
  setCurrentProject: (project: Project | null) => void;
  setCurrentScene: (scene: SceneMeta | null) => void;
}

export const useStudioStore = create<StudioState>(set => ({
  currentProject: null,
  currentScene: null,
  setCurrentProject: project => set({ currentProject: project }),
  setCurrentScene: scene => set({ currentScene: scene }),
}));
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/daniel/dev/claude-dev/marionette-suite/apps/studio
pnpm typecheck
```

Expected: Zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/store/studio.ts
git commit -m "feat(studio): add zustand store for project/scene context"
```

---

## Task 7: Shared UI components

**Files:**
- Create: `apps/studio/src/components/studio/StatusBadge.tsx`
- Create: `apps/studio/src/components/studio/ProgressBar.tsx`
- Create: `apps/studio/src/components/studio/Breadcrumb.tsx`
- Create: `apps/studio/src/components/studio/StudioNav.tsx`

- [ ] **Step 1: Create StatusBadge**

Create `apps/studio/src/components/studio/StatusBadge.tsx`:

```tsx
import type { SceneStatus, CutStatus } from '@/lib/studio/types';

type Status = SceneStatus | CutStatus;

const CONFIG: Record<Status, { label: string; className: string }> = {
  pending:    { label: 'Pending',    className: 'bg-[var(--studio-bg-elevated)] text-[var(--studio-text-dim)] border border-[var(--studio-border)]' },
  in_progress:{ label: 'In Progress',className: 'bg-[var(--studio-accent-dim)] text-[var(--studio-accent)] border border-[var(--studio-accent)]' },
  generating: { label: 'Generating', className: 'bg-amber-900/30 text-[var(--studio-warning)] border border-amber-700/50 animate-pulse' },
  done:       { label: 'Done',       className: 'bg-green-900/30 text-[var(--studio-success)] border border-green-700/50' },
  approved:   { label: 'Approved',   className: 'bg-green-900/50 text-[var(--studio-success)] border border-green-600' },
};

interface Props {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className = '' }: Props) {
  const { label, className: statusClass } = CONFIG[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${statusClass} ${className}`}
    >
      {label}
    </span>
  );
}
```

- [ ] **Step 2: Create ProgressBar**

Create `apps/studio/src/components/studio/ProgressBar.tsx`:

```tsx
interface Props {
  completed: number;
  total: number;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ completed, total, showLabel = true, className = '' }: Props) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={`space-y-1 ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-[11px] text-[var(--studio-text-dim)]">
          <span>{completed}/{total}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div className="h-1 bg-[var(--studio-bg-elevated)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--studio-accent)] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create Breadcrumb**

Create `apps/studio/src/components/studio/Breadcrumb.tsx`:

```tsx
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: Props) {
  return (
    <nav className="flex items-center gap-1 text-[12px] text-[var(--studio-text-dim)]">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={12} className="opacity-40" />}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-[var(--studio-text)] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--studio-text)]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
```

- [ ] **Step 4: Create StudioNav**

Create `apps/studio/src/components/studio/StudioNav.tsx`:

```tsx
import Link from 'next/link';
import { Film } from 'lucide-react';

interface Props {
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function StudioNav({ breadcrumbs = [] }: Props) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center gap-4 px-6 border-b border-[var(--studio-border)]"
      style={{
        height: 'var(--studio-nav-h)',
        background: 'var(--studio-bg-surface)',
      }}
    >
      <Link
        href="/projects"
        className="flex items-center gap-2 text-[var(--studio-accent)] hover:opacity-80 transition-opacity shrink-0"
      >
        <Film size={20} />
        <span className="text-[13px] font-bold tracking-widest uppercase">Studio</span>
      </Link>

      {breadcrumbs.length > 0 && (
        <>
          <div className="w-px h-5 bg-[var(--studio-border)]" />
          <nav className="flex items-center gap-1 text-[12px] text-[var(--studio-text-dim)]">
            {breadcrumbs.map((item, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="opacity-30 mx-1">/</span>}
                {item.href ? (
                  <Link href={item.href} className="hover:text-[var(--studio-text)] transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-[var(--studio-text)]">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        </>
      )}
    </header>
  );
}
```

- [ ] **Step 5: Typecheck**

```bash
cd /Users/daniel/dev/claude-dev/marionette-suite/apps/studio
pnpm typecheck
```

Expected: Zero errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/studio/
git commit -m "feat(studio): add shared UI components (StatusBadge, ProgressBar, Breadcrumb, StudioNav)"
```

---

## Task 8: Projects layout + Home (project grid)

**Files:**
- Create: `apps/studio/src/app/projects/layout.tsx`
- Create: `apps/studio/src/app/projects/page.tsx`
- Create: `apps/studio/src/components/studio/ProjectCard.tsx`

- [ ] **Step 1: Create ProjectCard**

Create `apps/studio/src/components/studio/ProjectCard.tsx`:

```tsx
import Link from 'next/link';
import Image from 'next/image';
import type { Project } from '@/lib/studio/types';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';

interface Props {
  project: Project;
}

const STATUS_MAP: Record<Project['status'], string> = {
  development: 'Development',
  production: 'Production',
  post: 'Post',
};

export function ProjectCard({ project }: Props) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group relative rounded-lg overflow-hidden border border-[var(--studio-border)] bg-[var(--studio-bg-surface)] transition-all duration-300 hover:border-[var(--studio-border-accent)] hover:shadow-[0_0_24px_rgba(99,102,241,0.15)]"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] bg-[var(--studio-bg-elevated)] overflow-hidden">
        <Image
          src={project.posterUrl}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
        />
        {/* Status badge overlay */}
        <div className="absolute top-2 left-2">
          <StatusBadge status={project.status === 'production' ? 'in_progress' : project.status === 'post' ? 'done' : 'pending'} />
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {/* Initials badge */}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-[var(--studio-accent)] text-[10px] font-bold tracking-widest px-2 py-0.5 rounded">
          {project.initials}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-[var(--studio-text)] font-semibold text-[14px] leading-tight">{project.title}</p>
          {project.titleKo && (
            <p className="text-[var(--studio-text-dim)] text-[12px] mt-0.5">{project.titleKo}</p>
          )}
        </div>
        <div className="space-y-2">
          <ProgressBar
            completed={project.completedScenes}
            total={project.totalScenes}
            showLabel={false}
          />
          <p className="text-[11px] text-[var(--studio-text-dim)]">
            {project.completedCuts.toLocaleString()} / {project.totalCuts.toLocaleString()} cuts
          </p>
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--studio-text-muted)]">
          {STATUS_MAP[project.status]}
        </p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create projects layout**

Create `apps/studio/src/app/projects/layout.tsx`:

```tsx
import { StudioNav } from '@/components/studio/StudioNav';

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--studio-bg-base)', color: 'var(--studio-text)' }}
    >
      <StudioNav />
      <main style={{ paddingTop: 'var(--studio-nav-h)' }}>{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Create home page**

Create `apps/studio/src/app/projects/page.tsx`:

```tsx
import { fetchProjects } from '@/lib/studio/api';
import { ProjectCard } from '@/components/studio/ProjectCard';
import { Film } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const projects = await fetchProjects();

  return (
    <div className="px-8 py-10 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Film size={20} className="text-[var(--studio-accent)]" />
          <h1 className="text-[28px] font-bold text-[var(--studio-text)]">Projects</h1>
        </div>
        <p className="text-[var(--studio-text-dim)] text-[14px]">
          {projects.length} active project{projects.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-24 text-[var(--studio-text-dim)]">
          <Film size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-[16px]">No projects yet</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Start dev server and visually verify**

```bash
cd /Users/daniel/dev/claude-dev/marionette-suite/apps/studio
NEXT_PUBLIC_USE_MOCK_DATA=true pnpm dev
```

Open http://localhost:3001/projects. Expected: 3 project cards in a Netflix-style grid with posters, progress bars, and initials badges. Dark cinematic background.

- [ ] **Step 5: Typecheck**

```bash
pnpm typecheck
```

Expected: Zero errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/projects/ src/components/studio/ProjectCard.tsx
git commit -m "feat(studio): add projects home page with Netflix-style project grid"
```

---

## Task 9: Project Hub `/projects/[id]`

**Files:**
- Create: `apps/studio/src/app/projects/[projectId]/layout.tsx`
- Create: `apps/studio/src/app/projects/[projectId]/page.tsx`

- [ ] **Step 1: Create project layout with sidebar tabs**

Create `apps/studio/src/app/projects/[projectId]/layout.tsx`:

```tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchProject } from '@/lib/studio/api';
import { StudioNav } from '@/components/studio/StudioNav';
import { LayoutGrid, Layers, Bot, Settings } from 'lucide-react';

const TABS = [
  { key: 'overview',  label: '개요',        icon: LayoutGrid, href: '' },
  { key: 'scenes',    label: '씬 목록',     icon: Layers,      href: '/scenes' },
  { key: 'agents',    label: '에이전트',    icon: Bot,         href: '/agents' },
  { key: 'management',label: '관리',        icon: Settings,    href: '?tab=management' },
] as const;

interface Props {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}

export default async function ProjectLayout({ children, params }: Props) {
  const { projectId } = await params;
  const project = await fetchProject(projectId);
  if (!project) notFound();

  const breadcrumbs = [
    { label: 'Projects', href: '/projects' },
    { label: project.initials },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--studio-bg-base)', color: 'var(--studio-text)' }}
    >
      <StudioNav breadcrumbs={breadcrumbs} />
      <div className="flex flex-1" style={{ paddingTop: 'var(--studio-nav-h)' }}>
        {/* Sidebar */}
        <aside
          className="shrink-0 border-r border-[var(--studio-border)] flex flex-col py-6 gap-1"
          style={{ width: 'var(--studio-sidebar-w)', background: 'var(--studio-bg-surface)' }}
        >
          <div className="px-4 mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--studio-accent)] mb-1">
              {project.initials}
            </p>
            <p className="text-[14px] font-semibold text-[var(--studio-text)] leading-tight">
              {project.title}
            </p>
          </div>
          {TABS.map(tab => (
            <Link
              key={tab.key}
              href={`/projects/${projectId}${tab.href}`}
              className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded text-[13px] text-[var(--studio-text-dim)] hover:text-[var(--studio-text)] hover:bg-[var(--studio-bg-hover)] transition-colors"
            >
              <tab.icon size={15} />
              {tab.label}
            </Link>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create project hub overview page**

Create `apps/studio/src/app/projects/[projectId]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { fetchProject, fetchScenes } from '@/lib/studio/api';
import { ProgressBar } from '@/components/studio/ProgressBar';
import Link from 'next/link';

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectHubPage({ params }: Props) {
  const { projectId } = await params;
  const [project, sceneData] = await Promise.all([
    fetchProject(projectId),
    fetchScenes(projectId),
  ]);
  if (!project) notFound();

  const { sequences } = sceneData;

  return (
    <div className="px-8 py-10 max-w-[1200px]">
      {/* Project stats */}
      <div className="mb-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '전체 씬', value: project.totalScenes },
          { label: '완료 씬', value: project.completedScenes },
          { label: '전체 컷', value: project.totalCuts.toLocaleString() },
          { label: '완료 컷', value: project.completedCuts.toLocaleString() },
        ].map(stat => (
          <div
            key={stat.label}
            className="rounded-lg border border-[var(--studio-border)] p-5"
            style={{ background: 'var(--studio-bg-surface)' }}
          >
            <p className="text-[11px] text-[var(--studio-text-dim)] uppercase tracking-wide mb-1">{stat.label}</p>
            <p className="text-[28px] font-bold text-[var(--studio-text)]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <div
        className="mb-10 rounded-lg border border-[var(--studio-border)] p-6"
        style={{ background: 'var(--studio-bg-surface)' }}
      >
        <h2 className="text-[14px] font-semibold mb-4">전체 진행률</h2>
        <ProgressBar completed={project.completedCuts} total={project.totalCuts} />
      </div>

      {/* Sequence cards */}
      <h2 className="text-[14px] font-semibold mb-4">시퀀스</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sequences.map(seq => (
          <Link
            key={seq.id}
            href={`/projects/${projectId}/scenes?seq=${seq.id}`}
            className="rounded-lg border border-[var(--studio-border)] p-5 hover:border-[var(--studio-border-accent)] transition-colors"
            style={{ background: 'var(--studio-bg-surface)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-bold text-[var(--studio-accent)] uppercase tracking-widest">
                Act {seq.number}
              </span>
            </div>
            <p className="text-[15px] font-semibold text-[var(--studio-text)] mb-4">{seq.title}</p>
            <ProgressBar completed={seq.completedSceneCount} total={seq.sceneCount} />
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Visual verification**

Open http://localhost:3001/projects/tdk. Expected: sidebar with tabs, project stats grid (120 scenes, 2400 cuts), 3 sequence cards with progress bars.

- [ ] **Step 4: Typecheck**

```bash
pnpm typecheck
```

Expected: Zero errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/projects/[projectId]/
git commit -m "feat(studio): add project hub page with stats + sequence cards"
```

---

## Task 10: Scene List with virtual scroll

**Files:**
- Create: `apps/studio/src/app/projects/[projectId]/scenes/page.tsx`
- Create: `apps/studio/src/components/studio/SceneCard.tsx`
- Create: `apps/studio/src/components/studio/VirtualSceneGrid.tsx`

- [ ] **Step 1: Create SceneCard**

Create `apps/studio/src/components/studio/SceneCard.tsx`:

```tsx
import Link from 'next/link';
import Image from 'next/image';
import type { SceneMeta } from '@/lib/studio/types';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';

interface Props {
  scene: SceneMeta;
  projectId: string;
}

export function SceneCard({ scene, projectId }: Props) {
  return (
    <Link
      href={`/projects/${projectId}/scenes/${scene.slug}`}
      className="group rounded border border-[var(--studio-border)] overflow-hidden hover:border-[var(--studio-border-accent)] transition-colors"
      style={{ background: 'var(--studio-bg-surface)' }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-[var(--studio-bg-elevated)] overflow-hidden">
        {scene.coverImageUrl ? (
          <Image
            src={scene.coverImageUrl}
            alt={scene.displayId}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--studio-text-muted)] text-[11px]">
            No image
          </div>
        )}
        <div className="absolute top-1.5 left-1.5">
          <StatusBadge status={scene.status} />
        </div>
        <div className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
          {scene.displayId}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <p className="text-[12px] font-semibold text-[var(--studio-text)] truncate">{scene.title}</p>
        <p className="text-[10px] text-[var(--studio-text-dim)]">
          {scene.location} · {scene.timeOfDay}
        </p>
        <ProgressBar
          completed={scene.completedCutCount}
          total={scene.cutCount}
          showLabel={false}
          className="mt-1"
        />
        <p className="text-[10px] text-[var(--studio-text-dim)]">
          {scene.completedCutCount}/{scene.cutCount} cuts
        </p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create VirtualSceneGrid (client component)**

Create `apps/studio/src/components/studio/VirtualSceneGrid.tsx`:

```tsx
'use client';

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { SceneMeta } from '@/lib/studio/types';
import { SceneCard } from './SceneCard';

const COLUMNS = 4;
const CARD_HEIGHT = 220; // px estimate per card row
const GAP = 16;

interface Props {
  scenes: SceneMeta[];
  projectId: string;
}

export function VirtualSceneGrid({ scenes, projectId }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Group scenes into rows of 4
  const rows: SceneMeta[][] = [];
  for (let i = 0; i < scenes.length; i += COLUMNS) {
    rows.push(scenes.slice(i, i + COLUMNS));
  }

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => CARD_HEIGHT + GAP,
    overscan: 3,
  });

  return (
    <div
      ref={parentRef}
      className="overflow-auto"
      style={{ height: 'calc(100vh - var(--studio-nav-h) - 120px)' }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map(virtualRow => {
          const row = rows[virtualRow.index];
          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                transform: `translateY(${virtualRow.start}px)`,
                display: 'grid',
                gridTemplateColumns: `repeat(${COLUMNS}, minmax(0, 1fr))`,
                gap: GAP,
              }}
            >
              {row.map(scene => (
                <SceneCard key={scene.id} scene={scene} projectId={projectId} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create scene list page**

Create `apps/studio/src/app/projects/[projectId]/scenes/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { fetchProject, fetchScenes } from '@/lib/studio/api';
import { VirtualSceneGrid } from '@/components/studio/VirtualSceneGrid';
import type { SceneMeta } from '@/lib/studio/types';

interface Props {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ seq?: string; status?: string }>;
}

export default async function SceneListPage({ params, searchParams }: Props) {
  const { projectId } = await params;
  const { seq, status } = await searchParams;

  const project = await fetchProject(projectId);
  if (!project) notFound();

  const statusFilter = status as SceneMeta['status'] | undefined;
  const { scenes, sequences, totalCount } = await fetchScenes(projectId, {
    sequenceId: seq,
    status: statusFilter,
  });

  const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
    { value: '', label: '전체' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
  ];

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--studio-text)]">씬 목록</h1>
          <p className="text-[13px] text-[var(--studio-text-dim)] mt-0.5">
            {scenes.length} / {totalCount}씬
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          {/* Sequence filter */}
          <div className="flex items-center gap-1 bg-[var(--studio-bg-surface)] border border-[var(--studio-border)] rounded px-1 py-0.5">
            {[{ id: '', title: '전체' }, ...sequences].map(s => (
              <a
                key={s.id}
                href={`?${new URLSearchParams({ ...(s.id && { seq: s.id }), ...(status && { status }) })}`}
                className={`px-3 py-1.5 rounded text-[11px] font-semibold transition-colors ${
                  seq === s.id || (!seq && !s.id)
                    ? 'bg-[var(--studio-accent)] text-white'
                    : 'text-[var(--studio-text-dim)] hover:text-[var(--studio-text)]'
                }`}
              >
                {'number' in s ? `Act ${s.number}` : s.title}
              </a>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 bg-[var(--studio-bg-surface)] border border-[var(--studio-border)] rounded px-1 py-0.5">
            {STATUS_OPTIONS.map(opt => (
              <a
                key={opt.value}
                href={`?${new URLSearchParams({ ...(seq && { seq }), ...(opt.value && { status: opt.value }) })}`}
                className={`px-3 py-1.5 rounded text-[11px] font-semibold transition-colors ${
                  (status ?? '') === opt.value
                    ? 'bg-[var(--studio-bg-elevated)] text-[var(--studio-text)]'
                    : 'text-[var(--studio-text-dim)] hover:text-[var(--studio-text)]'
                }`}
              >
                {opt.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Virtual grid */}
      <VirtualSceneGrid scenes={scenes} projectId={projectId} />
    </div>
  );
}
```

- [ ] **Step 4: Visual verification**

Open http://localhost:3001/projects/tdk/scenes. Expected: 4-column grid of 120 scene cards with cover images, status badges, displayId (e.g. `TDK_sc001`), and cut progress. Smooth virtual scrolling without rendering all 120 cards in the DOM simultaneously.

Open DevTools → Elements: confirm only ~20 scene card DOM nodes visible at once (virtual scroll working).

- [ ] **Step 5: Typecheck**

```bash
pnpm typecheck
```

Expected: Zero errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/projects/[projectId]/scenes/page.tsx \
        src/components/studio/SceneCard.tsx \
        src/components/studio/VirtualSceneGrid.tsx
git commit -m "feat(studio): add scene list page with 4-col virtual scroll grid"
```

---

## Task 11: Scene Detail with filmstrip

**Files:**
- Create: `apps/studio/src/app/projects/[projectId]/scenes/[sceneSlug]/page.tsx`
- Create: `apps/studio/src/components/studio/CutCard.tsx`
- Create: `apps/studio/src/components/studio/CutStrip.tsx`

- [ ] **Step 1: Create CutCard**

Create `apps/studio/src/components/studio/CutCard.tsx`:

```tsx
import Link from 'next/link';
import Image from 'next/image';
import type { CutMeta } from '@/lib/studio/types';
import { StatusBadge } from './StatusBadge';
import { Clock } from 'lucide-react';

interface Props {
  cut: CutMeta;
  projectId: string;
  sceneSlug: string;
}

export function CutCard({ cut, projectId, sceneSlug }: Props) {
  return (
    <Link
      href={`/projects/${projectId}/scenes/${sceneSlug}/cuts/${cut.slug}`}
      className="group shrink-0 w-[180px] rounded border border-[var(--studio-border)] overflow-hidden hover:border-[var(--studio-border-accent)] transition-colors"
      style={{ background: 'var(--studio-bg-surface)' }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-[var(--studio-bg-elevated)] overflow-hidden">
        {cut.thumbnailUrl ? (
          <Image
            src={cut.thumbnailUrl}
            alt={cut.displayId}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="180px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[var(--studio-text-muted)] text-[10px]">No image</span>
          </div>
        )}
        <div className="absolute bottom-1 right-1 flex items-center gap-1 bg-black/70 text-white text-[9px] px-1 py-0.5 rounded">
          <Clock size={9} />
          {cut.duration}s
        </div>
      </div>

      {/* Info */}
      <div className="p-2 space-y-1.5">
        <p className="text-[10px] font-mono text-[var(--studio-accent)]">{cut.slug}</p>
        <StatusBadge status={cut.status} className="text-[9px]" />
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create CutStrip**

Create `apps/studio/src/components/studio/CutStrip.tsx`:

```tsx
import type { CutMeta } from '@/lib/studio/types';
import { CutCard } from './CutCard';

interface Props {
  cuts: CutMeta[];
  projectId: string;
  sceneSlug: string;
}

export function CutStrip({ cuts, projectId, sceneSlug }: Props) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory">
      {cuts.map(cut => (
        <div key={cut.id} className="snap-start">
          <CutCard cut={cut} projectId={projectId} sceneSlug={sceneSlug} />
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create scene detail page**

Create `apps/studio/src/app/projects/[projectId]/scenes/[sceneSlug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { fetchProject, fetchSceneDetail } from '@/lib/studio/api';
import { CutStrip } from '@/components/studio/CutStrip';
import { StatusBadge } from '@/components/studio/StatusBadge';
import { ProgressBar } from '@/components/studio/ProgressBar';
import { ChevronLeft, ChevronRight, MapPin, Clock, Users } from 'lucide-react';
import { makeSceneSlug } from '@/lib/studio/naming';

interface Props {
  params: Promise<{ projectId: string; sceneSlug: string }>;
}

export default async function SceneDetailPage({ params }: Props) {
  const { projectId, sceneSlug } = await params;
  const [project, scene] = await Promise.all([
    fetchProject(projectId),
    fetchSceneDetail(projectId, sceneSlug),
  ]);
  if (!project || !scene) notFound();

  const prevSlug = scene.number > 1 ? makeSceneSlug(scene.number - 1) : null;
  const nextSlug = makeSceneSlug(scene.number + 1); // guard at data level

  const scenePath = `/projects/${projectId}/scenes`;

  return (
    <div className="px-8 py-8 max-w-[1400px]">
      {/* Navigation arrows */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {prevSlug && (
            <Link
              href={`${scenePath}/${prevSlug}`}
              className="flex items-center gap-1 text-[12px] text-[var(--studio-text-dim)] hover:text-[var(--studio-text)] transition-colors"
            >
              <ChevronLeft size={14} />
              {makeSceneSlug(scene.number - 1)}
            </Link>
          )}
        </div>
        <Link
          href={nextSlug ? `${scenePath}/${nextSlug}` : scenePath}
          className="flex items-center gap-1 text-[12px] text-[var(--studio-text-dim)] hover:text-[var(--studio-text)] transition-colors"
        >
          {makeSceneSlug(scene.number + 1)}
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* Scene header */}
      <div
        className="rounded-xl border border-[var(--studio-border)] overflow-hidden mb-8"
        style={{ background: 'var(--studio-bg-surface)' }}
      >
        <div className="grid md:grid-cols-[300px_1fr]">
          {/* Cover image */}
          <div className="relative aspect-video md:aspect-auto md:min-h-[200px] bg-[var(--studio-bg-elevated)]">
            {scene.coverImageUrl && (
              <Image
                src={scene.coverImageUrl}
                alt={scene.displayId}
                fill
                className="object-cover"
                sizes="300px"
              />
            )}
          </div>

          {/* Scene info */}
          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold text-[var(--studio-accent)] uppercase tracking-widest mb-1">
                  {scene.displayId}
                </p>
                <h1 className="text-[22px] font-bold text-[var(--studio-text)]">{scene.title}</h1>
              </div>
              <StatusBadge status={scene.status} />
            </div>

            <div className="flex flex-wrap gap-4 text-[12px] text-[var(--studio-text-dim)]">
              <span className="flex items-center gap-1.5">
                <MapPin size={12} /> {scene.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={12} /> {scene.timeOfDay}
              </span>
              {scene.characters.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <Users size={12} /> {scene.characters.join(', ')}
                </span>
              )}
            </div>

            <p className="text-[13px] text-[var(--studio-text-dim)] leading-relaxed">{scene.summary}</p>

            <ProgressBar completed={scene.completedCutCount} total={scene.cutCount} />
          </div>
        </div>
      </div>

      {/* Cut filmstrip */}
      <div>
        <h2 className="text-[14px] font-semibold text-[var(--studio-text)] mb-4">
          컷 목록 ({scene.cuts.length})
        </h2>
        <CutStrip cuts={scene.cuts} projectId={projectId} sceneSlug={sceneSlug} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Visual verification**

Open http://localhost:3001/projects/tdk/scenes/sc001. Expected:
- Header shows `TDK_sc001` in accent color + scene info (location, time, characters)
- Cover image on left
- Horizontal scrollable filmstrip of 20 cut cards below
- Each cut card shows `cut001`~`cut020`, duration badge, status badge
- Prev/Next navigation arrows at top

- [ ] **Step 5: Typecheck**

```bash
pnpm typecheck
```

Expected: Zero errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/projects/[projectId]/scenes/[sceneSlug]/ \
        src/components/studio/CutCard.tsx \
        src/components/studio/CutStrip.tsx
git commit -m "feat(studio): add scene detail page with horizontal cut filmstrip"
```

---

## Task 12: Placeholder cut page (stub for Phase 3)

**Files:**
- Create: `apps/studio/src/app/projects/[projectId]/scenes/[sceneSlug]/cuts/[cutSlug]/page.tsx`

This task creates a placeholder page so cut card links work. The full node editor is Phase 3.

- [ ] **Step 1: Create placeholder cut page**

Create `apps/studio/src/app/projects/[projectId]/scenes/[sceneSlug]/cuts/[cutSlug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchProject, fetchSceneDetail } from '@/lib/studio/api';
import { makeCutDisplayId } from '@/lib/studio/naming';
import { GitBranch } from 'lucide-react';

interface Props {
  params: Promise<{ projectId: string; sceneSlug: string; cutSlug: string }>;
}

export default async function CutPage({ params }: Props) {
  const { projectId, sceneSlug, cutSlug } = await params;

  const [project, scene] = await Promise.all([
    fetchProject(projectId),
    fetchSceneDetail(projectId, sceneSlug),
  ]);
  if (!project || !scene) notFound();

  const cut = scene.cuts.find(c => c.slug === cutSlug);
  if (!cut) notFound();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4"
      style={{ background: 'var(--studio-bg-base)', color: 'var(--studio-text)' }}
    >
      <GitBranch size={40} className="text-[var(--studio-accent)] opacity-60" />
      <div>
        <p className="text-[11px] text-[var(--studio-accent)] font-mono uppercase tracking-widest mb-2">
          {makeCutDisplayId(project.initials, scene.number, cut.number)}
        </p>
        <h1 className="text-[24px] font-bold mb-2">Cut Node Editor</h1>
        <p className="text-[var(--studio-text-dim)] text-[14px]">Phase 3 — Coming soon</p>
      </div>
      <Link
        href={`/projects/${projectId}/scenes/${sceneSlug}`}
        className="text-[13px] text-[var(--studio-accent)] hover:underline"
      >
        ← Back to {sceneSlug}
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: Zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/projects/[projectId]/scenes/[sceneSlug]/cuts/
git commit -m "feat(studio): add cut page placeholder (Phase 3 node editor stub)"
```

---

## Task 13: Environment variable + .env setup

**Files:**
- Modify: `apps/studio/.env.local` (create if absent)

- [ ] **Step 1: Create .env.local with mock mode**

```bash
cat > /Users/daniel/dev/claude-dev/marionette-suite/apps/studio/.env.local << 'EOF'
# Studio environment
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_PUBLIC_SCENARIO_API_URL=http://localhost:4005
NEXT_PUBLIC_PRODUCTION_API_URL=http://localhost:4000
EOF
```

- [ ] **Step 2: Confirm dev server runs with mock data**

```bash
cd /Users/daniel/dev/claude-dev/marionette-suite/apps/studio
pnpm dev
```

Open http://localhost:3001/projects — should show 3 mock projects without any API errors.

- [ ] **Step 3: Commit** (.env.local is gitignored; commit only a .env.local.example)

```bash
cat > /Users/daniel/dev/claude-dev/marionette-suite/apps/studio/.env.local.example << 'EOF'
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_PUBLIC_SCENARIO_API_URL=http://localhost:4005
NEXT_PUBLIC_PRODUCTION_API_URL=http://localhost:4000
EOF

git add .env.local.example
git commit -m "chore(studio): add .env.local.example for studio app"
```

---

## Final verification

- [ ] **Full type check**

```bash
cd /Users/daniel/dev/claude-dev/marionette-suite/apps/studio
pnpm typecheck
```

Expected: Zero errors.

- [ ] **All naming tests pass**

```bash
bun test src/lib/studio/naming.test.ts
```

Expected: All tests green.

- [ ] **Navigate the full flow**

```
http://localhost:3001/projects              → Project grid (3 cards)
http://localhost:3001/projects/tdk          → Project Hub (stats + 3 sequence cards)
http://localhost:3001/projects/tdk/scenes   → 120 scene cards, virtual scrolling
http://localhost:3001/projects/tdk/scenes/sc001   → Scene detail (TDK_sc001) + 20 cuts in filmstrip
http://localhost:3001/projects/tdk/scenes/sc001/cuts/cut007  → "Phase 3 — Coming soon" placeholder
```

---

## What's next

**Phase 3 plan** — Cut Node Editor (`@xyflow/react`):
- 8 node types (ScriptNode → ImagePromptNode → ImageGenNode → ImagePickNode → VideoPromptNode → VideoGenNode → AudioNode → FinalCutNode)
- Right panel preview (image gallery / video player)
- Auto-save node layout per cut (localStorage → API)
- Prev/Next cut navigation with keyboard shortcuts

**Phase 4 plan** — Agent Hub + real-time WebSocket monitoring

**Phase 5-6 plan** — Scriptwriter + Scenario analysis integration
