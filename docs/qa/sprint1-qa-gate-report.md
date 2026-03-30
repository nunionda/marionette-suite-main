# Sprint 1 QA Gate Report

- **Date**: 2026-03-31
- **QA Engineer**: Claude (QA Agent)
- **Branch**: main (`d96d363`)

---

## Check 1 — OpenAI/DeepSeek Removal

**Status**: ⚠️ PARTIAL

**Expected**: 0 files referencing OpenAI or DeepSeek.

**Actual output** (2 files found):

```
packages/scenario-core/package.json          — "openai": "^6.32.0" listed as dependency
packages/scenario-core/src/creative/infrastructure/llm/GroqProvider.ts
  line 1:  import OpenAI from 'openai';
  line 22: baseURL: 'https://api.groq.com/openai/v1',
```

**Notes**: The `openai` npm package is used by `GroqProvider` as a client SDK to talk to the Groq API (which exposes an OpenAI-compatible endpoint at `api.groq.com/openai/v1`). This is not a direct OpenAI API call — it's Groq using the OpenAI client library for compatibility. No DeepSeek references found. However, the `openai` package remains as a dependency when it could potentially be replaced with a generic HTTP client.

---

## Check 2 — Provider Chain Tests

**Status**: ✅ PASS

```
16 pass
0 fail
35 expect() calls
Ran 16 tests across 1 file. [378.00ms]
```

All fallback chain tests pass, including cascading failure scenarios and API key missing scenarios.

---

## Check 3 — TypeScript Typecheck

**Status**: ❌ FAIL

**Failing packages** (4 of 8):

| Package | Error Count | Summary |
|---------|-------------|---------|
| `@marionette/ai-gateway` | 1 | `OpenAIProvider` export missing from `providers/index.js` |
| `@marionette/gate-review` | ~30+ | `Object is possibly 'undefined'` and type mismatches in scenario-core application layer (BeatSheetGenerator, CharacterAnalyzer, EmotionAnalyzer, NarrativeArcClassifier) |
| `@marionette/web` | ~15+ | `Object is possibly 'undefined'` in `screenplay/page.tsx`, type mismatches |
| `@marionette/api` | 9 | `Record<string, unknown>` not assignable to Prisma `InputJsonValue` in `screenplay.ts`; stale `OpenAIProvider` import |
| `@marionette/agents` | 1 | Same `OpenAIProvider` import error from ai-gateway |

**Passing packages**: `@marionette/shared`, `@marionette/db`

**Key issues**:
1. **P0** — `ai-gateway` still exports/imports `OpenAIProvider` which was removed. Cascades to `@marionette/agents` and `@marionette/api`.
2. **P1** — scenario-core application layer has numerous strict-mode type errors (`undefined` checks, type shape mismatches).
3. **P1** — `screenplay/page.tsx` has ~15 type errors blocking web build.
4. **P2** — `screenplay.ts` API route has Prisma JSON type mismatches.

---

## Check 4 — Web App Build & Lint

**Status**: ❌ FAIL (build) / ✅ PASS (lint)

**Build result**: Failed — `next build` exits with code 1.
```
./app/(dashboard)/projects/[id]/screenplay/page.tsx:141:21
Type error: Object is possibly 'undefined'.
```

**Lint result**: Clean — no ESLint warnings or errors.

---

## Check 5 — API Contract Verification

**Status**: ✅ PASS

All 4 priority endpoints from `docs/api/contracts.md` are implemented:

| Endpoint | Found | Location |
|----------|-------|----------|
| `POST /analyze` | ✅ Yes | `apps/scenario-api/src/index.ts:328` |
| `GET /report/:id` | ✅ Yes | `apps/scenario-api/src/index.ts:492` |
| `GET /reports` | ✅ Yes | `apps/scenario-api/src/index.ts:498` |
| `POST /compare` | ✅ Yes | `apps/scenario-api/src/index.ts:750` |

---

## Check 6 — Dashboard API Wiring

**Status**: ✅ PASS

```
grep -r 'localStorage' apps/web/app/ apps/web/components/ --include='*.tsx' --include='*.ts'
→ NO MATCHES
```

All `localStorage` calls have been removed from the dashboard flow. API wiring is complete.

---

## Summary

| # | Check | Status |
|---|-------|--------|
| 1 | OpenAI/DeepSeek Removal | ⚠️ PARTIAL |
| 2 | Provider Chain Tests | ✅ PASS |
| 3 | TypeScript Typecheck | ❌ FAIL |
| 4 | Web App Build & Lint | ❌ FAIL (build) / ✅ PASS (lint) |
| 5 | API Contract Verification | ✅ PASS |
| 6 | Dashboard API Wiring | ✅ PASS |

---

## Bug List

| ID | Severity | Description | Files |
|----|----------|-------------|-------|
| BUG-001 | **P0** | `OpenAIProvider` still referenced in ai-gateway exports — cascades to agents and api packages | `packages/ai-gateway/src/index.ts`, `packages/ai-gateway/src/providers/index.ts` |
| BUG-002 | **P1** | scenario-core application layer has ~30+ strict TypeScript errors (undefined checks, type shape mismatches) | `packages/scenario-core/src/creative/application/*.ts` |
| BUG-003 | **P1** | `screenplay/page.tsx` has ~15 type errors, blocks web production build | `apps/web/app/(dashboard)/projects/[id]/screenplay/page.tsx` |
| BUG-004 | **P2** | Prisma `InputJsonValue` type mismatches in screenplay API routes | `apps/api/src/routes/screenplay.ts` |
| BUG-005 | **P2** | `openai` npm package still in scenario-core dependencies (used by GroqProvider as compatible client — low risk but should be documented or replaced) | `packages/scenario-core/package.json` |

---

## Gate Verdict

### ❌ FAIL

**Reason**: P0 issue BUG-001 is open — `OpenAIProvider` export reference breaks typecheck across 3 packages. Additionally, 2 P1 issues block the web production build.

**Required for gate pass**:
1. Fix BUG-001: Remove `OpenAIProvider` from ai-gateway exports/re-exports
2. Fix BUG-002: Add undefined guards in scenario-core application layer
3. Fix BUG-003: Fix type errors in screenplay/page.tsx to unblock web build

---

**Sign-off**: Sprint 1 QA Gate reviewed by QA Agent on 2026-03-31. Gate status: **FAIL** — 1 P0, 2 P1, 2 P2 issues open.
