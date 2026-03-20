# Scenario Analysis System

A comprehensive script intelligence system designed to ingest, analyze, and forecast the success of Hollywood screenplays using AI-native development and autoresearch paradigms.

## Development Track (Plans & Results)

- [**Plan: Phase 3 (Market Intelligence Predictor)**](./docs/plans/02-phase3-market-predictor.md)
- [**Plan: Phase 2 (Creative NLP Engine)**](./docs/plans/01-phase2-creative-nlp.md)

- [Result: Session 1 (Project Foundation) ](./docs/results/session-1-foundation.md) - Fountain parser, PDF integration, DDD.
- [Result: Session 2 (Infrastructure Scalability)](./docs/results/session-2-monorepo-infra.md) - Zod Env, Winston Logger, CI/CD, Next.js, Elysia Backend, PostgreSQL Docker.
- [Result: Session 3 (Automation Fixes)](./docs/results/session-3-ide-setup.md) - Universal IDE Setup Script, README guides, and Embedded Git repo fix.
- [Result: Session 4 (Market Data Integration)](./docs/results/session-4-market-data.md) - TMDB API Client, ROI math, BoxOfficeData Domain.
- [**Result: Session 5 (Beat Sheet & Multi-LLM)**](./docs/results/session-5-phase2-beat-sheet.md) - Multi-LLM Factory (OpenAI, Anthropic, Gemini) & Beat Sheet narrative generator.
- [**Result: Session 6 (Emotion Graph, Character Network, RAG)**](./docs/results/session-6-phase2-emotion-network.md) - Pinecone RAG setup, Determistic Character Line Parsing, Scene-by-scene emotional valence scoring.
- [**Result: Session 7 (Market Intelligence Predictor)**](./docs/results/session-7-phase3-predictor.md) - ROI Tier Forecasting, MPAA Rating Classification, and Comp Film Benchmarking.
- [**Result: Session 8 (Visualization Dashboard)**](./docs/results/session-8-phase4-dashboard.md) - Next.js Dashboard UI, Recharts Emotion Graph, and Elysia.js API Bridge.

## 🚀 Quick Setup (One-Click Initialization)

To perfectly setup this monorepo in any development environment (after cloning), run our automated initialization script on your terminal:

```bash
chmod +x scripts/setup-ide.sh
./scripts/setup-ide.sh
```

This script will automatically:
1. Verify and install all Bun Workspace dependencies.
2. Clone `.env.example` into a local `.env`.
3. Scaffold and start the local PostgreSQL database via Docker.
4. Auto-generate `.vscode/settings.json` for proper ESLint & TS integration.

## 🛠 IDE Specific Configurations

This project is optimized for AI-native and modern editors.

### 1. Cursor & VS Code
- **Setup:** The `setup-ide.sh` script automatically creates robust `.vscode/settings.json` files for format-on-save and ESLint auto-fixing.
- **Rules:** For Cursor, keep AI prompt context aware by mentioning `packages/core` for business logic, and `apps/web` for UI components.

### 2. Antigravity & Claude Code (AI Agents)
- **Shared Workflows:** Both agent platforms can securely read and execute the workflows stored in `.agents/workflows/`.
- **Command Setup:** At the end of your development session, type `/session-wrapup` in the Antigravity prompt or run `bun run session-wrapup` (if configured in package.json) to automatically summarize features, update documentation, and push code to the `develop` branch.
- **Tip:** When delegating tasks to agents, explicitly mention the target Monorepo workspace (e.g., "Implement a new route inside `apps/api` using Elysia").

## Architecture
See `Gemini.md` and `할리우드 시나리오 평가 시스템 구축.md` for full orchestration and system architecture details.
