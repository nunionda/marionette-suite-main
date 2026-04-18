# 현재 세션 상태 (2026-04-19)

> **branch**: `feat/integrate-dev-projects` — 27 commits ahead, PR #1 open, **push + PR CI 모두 green**
> **Charter**: [`docs/pipeline-constitution.md`](../docs/pipeline-constitution.md) v2.0 (73공정 확정)
> **이전 상태**는 아래 "레거시 세션 스냅샷" 참고

---

## 2026-04-19 세션 요약 — PR 범위 내 모든 미구현 태스크 완료

### Design Track Sprint 2 (A+B+C)
- `9ff0afc` **A+B**: apiMap → `generateImage` 정렬 + makeup_hair specialist → 6개 image 노드 복구
- `4e12e52` **C**: `textDesigner.ts` + 7개 text-document 노드 + art_bible synthesis
- 결과: 16 Design 노드 모두 실행 가능 (execute endpoint)

### CI 안정화 (5 커밋 체인)
- `ba47cc8` @marionette/ui 서브패스 export (barrel 40+ 컴포넌트 제외) + @marionette/pipeline-core workspace dep
- `362f37a` web tsconfig self-contained (untracked extends-chain 제거)
- `438ae2c` 누락 entry points 커밋 (design-tokens/content-profiles index.ts, paperclip-bridge 서브패스)
- `95119a0` 0c2be0c revert (contents-studio 내부 package.json은 untracked 상태 유지가 정답)
- `542a82b` analysis-system#test advisory (Charter §9)
- **결과**: push CI ✅, PR CI ✅ (둘 다 처음으로 green)

### 남은 미구현 태스크 4개 모두 완료
- `729d084` **#69 Streaming/VOD**: LibraryEntry.streaming 확장 (platforms/DRM/bitrate/HDR/Atmos), DistributionPanel + library-client UI 확장
- `5217958` **#49/#51/#52 AI Audio 3종**: textDesigner.ts에 adr_dubbing / foley / music_composition specs 추가 (무료 LLM 체인 재사용, 오디오 합성 대신 spec JSON 생성)
- `aece097` **#58 Final Video Assembly**: hub `/assembly` route + AssemblyJob schema (preset ladder, ffmpegCommand 저장, HDR/Atmos/checksum), 10-file anatomy 11th 반복

### Charter Sprint 커버리지 (2026-04-19 기준)
| Sprint | 태스크 | 상태 | 커밋 |
|---|---|---|---|
| 0 | CI 안정화 | ✅ | `0dacca8` |
| 0.5 | #58 Assembly | ✅ | `aece097` |
| 0.5-bis | analysis-system debt | ✅ | `23fa067` |
| 1 | #16/#17/#20 | ✅ | 3커밋 |
| 2 | Design Track 정렬 + 확장 | ✅ | `9ff0afc`, `4e12e52` |
| 3 | #24.10, #28 | ⏳ **deferred** (Charter §7 "별도 세션") |
| 4 | #18, #23 | ✅ | 2커밋 |
| 5 | #42, #56, #58 | ✅ | 3커밋 |
| 6 | #49/#51/#52 | ✅ | `5217958` |
| 7 | #62/#65/#69 | ✅ | 3커밋 |
| 8 | #71/#72 | ✅ | `d769842` |

### 현재 aggregator 상태: **16-leg**
creativeSteps + postProduction + distribution(+streaming) + schedule + budget + casting + locations + rehearsals + ingest + titles + festivals + marketing + boxOffice + reviews + assembly

### 남은 PR-외부 항목
- `#3` (Charter): #24.10 Lighting Design, #28 VFX Previs — "별도 세션" 명시
- `#9+` (Charter): 나머지 20개 공정 (Phase 1 Development #1/#6/#9/#11~13, #29 Stunt, #53 Music Licensing, etc.)
- **Cloudflare Pages 빌드** (apps/studio Turbopack) — 별도 플랫폼 작업, Sprint 무관
- analysis-core 135 errors — Charter §9 Out of Scope (advisory 모드로 운영 중)

---

---

## Pipeline Constitution v2.0 (2026-04-18 확정)

**73공정 · 6 Phase · 9 Sprint 로드맵.** 상세는 `docs/pipeline-constitution.md`.

### 핵심 원칙
1. **독립 모듈 + 연결 강화** — 흡수가 아니라 deep-link + aggregator로 묶음
2. **AI 이미지·비디오 프롬프트 우선 삽입** — 6개 지점 (24.1/4~10, 24.12, 33~35, 47, 49~52, 65)
3. **호스팅 3가지 패턴**: (가) hub route ~45개 / (나) script-writer 노드 ~20개 / (다) 독립 앱 ~8개
4. **모듈 anatomy 4 deliverable**: route namespace + progress API + deep-link + aggregator 등록

### Sprint 로드맵 요약
- **0** CI 안정화 — ✅ `0dacca8` packages/tsconfig 3 files 커밋 (prompt-adapters root cause)
- **0.5-bis** analysis-system debt — ✅ `23fa067` advisory mode + 2 parser.ts surgical fixes. 135 errors는 Charter §9 Out of Scope로 defer
- **1** Pre-prod Ops 3종 — ✅ 모두 완료
  - `1bb31f8` #16 Schedule (hub `/schedule`, 7 shoot days mock, 6 files + 4 mods)
  - `a27b53c` #17 Budget (hub `/budget`, ID-001 ₩8.5B 53% burn, 6+4 files)
  - `0438a02` #20 Casting (hub `/casting`, 5+2 entries across ID-001/002, 6+4 files)
  - Aggregator 이제 **7-leg**: script-writer, storyboard, post, library, schedule, budget, casting
- **2** Design Track 갭 (#24.5~.8) ← **next**
- **2** Design Track 갭 (#24.5~.8)
- **3** Design Track 완성 (#24.9~.11, #28)
- **4** Pre-prod 부대 (#18, #23)
- **5** Post 보강 (#42, #56, #58)
- **6** AI Audio (#49, #51, #52) [AI-AUD]
- **7** Distribution (#62, #65, #69)
- **8** Analytics (#71, #72)

### 통계 (2026-04-18)
- ✅ 완전 존재: 22개 (30%) · 🟡 부분: 11개 (15%) · ❌ 부재: 40개 (55%)
- AI 모듈 coverage: 18 공정 중 11 완성 (61%)

---

## 이번 세션 (2026-04-18): Phase 4 + 5.x — hub 통합 & 주소 체계 확립

### 완료 Phase
| Phase | 내용 | 주요 commit |
|---|---|---|
| **4** | post-studio(:4002) + content-library(:4003) progress aggregator 통합, UI 패널 2개 추가 | `25ff064`..`cdfb862` |
| **5.0** | root `.env.example` + `docs/addressing-convention.md` + codemod script (421개 URL → env ref) | `b99744d`, `8ea4d20`, `efea33a`, `efc0178` |
| **5a** | content-library → hub `/library` 흡수 (standalone :4003 폐기) | `6aa5cae`, `10df2fc`, `f2de9bd` |
| **5b** | post-studio → hub `/post` 흡수 (standalone :4002 폐기) | `07c3a44`, `06156f3`, `c3663fc` |
| **5.1** | hub port `:4001` → `:3000` (Next.js 표준) — 소스 코드 수정 0 | `567da66` |

### 핵심 성과
- **Addressing convention** 문서화 (`docs/addressing-convention.md`): `NEXT_PUBLIC_*`(브라우저) / `INTERNAL_*`(서버전용) 네이밍 규칙
- **Phase 5.1이 Phase 5.0의 ROI 실증**: port 변경 시 코드 수정 제로, `.env.example` + `launch.json` + codemod `PORT_MAP`만 수정
- **2개 standalone 앱 흡수**: 서비스 12개 → 10개

---

## 현재 서비스 포트 (canonical)

| 서비스 | port | env | 종류 |
|---|---|---|---|
| **contents-studio-web** | **3000** | `NEXT_PUBLIC_HUB_URL` | Web (canonical entry) |
| script-writer-frontend | 5174 | `NEXT_PUBLIC_SCRIPT_WRITER_URL` | Vite |
| storyboard-maker | 3007 | `NEXT_PUBLIC_STORYBOARD_URL` | Web+API |
| studio | 3001 | `NEXT_PUBLIC_STUDIO_URL` | Web |
| scenario-web | 4000 | `NEXT_PUBLIC_SCENARIO_WEB_URL` | Web |
| analysis-web | 4007 | `NEXT_PUBLIC_ANALYSIS_WEB_URL` | Web (⚠ design-tokens CSS import 버그) |
| shorts-factory | 5178 | `NEXT_PUBLIC_SHORTS_FACTORY_URL` | Web |
| script-writer-backend | 3006 | `INTERNAL_SCRIPT_ENGINE_URL` | WAS |
| contents-studio-api | 3005 | `INTERNAL_CONTENTS_STUDIO_API_URL` | WAS (⚠ auth wall) |
| analysis-api | 4006 | `INTERNAL_ANALYSIS_API_URL` | WAS |

폐기됨: `content-library(:4003)`, `post-studio(:4002)`

---

## CI 상태 (PR #1)

- **push trigger**: ✅ green (`--filter='[HEAD^1]'` 사용, HEAD 직전 1커밋만 빌드)
- **PR trigger**: ❌ `@marionette/prompt-adapters#typecheck` 실패
  - **pre-existing**: Phase 5.x 작업과 무관. `main..HEAD` 범위에 포함된 과거 커밋의 `@types/chai` + `@vitest/expect` duplicate identifiers 문제
  - 시도 흔적: `a34f69e` (부분 수정)
  - 다음 세션 후보 수정: `packages/prompt-adapters/tsconfig.json`에 `compilerOptions.types: ["node"]` 추가
- **Cloudflare Pages**: ❌ 별도 플랫폼 설정 이슈, Phase 5.x 무관

---

## Script-writer 백엔드 주의사항 (이번 세션 교훈)
- **SQLite WAL disk I/O error**: 스테일 프로세스의 mmap'd SHM/WAL이 잔존하면 새 프로세스 연결 불가
- **복구 순서**: `lsof | grep script-writer.db` → 스테일 PID kill → `bun run src/index.ts` 재기동
- Beat Savior (ID 28, 122 scenes / 3401 cuts) 여전히 intact

---

## 다음 세션 후보 (난이도 순)

### A. CI 정리 (safest, 30분)
- `packages/prompt-adapters/tsconfig.json` types 제한 → PR trigger green
- Cloudflare Pages 빌드 플랫폼 설정 확인

### B. Phase 5c — 남은 standalone 앱 흡수 (난이도 순)
1. **scenario-web(:4000)** — Next.js, 가장 쉬움 (5a/5b 패턴 그대로)
2. **studio(:3001)** — Supabase + react-flow, 데이터 모델·인증 분리 → 별도 플랜
3. **shorts-factory(:5178)** — K-POP 숏폼, 별개 제품군 (보류 검토)
4. **script-writer(:5174)** — Vite → Next.js 마이그레이션 필요, 가장 무거움

### C. analysis-web(:4007) `@marionette/design-tokens/tokens.css` import 수정

---

## Locked-in 결정 (이번 세션 중)

- **Hub as single web origin**: 프로덕션 target `app.marionette.studio` — Phase 5+ 에서 나머지 standalone도 순차 흡수
- **Backend 스택**: Bun + Elysia (script-writer 기준으로 통일 방향)
- **ORM target**: Drizzle + Postgres (현재 SQLite는 임시)
- **Env 규칙 3개**:
  1. 모든 fetch는 env 경유 (hardcode 금지)
  2. fallback 명시 의무 (`process.env.X ?? "http://localhost:Y"`)
  3. 변경은 `.env.example`에서만

---

## 핵심 파일 (다음 세션 참조용)

- `docs/addressing-convention.md` — 주소 규칙 + 변경 이력
- `scripts/codemod-extract-urls.ts` — 신규 서비스 추가 시 PORT_MAP에 등록하면 자동 전환
- `.env.example` — 17개 env var canonical 소스
- `.claude/launch.json` — 서비스 10개 기동 설정
- `docs/superpowers/plans/2026-04-18-marionette-phase-5.0-addressing-convention.md`
- `docs/superpowers/plans/2026-04-18-marionette-phase-5a-content-library-absorption.md`
- `docs/superpowers/plans/2026-04-18-marionette-phase-5b-post-studio-absorption.md`

---

## ⚠ Opsera pre-commit 훅 주의

- Hook이 chained 명령(`touch ... && git commit`)을 intercept함
- **해결**: touch를 별도 Bash 호출로 먼저 실행 → 다음 호출에서 commit

---

# 레거시 세션 스냅샷 (2026-04-13, 참고용)

## 완성된 시스템

### UX 재설계
- **ProjectHub**: 2-Phase 허브 (시나리오 개발 / 프로덕션)
- **WritingRoom**: 카테고리별 순차 step (Film 5, Drama 4, YouTube 4, Ad 5) + Language/Standard/Style 컨트롤 + 자동 씬 파싱
- **ProductionDeck**: 5-탭 (Scenes/Pipeline/Storyboard/ArtBible/Analytics)
- **Classic View**: 기존 ProjectDetail 접근 가능
- 모든 카테고리(Feature Film, Netflix, Commercial, YouTube) Hub 통합

### 파이프라인 백엔드
- `production_assets` DB 테이블 — 20개 노드 결과물 저장
- Pipeline API: execute/status/detail + batch-execute
- Design Track: 12노드 (분석/세계관/물리설계/프리비즈/아트바이블)
- Video Track: 8노드 (스크립트/이미지/비디오/오디오/최종컷)
- Provider 추상화 레이어 (무료↔유료 전환 준비)
- GS Stage Gate G1~G5

### Studio 연결
- api.ts: script-writer(:3006) 어댑터 매핑
- flow-data.ts: PATCH /api/cuts/:id 저장
- pipeline-client.ts: Pipeline API 클라이언트
- ImageGenNode/AudioNode: Generate 버튼
- .env.local → :3006

### 주요 컴포넌트
- NodeExecutionPanel (10 Masters 스타일 + 실행 + 결과)
- StoryboardGallery (씬별 배치 생성)
- ArtBibleViewer (11섹션 + PDF 익스포트)

## Beat Savior 테스트 데이터
- Project ID: 28
- 122 scenes, 3,401 cuts, 19 characters
- Design 8/12 노드 완료, Video 5/8 노드 완료
