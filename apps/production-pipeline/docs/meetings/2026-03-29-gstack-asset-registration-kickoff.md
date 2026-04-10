# Meeting Minutes — gstack Asset Registration & AI Development Kickoff

**Date:** 2026-03-29
**Meeting Type:** Technical Strategy — AI-Assisted Development Workflow
**Organization:** Marionette Studios
**Attendees:** CTO / AI Pipeline Lead (Daniel)
**Session:** Claude Code (claude-sonnet-4-6)
**Status:** APPROVED — Actions active

---

## Agenda

1. gstack Technical Assessment
2. Marionette Studios Asset Registration Plan
3. AI-Agent Development Workflow (Solo + Agents)
4. Frontend Development Kickoff — Frontend-Dev Agent
5. Integration Roadmap with production_pipeline

---

## 1. gstack Technical Assessment

### 1.1 Product Overview

**gstack** (Garry's Stack) is a Claude Code workflow framework and persistent headless browser system. It provides a unified developer AI toolkit — skills for QA, deployment, code review, design audit, security audit, and production monitoring — all orchestrated through Claude Code.

| Property | Value |
|----------|-------|
| Package name | `gstack` |
| Version | 0.11.10.0 (latest) |
| License | MIT |
| Runtime | Bun + TypeScript (compiled binary) |
| Browser engine | Chromium via Playwright (persistent daemon) |
| Protocol | Plain HTTP over localhost, Bearer token auth |
| Repository | `~/dev/antigravity-dev/gstack/` |

### 1.2 Architecture Summary

```
Claude Code Tool Calls
        │
        ▼
  gstack CLI binary (~58MB, no node_modules)
        │  HTTP POST
        ▼
  Bun.serve() server (localhost, random port 10000-60000)
        │  CDP
        ▼
  Chromium daemon (persistent, 30min idle timeout)
```

**Key design decisions:**
- **Daemon model:** Browser starts once (~3s), subsequent commands execute in 100–200ms. No cold-start per command. Cookies, localStorage, and login sessions persist across the entire dev session.
- **Ref system:** Elements addressed as `@e1`, `@e2` via ARIA accessibility tree — no DOM injection, no CSP conflicts, no framework hydration breakage. Shadow DOM safe.
- **Compiled binary:** Single executable via `bun build --compile`. Installs to `~/.claude/skills/gstack/`. No npm, no PATH config, no native addons.
- **SKILL.md template system:** Docs auto-generated from source (`commands.ts` → `SKILL.md.tmpl` → `SKILL.md`). Command registry is single source of truth — docs cannot drift from code.

### 1.3 Available Skills (27+)

| Category | Skill | Purpose |
|----------|-------|---------|
| QA | `/qa` | Systematic UI testing + auto-fix loop |
| QA | `/qa-only` | Report-only QA (no edits) |
| CI/CD | `/ship` | Merge + test + VERSION bump + deploy |
| CI/CD | `/land-and-deploy` | Merge PR → wait CI → canary verify |
| Review | `/review` | Pre-merge diff review (SQL safety, LLM trust, logic) |
| Review | `/code-review` | Full PR code review |
| Design | `/design-review` | Visual audit + fix loop |
| Design | `/plan-design-review` | Design audit report only |
| Design | `/design-consultation` | Design system from scratch |
| Planning | `/plan-ceo-review` | CEO/founder framing + scope challenge |
| Planning | `/plan-eng-review` | Eng manager execution lock-in |
| Planning | `/autoplan` | CEO + design + eng review pipeline |
| Security | `/cso` | OWASP Top 10 + STRIDE audit |
| Monitoring | `/canary` | Post-deploy live error + perf monitoring |
| Debugging | `/investigate` | Systematic root-cause debugging |
| Documentation | `/document-release` | Post-ship doc update |
| Performance | `/benchmark` | Page load + Core Web Vitals regression detection |
| Office Hours | `/office-hours` | YC-style startup diagnostic |
| Retro | `/retro` | Weekly engineering retrospective |

### 1.4 Test Infrastructure

| Tier | What | Cost | Speed | Gate |
|------|------|------|-------|------|
| 1 — Static validation | Parse `$B` commands, validate against registry | Free | <2s | Every `bun test` |
| 2 — E2E via `claude -p` | Spawn real Claude session, run each skill end-to-end | ~$3.85/run | ~6min (CI parallel) | Pre-ship |
| 3 — LLM-as-judge | Sonnet scores docs on clarity/completeness | ~$0.15/run | ~30s | Pre-ship |

CI evals run on Ubicloud (12 parallel GitHub Actions runners, ~$0.006/run). Docker image pre-bakes Bun + Node + Claude CLI.

### 1.5 Security Model

- Localhost-only HTTP server (not `0.0.0.0`)
- Per-session UUID Bearer token (state file mode 0o600)
- Cookie decryption in-memory only — never written to disk in plaintext
- macOS Keychain access requires user approval dialog (not silent)
- Browser DB opened read-only (copy to temp file first)
- No shell string interpolation — all subprocess calls use explicit argument arrays

### 1.6 Compatibility with Marionette Stack

| Dimension | gstack | Marionette production_pipeline | Compatible? |
|-----------|--------|-------------------------------|-------------|
| Runtime | Bun | Bun | ✅ Identical |
| Language | TypeScript (strict) | TypeScript (strict) | ✅ Identical |
| Test runner | bun:test | bun:test | ✅ Identical |
| Module system | ESM | ESM | ✅ Identical |
| Browser target | Chromium (headless) | React+Vite on Chromium | ✅ Direct |
| Package manager | Bun | Bun | ✅ Identical |
| CI paradigm | GitHub Actions + Bun | None yet | 🔧 Adopting gstack CI pattern |

**Verdict:** Zero friction integration. gstack runs natively on the same stack with no adapter layer required.

---

## 2. Marionette Studios Asset Registration Plan

### 2.1 Registration Decision

**RESOLVED:** gstack is registered as a Tier-1 development tool asset for Marionette Studios, effective 2026-03-29.

**Rationale:**
- Eliminates need for separate QA tooling, deploy scripting, and monitoring setup
- Provides 27+ battle-tested skills immediately applicable to the React dashboard and FastAPI backend
- MIT license — no commercial restrictions
- Same Bun+TypeScript stack — no ecosystem friction
- Persistent browser reduces QA session time from hours to minutes

### 2.2 Integration Scope

gstack will be applied to the following Marionette Studios components:

| Component | gstack Skills Applied |
|-----------|----------------------|
| `production_pipeline/web/` (React+Vite dashboard) | `/qa`, `/design-review`, `/benchmark`, `/canary` |
| `production_pipeline/server/` (FastAPI backend) | `/review`, `/cso`, `/investigate` |
| `cine-analysys-system` (Next.js + Elysia) | `/qa`, `/design-review`, `/ship`, `/canary` |
| `cine-script-writer` | `/qa`, `/design-review` |
| All repos (CI/CD) | `/ship`, `/land-and-deploy`, `/review` |
| All repos (planning) | `/plan-ceo-review`, `/plan-eng-review`, `/autoplan` |

### 2.3 Installation Action Items

- [ ] Run `gstack setup` in `production_pipeline/` workspace
- [ ] Verify `/browse` skill active: `$B health`
- [ ] Configure `CLAUDE.md` in each subproject to reference gstack commands
- [ ] Add gstack binary path to CI Docker image (reuse gstack's `Dockerfile.ci` pattern)
- [ ] Register `production_pipeline` in gstack workspace config

### 2.4 LLM Cost Policy Compliance

gstack's E2E evals use `claude -p` (Anthropic) and optionally Codex. Per Marionette Studios policy (2026-03-29):
- E2E evals: Anthropic Claude (allowed, within remaining credits)
- LLM-judge tier: Anthropic Claude (allowed)
- Production code: Gemini Free → Ollama → HuggingFace → Groq → Anthropic chain (per current sprint)

**No OpenAI API keys are required or used** for any gstack workflow invoked by Marionette Studios agents.

---

## 3. AI-Agent Development Workflow

### 3.1 Organizational Structure

Marionette Studios operates as an **AI-first, solo-led studio** with the following development model:

```
CTO / AI Pipeline Lead (Daniel)
        │
        ├── Claude Code (Primary orchestrator — this session)
        │       ├── Brainstorm → Plan → Execute loop
        │       ├── Spec writing, plan writing, code review
        │       └── Context management across subprojects
        │
        ├── Frontend-Dev Agent (active — separate tmux tab)
        │       └── Target: gstack frontend + Marionette dashboard
        │
        ├── Subagents (dispatched per task)
        │       ├── feature-dev:code-architect (design)
        │       ├── feature-dev:code-explorer (research)
        │       ├── superpowers:code-reviewer (post-task review)
        │       └── general-purpose (research, exploration)
        │
        └── gstack skills (quality gates)
                ├── /qa → UI validation
                ├── /review → pre-merge gate
                ├── /ship → deploy gate
                └── /canary → production monitoring
```

### 3.2 Development Loop

Each feature/agent follows this cycle:

```
1. PLAN     → brainstorming skill → writing-plans skill
                                           │
2. EXECUTE  → subagent-driven-development ◄┘
             (parallel subagents per independent task)
                    │
3. VALIDATE → gstack /qa (UI) + /review (code) + /cso (security)
                    │
4. SHIP     → gstack /ship (bump VERSION + CHANGELOG + push + deploy)
                    │
5. MONITOR  → gstack /canary (post-deploy live checks)
```

### 3.3 No Human Outsourcing — Rationale

**RESOLVED:** Zero human contractors engaged. All development executed via Claude Code + gstack.

| Task type | Human team estimate | CC+gstack estimate | Compression |
|-----------|--------------------|--------------------|-------------|
| Pipeline agent (one agent) | 3-5 days | 30-60 min | ~60-80x |
| Dashboard frontend integration | 2 weeks | 2-4 hours | ~50x |
| CI/CD setup | 3 days | 45 min | ~100x |
| Architecture documentation | 2 days | 1 hour | ~50x |
| Full 7-agent pipeline completion | 6-8 weeks | 6-10 hours total | ~60x |

**Business case:** At current AI capability and context window sizes, a single CTO + Claude Code + gstack executes at the throughput of a 5-10 person engineering team. Human outsourcing would introduce coordination overhead, context transfer costs, and review cycles that offset the speed gain.

### 3.4 Agent Coordination Rules

1. **Parallel agents for independent tasks** — use `superpowers:dispatching-parallel-agents` when tasks have no shared state
2. **Sequential for dependent tasks** — brainstorm → plan → execute is always sequential
3. **gstack as quality gate** — no task is "done" without `/qa` or `/review` passing
4. **One CLAUDE.md per subproject** — each agent gets full project context without cross-repo confusion
5. **Free LLM policy enforced in all agent-generated code** — Gemini Free → Ollama → HuggingFace → Groq → Anthropic

---

## 4. Frontend Development Kickoff — Frontend-Dev Agent

### 4.1 Current State

The Frontend-Dev agent is **actively running** in a separate tmux/conductor tab. Target work: gstack frontend + Marionette Studios pipeline dashboard.

**Marionette frontend inventory:**

| App | Stack | Status | Port |
|-----|-------|--------|------|
| `production_pipeline/web/` | React + Vite | UI complete, backend not wired | 3000 |
| `cine-analysys-system` (scenario-web) | Next.js | Session 31 complete, functional | 4000 |
| `cine-script-writer/` | React + Vite | Active development | TBD |

### 4.2 Frontend-Dev Agent Scope

**Primary deliverables for Frontend-Dev agent:**

1. **gstack frontend** — any UI component needed for gstack's own workflow visibility
2. **production_pipeline dashboard** — wire React UI to FastAPI backend:
   - Replace `localStorage`/mock data with real API calls
   - Pipeline stage progress bar (7 agents, real-time WebSocket)
   - Asset gallery (storyboards, video clips, audio)
   - Project CRUD connected to `/api/projects`
3. **Component quality gates** — agent runs `/qa` and `/design-review` on all new UI

### 4.3 Frontend Tech Constraints

- **No new paid LLM API calls** in frontend code
- **Gemini Free TTS/image generation** endpoints only (already in `ai-gateway`)
- Component library: existing React + Vite + TailwindCSS pattern (follow codebase)
- State management: existing pattern (no new libraries without CTO approval)
- API client: existing Vite proxy setup → FastAPI on `:8000`

### 4.4 Coordination with This Session

The primary Claude Code session (this session) owns:
- Backend agents (Python, FastAPI)
- LLM provider layer (TypeScript packages)
- Architecture decisions

The Frontend-Dev agent owns:
- React component implementation
- CSS/styling
- API client wiring

**Handoff protocol:** Frontend-Dev agent reads `production_pipeline/server/` route definitions to understand API contracts. No cross-session real-time communication — use shared files (`TASKS.md`, API spec) as coordination layer.

---

## 5. Integration Roadmap — production_pipeline

### 5.1 Current Pipeline Status (as of 2026-03-29)

| Agent | Status | API | Notes |
|-------|--------|-----|-------|
| Scripter | ✅ Complete | Gemini Free | JSON direction plan |
| ConceptArtist | ✅ Complete | Gemini Flash Image | Storyboard PNG |
| SoundDesigner | ✅ Complete | Gemini TTS | Dialogue WAV |
| Generalist | ✅ Complete | Veo 3.0 | 8s MP4 clips |
| MasterEditor | ✅ Complete | FFMPEG | Video concat |
| AssetDesigner | ⚠️ Mock | Meshy (TBD) | 3D models |
| VFXCompositor | ⚠️ Mock | OpenCV (TBD) | VFX compositing |
| Previsualizer | 🆕 Planned | Veo 3.0 | Camera blocking |
| CastingDirector | 🆕 Planned | Gemini Flash Image | Character sheets |
| LocationScout | 🆕 Planned | Gemini Flash Image | Environment art |
| Cinematographer | 🆕 Planned | Gemini Free | Prompt refinement |
| Colorist | 🆕 Planned | FFMPEG LUT | Color grading |
| Composer | 🆕 Planned | Suno/Udio | BGM score |
| MixingEngineer | 🆕 Planned | FFMPEG | Audio mix |

### 5.2 Sprint Roadmap

#### Sprint 1 (2026-03-29 — current session) — Infrastructure
- ✅ LLM provider swap: Remove OpenAI/DeepSeek, add Ollama/HuggingFace
- ✅ Free provider chain: Gemini → Ollama → HuggingFace → Groq → Anthropic
- ✅ Architecture documentation (this document)
- 🔄 Frontend-Dev agent: Dashboard API wiring (parallel)

#### Sprint 2 (next session) — Agent Completion Phase 1
- Implement `CastingDirector` (Gemini Flash Image, character consistency)
- Implement `LocationScout` (Gemini Flash Image, environment art)
- Implement `Cinematographer` (Gemini Free, prompt refinement text agent)
- gstack `/qa` validation on new agents via test scenarios

#### Sprint 3 — Agent Completion Phase 2
- Implement `Colorist` (FFMPEG LUT + Pillow frame processing)
- Implement `MixingEngineer` (FFMPEG audio stream merge)
- Implement `Previsualizer` (Veo 3.0 image→video, low-res camera blocking)
- End-to-end pipeline test: full scene S#1 through all 14 agents

#### Sprint 4 — CI/CD & Production Readiness
- gstack `/ship` workflow configured for `production_pipeline` repo
- GitHub Actions CI with gstack E2E eval pattern
- gstack `/canary` configured for post-deploy monitoring
- gstack `/cso` OWASP security audit on FastAPI backend + React dashboard
- Docker + deployment configuration

#### Sprint 5 — Monetization Foundation
- User authentication (OAuth2 or JWT)
- Credits/billing system design
- Beta onboarding (50 testers)
- Landing page (`/design-consultation` + `/qa`)

### 5.3 gstack Skills Applied Per Sprint

| Sprint | Primary gstack Skills |
|--------|-----------------------|
| 1 | `/investigate`, `/review`, `/cso` |
| 2–3 | `/qa` (agent output validation), `/design-review` (storyboard UI) |
| 4 | `/ship`, `/canary`, `/cso`, `/benchmark` |
| 5 | `/design-consultation`, `/qa`, `/plan-ceo-review` |

### 5.4 Success Metrics

| Milestone | Target | Measure |
|-----------|--------|---------|
| Free LLM swap | Sprint 1 | All tests pass, zero OpenAI/DeepSeek references in source |
| All 14 agents active | Sprint 3 | Full S#1–S#15 pipeline runs end-to-end |
| Dashboard fully wired | Sprint 2 | Zero localStorage mock data in production |
| CI/CD live | Sprint 4 | Every PR triggers gstack E2E + static validation |
| Beta launch | Sprint 5 | 50 users onboarded, canary showing green |

---

## Action Items

| # | Action | Owner | Sprint | Status |
|---|--------|-------|--------|--------|
| 1 | Execute free LLM provider swap plan | Claude Code (this session) | 1 | 🔄 In Progress |
| 2 | Dashboard API wiring | Frontend-Dev Agent | 1 | 🔄 Active |
| 3 | gstack setup in production_pipeline workspace | CTO | 1 | ⬜ Pending |
| 4 | Implement CastingDirector agent | Claude Code | 2 | ⬜ Pending |
| 5 | Implement LocationScout agent | Claude Code | 2 | ⬜ Pending |
| 6 | Implement Cinematographer agent | Claude Code | 2 | ⬜ Pending |
| 7 | Implement Colorist + MixingEngineer | Claude Code | 3 | ⬜ Pending |
| 8 | Implement Previsualizer | Claude Code | 3 | ⬜ Pending |
| 9 | Full 14-agent E2E pipeline test | Claude Code | 3 | ⬜ Pending |
| 10 | Configure gstack /ship CI/CD | Claude Code | 4 | ⬜ Pending |
| 11 | gstack /cso security audit | Claude Code | 4 | ⬜ Pending |
| 12 | Beta launch infrastructure | CTO | 5 | ⬜ Pending |

---

## Decisions Recorded

| Decision | Rationale | Date |
|----------|-----------|------|
| Register gstack as Tier-1 dev tool | MIT, same stack, 27+ battle-tested skills | 2026-03-29 |
| No human outsourcing | CC+gstack compression ratio ~60-80x vs human team | 2026-03-29 |
| Free LLM policy enforced globally | Cost control, all subprojects | 2026-03-29 |
| Remove OpenAI + DeepSeek from all providers | Policy violation, paid APIs | 2026-03-29 |
| Frontend-Dev agent separate tmux tab | Parallel execution, independent scope | 2026-03-29 |
| Veo 3.0 retained for video generation | No free alternative for video synthesis | 2026-03-29 |

---

*Minutes recorded by Claude Code (claude-sonnet-4-6) · Marionette Studios · 2026-03-29*
