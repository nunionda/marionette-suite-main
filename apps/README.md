# marionette-suite `/apps` 인벤토리

`marionette-suite`는 nunionda 영상 제작 스튜디오의 여러 제품을 한 모노레포에 모아둔 작업 공간. 다만 **각 제품은 독립적으로 개발/운영/배포되어야** 하고, 통합은 별도 레이어로 나중에 연결한다.

마지막 업데이트: 2026-04-17

---

## 🎯 전략: Independent-First, Integrate-Later

처음엔 모든 앱을 한 번에 통합하려 했지만, 다음 이유로 전략을 바꿨다:

- 각 앱의 도메인이 다르다 (시나리오 분석 vs 스케줄 관리 vs 숏폼 자동화 등)
- 각자 독립적인 사용자/고객/배포 사이클을 가질 수 있다
- 통합을 미리 그리면 각 제품의 진화 속도가 느려진다

**현재 원칙**:
1. 5개 제품은 각자 독립 제품으로 개발 (자체 DB, 자체 API, 자체 UI)
2. 모노레포는 단지 코드 보관소 (workspace dependency 강제 X)
3. 통합/연동은 명시적 API 레이어로 나중에 연결 (제품 간 직접 import 금지)

---

## 1️⃣ 핵심 독립 제품 (5개)

### 1. `analysis-system` — 시나리오 분석 시스템
> 시나리오 PDF/DOCX/MD 파일을 분석해서 **투자사 평가용 PDF 최종 보고서**를 생성

| 항목 | 값 |
|---|---|
| 입력 | 시나리오 파일 (PDF/DOCX/MD/Fountain) |
| 출력 | 투자사 평가 형식 PDF 보고서 (캐릭터/내러티브/시장성/제작 타당성) |
| 스택 | TypeScript (Bun), Vite, 워크스페이스 (`apps/api`, `apps/web`, `packages/core`) |
| 포트 | (명시 없음 — vite default `:5173`) |
| DB | SQLite (추정) |
| 외부 출처 | `cine-analysys-system` / 브랜치 `feat/free-llm-provider-swap` |
| `.git` | ❌ history-merged |
| 상태 | 🟡 통합 후 3 commits (6일 전) |
| 독립성 | ✅ 단독 실행 가능. 다른 앱과 직접 의존 X |

**핵심 미션**: 시나리오를 넣으면 → 투자 의사결정에 쓸 수 있는 PDF가 나온다.

---

### 2. `script-writer` — 시나리오 창작 스튜디오
> AI 보조를 받으면서 시나리오를 처음부터 끝까지 쓰는 창작 워크스테이션

| 항목 | 값 |
|---|---|
| 역할 | Feature Film/Drama/YouTube/Ad 카테고리별 sequential writing room, 씬 자동 파싱 |
| 스택 | Frontend Vite + React 19 (Recharts) / Backend Bun + Elysia + Drizzle |
| 포트 | Frontend `:5174`, Backend `:3006` |
| DB | SQLite (`script_writer.db`, WAL 모드) |
| 외부 출처 | `cine-script-writer` / 브랜치 `develop` |
| `.git` | ❌ history-merged |
| 상태 | 🟢 가장 활발 (42 commits, 2일 전) |
| 독립성 | ⚠️ 현재 storyboard-maker(:3007)와 studio(:3001)에 어댑터 코드 존재 — **분리 필요** |

**핵심 미션**: 시나리오 한 편을 처음부터 끝까지 쓸 수 있는 단독 도구.

---

### 3. `storyboard-maker` — 스토리보드 자동 생성기
> 씬 텍스트 → 스타일 선택 → 이미지 생성 → 시트 합성, Python 기반 단독 도구

| 항목 | 값 |
|---|---|
| 역할 | Scene parser → style selector → image generator → PDF sheet composer |
| 스택 | Python (click CLI), `google-genai` / `huggingface_hub` / `ollama`, Pillow, OpenCV, fpdf2 |
| 포트 | `:3007` (script-writer가 호출하는 주소 — 분리 후 변경 가능) |
| 엔트리 | `main.py` (CLI), `src/{scene_parser, style_selector, prompt_engine, image_generator, post_processor, sheet_composer}.py` |
| 설정 | `config/concept_designers.yaml`, `config/styles.yaml` |
| 저장 | 파일 시스템 (`gallery/` 출력) |
| 외부 출처 | `storyboard-concept-maker` / 브랜치 `main` |
| `.git` | ❌ history-merged |
| 상태 | 🟡 5 commits (3일 전) |
| 독립성 | ✅ CLI로 단독 실행 가능. script-writer가 클라이언트로 쓸 뿐 |

**핵심 미션**: 씬을 넣으면 → 스토리보드 시트(이미지 + PDF)가 나온다. 단독 사용 가능.

---

### 4. `shorts-factory` — 유튜브 창작 스튜디오
> K-pop 팬튜브 숏폼 자동 제작 파이프라인 (소스 모니터링 → 편집 → 자막 → 검수 → 업로드)

| 항목 | 값 |
|---|---|
| 역할 | YouTube Shorts 자동 제작 (MVP: NCT WISH/aespa, 48 K-pop 그룹 DB) |
| 스택 | Frontend Vite + React / Backend Bun + Elysia 1.4 + Drizzle / Worker Python (FFmpeg + Whisper-Groq + Gemini) |
| 포트 | Frontend `:5178`, Backend `:3008`, Python worker (DB 폴링 별도 프로세스) |
| DB | SQLite (`shorts_factory.db`) |
| 외부 API | YouTube Data API v3, Groq STT, Gemini 번역, (옵션) Submagic / DaVinci Resolve |
| 8개 탭 | Dashboard / Sources / Assets / Subtitles / Review / Publish / Analytics / K-pop DB |
| 외부 출처 | (자체 개발) |
| 상태 | 🟢 가장 최근 (commit 5c6fa62 — 인벤토리 README 추가, 직전 71cefdb — Elysia 1.4 호환 + composite 자동 트리거 fix) |
| 독립성 | ✅ 완전 독립. 다른 앱과 의존 X |

**핵심 미션**: 공식 채널 신곡 발견 → 숏폼 자동 제작 → YouTube 업로드까지.

---

### 5. `production-pipeline-system` — 영화제작사 메인 프로덕션 스케줄 관리 시스템
> 프로젝트 → 시나리오 → 스케줄 → 촬영 → 포스트 → 납품 6단계 관리 백오피스

| 항목 | 값 |
|---|---|
| 역할 | 영상 프로덕션 풀-사이클 관리 (Sprint 1~6) — 대시보드, 프로젝트 CRUD, 단계별 워크스페이스, 팀 디렉토리 |
| 스택 | Next.js 16 (App Router) + React 19, Tailwind 4, Prisma 7, NextAuth v5 beta |
| 포트 | `:3000` (Postgres `:5432`, DB명 `nunionda`) |
| 엔트리 | `src/app/`, `prisma/schema.prisma` |
| 외부 출처 | `production_pipeline` (`https://github.com/nunionda/production-pipeline-system`) / 브랜치 `main` (모노레포 작업본은 `feat/team-directory`) |
| `.git` | ✅ submodule 형태로 보존 |
| 상태 | 🟢 활성 |
| 독립성 | ✅ 자체 GitHub 저장소 + 자체 PostgreSQL DB. 가장 분리 정리된 상태 |

**핵심 미션**: 영화 한 편이 기획부터 납품까지 가는 전 과정을 관리.

---

## 2️⃣ 통합 레이어 (미래 작업, 현재 우선순위 낮음)

5개 독립 제품을 사용자에게 한 화면으로 노출하기 위한 통합 UI/연결 레이어. **현재는 보류**, 각 제품이 안정화된 뒤에 다시 검토.

### `studio` — 노드 기반 통합 UI 후보
- ReactFlow 노드 편집기 (이미지/오디오/비디오 노드)
- Next.js 15+, React 19, `@xyflow/react`, Supabase, TanStack Query
- 포트 `:3001`
- 상태: 🟢 25 commits (4일 전)
- ⚠️ 현재 script-writer(:3006) 어댑터를 가지고 있음 → **독립 제품화 후 통합 레이어로 격리** 결정 필요

### `contents-studio` — 미정 워크스페이스
- Bun workspace, Prisma — sub-apps (`@marionette/api`, `@marionette/web`, `@marionette/scenario-api`, `@marionette/scenario-web`, `@marionette/finance-api`)
- 상태: 🔴 모노레포 git에 0 commits, CLAUDE.md는 Boris Cherny 데모 잔재
- **결정 필요**: archive vs 통합 레이어로 재활용

### `marionette-web` — 외부 공개 웹
- Next.js, `@base-ui/react`, shadcn
- 포트 `:3000` (production-pipeline-system과 충돌!)
- 상태: 🟡 1 commit (6일 전), 자체 `.git` 보유 (remote 미설정)
- **이슈**: 매 모노레포 commit마다 dirty 표시, `.git` 정리 필요

---

## 3️⃣ 부속 자산 (정적/문서/스텁)

| 항목 | 설명 | 상태 |
|---|---|---|
| `homepage` | Marionette Studios 공식 홈페이지 (정적 HTML, Cloudflare Pages, `marionette-studios.com`) | 🟡 운영 중 |
| `art-department` | Claude Desktop Cowork용 단일 HTML 에이전트. `docs/proposals/`로 이동 검토 | 🔴 1 commit |
| `mobile-app` | Expo Webview 래퍼 계획서 (README만, 코드 없음). `docs/proposals/`로 이동 검토 | 🔴 README only |
| `console` | 빈 디렉토리. 의도 확인 필요 | 🔴 empty |

---

## 4️⃣ 의존 관계 — 현재 vs 목표

### 현재 (얽혀있음)

```
[script-writer :5174 / :3006] ─────► [storyboard-maker :3007]
        ▲                                   (Python CLI)
        │ adapter (api.ts, flow-data.ts,
        │          pipeline-client.ts)
        ▼
[studio :3001]
(ReactFlow UX)

[shorts-factory :5178 / :3008]   ← 독립
[analysis-system]                ← 독립
[production-pipeline-system :3000] ← 독립
```

### 목표 (Independent-First)

```
독립 제품 5개 (각자 자기 DB, 자기 API, 자기 UI):

  [analysis-system]          [script-writer]         [storyboard-maker]
  PDF in → PDF out           시나리오 작성             씬 in → 보드 PDF out

  [shorts-factory]           [production-pipeline-system]
  YouTube 자동화              영화 제작 스케줄

       ▼ ▼ ▼ ▼ ▼  (명시적 HTTP API만으로 통신)
       
  [통합 레이어 (미래)]
  - studio: 노드 UI?
  - 새 게이트웨이?
  - (제품 안정화 후 결정)
```

---

## 5️⃣ Independent-First 마이그레이션 백로그

### Priority 1 — 의존성 끊기
- [ ] `script-writer` → `storyboard-maker` 직접 호출 분리. 명시적 client 모듈로 격리
- [ ] `studio`의 `script-writer` 어댑터 제거 또는 별도 통합 레이어로 이동
- [ ] `shorts-factory` 독립성 유지 확인 (현재 OK, regression 방지)

### Priority 2 — 모노레포 위생
- [ ] `marionette-web` 자체 `.git` 정리 (submodule 등록 또는 history merge)
- [ ] `contents-studio` 사용 여부 결정 (archive vs 통합 레이어)
- [ ] `console` 빈 폴더 처리 (placeholder vs 삭제)
- [ ] `art-department`, `mobile-app` → `docs/proposals/`로 이동

### Priority 3 — 독립 배포 준비
- [ ] 각 제품 독립 Docker / 배포 스크립트
- [ ] 각 제품 자체 README (현재 일부 미흡)
- [ ] 포트 충돌 해결 (`marionette-web` `:3000` ↔ `production-pipeline-system` `:3000`)
- [ ] 각 제품을 다시 별도 GitHub 저장소로 split할지 결정

---

## 6️⃣ 외부 통합 출처 메타데이터

| 모노레포 경로 | 외부 저장소 | 외부 브랜치 | `.git` 보존? |
|---|---|---|---|
| `apps/analysis-system/` | `cine-analysys-system` | `feat/free-llm-provider-swap` | ❌ history-merged |
| `apps/production-pipeline-system/` | `production_pipeline` | `main` | ✅ submodule |
| `apps/script-writer/` | `cine-script-writer` | `develop` | ❌ history-merged |
| `apps/storyboard-maker/` | `storyboard-concept-maker` | `main` | ❌ history-merged |

자체 개발 (외부 출처 없음): `shorts-factory`, `studio`, `contents-studio`, `marionette-web`, `homepage`, `art-department`, `mobile-app`, `console`

---

## 7️⃣ 운영 상태 요약 (2026-04-17 기준)

| 카테고리 | Active 🟢 | Maintenance 🟡 | Inactive 🔴 |
|---|---|---|---|
| 핵심 5 제품 | shorts-factory, script-writer, production-pipeline-system | analysis-system, storyboard-maker | — |
| 통합 레이어 | studio | marionette-web | contents-studio |
| 부속 자산 | — | homepage | art-department, mobile-app, console |
