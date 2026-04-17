# marionette-suite `/apps` 인벤토리

`marionette-suite` 모노레포의 `apps/` 하위 12개 디렉토리를 한 페이지로 정리한 문서.
외부 GitHub 4개 저장소를 통합한 결과물 + 자체 개발 앱 + 정적/문서/스텁이 섞여 있다.

마지막 업데이트: 2026-04-17

---

## 빠른 인덱스

| # | 앱 | 카테고리 | 포트 | 상태 |
|---|---|---|---|---|
| 1 | [`analysis-system`](#1-analysis-system) | 외부 통합 | (vite default :5173) | 🟡 6d |
| 2 | [`production-pipeline-system`](#2-production-pipeline-system) | 외부 통합 (submodule) | :3000 + Postgres :5432 | 🟢 active |
| 3 | [`script-writer`](#3-script-writer) | 외부 통합 | :5174 / :3006 | 🟢 active |
| 4 | [`storyboard-maker`](#4-storyboard-maker) | 외부 통합 | :3007 | 🟡 3d |
| 5 | [`shorts-factory`](#5-shorts-factory) | 자체 개발 | :5178 / :3008 | 🟢 active |
| 6 | [`studio`](#6-studio) | 자체 개발 | :3001 | 🟢 active |
| 7 | [`contents-studio`](#7-contents-studio) | 자체 개발 (워크스페이스) | (sub-apps 별도) | 🔴 0 commits |
| 8 | [`marionette-web`](#8-marionette-web) | 자체 개발 (별도 git) | :3000 | 🟡 6d |
| 9 | [`homepage`](#9-homepage) | 정적 사이트 | (Cloudflare Pages) | 🟡 7d |
| 10 | [`art-department`](#10-art-department) | 단일 HTML 에이전트 | — | 🔴 stub |
| 11 | [`mobile-app`](#11-mobile-app) | 계획서 (README only) | — | 🔴 stub |
| 12 | [`console`](#12-console) | 빈 폴더 | — | 🔴 empty |

---

## A. 외부 통합 프로젝트 (4개)

원래 별도 GitHub 저장소였던 프로젝트를 모노레포로 끌어온 것. 4개 중 `production-pipeline-system`만 git submodule 형태로 별도 `.git`을 유지하고, 나머지 3개는 history-merge되어 `.git`이 제거됐다.

### 1. `analysis-system`
> **시나리오 지능 시스템**: 헐리우드 시나리오를 ingest해서 분석하고 흥행을 예측하는 AI-native 도구

- **원본**: `cine-analysys-system` (외부 브랜치 `feat/free-llm-provider-swap`)
- **역할**: Fountain parser, character extraction, market predictor, production feasibility engine
- **스택**: TypeScript (Bun), Vite, monorepo 내부 워크스페이스 (`apps/api`, `apps/web`, `packages/core`)
- **포트**: vite default `:5173` (구체 명시 없음)
- **DB**: 추정 SQLite (script DB)
- **상태**: 🟡 모노레포 통합 후 commit 3건, 마지막 6일 전. `.git` 미보유 (history-merged)
- **의존**: 독립 동작. `production-pipeline-system`이 분석 결과를 소비할 가능성

### 2. `production-pipeline-system`
> **누니온다 영상 제작 파이프라인 관리 시스템**: 프로젝트 → 시나리오 → 스케줄 → 촬영 → 포스트 → 납품 6단계 관리

- **원본**: `production_pipeline` (외부 브랜치 `main`)
- **역할**: 영상 프로덕션 풀-사이클 관리 (Sprint 1~6) — 대시보드, 프로젝트 CRUD, 단계별 워크스페이스
- **스택**: Next.js 16 (App Router) + React 19, Tailwind 4, Prisma 7, NextAuth v5 beta
- **포트**: `:3000` (Postgres `:5432`, DB명 `nunionda`)
- **엔트리**: `src/app/`, `prisma/schema.prisma`
- **상태**: 🟢 활성. Git submodule 형태로 `.git` 보유 (`https://github.com/nunionda/production-pipeline-system`), 모노레포 작업본 브랜치 `feat/team-directory`
- **의존**: 시나리오 단계에서 `analysis-system` 결과 활용 가능

### 3. `script-writer`
> **시네마틱 스크립트 작성 워크스테이션**: 시나리오 개발 → 씬 파싱 → 자동 스토리보드 연동까지

- **원본**: `cine-script-writer` (외부 브랜치 `develop`)
- **역할**: Feature Film/Drama/YouTube/Ad 카테고리별 sequential writing room, 씬 자동 파싱
- **스택**: Frontend Vite + React 19 (Recharts) / Backend Bun + Elysia + Drizzle
- **포트**: Frontend `:5174`, Backend `:3006` (vite proxy `/api → 127.0.0.1:3006`)
- **DB**: SQLite (`script_writer.db`, WAL 모드)
- **엔트리**: `server/index.ts`, `vite.config.js` (root `src/`)
- **상태**: 🟢 가장 활발 (42 commits, 2일 전) — UX 재설계 (ProjectHub/WritingRoom/ProductionDeck) 완료
- **의존**: `storyboard-maker` (:3007) 호출, `studio` (:3001)와 양방향 어댑터 (`api.ts`, `flow-data.ts`, `pipeline-client.ts`)

### 4. `storyboard-maker`
> **스토리보드 자동 생성기**: 씬 텍스트 → 스타일 선택 → 이미지 생성 → 시트 합성

- **원본**: `storyboard-concept-maker` (외부 브랜치 `main`)
- **역할**: Scene parser → style selector → image generator → PDF sheet composer
- **스택**: Python (click CLI), `google-genai`/`huggingface_hub`/`ollama`, Pillow, OpenCV, fpdf2
- **포트**: `:3007` (script-writer가 호출하는 주소)
- **엔트리**: `main.py` (CLI), `src/{scene_parser, style_selector, prompt_engine, image_generator, post_processor, sheet_composer}.py`
- **설정**: `config/concept_designers.yaml`, `config/styles.yaml`
- **저장**: 파일 시스템 (`gallery/` 출력)
- **상태**: 🟡 5 commits (3일 전) — 갤러리 ↔ 파이프라인 연동 버그 fix 완료

---

## B. 모노레포 자체 개발 앱 (4개)

### 5. `shorts-factory`
> **K-pop 팬튜브 숏폼 자동화**: 공식 채널 모니터링 → 하이라이트 추출 → 자막 → 메타데이터 → 검수 → YouTube 업로드

- **역할**: YouTube Shorts 자동 제작 파이프라인 (MVP: NCT WISH/aespa, 48 K-pop 그룹 DB)
- **스택**: Frontend Vite + React / Backend Bun + Elysia 1.4 + Drizzle / Worker Python (FFmpeg + Whisper-Groq + Gemini)
- **포트**: Frontend `:5178`, Backend `:3008`, Python worker (DB 폴링 별도 프로세스)
- **DB**: SQLite (`shorts_factory.db`)
- **엔트리**: `server/src/index.ts`, `src/App.jsx`, `worker/worker.py`
- **8개 탭**: Dashboard / Sources / Assets / Subtitles / Review / Publish / Analytics / K-pop DB
- **외부 API**: YouTube Data API v3, Groq STT, Gemini 번역, (옵션) Submagic / DaVinci Resolve
- **상태**: 🟢 가장 최근 (commit 71cefdb — Elysia 1.4 호환 + composite 자동 트리거 fix)

### 6. `studio`
> **마리오네트 스튜디오 메인 UI**: ReactFlow 노드 기반 파이프라인 시각화

- **역할**: 노드 기반 파이프라인 편집기 (이미지/오디오/비디오 노드), 디자인 시스템 호스트
- **스택**: Next.js 15+, React 19, `@xyflow/react` (ReactFlow), Supabase, TanStack Query, Framer Motion
- **포트**: `:3001` (`next dev -p 3001`)
- **엔트리**: `app/`, `components/`, `lib/`
- **DB**: Supabase
- **상태**: 🟢 활성 (25 commits, 4일 전) — "전체 파이프라인 레이아웃 완성 — UX 재설계"
- **의존**: 워크스페이스 패키지 `@marionette/config`, `@marionette/ui`, script-writer (:3006) 어댑터

### 7. `contents-studio`
> **마리오네트 컨텐츠 스튜디오**: api/web/scenario/finance 멀티 워크스페이스

- **역할**: 콘텐츠 + 시나리오 + 재무를 통합한 비즈니스 백오피스 (계획)
- **스택**: Bun workspace, Prisma, TypeScript
- **sub-apps**: `@marionette/api`, `@marionette/web`, `@marionette/scenario-api`, `@marionette/scenario-web`, `@marionette/finance-api`
- **상태**: 🔴 모노레포 git에 0 commits — CLAUDE.md는 Boris Cherny 데모 잔재 그대로. **사용 여부 결정 필요**

### 8. `marionette-web`
> **마리오네트 web 프론트**: Next.js + base-ui + shadcn

- **역할**: 외부 공개용 웹 (홈페이지 외 추가 마케팅 페이지 추정)
- **스택**: Next.js, `@base-ui/react`, shadcn, tailwind-merge, lucide-react
- **포트**: Next.js default `:3000` (production-pipeline-system과 충돌 가능)
- **엔트리**: `app/page.tsx` (App Router)
- **상태**: 🟡 1 commit (6일 전, "archive legacy production-pipeline/web Vite app") — 자체 `.git` 디렉토리 보유 (remote 미설정, 로컬 전용)
- ⚠️ **모노레포 commit 시 매번 "modified content, untracked content"로 표시**됨 → submodule 등록 또는 `.git` 정리 필요

---

## C. 정적/문서/스텁 (4개)

### 9. `homepage`
> Marionette Studios 공식 홈페이지 (정적 HTML)

- 정적 `index.html` + `assets/` + `_redirects` (Cloudflare Pages 배포 추정)
- 한국어/영어 i18n (`data-i18n-en` 속성)
- 운영 도메인: `https://www.marionette-studios.com`
- **상태**: 🟡 3 commits (7일 전), 운영 중

### 10. `art-department`
> Claude Desktop Cowork용 단일 HTML 에이전트

- `art_department_agent.html` 단일 파일 + `COWORK_INSTRUCTIONS.md`
- Claude Desktop의 "Work in a Folder" 기능으로 동작
- **상태**: 🔴 1 commit (8일 전), 코드라기보다 콘셉트/문서 자료. `docs/proposals/` 등으로 이동 검토

### 11. `mobile-app`
> Expo Webview 래퍼 계획서 (README만)

- React Native + Expo로 `marionette-studio.pages.dev`를 webview wrap
- Polar (글로벌 결제) + Stripe Atlas (델라웨어 C-Corp) 전략 문서 포함
- **상태**: 🔴 README only, 실제 프로젝트 코드 없음. Phase 27 계획서. `docs/proposals/`로 이동 검토

### 12. `console`
> 빈 디렉토리

- **상태**: 🔴 완전 비어있음. 의도된 placeholder인지 확인 필요

---

## D. 의존 관계 다이어그램

```
                     [marionette-web]   [homepage]
                      (외부 마케팅)       (정적 SEO)
                              │                │
                              └──── 사용자 ────┘
                                     │
                              ┌──────┴───────┐
                              ▼              ▼
                          [studio :3001]  [production-pipeline-system :3000]
                          (UX/노드편집)    (프로젝트 풀-사이클 관리)
                              │                │
                              ├────────────────┤
                              ▼                ▼
                        [script-writer :5174]
                        backend       :3006 ─┐
                              │              │
                              ▼              ▼
                  [storyboard-maker :3007]  [analysis-system]
                  (Python 이미지 생성)       (시나리오 분석)


  [shorts-factory :5178/:3008]   ← 독립 파이프라인
   worker.py (FFmpeg/Whisper)      (K-pop YouTube 자동화)
```

---

## E. 운영 상태 요약 (2026-04-17 기준)

| Active 🟢 | Maintenance 🟡 | Inactive/Stub 🔴 |
|---|---|---|
| shorts-factory (오늘) | analysis-system (6d) | contents-studio (0 commits) |
| script-writer (2d) | storyboard-maker (3d) | art-department (정적 HTML) |
| studio (4d) | marionette-web (6d) | mobile-app (README only) |
| production-pipeline-system (submodule) | homepage (7d) | console (빈 폴더) |

---

## F. 외부 통합 출처 메타데이터

| 모노레포 경로 | 외부 저장소 | 외부 브랜치 | `.git` 보존? |
|---|---|---|---|
| `apps/analysis-system/` | `cine-analysys-system` | `feat/free-llm-provider-swap` | ❌ history-merged |
| `apps/production-pipeline-system/` | `production_pipeline` | `main` | ✅ submodule |
| `apps/script-writer/` | `cine-script-writer` | `develop` | ❌ history-merged |
| `apps/storyboard-maker/` | `storyboard-concept-maker` | `main` | ❌ history-merged |

자체 개발 (외부 출처 없음): `shorts-factory`, `studio`, `contents-studio`, `marionette-web`, `homepage`, `art-department`, `mobile-app`, `console`

---

## G. 권장 다음 단계

1. **`marionette-web` `.git` 정리**: 로컬 전용 `.git` 보유 → 매 commit마다 dirty 표시. submodule 등록 또는 `.git` 제거 결정.
2. **`contents-studio` 결정**: 0 commits, Boris Cherny 데모 잔재 → 사용 중이면 정리, 아니면 archive
3. **`console/` 처리**: 빈 폴더 → 미래 슬롯이면 `README.md` placeholder 추가, 아니면 삭제
4. **`art-department/`, `mobile-app/`**: 코드 없는 문서 폴더 → `docs/proposals/`로 이동 검토
5. **포트 충돌 방지**: `marionette-web` `:3000` ↔ `production-pipeline-system` `:3000` 둘 다 default. 동시 실행 불가.
