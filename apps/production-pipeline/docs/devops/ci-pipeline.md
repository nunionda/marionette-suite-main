# CI Pipeline

## Overview

GitHub Actions CI runs on every push to `main` and on pull requests targeting `main`.

## Jobs

| Job | Depends on | What it does |
|-----|-----------|--------------|
| **typecheck** | — | `bun run typecheck` across all workspace packages via `--filter '*'` |
| **test** | typecheck | `bun run test` across all workspace packages |
| **lint** | typecheck | `eslint .` on the full repo |

**Fail-fast**: test and lint only run after typecheck passes (`needs: typecheck`). If types are broken, CI fails immediately without wasting time on tests or lint.

## Caching

Bun's install cache (`~/.bun/install/cache`) is cached using `actions/cache@v4` keyed on `bun.lock` hash. This avoids re-downloading dependencies on every run.

## PR Quality Gate

A pull request template (`.github/PULL_REQUEST_TEMPLATE.md`) enforces a checklist:
- Typecheck, test, lint must pass
- No paid LLM provider imports (openai, deepseek)
- Sprint gate question: "Does this PR support production? Not block it?"

## Provider Policy

CI does not call any LLM APIs. All provider-dependent tests use mocks or the mock provider fallback. See `CLAUDE.md` for the full provider policy.
