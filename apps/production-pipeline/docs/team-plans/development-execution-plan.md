# Development Execution Plan — Marionette Studios

**Document type:** Dev Execution Plan
**Company:** Marionette Studios (MAR)
**Author:** CTO
**Date:** 2026-03-29
**Status:** Active
**Horizon:** Sprint 1–5 (5 weeks: 2026-03-29 → 2026-05-02)

---

## 0. Guiding Principle

> **Dev serves production. Never the reverse.**

Every sprint ends with at least one production-ready capability the pipeline team can use immediately. Dev timelines are derived from production milestones — not from internal technical preferences. QA gates are placed at production review boundaries so review never blocks on infrastructure.

---

## 1. Production Pipeline — Current State

The 14-agent film production pipeline is the primary production system. Dev supports it directly.

| Agent | Status | Blocker |
|-------|--------|---------|
| Scripter | ✅ Complete | — |
| ConceptArtist | ✅ Complete | — |
| SoundDesigner | ✅ Complete | — |
| Generalist (Veo 3.0) | ✅ Complete | — |
| MasterEditor (FFMPEG) | ✅ Complete | — |
| AssetDesigner | ⚠️ Mock | Meshy API TBD |
| VFXCompositor | ⚠️ Mock | OpenCV integration |
| **CastingDirector** | 🆕 Sprint 2 | Backend agent + character sheet UI |
| **LocationScout** | 🆕 Sprint 2 | Backend agent + location gallery UI |
| **Cinematographer** | 🆕 Sprint 2 | Backend agent + prompt preview |
| **Colorist** | 🆕 Sprint 3 | FFMPEG LUT implementation |
| **MixingEngineer** | 🆕 Sprint 3 | FFMPEG audio stream merge |
| **Previsualizer** | 🆕 Sprint 3 | Veo 3.0 image→video pipeline |
| *(Full E2E run)* | 🆕 Sprint 3 | All 14 agents operational |

**Screenplay analysis system** (38 sessions, Phases 2–22) is feature-complete. Dev team's role here is stabilization, gstack integration, and unresolved edge cases only.

---

## 2. Tech Stack

| Layer | Technology | Version | Role |
|-------|-----------|---------|------|
| Runtime | Bun | latest | All runtimes |
| Language | TypeScript | ^5.9.3 strict | All code |
| Frontend | Next.js | ^15.3.0 | `apps/web` dashboard |
| Frontend | Next.js | 16.2.0 | `apps/scenario-web` |
| UI | React | ^19.0.0 | Both frontend apps |
| Styling | TailwindCSS | ^4.0.0 | Utility-first |
| Charts | Recharts | ^3.8.0 | Data visualization |
| Backend | Elysia | latest | `apps/scenario-api`, `apps/finance-api` |
| Backend | Hono | ^4.7.0 | `apps/api` gateway |
| Database | PostgreSQL | 15+ | All persisted data |
| ORM | Prisma | 6.19.2 | All DB access |
| E2E Testing | Playwright | ^1.58.2 | Full-stack test suite |
| Dev Tools | gstack | 0.11.10.0 | QA, CI/CD, monitoring (Tier-1) |
| LLM (primary) | Gemini Free | — | Provider chain head |
| LLM (fallback) | Ollama → HuggingFace → Groq | — | Free-tier chain |
| LLM (credit limit) | Anthropic Claude | — | Chain tail only |

**Blocked:** OpenAI, DeepSeek, any paid provider API calls in source code.

---

## 3. Team — Roles and Assignment

| Agent | ID | Scope |
|-------|----|-------|
| Dev Team Lead | `579327be` | Sprint planning, PR review, cross-team coordination, blocker escalation |
| Frontend Developer | `855adf1c` | Next.js 15 UI, React 19 components, API wiring, gstack /qa sign-off |
| Backend Developer | `85ee4109` | Elysia/Hono APIs, AI agent implementation, provider chain, DB schema |
| DevOps Engineer | `e54ec358` | CI/CD (GitHub Actions), Docker, gstack /ship + /canary, monitoring |
| QA Engineer | `42d4c1fb` | Test plans, Playwright E2E, gstack /qa + /review, release sign-off |

**RACI shorthand used in task tables:** R = Responsible, A = Accountable, C = Consulted, I = Informed

---

## 4. Sprint Schedule

### Sprint Overview

| Sprint | Dates | Theme | Production Unlock |
|--------|-------|-------|-------------------|
| **S1** | Mar 29 – Apr 4 | Foundation: Free LLM + Dashboard API | Analysis dashboard live, no mock data |
| **S2** | Apr 5 – Apr 11 | Agent Pipeline Phase 1 (3 agents) | CastingDirector, LocationScout, Cinematographer |
| **S3** | Apr 12 – Apr 18 | Agent Pipeline Phase 2 + E2E | Full 14-agent run, Colorist/Mixer/Previs |
| **S4** | Apr 19 – Apr 25 | CI/CD + Production Readiness | Automated deploy, security audit, perf gates |
| **S5** | Apr 26 – May 2 | Beta Launch | 50 users onboarded, live monitoring |

---

### Sprint 1 — Foundation: Free LLM Swap + Dashboard API Wiring
**Dates:** 2026-03-29 → 2026-04-04
**Production milestone:** Analysis dashboard fully functional with live data (no localStorage, no mocks)

#### Goals
1. Remove all OpenAI/DeepSeek references from source — enforce free provider chain
2. Wire React dashboard to real API (replace all mock/localStorage data sources)
3. Establish gstack in workspace (health check, /browse live)
4. Set baseline for test coverage and CI skeleton

#### Task Breakdown

| # | Task | Owner | Priority | Dependencies |
|---|------|-------|----------|-------------|
| 1.1 | Remove OpenAI/DeepSeek imports across all packages | Backend Dev | P0 | — |
| 1.2 | Implement Gemini Free → Ollama → HuggingFace → Groq → Anthropic fallback chain | Backend Dev | P0 | 1.1 |
| 1.3 | Write provider chain unit tests (chain order, fallback behavior) | QA | P0 | 1.2 |
| 1.4 | Wire `apps/web` dashboard to `apps/api` (replace localStorage/mock) | Frontend Dev | P0 | — |
| 1.5 | `/analyze` endpoint contract verification — align API response schema with dashboard components | Frontend Dev + Backend Dev | P0 | — |
| 1.6 | Replace mock report history with `GET /reports` paginated call | Frontend Dev | P1 | 1.5 |
| 1.7 | Wire draft comparison (`POST /compare`) to `DraftComparison.tsx` | Frontend Dev | P1 | 1.5 |
| 1.8 | `gstack setup` in `production_pipeline/` workspace + `$B health` verification | DevOps | P1 | — |
| 1.9 | gstack `/qa` run on `apps/web` dashboard — log all failures | QA | P1 | 1.4, 1.8 |
| 1.10 | Fix P0 bugs surfaced by gstack /qa | Frontend Dev | P1 | 1.9 |
| 1.11 | Add gstack binary path to `.github/` CI skeleton (Docker image stub) | DevOps | P2 | 1.8 |
| 1.12 | Document API contracts in `docs/api/` for all current endpoints | Backend Dev | P2 | 1.5 |

#### QA Gate — Sprint 1
- [ ] Zero OpenAI/DeepSeek API calls in `grep -r "openai\|deepseek" packages/ apps/`
- [ ] Dashboard loads live analysis data end-to-end (upload → analyze → view report)
- [ ] gstack `/qa` passes with no P0 UI failures on `apps/web`
- [ ] Provider fallback chain: all 5 providers return valid response or graceful error in unit test

#### Production Impact
Unlocks: Analysis team can run screenplay analyses from dashboard without manual API calls. Real data populates all panels (Emotion, Character, ROI, Production, Narrative).

---

### Sprint 2 — Agent Pipeline Phase 1: CastingDirector, LocationScout, Cinematographer
**Dates:** 2026-04-05 → 2026-04-11
**Production milestone:** Production team can generate character sheets, location environments, and refined camera prompts inside the pipeline

#### Goals
1. Implement 3 new production agents with free LLM providers
2. Build corresponding UI panels for agent outputs (character sheets, location gallery, prompt preview)
3. First GitHub Actions CI run with gstack /review gate

#### Task Breakdown

| # | Task | Owner | Priority | Dependencies |
|---|------|-------|----------|-------------|
| 2.1 | Implement `CastingDirector` agent (Gemini Flash Image → character consistency sheets) | Backend Dev | P0 | Sprint 1 provider chain |
| 2.2 | Implement `LocationScout` agent (Gemini Flash Image → environment art per scene) | Backend Dev | P0 | Sprint 1 provider chain |
| 2.3 | Implement `Cinematographer` agent (Gemini Free text → camera/lens prompt refinement) | Backend Dev | P0 | Sprint 1 provider chain |
| 2.4 | Define agent output schemas (TypeScript interfaces in `@marionette/agents`) | Backend Dev | P0 | — |
| 2.5 | `CharacterSheetPanel.tsx` — display cast character images, consistency scores | Frontend Dev | P0 | 2.4 |
| 2.6 | `LocationGallery.tsx` — grid display of generated location art per scene | Frontend Dev | P0 | 2.4 |
| 2.7 | `PromptPreview.tsx` — Cinematographer refined prompts with diff vs. original | Frontend Dev | P1 | 2.4 |
| 2.8 | Add agent output routes to `apps/api`: `GET /agent/:type/output/:runId` | Backend Dev | P1 | 2.1–2.3 |
| 2.9 | GitHub Actions CI: lint + typecheck + unit tests on PR (Bun test runner) | DevOps | P0 | — |
| 2.10 | Add gstack `/review` as required CI check on PRs | DevOps | P1 | 1.8, 2.9 |
| 2.11 | Write Playwright E2E for each new UI panel (happy path + empty state) | QA | P1 | 2.5–2.7 |
| 2.12 | gstack `/qa` on new panels + `/design-review` on character sheet UI | QA | P1 | 2.5–2.7, 1.8 |
| 2.13 | Fix P0/P1 issues from QA sweep | Frontend Dev | P1 | 2.12 |
| 2.14 | Production review: CastingDirector output quality evaluation (sample 3 scripts) | Dev Team Lead + CTO | P0 | 2.1–2.3 |

#### QA Gate — Sprint 2
- [ ] All 3 new agents return structured output within 30s per script scene
- [ ] Agent outputs stored in DB via repository pattern (not in-memory)
- [ ] New UI panels pass gstack `/qa` with no P0/P1 failures
- [ ] GitHub Actions CI green on `main` branch
- [ ] Production team sign-off on character sheet and location art quality

#### Production Impact
Unlocks: Production team can now run CastingDirector and LocationScout for any script scene via the dashboard. Cinematographer agent refines all downstream Veo 3.0 prompts.

---

### Sprint 3 — Agent Pipeline Phase 2 + Full 14-Agent E2E
**Dates:** 2026-04-12 → 2026-04-18
**Production milestone:** Complete 14-agent pipeline runs end-to-end on Scene S#1–S#15. First full film segment producible.

#### Goals
1. Implement Colorist, MixingEngineer, Previsualizer
2. Add real-time pipeline progress to dashboard (WebSocket, per-agent status)
3. Full E2E pipeline test across all 14 agents
4. gstack /cso security audit

#### Task Breakdown

| # | Task | Owner | Priority | Dependencies |
|---|------|-------|----------|-------------|
| 3.1 | Implement `Colorist` agent (FFMPEG LUT color grading, per-scene tone) | Backend Dev | P0 | Sprint 2 agents |
| 3.2 | Implement `MixingEngineer` agent (FFMPEG audio stream merge, SFX + dialogue + BGM) | Backend Dev | P0 | Sprint 2 agents |
| 3.3 | Implement `Previsualizer` agent (Veo 3.0 image→video, low-res camera blocking preview) | Backend Dev | P0 | Sprint 2 agents |
| 3.4 | WebSocket endpoint `ws://api/pipeline/:runId/progress` — per-agent status events | Backend Dev | P0 | — |
| 3.5 | `PipelineProgressBar.tsx` — 14-agent live status (idle/running/complete/error per agent) | Frontend Dev | P0 | 3.4 |
| 3.6 | `VideoPlayer.tsx` — inline preview for Previsualizer + MasterEditor output clips | Frontend Dev | P0 | 3.3 |
| 3.7 | `AudioWaveform.tsx` — MixingEngineer output preview with waveform visualization | Frontend Dev | P1 | 3.2 |
| 3.8 | Full 14-agent E2E pipeline run: S#1–S#5 scenes, validate each agent output | Backend Dev + QA | P0 | 3.1–3.3 |
| 3.9 | Playwright E2E: full dashboard flow from upload → pipeline run → video output | QA | P0 | 3.5–3.6 |
| 3.10 | gstack `/cso` OWASP security audit on `apps/api` + `apps/scenario-api` | QA + DevOps | P0 | — |
| 3.11 | Fix all P0/P1 findings from `/cso` audit | Backend Dev + DevOps | P0 | 3.10 |
| 3.12 | gstack `/benchmark` baseline: `apps/web` Core Web Vitals (LCP, FID, CLS) | Frontend Dev | P1 | — |
| 3.13 | Fix P0 performance regressions from benchmark (LCP > 3s, CLS > 0.1) | Frontend Dev | P1 | 3.12 |
| 3.14 | Production team review: full pipeline output for Scene S#1 (all 14 agents) | Dev Team Lead + CTO | P0 | 3.8 |

#### QA Gate — Sprint 3
- [ ] All 14 agents execute without error on S#1–S#5 test scenes
- [ ] Pipeline progress WebSocket delivers status within 500ms of each agent completion
- [ ] Video player streams Previsualizer output in-browser without download
- [ ] gstack `/cso` — zero critical (P0) OWASP findings in production
- [ ] `apps/web` Core Web Vitals: LCP ≤ 3.0s, CLS ≤ 0.1, FID ≤ 100ms
- [ ] Production team signs off: full scene output acceptable quality

#### Production Impact
Unlocks: Production team can run any screenplay scene through the full 14-agent pipeline, preview results in browser, and download colored + mixed video segments.

---

### Sprint 4 — CI/CD + Production Readiness
**Dates:** 2026-04-19 → 2026-04-25
**Production milestone:** Every code change auto-tested and deployed. Monitoring live in production. No manual deploy steps.

#### Goals
1. Full CI/CD pipeline via gstack `/ship` and `/canary`
2. Docker production images for all services
3. Performance regression detection baked into CI
4. Regression test suite for screenplay analysis system (Phases 2–22 coverage)

#### Task Breakdown

| # | Task | Owner | Priority | Dependencies |
|---|------|-------|----------|-------------|
| 4.1 | Configure gstack `/ship` for `production_pipeline` repo (VERSION + CHANGELOG + push + deploy) | DevOps | P0 | Sprint 3 CI base |
| 4.2 | Write `Dockerfile` for `apps/api`, `apps/scenario-api`, `apps/finance-api` | DevOps | P0 | — |
| 4.3 | Write `Dockerfile` for `apps/web`, `apps/scenario-web` (Next.js standalone output) | DevOps | P0 | — |
| 4.4 | `docker-compose.prod.yml` — all services + PostgreSQL + health checks | DevOps | P0 | 4.2–4.3 |
| 4.5 | GitHub Actions: `deploy.yml` — build images, push registry, trigger deploy on `main` push | DevOps | P0 | 4.1–4.4 |
| 4.6 | Configure gstack `/canary` post-deploy: console error watch + perf regression alerts | DevOps + QA | P0 | 4.1 |
| 4.7 | Playwright regression suite for screenplay analysis (Phases 2–22 critical paths) | QA | P0 | — |
| 4.8 | Add gstack `/benchmark` as CI check — fail PR if Core Web Vitals regress >10% | DevOps + Frontend Dev | P1 | 3.12 |
| 4.9 | Add gstack `/review` pre-merge gate to `main` branch PR requirements | DevOps | P1 | Sprint 2 CI |
| 4.10 | Prisma migration strategy: `migrate deploy` in CI before app start | Backend Dev + DevOps | P1 | — |
| 4.11 | Environment config: `.env.production` template, secrets management via CI env vars | DevOps | P1 | — |
| 4.12 | Korean character extraction edge case fixes (suffix merge, prefix strip) | Backend Dev | P1 | Session 38 known issues |
| 4.13 | PDF print CSS: fix production/VFX section height truncation in `apps/web` | Frontend Dev | P1 | Session 38 known issues |
| 4.14 | Gemini model chain reorder (low-tier → high-tier within free quota) | Backend Dev | P2 | — |
| 4.15 | Load test: 10 concurrent analysis requests, measure queue behavior | QA | P2 | 4.4 |

#### QA Gate — Sprint 4
- [ ] `gstack /ship` completes without error on `production_pipeline` repo
- [ ] `gstack /canary` — green on production after deploy (no console errors, no perf regression)
- [ ] Playwright regression suite: ≥ 80% pass rate across Phase 2–22 critical paths
- [ ] Zero P0 deployment failures in CI/CD run log
- [ ] Load test: 10 concurrent requests complete within 60s, no OOM errors

#### Production Impact
Unlocks: Production team can request new features and see them deployed within hours. No manual deploy ceremonies. Monitoring alerts team if production breaks.

---

### Sprint 5 — Beta Launch
**Dates:** 2026-04-26 → 2026-05-02
**Production milestone:** 50 beta users onboarded. Live product accessible, monitored, and accepting screenplay uploads.

#### Goals
1. User authentication and session management
2. Credits/quota system for free-tier LLM usage
3. Landing page launch-ready (conversion-optimized)
4. Onboarding flow (first-time user → first analysis)

#### Task Breakdown

| # | Task | Owner | Priority | Dependencies |
|---|------|-------|----------|-------------|
| 5.1 | Auth strategy decision: OAuth2 (Google/GitHub) vs JWT — approved by CTO | Dev Team Lead | P0 | — |
| 5.2 | Implement auth middleware in `apps/api` (JWT verify, session store) | Backend Dev | P0 | 5.1 |
| 5.3 | Login/signup pages + OAuth callback routes in `apps/web` | Frontend Dev | P0 | 5.2 |
| 5.4 | `UserProfile` schema + Prisma migration (id, email, createdAt, usageQuota) | Backend Dev | P0 | 5.1 |
| 5.5 | Usage quota middleware: count analyses per user per month, enforce free limit | Backend Dev | P1 | 5.4 |
| 5.6 | Quota status indicator in dashboard header (X analyses remaining) | Frontend Dev | P1 | 5.5 |
| 5.7 | Landing page: gstack `/design-consultation` audit + conversion copy review | Frontend Dev + CTO | P0 | — |
| 5.8 | Onboarding flow: 3-step wizard (upload sample script → analyze → view report) | Frontend Dev | P0 | — |
| 5.9 | Beta invite system: invite code gate on signup | Backend Dev | P1 | 5.2 |
| 5.10 | gstack `/qa` full-flow test: signup → upload → analyze → view → export PDF | QA | P0 | 5.3, 5.8 |
| 5.11 | gstack `/design-review` on landing page + onboarding flow | QA | P1 | 5.7–5.8 |
| 5.12 | Fix all P0/P1 findings from 5.10–5.11 | Frontend Dev | P0 | 5.10–5.11 |
| 5.13 | Set up error tracking (e.g., Sentry free tier) — surfaced via gstack /canary | DevOps | P1 | — |
| 5.14 | Beta user documentation: `docs/beta-guide.md` (upload formats, analysis fields) | Dev Team Lead | P2 | — |
| 5.15 | Launch: `gstack /ship` → production deploy → gstack /canary green → announce | DevOps | P0 | All above |

#### QA Gate — Sprint 5
- [ ] New user signup → first analysis complete in < 5 minutes (no friction)
- [ ] gstack `/qa` full signup-to-report flow passes with no P0/P1 issues
- [ ] gstack `/canary` green 30 minutes post-launch
- [ ] 50 beta invite codes issued and accepted
- [ ] Zero auth security P0 findings (gstack `/cso` on auth endpoints)

#### Production Impact
Unlocks: External users can experience the full screenplay analysis pipeline. Feedback loop begins for production quality refinement.

---

## 5. gstack Integration Roadmap — Next.js 15

### Why Next.js 15 + gstack

`apps/web` runs Next.js 15.3.0 with Turbopack. gstack's headless Chromium daemon runs against the app on localhost — no build-time instrumentation required. The ref-system (`@e1`, `@e2`) resolves via ARIA tree, making it framework-agnostic and fully compatible with React 19's concurrent rendering.

### Integration Points by Sprint

| Sprint | gstack Skill | Target | What It Validates |
|--------|-------------|--------|-------------------|
| S1 | `/qa` | `apps/web` dashboard | All panels render, upload flow works, no console errors |
| S1 | `/browse` | `apps/web` | Interactive exploration for debugging |
| S2 | `/qa` | New agent UI panels | CharacterSheet, LocationGallery, PromptPreview render correctly |
| S2 | `/design-review` | Character sheet panel | Visual hierarchy, spacing, dark mode consistency |
| S2 | `/review` | Agent implementation PRs | Logic, SQL safety, LLM trust boundary checks |
| S3 | `/benchmark` | `apps/web` | Core Web Vitals baseline (LCP, FID, CLS) |
| S3 | `/cso` | `apps/api`, `apps/scenario-api` | OWASP Top 10, STRIDE model |
| S4 | `/ship` | `production_pipeline` | VERSION bump + CHANGELOG + push + deploy |
| S4 | `/canary` | Production | Console errors, perf regression, page load regressions |
| S4 | `/benchmark` | CI gate | Fail PR if Core Web Vitals regress > 10% |
| S5 | `/design-review` | Landing page + onboarding | Conversion design quality, UI polish |
| S5 | `/qa` | Full auth + analysis flow | Signup → analyze → export PDF |

### Next.js 15 Specific Considerations

| Area | Consideration | Action |
|------|--------------|--------|
| Turbopack | Default dev server in 15.3.0 — gstack targets `localhost:3000` | No change needed; `/browse $B navigate http://localhost:3000` works |
| React 19 | Concurrent rendering — Suspense boundaries must complete before gstack ref extraction | Ensure loading states resolve before `/qa` interacts with elements |
| Server Actions | Any `use server` actions need API contract parity with Hono gateway | Backend Dev to document all server action endpoints in Sprint 1 |
| `apps/scenario-web` (16.2.0) | Ahead of `apps/web` — use as reference for upgrade path | Not blocking; upgrade `apps/web` post-beta if needed |
| PDF export | `@media print` CSS — gstack `/benchmark` does not cover print; manual QA required | QA Engineer to test PDF export in Sprint 4 regression suite |

---

## 6. QA Checkpoints — Synced with Production Reviews

```
Sprint 1 End (Apr 4)
├── DEV QA:   gstack /qa on dashboard, provider chain unit tests
└── PROD REVIEW: Analysis team confirms live data in all dashboard panels

Sprint 2 End (Apr 11)
├── DEV QA:   gstack /qa + /design-review on agent UI panels, CI green
└── PROD REVIEW: Production team evaluates CastingDirector + LocationScout output quality
                  → If quality insufficient: Backend Dev revises agent prompts before Sprint 3

Sprint 3 End (Apr 18)
├── DEV QA:   gstack /cso security audit, full 14-agent E2E, Playwright suite
└── PROD REVIEW: Production team reviews full Scene S#1 pipeline output (video + audio + color)
                  → GATE: No Sprint 4 CI/CD work begins until production team signs off on S#1

Sprint 4 End (Apr 25)
├── DEV QA:   Playwright regression suite (≥80%), /benchmark CI gate, /canary live
└── PROD REVIEW: CTO + Dev Team Lead review deploy pipeline, load test results, monitoring
                  → Sign-off required before beta invites sent

Sprint 5 (May 2) — LAUNCH
├── DEV QA:   gstack /qa full auth flow, /design-review landing, /canary post-launch
└── PROD REVIEW: 50 beta users onboarded, first production screenplay analyses reviewed live
```

### QA Escalation Rules

| Finding Severity | Definition | Response |
|-----------------|------------|----------|
| **P0 — Critical** | Feature unusable, data loss, security breach, build broken | Stop sprint, fix before any other work |
| **P1 — High** | Feature degraded, visible error to user, perf > 3× baseline | Fix within current sprint, cannot ship |
| **P2 — Medium** | Visual issue, minor UX friction, non-critical warning | Fix before beta launch (Sprint 5) |
| **P3 — Low** | Polish, cosmetic, enhancement | Backlog, schedule next available sprint |

---

## 7. Dependency Map — Production ↔ Dev

```
PRODUCTION PIPELINE                      DEV TEAM DELIVERABLE
──────────────────────────────────────────────────────────────
CastingDirector needs:          ←──── Backend: agent impl + API (Sprint 2)
                                ←──── Frontend: CharacterSheetPanel (Sprint 2)
                                ←──── QA: /qa + E2E test (Sprint 2)

LocationScout needs:            ←──── Backend: agent impl + API (Sprint 2)
                                ←──── Frontend: LocationGallery (Sprint 2)

Cinematographer needs:          ←──── Backend: agent impl (Sprint 2)
                                ←──── Frontend: PromptPreview (Sprint 2)

Full E2E pipeline needs:        ←──── Backend: Colorist + Mixer + Previs (Sprint 3)
                                ←──── Frontend: PipelineProgressBar (Sprint 3)
                                ←──── DevOps: Docker compose all services (Sprint 4)

Production team monitoring:     ←──── DevOps: gstack /canary (Sprint 4)
                                ←──── DevOps: Sentry error tracking (Sprint 5)

Beta users need:                ←──── Backend: Auth + quota (Sprint 5)
                                ←──── Frontend: Login + onboarding (Sprint 5)
                                ←──── DevOps: Production deploy (Sprint 5)
```

---

## 8. Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Gemini Free rate limits hit during E2E pipeline run | High | P1 | Implement request queue + Ollama fallback for batch runs |
| Veo 3.0 API changes (Previsualizer) | Medium | P0 | Pin Veo API version, add mock mode for CI |
| Korean character extraction regression (suffix/prefix issues) | Medium | P2 | Deterministic test suite against ground-truth scripts (Sprint 4) |
| gstack /cso finds auth vulnerability in Sprint 3 | Low | P0 | Full auth re-architecture if needed; delay Sprint 5 |
| Next.js 15/React 19 Suspense edge case in gstack ref extraction | Low | P1 | Add loading-complete signal before /qa runs |
| WebSocket scaling (many concurrent pipeline runs) | Low | P2 | Connection pool limit + queue depth monitoring from Sprint 4 |

---

## 9. Definition of Done (Per Task)

A task is **Done** when:
1. Code is merged to `main` via PR
2. gstack `/review` passes on the PR diff
3. Relevant unit tests added and passing (`bun test`)
4. If UI: gstack `/qa` passes with no P0/P1 findings
5. API contract documented in `docs/api/` if new endpoint added
6. Dev Team Lead has reviewed and approved PR

A sprint is **Done** when:
1. All P0 tasks complete
2. QA Gate checklist signed off by QA Engineer
3. Production review sign-off received from CTO
4. `gstack /ship` (or sprint-equivalent deploy) executed successfully

---

## 10. Schedule Summary

```
Week 1  Mar 29–Apr 4   S1: Free LLM swap · Dashboard API wired · gstack setup
Week 2  Apr 5–Apr 11   S2: 3 new production agents · CI green · Agent UI panels
Week 3  Apr 12–Apr 18  S3: 3 more agents · Full 14-agent E2E · Security audit · Perf baseline
Week 4  Apr 19–Apr 25  S4: Docker + /ship CI/CD · /canary live · Regression suite
Week 5  Apr 26–May 2   S5: Auth · Beta launch · 50 users · /canary green
```

---

*Development Execution Plan · Marionette Studios (MAR) · 2026-03-29 · CTO*
