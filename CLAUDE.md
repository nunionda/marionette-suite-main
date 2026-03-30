# Project overview

Bun + TypeScript demo project showcasing Boris Cherny's Claude Code workflow setup.

- **Runtime**: Bun (not Node.js)
- **Language**: TypeScript (strict mode)
- **Linter**: ESLint with @typescript-eslint
- **Test**: bun:test

## Project structure

```
.
├── index.test.ts          # Source + tests (bun:test)
├── package.json           # Scripts: typecheck, test, lint
├── tsconfig.json          # Strict TS, bundler mode, ESNext
├── .claude/
│   ├── settings.json      # Pre-allowed safe commands
│   └── commands/
│       └── commit-push-pr # Slash command for commit workflow
└── .agents/
    └── workflows/         # Subagent definitions
```

## Development workflow

**Always use `bun`, not `npm`.**

```sh
# 1. Make changes

# 2. Typecheck (fast)
bun run typecheck

# 3. Run tests (slow)
bun run test -- -t "test name"             # Single suite
bun run test:file -- "glob"                # Specific files

# 4. Lint before committing
bun run lint:file -- "file.ts"             # Specific files
bun run lint                               # All files

# 5. Before creating PR
bun run lint:claude && bun run test
```

## Coding conventions

- Use `import`/`export` (ES modules). Never use `require()`.
- Prefer `const` over `let`. Never use `var`.
- Use TypeScript strict types. Avoid `any`.
- Export functions directly from the file they're defined in.
- Tests live alongside source code (e.g., `index.test.ts`).

## Verification

After every change, Claude must verify its work:
1. `bun run typecheck` — must pass with zero errors
2. `bun run test` — all tests must pass
3. `bun run lint` — no lint errors before committing

## Scenario analysis workspace

Self-contained LLM-based screenplay analysis sub-system within the monorepo.

### Structure
- `packages/scenario-core` — Analysis engines (beat sheet, emotion, rating, ROI, coverage, VFX, trope)
- `packages/gate-review` — Gate Review pipeline (4-gate quality checkpoints, revision loop, writer scorecard)
- `packages/scenario-db` — Prisma client (separate DB: `SCENARIO_DATABASE_URL`)
- `apps/scenario-api` — Elysia server (port 4005)
- `apps/scenario-web` — Next.js dashboard (port 4000)
- `docs/scenario/` — 22 plans + 38 session results + architecture docs
- `scripts/gate-review/` — Pipeline runner CLI for gate reviews

### Running
```sh
bun run dev:scenario-api   # API server on :4005
bun run dev:scenario-web   # Web dashboard on :4000
```

### Provider chain (fallback order)
Gemini Free → Groq → Anthropic → Mock

### Note on TypeScript
Scenario packages have own tsconfig, excluded from root typecheck.

## Compact instructions

When compacting, preserve: current task context, file paths being modified, test/lint results, and architectural decisions. Discard: exploration output, verbose tool results, and intermediate search results.

## LLM API 비용 정책 (2026-03-29~)
- **유료 LLM API 사용 금지**: 유료 API 호출 코드 작성 금지 (단, Anthropic Claude API는 남은 크레딧 범위 내 사용 허용)
- **무료 모델만 사용**: Ollama 로컬 모델, HuggingFace 무료 모델, Google Gemini 무료 티어
- Provider fallback 체인: Gemini Free → Groq Free → Anthropic Claude (남은 크레딧 허용) → Mock

## CTO 팀 에이전트 디스패치 — Vagrant 샌드박스

팀 에이전트를 `--dangerously-skip-permissions`로 실행할 때는 반드시 Vagrant VM 안에서 실행한다.

```bash
# VM 시작 (최초 ~5분, suspend 재개 ~10초)
vagrant up && vagrant ssh

# VM 안에서 에이전트 디스패치
cd /agent-workspace
claude --dangerously-skip-permissions -p "You are the Backend Developer..."

# 세션 종료
exit && vagrant suspend
```

상세 템플릿 및 병렬 실행 가이드 → `docs/team-plans/cto-agent-dispatch-playbook.md`
**안전 규칙:** 에이전트 세션 전 항상 `git commit` (체크포인트). VM 파일 삭제 = 호스트 파일 삭제.
