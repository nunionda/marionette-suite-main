# Sprint 3 — Performance Baseline

**Date:** 2026-03-31
**Auditor:** DevOps/QA (CTO direct)

---

## Findings

| ID | Area | Severity | Finding | Recommendation |
|----|------|----------|---------|----------------|
| PERF-001 | Images | P2 | No raw `<img>` tags found — all images use Next.js `<Image>` or none | ✅ Good |
| PERF-002 | Client bundle | P2 | Project detail page has only 10 top-level imports — acceptable | ✅ Good |
| PERF-003 | Dynamic imports | P2 | No `dynamic()` or `React.lazy()` in use — heavy components load eagerly | Add `dynamic()` for PipelineProgressBar (WebSocket) + heavy panels in S4 |
| PERF-004 | WebSocket | P3 | PipelineProgressBar loads WS connection on page load even without active run | Gate WS connection on `runId !== null` |

## Baseline Targets (Sprint 4 CI gate)

| Metric | Target | Measure |
|--------|--------|---------|
| LCP | ≤ 3.0s | gstack /benchmark on /dashboard |
| CLS | ≤ 0.1 | gstack /benchmark |
| FID | ≤ 100ms | gstack /benchmark |
| Web build time | ≤ 60s | CI logs |
| Typecheck | 0 errors | CI — already enforced |

---

*Performance Baseline · Marionette Studios · 2026-03-31*
