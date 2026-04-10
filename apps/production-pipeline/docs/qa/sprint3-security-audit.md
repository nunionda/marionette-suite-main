# Sprint 3 — Security Audit (OWASP Top 10)

**Date:** 2026-03-31
**Auditor:** DevOps/QA (CTO direct)
**Branch:** main

---

## Findings

| ID | OWASP | Severity | Finding | File |
|----|-------|----------|---------|------|
| SEC-001 | A02 | **P1** | `password123` hardcoded in reset-password.ts | `packages/db/reset-password.ts:5` |
| SEC-002 | A01 | P2 | All localhost ports allowed in CORS (dev convenience, risk in prod) | `apps/api/src/index.ts` |
| SEC-003 | A09 | P2 | No rate limiting on `/api/auth` login endpoint | `apps/api/src/routes/auth.ts` |
| SEC-004 | A05 | P3 | `console.error` logs include raw error objects — may leak stack in prod | `apps/api/src/routes/screenplay.ts` |

**Clean (no issues found):**
- A03 Injection: All DB queries via Prisma ORM (parameterized). No raw SQL in application code. `$queryRaw` in generated Prisma client is Prisma internals — not application usage.
- A02 Secrets: No hardcoded API keys in application code (only env vars via `process.env`).
- Auth guard: `authGuard` middleware applied at `/api/*` level, with explicit exclusions for `/api/auth` and `/api/health` only.

---

## Action Items

| ID | Action | Owner | Sprint |
|----|--------|-------|--------|
| SEC-001 | Remove/replace hardcoded password in reset-password.ts — use env var | Backend Dev | S3 |
| SEC-002 | Lock CORS to `WEB_ORIGIN` only in production (keep localhost for dev) | DevOps | S4 |
| SEC-003 | Add rate limiting middleware on `/api/auth` (e.g., 10 req/min per IP) | Backend Dev | S4 |
| SEC-004 | Sanitize error objects before logging in production | Backend Dev | S4 |

**Gate verdict:** ✅ No P0 issues. 1 P1 (SEC-001) — fix before Sprint 4.

---

*Security Audit · Marionette Studios · 2026-03-31*
