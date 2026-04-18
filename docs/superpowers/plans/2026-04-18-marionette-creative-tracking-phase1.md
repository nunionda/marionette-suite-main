# Marionette Suite — Creative Tracking Phase 1 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Hub-and-spoke shell of the 8-step creative tracking UI in `contents-studio`, wired to a file-based Paperclip project registry, with the shared packages (design-tokens, content-profiles, paperclip-bridge, prompt-adapters, ui) needed to power it.

**Architecture:** Monorepo packages first, then `contents-studio /projects/[id]` route renders `CreativePipelineShell` showing 8 step cards per project. Deep-link Spokes (script-writer, storyboard-maker URL param wiring) are a follow-up plan — Phase 1b.

**Tech Stack:** TypeScript, Next.js App Router (contents-studio), React 19, Bun workspaces, Turborepo, Tailwind v4, `@marionette/design-tokens`, `@marionette/content-profiles`, `@marionette/paperclip-bridge`, vitest.

**Reference spec:** [docs/superpowers/specs/2026-04-18-marionette-creative-tracking-architecture.md](../specs/2026-04-18-marionette-creative-tracking-architecture.md)

---

## File Structure

### NEW

| Path | Responsibility |
|------|----------------|
| `packages/paperclip-bridge/src/registry.ts` | File-based Paperclip project registry reader |
| `packages/prompt-adapters/package.json` | Package manifest |
| `packages/prompt-adapters/tsconfig.json` | TS config (extends shared) |
| `packages/prompt-adapters/src/index.ts` | Barrel export |
| `packages/prompt-adapters/src/types.ts` | Neutral prompt schema types (`ImagePrompt`, `VideoPrompt`, `Character`, `Location`, `Prop`) |
| `packages/prompt-adapters/src/adapter.ts` | `PromptAdapter<T>` interface + `registerAdapter` registry |
| `packages/prompt-adapters/src/higgsfield-cinema-studio.ts` | Placeholder adapter for Cinema Studio 3.5 |
| `packages/prompt-adapters/src/higgsfield-marketing-studio.ts` | Placeholder adapter for Marketing Studio |
| `packages/ui/src/creative-pipeline/types.ts` | 8-step types (`StepKey`, `StepStatus`, `StepProgress`) |
| `packages/ui/src/creative-pipeline/PipelineStepBadge.tsx` | 4-state status pill |
| `packages/ui/src/creative-pipeline/PipelineStepper.tsx` | Horizontal 8-step indicator, sticky |
| `packages/ui/src/creative-pipeline/PipelineStepCard.tsx` | Step card (badge + preview + action) |
| `packages/ui/src/creative-pipeline/CreativePipelineShell.tsx` | Top-level shell (stepper + 8 cards + meta sidebar) |
| `packages/ui/src/creative-pipeline/useProjectProgress.ts` | Hook — queries 8-step states per project |
| `packages/ui/src/creative-pipeline/useProjectMeta.ts` | Hook — Paperclip metadata via bridge |
| `packages/ui/src/creative-pipeline/index.ts` | Barrel export |
| `apps/contents-studio/apps/web/app/(dashboard)/projects/[id]/page.tsx` | Server component — loads meta, renders client |
| `apps/contents-studio/apps/web/app/(dashboard)/projects/[id]/pipeline-client.tsx` | Client component — wraps `CreativePipelineShell` |
| `packages/paperclip-bridge/src/__tests__/registry.test.ts` | Registry reader unit test |
| `packages/prompt-adapters/src/__tests__/adapter.test.ts` | Adapter registry test |
| `packages/ui/src/creative-pipeline/__tests__/PipelineStepBadge.test.tsx` | Badge rendering test |

### EDIT

| Path | Change |
|------|--------|
| `packages/design-tokens/src/tokens.css` | Add `--accent-violet`, `--accent-mint` |
| `packages/pipeline-core/src/index.ts` | Add `GenerationTarget` type + extend `ContentProfile` |
| `packages/content-profiles/src/film.ts` | Add `generationTarget` (Cinema Studio) |
| `packages/content-profiles/src/drama.ts` | Add `generationTarget` (Cinema Studio) |
| `packages/content-profiles/src/commercial.ts` | Add `generationTarget` (Marketing Studio) |
| `packages/content-profiles/src/youtube.ts` | Add `generationTarget` (Marketing Studio UGC) |
| `packages/paperclip-bridge/src/index.ts` | Wire registry + real `health()` + exclude MAR from `recommendStudio()` |
| `packages/paperclip-bridge/package.json` | Add `@marionette/prompt-adapters` workspace dep if needed (probably not) |
| `packages/ui/src/index.ts` | Re-export `creative-pipeline` barrel |
| `~/paperclip/projects-registry.json` | NEW — 3 initial projects (Paperclip-side setup, user action) |

---

## Phase 0 — Token foundations

### Task 1: Add Obsidian accent tokens

**Files:**
- Modify: `packages/design-tokens/src/tokens.css`

- [ ] **Step 1: Add violet and mint tokens inside `:root`**

Edit `packages/design-tokens/src/tokens.css`. Inside the existing `:root` block, after the `--studio-accent-glow` line, add:

```css
  /* ── Cross-app accent variants (promoted from script-writer Obsidian) ── */
  --accent-violet:        #8B5CF6;  /* script-writer Signal Violet */
  --accent-violet-dim:    rgba(139, 92, 246, 0.15);
  --accent-mint:          #10B981;  /* script-writer Cinema Mint */
  --accent-mint-dim:      rgba(16, 185, 129, 0.15);
```

- [ ] **Step 2: Verify tokens.css parses**

Run: `bun run --filter @marionette/design-tokens build 2>&1 || true`
Expected: no parse errors. The design-tokens package is CSS-only, so if the build script exists it should succeed; if not, just verify the file loads syntactically.

Fallback check:
```bash
node -e "const css = require('fs').readFileSync('packages/design-tokens/src/tokens.css', 'utf8'); if (!css.includes('--accent-violet')) process.exit(1); console.log('tokens ok');"
```
Expected: `tokens ok`

- [ ] **Step 3: Commit**

```bash
git add packages/design-tokens/src/tokens.css
git commit -m "feat(design-tokens): add --accent-violet and --accent-mint variants"
```

---

## Phase 1 — Type foundations

### Task 2: Add `GenerationTarget` type + extend `ContentProfile`

**Files:**
- Modify: `packages/pipeline-core/src/index.ts`

- [ ] **Step 1: Add `GenerationTarget` type**

At the end of `packages/pipeline-core/src/index.ts`, add:

```ts
export type HiggsfieldProduct =
  | "cinema-studio-3.5"
  | "marketing-studio"
  | "original-series";

export type PromptStyle =
  | "cinematic"
  | "ad-ugc"
  | "ad-cgi"
  | "episodic";

export interface GenerationTarget {
  platform: "higgsfield"; // 향후 "runway" | "luma" 등 추가 가능
  product: HiggsfieldProduct;
  promptStyle: PromptStyle;
  shotStructure: "sequential" | "parallel" | "montage";
}
```

- [ ] **Step 2: Extend `ContentProfile`**

Modify the existing `ContentProfile` interface in the same file. Locate:

```ts
export interface ContentProfile {
  category: ContentCategory;
  label: string;
  stages: PipelineStage[];
  metrics: string[];
  stakeholders: string[];
  ui: {
    emphasize: Phase;
    collapse?: Phase[];
  };
}
```

Replace with:

```ts
export interface ContentProfile {
  category: ContentCategory;
  label: string;
  stages: PipelineStage[];
  metrics: string[];
  stakeholders: string[];
  ui: {
    emphasize: Phase;
    collapse?: Phase[];
  };
  generationTarget: GenerationTarget;
}
```

- [ ] **Step 3: Type-check**

Run: `cd packages/pipeline-core && bunx tsc --noEmit`
Expected: no errors in `pipeline-core`. Downstream errors in `content-profiles` (missing `generationTarget`) are expected — they'll be fixed in Task 3.

- [ ] **Step 4: Commit**

```bash
git add packages/pipeline-core/src/index.ts
git commit -m "feat(pipeline-core): add GenerationTarget type and extend ContentProfile"
```

### Task 3: Update 4 content profiles with `generationTarget`

**Files:**
- Modify: `packages/content-profiles/src/film.ts`
- Modify: `packages/content-profiles/src/drama.ts`
- Modify: `packages/content-profiles/src/commercial.ts`
- Modify: `packages/content-profiles/src/youtube.ts`

- [ ] **Step 1: Add `generationTarget` to `filmProfile`**

In `packages/content-profiles/src/film.ts`, add `generationTarget` to the exported object (right after `stages: [...]`):

```ts
  generationTarget: {
    platform: "higgsfield",
    product: "cinema-studio-3.5",
    promptStyle: "cinematic",
    shotStructure: "sequential",
  },
```

- [ ] **Step 2: Add `generationTarget` to `dramaProfile`**

In `packages/content-profiles/src/drama.ts`:

```ts
  generationTarget: {
    platform: "higgsfield",
    product: "cinema-studio-3.5",
    promptStyle: "episodic",
    shotStructure: "sequential",
  },
```

- [ ] **Step 3: Add `generationTarget` to `commercialProfile`**

In `packages/content-profiles/src/commercial.ts`:

```ts
  generationTarget: {
    platform: "higgsfield",
    product: "marketing-studio",
    promptStyle: "ad-cgi",
    shotStructure: "parallel",
  },
```

- [ ] **Step 4: Add `generationTarget` to `youtubeProfile`**

In `packages/content-profiles/src/youtube.ts`:

```ts
  generationTarget: {
    platform: "higgsfield",
    product: "marketing-studio",
    promptStyle: "ad-ugc",
    shotStructure: "montage",
  },
```

- [ ] **Step 5: Type-check**

Run: `cd packages/content-profiles && bunx tsc --noEmit`
Expected: no errors. All 4 profiles now match the extended interface.

- [ ] **Step 6: Commit**

```bash
git add packages/content-profiles/src
git commit -m "feat(content-profiles): add generationTarget for all 4 categories"
```

---

## Phase 2 — Paperclip bridge realization

### Task 4: Create file-based registry reader

**Files:**
- Create: `packages/paperclip-bridge/src/registry.ts`

- [ ] **Step 1: Create the registry module**

Create `packages/paperclip-bridge/src/registry.ts`:

```ts
/**
 * File-based Paperclip project registry.
 *
 * Phase 1: reads from ~/paperclip/projects-registry.json.
 * Phase 2 will swap for real HTTP calls to the Paperclip :3100 server.
 *
 * Ownership: Paperclip HQ writes this file. Marionette Suite only reads.
 */
import { readFile } from "fs/promises";
import { homedir } from "os";
import path from "path";
import type { StudioCode } from "@marionette/pipeline-core";

const REGISTRY_PATH = path.join(homedir(), "paperclip", "projects-registry.json");

export interface PaperclipRegistryEntry {
  id: string;
  title: string;
  genre: string;
  category: "film" | "drama" | "commercial" | "youtube";
  budgetKRW: number;
  priority: "P0" | "P1" | "P2";
  ownerStudio: StudioCode;
}

let _cache: { entries: PaperclipRegistryEntry[]; mtime: number } | null = null;

export async function readRegistry(): Promise<PaperclipRegistryEntry[]> {
  try {
    const raw = await readFile(REGISTRY_PATH, "utf-8");
    const entries = JSON.parse(raw) as PaperclipRegistryEntry[];
    _cache = { entries, mtime: Date.now() };
    return entries;
  } catch (err) {
    // File not found or unreadable: return empty list (non-blocking)
    console.warn("[paperclip-bridge] registry unavailable:", (err as Error).message);
    return _cache?.entries ?? [];
  }
}

export async function findProject(
  id: string,
): Promise<PaperclipRegistryEntry | undefined> {
  const entries = await readRegistry();
  return entries.find((e) => e.id === id);
}

export function getRegistryPath(): string {
  return REGISTRY_PATH;
}
```

- [ ] **Step 2: Write unit test**

Create `packages/paperclip-bridge/src/__tests__/registry.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "fs/promises";
import { readRegistry, findProject } from "../registry";

vi.mock("fs/promises");

describe("registry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns parsed entries when registry file exists", async () => {
    const mockEntries = [
      {
        id: "ID-001",
        title: "DECODE",
        genre: "SF",
        category: "film",
        budgetKRW: 3_500_000_000,
        priority: "P1",
        ownerStudio: "IMP",
      },
    ];
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockEntries));
    const entries = await readRegistry();
    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe("ID-001");
  });

  it("returns empty array when file missing", async () => {
    vi.mocked(fs.readFile).mockRejectedValue(new Error("ENOENT"));
    const entries = await readRegistry();
    expect(entries).toEqual([]);
  });

  it("findProject returns matching entry", async () => {
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify([
      { id: "ID-001", title: "DECODE", genre: "SF", category: "film", budgetKRW: 3.5e9, priority: "P1", ownerStudio: "IMP" },
      { id: "ID-002", title: "어머니의 이력서", genre: "드라마", category: "drama", budgetKRW: 2e9, priority: "P0", ownerStudio: "STE" },
    ]));
    const found = await findProject("ID-002");
    expect(found?.title).toBe("어머니의 이력서");
  });
});
```

- [ ] **Step 3: Run test**

Run: `cd packages/paperclip-bridge && bunx vitest run src/__tests__/registry.test.ts`
Expected: 3 tests pass.

- [ ] **Step 4: Commit**

```bash
git add packages/paperclip-bridge/src/registry.ts packages/paperclip-bridge/src/__tests__/registry.test.ts
git commit -m "feat(paperclip-bridge): add file-based project registry reader"
```

### Task 5: Real health check + MAR exclusion in `recommendStudio`

**Files:**
- Modify: `packages/paperclip-bridge/src/index.ts`

- [ ] **Step 1: Update `health()` to do real HTTP**

In `packages/paperclip-bridge/src/index.ts`, replace the existing `health()` function:

```ts
export async function health(): Promise<{ status: "ok" | "offline"; host: string }> {
  const host = "http://127.0.0.1:3100";
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 1500);
    const res = await fetch(`${host}/api/health`, { signal: ctrl.signal });
    clearTimeout(timer);
    return { status: res.ok ? "ok" : "offline", host };
  } catch {
    return { status: "offline", host };
  }
}
```

- [ ] **Step 2: Ensure `recommendStudio()` never returns MAR**

In the same file, locate `recommendStudio` and replace the body:

```ts
export function recommendStudio(
  category: ContentCategory,
  budgetKRW?: number,
): StudioCode {
  // MAR는 creative dispatch에서 제외 — 앱 유지보수 전용.
  if (category === "film") {
    // Big-budget 영화는 IMP로 라우팅 (threshold는 환경 변수로 외부화)
    const threshold = Number(
      process.env.PAPERCLIP_IMP_BUDGET_THRESHOLD_KRW ?? "30000000000",
    );
    if (budgetKRW && budgetKRW >= threshold) return "IMP";
    return "STE";
  }
  // 모든 다른 카테고리는 STE로
  return "STE";
}
```

- [ ] **Step 3: Re-export registry helpers**

At the bottom of `packages/paperclip-bridge/src/index.ts`, add:

```ts
export { readRegistry, findProject, getRegistryPath } from "./registry";
export type { PaperclipRegistryEntry } from "./registry";
```

- [ ] **Step 4: Type-check**

Run: `cd packages/paperclip-bridge && bunx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Add test for MAR exclusion**

Append to `packages/paperclip-bridge/src/__tests__/registry.test.ts` a new describe block, OR create `packages/paperclip-bridge/src/__tests__/recommendStudio.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { recommendStudio } from "../index";

describe("recommendStudio", () => {
  it("never returns MAR", () => {
    const samples = [
      recommendStudio("film"),
      recommendStudio("film", 1_000_000),
      recommendStudio("film", 9_999_999_999_999),
      recommendStudio("drama"),
      recommendStudio("commercial"),
      recommendStudio("youtube"),
    ];
    for (const s of samples) {
      expect(s).not.toBe("MAR");
    }
  });

  it("routes small film to STE, big film to IMP", () => {
    expect(recommendStudio("film", 1_000_000_000)).toBe("STE");
    expect(recommendStudio("film", 100_000_000_000)).toBe("IMP");
  });

  it("routes drama/commercial/youtube to STE", () => {
    expect(recommendStudio("drama")).toBe("STE");
    expect(recommendStudio("commercial")).toBe("STE");
    expect(recommendStudio("youtube")).toBe("STE");
  });
});
```

- [ ] **Step 6: Run test**

Run: `cd packages/paperclip-bridge && bunx vitest run`
Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add packages/paperclip-bridge/src
git commit -m "feat(paperclip-bridge): real health() + exclude MAR from recommendStudio"
```

---

## Phase 3 — Prompt adapters package

### Task 6: Scaffold `@marionette/prompt-adapters` package

**Files:**
- Create: `packages/prompt-adapters/package.json`
- Create: `packages/prompt-adapters/tsconfig.json`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "@marionette/prompt-adapters",
  "version": "0.1.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@marionette/pipeline-core": "workspace:*"
  },
  "devDependencies": {
    "@marionette/tsconfig": "workspace:*",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "extends": "@marionette/tsconfig/base.json",
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Install workspace deps**

Run: `cd /Users/daniel/dev/claude-dev/marionette-suite && bun install`
Expected: installs without errors, `@marionette/prompt-adapters` resolves as workspace.

- [ ] **Step 4: Commit**

```bash
git add packages/prompt-adapters/package.json packages/prompt-adapters/tsconfig.json bun.lock
git commit -m "feat(prompt-adapters): scaffold package"
```

### Task 7: Neutral prompt schema types

**Files:**
- Create: `packages/prompt-adapters/src/types.ts`

- [ ] **Step 1: Create types file**

```ts
/**
 * Neutral prompt schema — stored canonical in Marionette Suite.
 * Adapters convert these into vendor-specific prompt strings.
 */
import type { ContentCategory } from "@marionette/pipeline-core";

export interface CharacterRef {
  id: string;
  name: string;
  visualAnchors?: string[];
}

export interface LocationRef {
  id: string;
  name: string;
  visualAnchors?: string[];
}

export interface PropRef {
  id: string;
  name: string;
  visualAnchors?: string[];
}

export interface Camera {
  angle?: "eye-level" | "high" | "low" | "top-down" | "dutch";
  lens?: "wide" | "normal" | "tele" | "macro";
  height?: "ground" | "eye" | "overhead";
}

export interface Lighting {
  key: "natural" | "hard" | "soft" | "practical" | "mixed";
  mood?: string;
  timeOfDay?: "dawn" | "day" | "golden" | "dusk" | "night";
}

export interface Style {
  tone?: string;
  era?: string;
  reference?: string[]; // e.g., ["Roger Deakins", "1917 (2019)"]
}

export interface ImagePromptNeutral {
  cutId: string;
  projectId: string;
  characters: CharacterRef[];
  location: LocationRef;
  props: PropRef[];
  camera: Camera;
  lighting: Lighting;
  style: Style;
  description: string; // free-form text for nuance
}

export interface Motion {
  action: string; // "character walks away", "product rotates"
  subject?: string; // which character/prop
  intensity?: "subtle" | "moderate" | "dynamic";
}

export interface CameraMove {
  type: "static" | "pan" | "tilt" | "dolly" | "crane" | "handheld" | "orbit";
  speed?: "slow" | "medium" | "fast";
  target?: string;
}

export interface VideoPromptNeutral {
  cutId: string;
  imagePromptId: string;
  projectId: string;
  motion: Motion;
  cameraMove: CameraMove;
  durationSeconds: number;
  description: string;
}

export interface AdapterContext {
  category: ContentCategory;
  projectTitle: string;
}
```

- [ ] **Step 2: Type-check**

Run: `cd packages/prompt-adapters && bunx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/prompt-adapters/src/types.ts
git commit -m "feat(prompt-adapters): define neutral prompt schema"
```

### Task 8: Adapter interface + placeholder adapters

**Files:**
- Create: `packages/prompt-adapters/src/adapter.ts`
- Create: `packages/prompt-adapters/src/higgsfield-cinema-studio.ts`
- Create: `packages/prompt-adapters/src/higgsfield-marketing-studio.ts`
- Create: `packages/prompt-adapters/src/index.ts`
- Create: `packages/prompt-adapters/src/__tests__/adapter.test.ts`

- [ ] **Step 1: Create adapter interface**

`packages/prompt-adapters/src/adapter.ts`:

```ts
import type {
  ImagePromptNeutral,
  VideoPromptNeutral,
  AdapterContext,
} from "./types";
import type { HiggsfieldProduct } from "@marionette/pipeline-core";

export interface AdapterOutput {
  text: string;
  metadata?: Record<string, unknown>;
}

export interface PromptAdapter {
  id: string;
  product: HiggsfieldProduct;
  renderImage(prompt: ImagePromptNeutral, ctx: AdapterContext): AdapterOutput;
  renderVideo(prompt: VideoPromptNeutral, ctx: AdapterContext): AdapterOutput;
}

const _registry: Map<string, PromptAdapter> = new Map();

export function registerAdapter(adapter: PromptAdapter): void {
  _registry.set(adapter.id, adapter);
}

export function getAdapter(id: string): PromptAdapter | undefined {
  return _registry.get(id);
}

export function listAdapters(): PromptAdapter[] {
  return [..._registry.values()];
}
```

- [ ] **Step 2: Cinema Studio placeholder**

`packages/prompt-adapters/src/higgsfield-cinema-studio.ts`:

```ts
import type { PromptAdapter } from "./adapter";

/**
 * Placeholder — Phase 2 will implement real Cinema Studio 3.5 rendering.
 * Current output is a structured description for manual paste into Higgsfield UI.
 */
export const cinemaStudioAdapter: PromptAdapter = {
  id: "higgsfield-cinema-studio-3.5",
  product: "cinema-studio-3.5",
  renderImage(prompt, ctx) {
    const chars = prompt.characters.map((c) => c.name).join(", ");
    const refs = prompt.style.reference?.join(" / ") ?? "";
    const text = [
      `[CINEMA STUDIO 3.5 — ${ctx.category}] ${ctx.projectTitle}`,
      `SHOT: ${prompt.cutId}`,
      `LOCATION: ${prompt.location.name}`,
      `CHARACTERS: ${chars}`,
      `LIGHTING: ${prompt.lighting.key}, ${prompt.lighting.timeOfDay ?? ""}`,
      `CAMERA: ${prompt.camera.angle ?? "eye-level"}, ${prompt.camera.lens ?? "normal"}`,
      `STYLE: ${prompt.style.tone ?? ""} ${refs ? `(ref: ${refs})` : ""}`,
      ``,
      prompt.description,
    ].join("\n");
    return { text, metadata: { product: "cinema-studio-3.5", cutId: prompt.cutId } };
  },
  renderVideo(prompt, ctx) {
    const text = [
      `[CINEMA STUDIO 3.5 — VIDEO — ${ctx.category}]`,
      `SHOT: ${prompt.cutId}`,
      `MOTION: ${prompt.motion.action} (${prompt.motion.intensity ?? "moderate"})`,
      `CAMERA MOVE: ${prompt.cameraMove.type}, ${prompt.cameraMove.speed ?? "medium"}`,
      `DURATION: ${prompt.durationSeconds}s`,
      ``,
      prompt.description,
    ].join("\n");
    return { text, metadata: { product: "cinema-studio-3.5", cutId: prompt.cutId } };
  },
};
```

- [ ] **Step 3: Marketing Studio placeholder**

`packages/prompt-adapters/src/higgsfield-marketing-studio.ts`:

```ts
import type { PromptAdapter } from "./adapter";

export const marketingStudioAdapter: PromptAdapter = {
  id: "higgsfield-marketing-studio",
  product: "marketing-studio",
  renderImage(prompt, ctx) {
    const text = [
      `[MARKETING STUDIO — ${ctx.category}] ${ctx.projectTitle}`,
      `AD FORMAT HINT: ${ctx.category === "youtube" ? "UGC / vertical" : "CGI / horizontal"}`,
      `LOCATION: ${prompt.location.name}`,
      `PRODUCTS/PROPS: ${prompt.props.map((p) => p.name).join(", ")}`,
      `STYLE: ${prompt.style.tone ?? ""}`,
      ``,
      prompt.description,
    ].join("\n");
    return { text, metadata: { product: "marketing-studio", cutId: prompt.cutId } };
  },
  renderVideo(prompt, ctx) {
    const text = [
      `[MARKETING STUDIO — VIDEO — ${ctx.category}]`,
      `MOTION: ${prompt.motion.action}`,
      `CAMERA MOVE: ${prompt.cameraMove.type}`,
      `DURATION: ${prompt.durationSeconds}s`,
      ``,
      prompt.description,
    ].join("\n");
    return { text, metadata: { product: "marketing-studio", cutId: prompt.cutId } };
  },
};
```

- [ ] **Step 4: Barrel index**

`packages/prompt-adapters/src/index.ts`:

```ts
export * from "./types";
export * from "./adapter";
import { registerAdapter } from "./adapter";
import { cinemaStudioAdapter } from "./higgsfield-cinema-studio";
import { marketingStudioAdapter } from "./higgsfield-marketing-studio";

// Auto-register built-in adapters
registerAdapter(cinemaStudioAdapter);
registerAdapter(marketingStudioAdapter);

export { cinemaStudioAdapter, marketingStudioAdapter };
```

- [ ] **Step 5: Write adapter test**

`packages/prompt-adapters/src/__tests__/adapter.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import "../index"; // auto-registers adapters
import { getAdapter, listAdapters } from "../adapter";
import type { ImagePromptNeutral, VideoPromptNeutral, AdapterContext } from "../types";

const ctx: AdapterContext = { category: "film", projectTitle: "DECODE" };

const imageFixture: ImagePromptNeutral = {
  cutId: "C-001",
  projectId: "ID-001",
  characters: [{ id: "c1", name: "Nova" }],
  location: { id: "l1", name: "Neo-Tokyo rooftop" },
  props: [],
  camera: { angle: "low", lens: "wide" },
  lighting: { key: "hard", timeOfDay: "night" },
  style: { tone: "noir", reference: ["Blade Runner 2049"] },
  description: "Nova stands at the edge of the rooftop.",
};

const videoFixture: VideoPromptNeutral = {
  cutId: "C-001",
  imagePromptId: "IP-001",
  projectId: "ID-001",
  motion: { action: "Nova turns toward camera", intensity: "subtle" },
  cameraMove: { type: "dolly", speed: "slow", target: "Nova" },
  durationSeconds: 4,
  description: "Slow dolly-in as Nova turns.",
};

describe("prompt adapters", () => {
  it("registers cinema-studio and marketing-studio by default", () => {
    expect(listAdapters().map((a) => a.id)).toEqual(
      expect.arrayContaining([
        "higgsfield-cinema-studio-3.5",
        "higgsfield-marketing-studio",
      ]),
    );
  });

  it("cinema-studio adapter renders image with shot and location", () => {
    const adapter = getAdapter("higgsfield-cinema-studio-3.5")!;
    const out = adapter.renderImage(imageFixture, ctx);
    expect(out.text).toContain("C-001");
    expect(out.text).toContain("Neo-Tokyo rooftop");
    expect(out.metadata?.product).toBe("cinema-studio-3.5");
  });

  it("cinema-studio adapter renders video with motion and duration", () => {
    const adapter = getAdapter("higgsfield-cinema-studio-3.5")!;
    const out = adapter.renderVideo(videoFixture, ctx);
    expect(out.text).toContain("Nova turns toward camera");
    expect(out.text).toContain("4s");
  });

  it("marketing-studio adapter annotates youtube as UGC", () => {
    const adapter = getAdapter("higgsfield-marketing-studio")!;
    const out = adapter.renderImage(imageFixture, {
      category: "youtube",
      projectTitle: "Shorts 001",
    });
    expect(out.text).toContain("UGC");
  });
});
```

- [ ] **Step 6: Run test**

Run: `cd packages/prompt-adapters && bunx vitest run`
Expected: 4 tests pass.

- [ ] **Step 7: Commit**

```bash
git add packages/prompt-adapters/src
git commit -m "feat(prompt-adapters): adapter interface + Higgsfield placeholders"
```

---

## Phase 4 — Creative Pipeline UI package

### Task 9: UI types

**Files:**
- Create: `packages/ui/src/creative-pipeline/types.ts`

- [ ] **Step 1: Create types**

```ts
import type { ContentCategory } from "@marionette/pipeline-core";

export type StepKey =
  | "logline"
  | "synopsis"
  | "treatment"
  | "script"
  | "scene"
  | "cut"
  | "image-prompt"
  | "video-prompt";

export type StepStatus = "not_started" | "in_progress" | "review" | "locked";

export const STEPS: { key: StepKey; label: string; description: string; order: number }[] = [
  { key: "logline", label: "로그라인", description: "1줄 요약", order: 1 },
  { key: "synopsis", label: "시놉시스", description: "스토리 요약", order: 2 },
  { key: "treatment", label: "트리트먼트", description: "구조·캐릭터·테마", order: 3 },
  { key: "script", label: "스크립트", description: "씬별 대사·액션", order: 4 },
  { key: "scene", label: "씬 분해", description: "씬 리스트", order: 5 },
  { key: "cut", label: "컷 분해", description: "샷별 분해", order: 6 },
  { key: "image-prompt", label: "이미지 프롬프트", description: "컷별 비주얼", order: 7 },
  { key: "video-prompt", label: "비디오 프롬프트", description: "모션·카메라 무브", order: 8 },
];

export interface StepProgress {
  key: StepKey;
  status: StepStatus;
  lastUpdated?: string; // ISO timestamp
  previewText?: string;
  count?: number; // for scene/cut/image-prompt/video-prompt (N items)
}

export interface ProjectMeta {
  id: string;
  title: string;
  category: ContentCategory;
  ownerStudio: "STE" | "IMP" | "MAR";
  priority: "P0" | "P1" | "P2";
  budgetKRW?: number;
  genre?: string;
}

export interface DeepLink {
  url: string;
  label: string;
}
```

- [ ] **Step 2: Type-check**

Run: `cd packages/ui && bunx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/creative-pipeline/types.ts
git commit -m "feat(ui/creative-pipeline): add 8-step types and constants"
```

### Task 10: PipelineStepBadge component

**Files:**
- Create: `packages/ui/src/creative-pipeline/PipelineStepBadge.tsx`
- Create: `packages/ui/src/creative-pipeline/__tests__/PipelineStepBadge.test.tsx`

- [ ] **Step 1: Component**

```tsx
"use client";

import type { StepStatus } from "./types";

const COLOR: Record<StepStatus, { fg: string; bg: string; border: string; label: string }> = {
  not_started: {
    fg: "var(--studio-text-dim)",
    bg: "transparent",
    border: "var(--studio-border)",
    label: "대기",
  },
  in_progress: {
    fg: "var(--accent-violet)",
    bg: "var(--accent-violet-dim)",
    border: "var(--accent-violet)",
    label: "진행",
  },
  review: {
    fg: "var(--studio-warning)",
    bg: "rgba(245, 158, 11, 0.15)",
    border: "var(--studio-warning)",
    label: "검토",
  },
  locked: {
    fg: "var(--accent-mint)",
    bg: "var(--accent-mint-dim)",
    border: "var(--accent-mint)",
    label: "확정",
  },
};

export function PipelineStepBadge({ status }: { status: StepStatus }) {
  const c = COLOR[status];
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
      style={{ color: c.fg, backgroundColor: c.bg, border: `1px solid ${c.border}` }}
    >
      {c.label}
    </span>
  );
}
```

- [ ] **Step 2: Write test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PipelineStepBadge } from "../PipelineStepBadge";

describe("PipelineStepBadge", () => {
  it("renders Korean label for each status", () => {
    const { rerender } = render(<PipelineStepBadge status="not_started" />);
    expect(screen.getByText("대기")).toBeInTheDocument();
    rerender(<PipelineStepBadge status="in_progress" />);
    expect(screen.getByText("진행")).toBeInTheDocument();
    rerender(<PipelineStepBadge status="review" />);
    expect(screen.getByText("검토")).toBeInTheDocument();
    rerender(<PipelineStepBadge status="locked" />);
    expect(screen.getByText("확정")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test**

Run: `cd packages/ui && bunx vitest run src/creative-pipeline/__tests__/PipelineStepBadge.test.tsx`
Expected: test passes. If vitest isn't configured in `packages/ui`, skip the test step and instead verify component compiles via `bunx tsc --noEmit`. Log a follow-up to add vitest to `packages/ui`.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/creative-pipeline/PipelineStepBadge.tsx packages/ui/src/creative-pipeline/__tests__/
git commit -m "feat(ui/creative-pipeline): PipelineStepBadge with 4 status states"
```

### Task 11: PipelineStepper component

**Files:**
- Create: `packages/ui/src/creative-pipeline/PipelineStepper.tsx`

- [ ] **Step 1: Component**

```tsx
"use client";

import { STEPS, type StepKey, type StepProgress } from "./types";

interface Props {
  progress: StepProgress[];
  currentStep?: StepKey;
  onStepClick?: (key: StepKey) => void;
}

export function PipelineStepper({ progress, currentStep, onStepClick }: Props) {
  const byKey = new Map(progress.map((p) => [p.key, p]));

  return (
    <nav
      aria-label="Creative pipeline steps"
      className="sticky top-0 z-10 border-b px-6 py-3"
      style={{
        backgroundColor: "var(--studio-bg-surface)",
        borderColor: "var(--studio-border)",
      }}
    >
      <ol className="flex items-center gap-1 overflow-x-auto">
        {STEPS.map((step, idx) => {
          const p = byKey.get(step.key);
          const active = currentStep === step.key;
          const done = p?.status === "locked";
          return (
            <li key={step.key} className="flex items-center">
              <button
                onClick={() => onStepClick?.(step.key)}
                className="flex items-center gap-2 rounded px-3 py-2 text-xs transition"
                style={{
                  color: active ? "var(--studio-text)" : "var(--studio-text-dim)",
                  backgroundColor: active ? "var(--studio-bg-hover)" : "transparent",
                  cursor: onStepClick ? "pointer" : "default",
                }}
              >
                <span
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{
                    backgroundColor: done
                      ? "var(--accent-mint)"
                      : active
                        ? "var(--accent-violet)"
                        : "var(--studio-bg-elevated)",
                    color: done || active ? "var(--studio-bg-base)" : "var(--studio-text-dim)",
                  }}
                >
                  {done ? "✓" : step.order}
                </span>
                <span className="font-medium">{step.label}</span>
              </button>
              {idx < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className="mx-1 h-px w-4"
                  style={{ backgroundColor: "var(--studio-border)" }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `cd packages/ui && bunx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/creative-pipeline/PipelineStepper.tsx
git commit -m "feat(ui/creative-pipeline): PipelineStepper sticky nav"
```

### Task 12: PipelineStepCard component

**Files:**
- Create: `packages/ui/src/creative-pipeline/PipelineStepCard.tsx`

- [ ] **Step 1: Component**

```tsx
"use client";

import { PipelineStepBadge } from "./PipelineStepBadge";
import { STEPS, type StepKey, type StepProgress, type DeepLink } from "./types";

interface Props {
  stepKey: StepKey;
  progress: StepProgress;
  deepLink?: DeepLink;
  children?: React.ReactNode; // preview content
}

export function PipelineStepCard({ stepKey, progress, deepLink, children }: Props) {
  const step = STEPS.find((s) => s.key === stepKey)!;
  const updated = progress.lastUpdated
    ? new Date(progress.lastUpdated).toLocaleString("ko-KR", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <article
      className="rounded-lg border p-5"
      style={{
        borderColor: "var(--studio-border)",
        backgroundColor: "var(--studio-bg-surface)",
      }}
    >
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
              style={{
                backgroundColor: "var(--studio-bg-elevated)",
                color: "var(--studio-text-dim)",
              }}
            >
              {step.order}
            </span>
            <h3 className="text-sm font-bold tracking-wider">{step.label}</h3>
            <PipelineStepBadge status={progress.status} />
            {progress.count !== undefined && progress.count > 0 && (
              <span
                className="text-[11px]"
                style={{ color: "var(--studio-text-dim)" }}
              >
                · {progress.count}개
              </span>
            )}
          </div>
          <p
            className="mt-1 text-xs"
            style={{ color: "var(--studio-text-dim)" }}
          >
            {step.description}
          </p>
        </div>
        {deepLink && (
          <a
            href={deepLink.url}
            className="rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition"
            style={{
              backgroundColor: "var(--accent-violet-dim)",
              color: "var(--accent-violet)",
              border: "1px solid var(--accent-violet)",
            }}
          >
            {deepLink.label} →
          </a>
        )}
      </header>

      {(progress.previewText || children) && (
        <div className="mt-3">
          {progress.previewText && (
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--studio-text)" }}
            >
              {progress.previewText}
            </p>
          )}
          {children}
        </div>
      )}

      {updated && (
        <footer
          className="mt-3 text-[10px] uppercase tracking-wider"
          style={{ color: "var(--studio-text-muted)" }}
        >
          Last updated · {updated}
        </footer>
      )}
    </article>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `cd packages/ui && bunx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/creative-pipeline/PipelineStepCard.tsx
git commit -m "feat(ui/creative-pipeline): PipelineStepCard with preview and deep-link"
```

### Task 13: `useProjectMeta` and `useProjectProgress` hooks

**Files:**
- Create: `packages/ui/src/creative-pipeline/useProjectMeta.ts`
- Create: `packages/ui/src/creative-pipeline/useProjectProgress.ts`

- [ ] **Step 1: `useProjectMeta`**

```ts
"use client";

import { useEffect, useState } from "react";
import type { ProjectMeta } from "./types";

/**
 * Fetches project metadata from a /api/projects/[id] endpoint.
 * Server component caller is preferred; this hook is a client-side fallback.
 */
export function useProjectMeta(projectId: string, initial?: ProjectMeta) {
  const [meta, setMeta] = useState<ProjectMeta | undefined>(initial);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (initial) return; // skip fetch if SSR provided
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as ProjectMeta;
        if (!cancelled) setMeta(data);
      } catch (err) {
        if (!cancelled) setError(err as Error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId, initial]);

  return { meta, error };
}
```

- [ ] **Step 2: `useProjectProgress`**

```ts
"use client";

import { useEffect, useState } from "react";
import type { StepProgress, StepKey } from "./types";
import { STEPS } from "./types";

/**
 * Fetches progress for all 8 steps. Phase 1 returns all-empty if endpoint missing.
 * Phase 1b will query script-writer + storyboard-maker in parallel.
 */
export function useProjectProgress(projectId: string) {
  const [progress, setProgress] = useState<StepProgress[]>(
    STEPS.map((s) => ({ key: s.key, status: "not_started" })),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/progress`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as StepProgress[];
        if (!cancelled) setProgress(data);
      } catch {
        // Silent fail: keep all-empty default
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const currentStep: StepKey | undefined = progress.find(
    (p) => p.status === "in_progress" || p.status === "review",
  )?.key;

  return { progress, currentStep, loading };
}
```

- [ ] **Step 3: Type-check**

Run: `cd packages/ui && bunx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/creative-pipeline/useProjectMeta.ts packages/ui/src/creative-pipeline/useProjectProgress.ts
git commit -m "feat(ui/creative-pipeline): useProjectMeta and useProjectProgress hooks"
```

### Task 14: CreativePipelineShell top-level component

**Files:**
- Create: `packages/ui/src/creative-pipeline/CreativePipelineShell.tsx`

- [ ] **Step 1: Component**

```tsx
"use client";

import { PipelineStepper } from "./PipelineStepper";
import { PipelineStepCard } from "./PipelineStepCard";
import { useProjectProgress } from "./useProjectProgress";
import type { ProjectMeta, DeepLink, StepKey } from "./types";
import { STEPS } from "./types";

interface Props {
  meta: ProjectMeta;
  /** Map of stepKey → external app URL. Phase 1: static, passed in by app. */
  deepLinks?: Partial<Record<StepKey, DeepLink>>;
}

export function CreativePipelineShell({ meta, deepLinks }: Props) {
  const { progress, currentStep } = useProjectProgress(meta.id);

  return (
    <div
      className="flex flex-col"
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--studio-bg-base)",
        color: "var(--studio-text)",
      }}
    >
      {/* Header */}
      <header
        className="border-b px-6 py-4"
        style={{ borderColor: "var(--studio-border)" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-wider">{meta.title}</h1>
              <span
                className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: "var(--studio-bg-hover)",
                  color: "var(--studio-text-dim)",
                  border: "1px solid var(--studio-border)",
                }}
              >
                {meta.ownerStudio}
              </span>
              <span
                className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor:
                    meta.priority === "P0"
                      ? "rgba(239, 68, 68, 0.15)"
                      : meta.priority === "P1"
                        ? "rgba(245, 158, 11, 0.15)"
                        : "rgba(107, 114, 128, 0.15)",
                  color:
                    meta.priority === "P0"
                      ? "var(--studio-danger)"
                      : meta.priority === "P1"
                        ? "var(--studio-warning)"
                        : "var(--studio-text-dim)",
                  border: `1px solid ${
                    meta.priority === "P0"
                      ? "var(--studio-danger)"
                      : meta.priority === "P1"
                        ? "var(--studio-warning)"
                        : "var(--studio-border)"
                  }`,
                }}
              >
                {meta.priority}
              </span>
            </div>
            <p
              className="mt-1 text-xs"
              style={{ color: "var(--studio-text-dim)" }}
            >
              {meta.category}
              {meta.genre && ` · ${meta.genre}`}
              {meta.budgetKRW && ` · ₩${(meta.budgetKRW / 1_000_000_000).toFixed(1)}B`}
            </p>
          </div>
          <a
            href="/paperclip"
            className="text-xs underline opacity-70 hover:opacity-100"
            style={{ color: "var(--studio-text-dim)" }}
          >
            ← Paperclip HQ
          </a>
        </div>
      </header>

      {/* Sticky stepper */}
      <PipelineStepper progress={progress} currentStep={currentStep} />

      {/* 8 cards */}
      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="flex flex-col gap-4">
          {STEPS.map((step) => {
            const p =
              progress.find((pr) => pr.key === step.key) ?? {
                key: step.key,
                status: "not_started" as const,
              };
            return (
              <PipelineStepCard
                key={step.key}
                stepKey={step.key}
                progress={p}
                deepLink={deepLinks?.[step.key]}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `cd packages/ui && bunx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/creative-pipeline/CreativePipelineShell.tsx
git commit -m "feat(ui/creative-pipeline): CreativePipelineShell top-level component"
```

### Task 15: Barrel export + wire into packages/ui

**Files:**
- Create: `packages/ui/src/creative-pipeline/index.ts`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Creative pipeline barrel**

`packages/ui/src/creative-pipeline/index.ts`:

```ts
export * from "./types";
export { PipelineStepBadge } from "./PipelineStepBadge";
export { PipelineStepper } from "./PipelineStepper";
export { PipelineStepCard } from "./PipelineStepCard";
export { CreativePipelineShell } from "./CreativePipelineShell";
export { useProjectMeta } from "./useProjectMeta";
export { useProjectProgress } from "./useProjectProgress";
```

- [ ] **Step 2: Re-export from package root**

In `packages/ui/src/index.ts`, append:

```ts
export * from "./creative-pipeline";
```

- [ ] **Step 3: Type-check whole package**

Run: `cd packages/ui && bunx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/creative-pipeline/index.ts packages/ui/src/index.ts
git commit -m "feat(ui): export creative-pipeline module from package root"
```

---

## Phase 5 — Contents-Studio `/projects/[id]` route

### Task 16: Server component page

**Files:**
- Create: `apps/contents-studio/apps/web/app/(dashboard)/projects/[id]/page.tsx`

- [ ] **Step 1: Server component**

```tsx
import { notFound } from "next/navigation";
import { findProject } from "@marionette/paperclip-bridge";
import { PipelineClient } from "./pipeline-client";
import type { ProjectMeta } from "@marionette/ui";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPipelinePage({ params }: PageProps) {
  const { id } = await params;
  const entry = await findProject(id);
  if (!entry) notFound();

  const meta: ProjectMeta = {
    id: entry.id,
    title: entry.title,
    category: entry.category,
    ownerStudio: entry.ownerStudio,
    priority: entry.priority,
    budgetKRW: entry.budgetKRW,
    genre: entry.genre,
  };

  return <PipelineClient meta={meta} />;
}
```

- [ ] **Step 2: Type-check**

Run: `cd apps/contents-studio/apps/web && bunx tsc --noEmit`
Expected: no errors. If `@marionette/ui` isn't already a dependency, add it to `package.json` and rerun `bun install`.

- [ ] **Step 3: Commit**

```bash
git add apps/contents-studio/apps/web/app/\(dashboard\)/projects/\[id\]/page.tsx
git commit -m "feat(contents-studio): server route for project pipeline view"
```

### Task 17: Client wrapper with deep links

**Files:**
- Create: `apps/contents-studio/apps/web/app/(dashboard)/projects/[id]/pipeline-client.tsx`

- [ ] **Step 1: Client wrapper**

```tsx
"use client";

import { CreativePipelineShell, type ProjectMeta, type StepKey, type DeepLink } from "@marionette/ui";

interface Props {
  meta: ProjectMeta;
}

const SCRIPT_WRITER_BASE = process.env.NEXT_PUBLIC_SCRIPT_WRITER_URL ?? "http://localhost:5174";
const STORYBOARD_BASE = process.env.NEXT_PUBLIC_STORYBOARD_URL ?? "http://localhost:3007";

function buildDeepLinks(projectId: string): Partial<Record<StepKey, DeepLink>> {
  const sw = (step: string): DeepLink => ({
    url: `${SCRIPT_WRITER_BASE}/?projectId=${encodeURIComponent(projectId)}&jumpTo=${step}`,
    label: "Open in Script Writer",
  });
  const sb = (step: string): DeepLink => ({
    url: `${STORYBOARD_BASE}/?projectId=${encodeURIComponent(projectId)}&jumpTo=${step}`,
    label: "Open in Storyboard Maker",
  });
  return {
    logline: sw("logline"),
    synopsis: sw("synopsis"),
    treatment: sw("treatment"),
    script: sw("script"),
    scene: sw("scene"),
    cut: sw("cut"),
    "image-prompt": sb("image-prompt"),
    "video-prompt": sb("video-prompt"),
  };
}

export function PipelineClient({ meta }: Props) {
  const deepLinks = buildDeepLinks(meta.id);
  return <CreativePipelineShell meta={meta} deepLinks={deepLinks} />;
}
```

- [ ] **Step 2: Type-check**

Run: `cd apps/contents-studio/apps/web && bunx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Verify dependency**

Check `apps/contents-studio/apps/web/package.json` for:
```json
"@marionette/ui": "workspace:*"
```
If missing, add it and run `bun install` from monorepo root.

- [ ] **Step 4: Commit**

```bash
git add apps/contents-studio/apps/web/app/\(dashboard\)/projects/\[id\]/pipeline-client.tsx apps/contents-studio/apps/web/package.json bun.lock
git commit -m "feat(contents-studio): client pipeline wrapper with deep links"
```

---

## Phase 6 — Integration smoke test

### Task 18: Seed `~/paperclip/projects-registry.json`

**Files:**
- User writes: `~/paperclip/projects-registry.json` (outside monorepo, user action)

- [ ] **Step 1: Check file exists or create**

```bash
cat ~/paperclip/projects-registry.json 2>/dev/null || echo "not yet created"
```

If not present, create it with the 3 canonical projects:

```bash
cat > ~/paperclip/projects-registry.json <<'EOF'
[
  {
    "id": "ID-001",
    "title": "DECODE (디코드)",
    "genre": "SF 스릴러",
    "category": "film",
    "budgetKRW": 3500000000,
    "priority": "P1",
    "ownerStudio": "IMP"
  },
  {
    "id": "ID-002",
    "title": "어머니의 이력서",
    "genre": "휴먼 드라마",
    "category": "drama",
    "budgetKRW": 2000000000,
    "priority": "P0",
    "ownerStudio": "STE"
  },
  {
    "id": "ID-003",
    "title": "나노 커뮤니티",
    "genre": "블랙코미디/스릴러",
    "category": "film",
    "budgetKRW": 1500000000,
    "priority": "P1",
    "ownerStudio": "STE"
  }
]
EOF
```

- [ ] **Step 2: Verify via bridge**

```bash
cd /Users/daniel/dev/claude-dev/marionette-suite
bun -e 'import("./packages/paperclip-bridge/src/registry.js").then(async m => { const r = await m.readRegistry(); console.log("entries:", r.length); console.log(r.map(e => e.id + " · " + e.title).join("\n")); })'
```
Expected: 3 entries listed. (If Bun TS loader needs direct TS, use: `bun --tsconfig-override packages/paperclip-bridge/tsconfig.json ...` or run via a small scratch script inside packages/paperclip-bridge.)

Alternative verification: existing test in Task 4 already covers reading behavior.

- [ ] **Step 3: No commit**

This step is Paperclip-side data only. Not versioned in Marionette Suite.

### Task 19: Manual smoke — contents-studio dev server

**Files:**
- None

- [ ] **Step 1: Find the contents-studio dev command**

```bash
cat apps/contents-studio/apps/web/package.json | grep -A2 '"scripts"'
```
Locate the `dev` script (likely `next dev`).

- [ ] **Step 2: Start dev server**

```bash
cd apps/contents-studio/apps/web && bun run dev
```
Note the port from terminal output (likely `:3001` or whatever the config specifies).

- [ ] **Step 3: Navigate to 3 project URLs**

Open in browser:
- `http://localhost:<port>/projects/ID-001`
- `http://localhost:<port>/projects/ID-002`
- `http://localhost:<port>/projects/ID-003`

Expected per page:
- Header: title, owner studio badge, priority badge, category + genre + budget
- Sticky stepper with 8 numbered steps
- 8 `PipelineStepCard`s with "대기" status
- Each card has `Open in Script Writer` (steps 1-6) or `Open in Storyboard Maker` (steps 7-8) button

- [ ] **Step 4: Verify navigation to missing project**

Navigate to `http://localhost:<port>/projects/ID-999`
Expected: Next.js 404.

- [ ] **Step 5: No commit**

Smoke test is verification only.

---

## Phase 7 — Plan wrap-up

### Task 20: Push and update PR

**Files:**
- Pushed to remote

- [ ] **Step 1: Push**

```bash
git push origin feat/integrate-dev-projects
```

- [ ] **Step 2: Update PR description**

```bash
gh pr view 1 --json body -q .body > /tmp/pr-body-current.md
```
Append to the existing body a new section:

```markdown

## Phase 1 MVP — Creative Tracking (2026-04-18)

Spec: `docs/superpowers/specs/2026-04-18-marionette-creative-tracking-architecture.md`
Plan: `docs/superpowers/plans/2026-04-18-marionette-creative-tracking-phase1.md`

- Tokens: `--accent-violet`, `--accent-mint` 추가
- Types: `GenerationTarget` + 4개 ContentProfile 확장
- Bridge: 파일 registry + real health + MAR creative dispatch 제외
- Prompt adapters: 중립 스키마 + Cinema Studio / Marketing Studio placeholder
- UI: `creative-pipeline` 모듈 (8 steps, 4-state stepper, stepper+card+shell)
- Contents-studio: `/projects/[id]` 라우트 + deep-link wrapper
```

Then:
```bash
gh pr edit 1 --body-file /tmp/pr-body-current.md
```

- [ ] **Step 3: Confirm PR reflects new commits**

```bash
gh pr view 1 --json url,commits -q '.url, .commits[-5:] | .[] | .messageHeadline'
```
Expected: 20 new commits visible, PR URL clickable.

---

## Follow-up plans (not in this document)

- **Phase 1b:** script-writer DB schema — Character, Location, Prop tables + ImagePrompt/VideoPrompt tables (in storyboard-maker or a new `@marionette/prompts` package).
- **Phase 1c:** Deep-link wiring in script-writer (URL param parsing + auto-scroll to step) and storyboard-maker (Next.js conversion or HTML param reading).
- **Phase 1d:** Real `/api/projects/[id]/progress` endpoint in contents-studio that queries script-writer + storyboard-maker in parallel.
- **Phase 2:** Higgsfield export flow (JSON download) + optional real API integration + actual image/video generation wiring.

---

## Self-Review Checklist

**Spec coverage map:**

| Spec section | Tasks |
|--------------|-------|
| §5 Frontend architecture | Tasks 9-17 |
| §6 Data model (prompt schema) | Tasks 7-8 |
| §7 Higgsfield integration | Tasks 6-8 (adapter placeholders) |
| §8 Paperclip bridge | Tasks 4-5 |
| §9 Design system strategy | Task 1 |
| §11 Dependencies & sequencing | Phases 0-7 ordering |
| §15 Success criteria | Tasks 18-19 (smoke test validates top-line items) |

**Not in this plan (explicitly deferred):**
- script-writer Character/Location/Prop tables — Phase 1b
- Deep-link URL param handling inside Spokes — Phase 1c
- Real progress API — Phase 1d
- Higgsfield actual generation — Phase 2

**Placeholder scan result:** None. All code blocks contain complete implementations.

**Type consistency check:** `StepKey`, `StepStatus`, `StepProgress`, `ProjectMeta`, `DeepLink` all defined in Task 9 and used consistently in Tasks 10-17. `PromptAdapter`, `ImagePromptNeutral`, `VideoPromptNeutral` defined in Tasks 7-8 and used in the Higgsfield placeholders.

---

**End of Phase 1 MVP plan.** 20 tasks, estimated ~3-6 hours of focused CC+gstack work, or 2-3 days of solo human work.
