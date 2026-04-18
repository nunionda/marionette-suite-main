# ⚠️ DEPRECATED

This package is a legacy fork of the scenario analysis engine.

**Canonical source**: `@marionette/analysis-core` (in `/packages/analysis-core`).

## Migration Plan

| Step | Status |
|---|---|
| Document deprecation | ✅ (this file) |
| Audit consumers | ⏳ pending |
| Replace imports one-by-one | ⏳ pending |
| Delete this package | ⏳ pending |

## Why not delete now?

- Multiple routes in `apps/contents-studio/apps/scenario-api` and `apps/scenario-web` still import from here.
- Migration is Sprint 3b work: audit → replace → test → delete.
- Deleting now would break `/scenario` routes.

## Consumers (grep baseline)

Run from suite root to refresh:

```bash
grep -rln "from.*scenario-core" apps/contents-studio/ --include="*.ts" --include="*.tsx"
```

## Next Step

Audit each consumer, confirm `@marionette/analysis-core` exposes equivalent API, then replace and delete.
