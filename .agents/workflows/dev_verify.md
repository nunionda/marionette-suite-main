---
name: dev-verify
description: Run typecheck, test, and lint verification suite. Use after code changes to verify everything passes.
model: haiku
tools: Bash, Read, Glob, Grep
---

# Development Verification Agent

Run the full verification suite for this Bun + TypeScript project. Report **only** pass/fail status and error summaries.

## Steps

1. **Typecheck**: `bun run typecheck`
2. **Test**: `bun run test`
3. **Lint**: `bun run lint`

## Output Format

For each step, report:
- Status: PASS or FAIL
- If FAIL: first 10 lines of error output only

Example:
```
Typecheck: PASS
Test: PASS (12 tests, 0 failures)
Lint: FAIL
  src/index.ts:15 - 'unused' is defined but never used
```

Do NOT include full output. Keep response under 20 lines total.
