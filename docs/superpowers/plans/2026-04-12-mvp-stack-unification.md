# MVP Stack Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify the marionette-suite monorepo to a single coherent stack (Next.js 16 + FastAPI), remove legacy code, fix paid API violations, and fill missing content data.

**Architecture:** `apps/studio` (Next.js 16, port 3001) is the canonical frontend — all new UI lives here. `apps/production-pipeline` (FastAPI, port 3005) is the canonical backend. `apps/script-writer` keeps its Bun+Elysia backend (port 3006) temporarily but removes OpenRouter as default AI provider. Legacy `apps/production-pipeline/web/` (Vite+React) is archived.

**Tech Stack:** Python FastAPI + SQLAlchemy + SQLite (backend), Next.js 16 App Router + TypeScript + Tailwind v4 + Zustand (frontend), Bun+Elysia (script-writer backend — temporary), Gemini Free → Groq → Anthropic credits → Mock (LLM chain)

---

## File Map

| File | Action | Reason |
|------|--------|--------|
| `apps/production-pipeline/web/` | Rename → `_web_legacy/` | Archive Vite+React legacy app |
| `apps/production-pipeline/server/data/master_prompts_db.json` | Modify | Fill 10 empty `aiPrompt` fields for storyboard masters |
| `apps/script-writer/server/src/ai.ts:55` | Modify | Change default model from `anthropic/claude-3-5-sonnet` → `google/gemini-2.5-flash`; remove isChatMode OpenRouter-first behavior |
| `apps/script-writer/src/components/ProjectCreateModal.jsx` | Modify | Add YouTube as 5th content category with 4 genres |
| `apps/studio/src/app/projects/[projectId]/script/page.tsx` | Create | New page showing `direction_plan_json` scenes from FastAPI |
| `apps/studio/src/app/projects/[projectId]/script/ScriptViewer.tsx` | Create | Client component for interactive scene/script display |

---

## Task 1: Archive Legacy Web App

**Files:**
- Rename: `apps/production-pipeline/web/` → `apps/production-pipeline/_web_legacy/`

- [ ] **Step 1: Rename the directory**

```bash
mv apps/production-pipeline/web apps/production-pipeline/_web_legacy
```

- [ ] **Step 2: Verify rename**

```bash
ls apps/production-pipeline/ | grep -E "web|_web"
# Expected: _web_legacy (no plain "web")
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: archive legacy production-pipeline/web Vite app → _web_legacy"
```

---

## Task 2: Fill Storyboard aiPrompts

**Files:**
- Modify: `apps/production-pipeline/server/data/master_prompts_db.json`

All 10 storyboard master entries have `"aiPrompt": ""`. Fill each with a concise English AI image prompt matching the director's visual style.

- [ ] **Step 1: Update master_prompts_db.json with all 10 aiPrompts**

Prompts by master ID:

| ID | aiPrompt |
|----|---------|
| `kurosawa` | `"Akira Kurosawa storyboard style, watercolor and gouache painting, Van Gogh expressive brushstrokes, Japanese ink wash influence, full color emotional palette, impressionist atmosphere, hand-painted cinematic frame"` |
| `ridley_scott` | `"Ridleygram storyboard style, ink and pencil contour drawing, Heavy Metal magazine aesthetic, Moebius influence, deep shadow rendering, atmospheric haze, dramatic chiaroscuro lighting, cinematic comic book panel"` |
| `bong` | `"Bong Joon-ho storyboard style, clean pen line drawing, graphic novel composition, Korean cinematic framing, precise camera angle with direction arrows, manga-influenced panel layout, B&W ink"` |
| `saul_bass` | `"Saul Bass storyboard style, high contrast black and white graphic design, bold silhouette shapes, geometric minimalism, title sequence aesthetic, flat graphic composition, Hitchcock film storyboard"` |
| `miyazaki` | `"Miyazaki ekonte storyboard style, monochrome pencil sketch, Studio Ghibli aesthetic, information-dense single frame with timing annotations, organic flowing lines, hand-drawn animation planning"` |
| `scorsese` | `"Martin Scorsese storyboard style, rough pencil sketch with red ink highlights, stick figure composition, minimal expressive lines, handwritten scene notes, 1970s New York cinema atmosphere"` |
| `mad_max` | `"Mad Max Fury Road storyboard style, action comic book art, Brendan McCarthy illustration, full color kinetic panel, post-apocalyptic vehicle action, motion blur lines, dynamic extreme angle"` |
| `anderson_jt` | `"J. Todd Anderson Coen Brothers storyboard style, ink and shadow cross-hatching, noir cinematic depth, dramatic low-angle framing, precise scene blocking arrows, film noir atmosphere"` |
| `lowery` | `"David Lowery Spielberg storyboard style, cinematic realism pencil drawing, precise lighting and shadow study, suspense framing composition, detailed depth-of-field indication, dramatic perspective"` |
| `anderson_wes` | `"Wes Anderson storyboard style, simple symmetrical line drawing, center-frame perfect composition, storybook aesthetic, pastel color palette, flat graphic depth, dollhouse framing"` |

- [ ] **Step 2: Verify JSON is valid**

```bash
python3 -c "import json; d=json.load(open('apps/production-pipeline/server/data/master_prompts_db.json')); sb=d['storyboard']; print(f'Count: {len(sb)}'); [print(f\"{x['id']}: {len(x['aiPrompt'])} chars\") for x in sb]"
# Expected: 10 entries, all >50 chars
```

- [ ] **Step 3: Commit**

```bash
git add apps/production-pipeline/server/data/master_prompts_db.json
git commit -m "feat: fill storyboard master aiPrompts for AI image generation"
```

---

## Task 3: Fix script-writer AI Provider

**Files:**
- Modify: `apps/script-writer/server/src/ai.ts:54-76`

The default model `"anthropic/claude-3-5-sonnet"` (paid) must change to `"google/gemini-2.5-flash"` (free). The `isChatMode` branch that calls OpenRouter first must be removed — direct Gemini must always be tried first.

- [ ] **Step 1: Change fallback model list and remove OpenRouter-first chat mode**

Replace lines 54–76 in `apps/script-writer/server/src/ai.ts`:

```typescript
// BEFORE
const fallbackModels = [
  requestedModel || "anthropic/claude-3-5-sonnet",
  "google/gemini-2.0-flash-001",
  "google/gemini-2.5-flash",
  "google/gemini-2.0-flash-lite-001",
  "deepseek/deepseek-chat"
];

for (const currentModel of fallbackModels) {
  console.log(`[AI_ORCHESTRATOR][${mode.toUpperCase()}] Attempting: ${currentModel}`);

  try {
    let response: any = null;

    // --- 1. CHAT MODE: OPENROUTER FIRST ---
    if (isChatMode && KEYS.OPENROUTER) {
      console.log(`[AI_ORCHESTRATOR] Chat Mode: Prioritizing OpenRouter for ${currentModel}`);
      response = await callOpenRouterStream(currentModel, prompt, system, KEYS.OPENROUTER);
      if (response && response.ok) {
        console.log(`[AI_ORCHESTRATOR] OpenRouter Success (Chat Mode)`);
        return new Response(response.body, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" } });
      }
    }

    // --- 2. DIRECT API ATTEMPT (Agent Mode priority or Chat Fallback) ---
    console.log(`[AI_ORCHESTRATOR] Attempting Direct API for ${currentModel}`);
```

```typescript
// AFTER
// Provider chain: Gemini Free → Groq → Anthropic (credits) → Mock
// OpenRouter is NOT used as default — only as last resort if OPENROUTER_API_KEY is set
const fallbackModels = [
  requestedModel || "google/gemini-2.5-flash",
  "google/gemini-2.0-flash-001",
  "google/gemini-2.0-flash-lite-001",
  "groq/llama-3.3-70b-versatile",
  "anthropic/claude-3-5-haiku",
];

for (const currentModel of fallbackModels) {
  console.log(`[AI_ORCHESTRATOR][${mode.toUpperCase()}] Attempting: ${currentModel}`);

  try {
    let response: any = null;

    // --- DIRECT API ATTEMPT (Gemini Free → Groq → Anthropic credits) ---
    console.log(`[AI_ORCHESTRATOR] Attempting Direct API for ${currentModel}`);
```

- [ ] **Step 2: Also update Groq handling in the direct API block (lines ~80-90)**

The direct API block checks `currentModel.includes("claude")`, etc. Add Groq handling:

```typescript
// After the deepseek check, add:
} else if (currentModel.includes("groq/") || currentModel.includes("llama") || currentModel.includes("mixtral")) {
  if (KEYS.GROQ) response = await callGroqDirect(currentModel, prompt, system);
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd apps/script-writer/server && bun run typecheck 2>/dev/null || bunx tsc --noEmit
# Expected: 0 errors (or only pre-existing errors)
```

- [ ] **Step 4: Commit**

```bash
git add apps/script-writer/server/src/ai.ts
git commit -m "fix: change script-writer default LLM to Gemini free, remove OpenRouter-first behavior"
```

---

## Task 4: Add YouTube Category to script-writer

**Files:**
- Modify: `apps/script-writer/src/components/ProjectCreateModal.jsx`

- [ ] **Step 1: Add YouTube to CATEGORIES array and GENRES_BY_CATEGORY**

In `ProjectCreateModal.jsx`, after the `'Commercial'` entry:

```javascript
// Add to CATEGORIES array:
{ id: 'YouTube', name: '▶️ YouTube / Creator', desc: 'Hook-driven content, retention optimized (3-15 min)' }

// Add to GENRES_BY_CATEGORY:
'YouTube': [
  { id: 'Documentary', name: '🎙️ Mini Documentary' },
  { id: 'Story', name: '📖 Narrative Story' },
  { id: 'Educational', name: '📚 Educational / Tutorial' },
  { id: 'Comedy', name: '😂 Sketch / Comedy' }
]
```

- [ ] **Step 2: Verify file saves cleanly (no syntax errors)**

```bash
cd apps/script-writer && node --input-type=module < /dev/null || bun run dev --dry-run 2>&1 | head -5
# Simple check: open the file and look for syntax
```

- [ ] **Step 3: Commit**

```bash
git add apps/script-writer/src/components/ProjectCreateModal.jsx
git commit -m "feat: add YouTube/Creator category to script-writer project creation"
```

---

## Task 5: Create Studio Script Page

**Files:**
- Create: `apps/studio/src/app/projects/[projectId]/script/page.tsx`
- Create: `apps/studio/src/app/projects/[projectId]/script/ScriptViewer.tsx`

The page fetches the project from FastAPI (`GET /api/projects/{projectId}`) and renders the `direction_plan_json.scenes` array as a readable scene list. Pattern follows `agents/page.tsx`.

- [ ] **Step 1: Create ScriptViewer client component**

```typescript
// apps/studio/src/app/projects/[projectId]/script/ScriptViewer.tsx
"use client";

import { Project } from "@/lib/studio/types";

interface Scene {
  scene_number: number;
  setting: string;
  time_of_day?: string;
  characters?: string[];
  action_description?: string;
}

interface Props {
  project: Project;
}

export function ScriptViewer({ project }: Props) {
  const plan = project.direction_plan_json as { scenes?: Scene[] } | null;
  const scenes: Scene[] = plan?.scenes ?? [];

  if (scenes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
        <p className="text-lg">아직 시나리오가 생성되지 않았습니다.</p>
        <p className="text-sm mt-2">파이프라인에서 Script Writer 에이전트를 실행하면 여기에 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {scenes.map((scene) => (
        <div key={scene.scene_number} className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-mono text-zinc-500">SC{String(scene.scene_number).padStart(3, "0")}</span>
            <h3 className="font-semibold text-white">{scene.setting}</h3>
            {scene.time_of_day && (
              <span className="text-xs text-zinc-400 border border-zinc-700 rounded px-2 py-0.5">{scene.time_of_day}</span>
            )}
          </div>
          {scene.characters && scene.characters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {scene.characters.map((c) => (
                <span key={c} className="text-xs bg-zinc-800 text-zinc-300 rounded-full px-3 py-1">{c}</span>
              ))}
            </div>
          )}
          {scene.action_description && (
            <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">{scene.action_description}</p>
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create the page.tsx server component**

```typescript
// apps/studio/src/app/projects/[projectId]/script/page.tsx
import { notFound } from "next/navigation";
import { getProject } from "@/lib/studio/actions";
import { ScriptViewer } from "./ScriptViewer";

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function ScriptPage({ params }: Props) {
  const { projectId } = await params;
  const project = await getProject(projectId);
  if (!project) notFound();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{project.title}</h1>
        <p className="text-zinc-400 text-sm mt-1">시나리오 / Direction Plan</p>
      </div>
      <ScriptViewer project={project} />
    </div>
  );
}
```

- [ ] **Step 3: Verify getProject exists in lib/studio/actions**

```bash
grep -r "getProject\|export.*function.*getProject\|export.*getProject" apps/studio/src/lib/ | head -5
# Expected: at least one match showing getProject is exported
```

- [ ] **Step 4: Run typecheck**

```bash
cd apps/studio && pnpm typecheck
# Expected: 0 errors
```

- [ ] **Step 5: Commit**

```bash
git add apps/studio/src/app/projects/[projectId]/script/
git commit -m "feat: add studio script page showing direction_plan_json scenes"
```

---

## Verification

```bash
# 1. Legacy folder archived
ls apps/production-pipeline/ | grep _web_legacy

# 2. aiPrompts filled
python3 -c "import json; d=json.load(open('apps/production-pipeline/server/data/master_prompts_db.json')); empty=[x['id'] for x in d['storyboard'] if not x['aiPrompt']]; print('Empty:', empty)"
# Expected: Empty: []

# 3. script-writer default model is Gemini
grep '"google/gemini-2.5-flash"' apps/script-writer/server/src/ai.ts
# Expected: match on the default model line

# 4. YouTube category present
grep -i "youtube" apps/script-writer/src/components/ProjectCreateModal.jsx
# Expected: at least 2 matches

# 5. Studio script page exists
ls apps/studio/src/app/projects/\[projectId\]/script/
# Expected: page.tsx ScriptViewer.tsx
```
