# marionette-dev Archive Manifest
> Generated: 2026-04-19
> Status: Pre-merger standalone apps — superseded by marionette-suite monorepo
> Action: Retained at /Users/daniel/dev/claude-dev/marionette-dev/ (safe to delete after verification)

## Repos & GitHub Remotes

### cine-analysys-studio
- Remote: https://github.com/nunionda/scenario-analysys-system.git
- Branch: feat/free-llm-provider-swap
- Last commit: 40614b1 fix: remove stale deepseek/openai references from benchmark infrastructure

### cine-art-studio
- Status: No git repo (static files only)

### contents-studio
- Remote: https://github.com/nunionda/ai-contents-creator
- Branch: main
- Last commit: 8f97f91 fix: robust Gemini provider with model fallback and JSON cleanup

### multimodal-benchmark
- Remote: https://github.com/nunionda/multimodal-benchmark-2026
- Branch: main
- Last commit: b3a235e feat: complete Image & Video Leaderboard sub-page and fix data parity

### pipeline-management-studio
- Remote: https://github.com/nunionda/production-pipeline-system
- Branch: feat/team-directory
- Last commit: 5196204 feat: add team directory link to project dashboard quick actions

### script-studio
- Remote: no remote
- Branch: develop
- Last commit: f85ac53 Studio 레이아웃 최적화 (헤더/사이드바 짤림 및 줄바꿈 보정)

### storyboard-studio
- Remote: https://github.com/nunionda/storyboard-concept-maker.git
- Branch: main
- Last commit: c85a189 UI/UX improvements: shared CSS, mobile responsive, image states, nav fix

## Absorbed Into marionette-suite
| marionette-dev | marionette-suite equivalent |
|---|---|
| script-studio | apps/script-writer |
| pipeline-management-studio | apps/production-pipeline / packages/pipeline-core |
| cine-analysys-studio | apps/analysis-system |
| storyboard-studio | apps/storyboard-maker |
| contents-studio | apps/contents-studio (Sprint 11+ version) |
| cine-art-studio | packages/engine-cinema / packages/elements-core |
| multimodal-benchmark | apps/analysis-system/packages/* |
