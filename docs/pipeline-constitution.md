# Marionette Suite — Pipeline Constitution v2.0

> **확정일**: 2026-04-18
> **관계**: [`docs/PIPELINE.md`](./PIPELINE.md)의 4-phase canonical spec을 세분화한 **73공정 구현 지도**.
> **목적**: 모든 개발 결정의 기준점. "이거 만들 거야, 말 거야?" 질문의 판정 기준.

## 1. 철학 (Constitution)

**독립 모듈 + 연결 강화.**

- 각 영화 제작 공정 = 1개 독립 모듈
- 모듈 간 연결은 **deep-link + API aggregator + `paperclipId` 공통 ID**
- "완성"의 정의 = "더 많은 기능"이 아니라 "이미 있는 것들이 seamless하게 연결됨"
- 독립 모듈 원칙은 **미래 고도화 편의성**을 보장 (provider 교체, 권한 차별화, A/B 테스트, 독립 앱 승격 등)

## 2. PIPELINE.md 4-Phase와의 매핑

| PIPELINE.md Phase | Constitution Phase | 공정 번호 범위 |
|---|---|---|
| `PRE` (프리프로덕션) | 1. Development + 2. Pre-production | #1~#32 |
| `MAIN` (프로덕션) | 3. Production | #33~#41 |
| `POST` (포스트프로덕션) | 4. Post-production | #42~#59 |
| `LIBRARY` (관리) | 5. Distribution + 6. Post-release | #60~#74 |

## 3. 73 공정 전체 목록

### Phase 1 — Development (개발) · 13 공정 · [PRE]

| # | 공정 | 국문 | 호스팅 | 상태 |
|---|---|---|---|---|
| 1 | Idea / Concept | 아이디어·컨셉 | hub route | ❌ |
| 2 | Logline | 로그라인 | script-writer | ✅ |
| 3 | Synopsis | 시놉시스 | script-writer | 🟡 |
| 4 | Treatment | 트리트먼트 | script-writer | 🟡 |
| 5 | Outline / Beat Sheet | 개요·비트시트 | script-writer | ✅ |
| 6 | Research | 리서치 | hub route | ❌ |
| 7 | Screenplay First Draft | 시나리오 초고 | script-writer | ✅ |
| 8 | Script Revisions | 개고 | script-writer | 🟡 |
| 9 | Script Coverage / Doctoring | 스크립트 닥터링 | hub route | ❌ |
| 10 | Investor Analysis | 투자자 분석 | analysis-system (독립) | ✅ |
| 11 | Rights / Clearances | 판권·원작권 | hub route | ❌ |
| 12 | Pitch Deck | 피치덱 | hub route | ❌ |
| 13 | Financing / Greenlight | 파이낸싱·그린라잇 | hub route | ❌ |

### Phase 2 — Pre-production (사전 제작) · 27 공정 · [PRE]

| # | 공정 | 국문 | 호스팅 | 상태 |
|---|---|---|---|---|
| 14 | Script Lock | 시나리오 확정 | script-writer | 🟡 |
| 15 | Script Breakdown | 씬·요소 분해 | script-writer | ✅ |
| 16 | Stripboard / Schedule | 스트립보드·스케줄 | hub route | ❌ **Sprint 1** |
| 17 | Budget | 예산 | hub route | ❌ **Sprint 1** |
| 18 | Location Scouting | 로케이션 헌팅 | hub route | ❌ |
| 19 | Location Contracts / Permits | 로케이션 계약·허가 | hub route | ❌ |
| 20 | Casting — Audition | 오디션 | hub route | ❌ **Sprint 1** |
| 21 | Casting — Contract | 배역 계약 | hub route | ❌ |
| 22 | Crew Hiring | 제작진 고용 | hub route | ❌ |
| 23 | Rehearsals | 리허설 | hub route | ❌ |
| **24** | **Production Design** *(13 sub-stages ↓)* | **프로덕션 디자인** | script-writer Design Track | — |
| 24.1 | Concept / Visual Direction | 컨셉·비주얼 디렉션 | Design Track 노드 | ✅ [AI-IMG] |
| 24.2 | World Building | 세계관 설정 | Design Track 노드 | ✅ |
| 24.3 | Physics / Reality Rules | 물리·리얼리티 룰 | Design Track 노드 | ✅ |
| 24.4 | Character Design | 캐릭터 디자인 | Design Track 노드 (`character_design`) | 🟡 [AI-IMG] frontend config 존재, backend apiMap stale |
| 24.5 | Set / Location Design | 세트·로케이션 디자인 | Design Track 노드 (`set_design`) | 🟡 [AI-IMG] 동상 |
| 24.6 | Costume Design / Fitting | 의상 디자인·피팅 | Design Track 노드 (`costume_design`) | 🟡 [AI-IMG] 동상 |
| 24.7 | Hair & Makeup Design | 헤어·메이크업 | Design Track 노드 (`makeup_hair`) | 🟡 [AI-IMG] frontend only, backend apiMap 누락 |
| 24.8 | Props / Vehicles / Weapons | 소품·차량·무기 | Design Track 노드 (`props`) | 🟡 [AI-IMG] frontend + apiMap stale |
| 24.9 | Color Script | 컬러 스크립트 | Design Track 노드 (`color_script`) | 🟡 [AI-IMG] frontend config 존재, 실행 경로 없음 |
| 24.10 | Lighting Design | 라이팅 디자인 | Design Track 노드 | ❌ **별도 세션** |
| 24.11 | Camera / Lens / Framing | 카메라·렌즈·프레이밍 | Design Track 노드 (`shot_list`) | 🟡 frontend config 존재 |
| 24.12 | Previz / Animatic | 프리비즈·애니매틱 | Design Track 노드 (`storyboard`) | ✅ [AI-VID] |
| 24.13 | Art Bible Consolidation | 아트바이블 통합 | script-writer ArtBibleViewer | ✅ |

**Design Track 현황 (2026-04-18 재평가)**: 프론트엔드 `apps/script-writer/src/config/productionPipeline.js`에 **16개 노드가 완전 정의**되어 있음 (초기 Charter v2.0 작성 시 12개로 과소평가). 그러나 `script-writer` backend의 apiMap이 `storyboard-maker :3007`의 dead endpoints(`/api/character` 등 모두 404)를 가리켜 **실행은 불가**. 진짜 debt는 "새 노드 추가"가 아니라 **script-writer ↔ storyboard-maker provider 정렬**. Sprint 2는 이 debt 전용 세션으로 재정의.
| **25** | **Storyboard** | **스토리보드** | storyboard-maker (독립) | ✅ [AI-IMG] |
| 26 | Shot List / Floor Plan | 샷 리스트·플로어 플랜 | script-writer | ✅ |
| 27 | Equipment Prep | 장비 준비 | hub route | ❌ |
| 28 | VFX Previs / Virtual Production | VFX 프리비즈 | script-writer | 🟡 [AI-VID] |
| 29 | Stunt Choreography | 스턴트 안무 | hub route | ❌ |
| 30 | Script Supervisor Prep | 스크립트 수퍼바이저 준비 | hub route | ❌ |
| 31 | Insurance / Legal | 보험·법무 | hub route | ❌ |
| 32 | Production Office Setup | 제작 사무실 | hub route | ❌ |

### Phase 3 — Production (촬영) · 9 공정 · [MAIN] · **AI 시대 축소**

| # | 공정 | 국문 | 호스팅 | 상태 |
|---|---|---|---|---|
| 33 | AI Image Generation | 이미지 생성 | script-writer Video Track | ✅ [AI-IMG] |
| 34 | AI Video Generation | 비디오 생성 | script-writer Video Track | ✅ [AI-VID] |
| 35 | AI Audio Generation | 오디오 생성 | script-writer Video Track | ✅ [AI-AUD] |
| 36 | Principal Photography (live-action) | 실사 본촬영 | hub route (옵션) | ❌ |
| 37 | Daily Production Report | 일일 제작보고서 | hub route | ❌ |
| 38 | Dailies / Rushes Review | 데일리 검수 | hub route | 🟡 |
| 39 | On-set Sound Recording | 현장 녹음 | hub route (실사) | ❌ |
| 40 | Continuity / Script Supervision | 연속성·스크립트 감수 | hub route | ❌ |
| 41 | Wrap Report | 랩 리포트 | hub route | ❌ |

### Phase 4 — Post-production (후반 작업) · 18 공정 · [POST]

| # | 공정 | 국문 | 호스팅 | 상태 |
|---|---|---|---|---|
| 42 | Data Management / Ingest | 데이터 인제스트 | hub route | ❌ |
| 43 | Assembly Edit | 어셈블리 편집 | hub /post Edit | ✅ |
| 44 | Rough Cut | 러프 컷 | hub /post Edit | ✅ |
| 45 | Fine Cut | 파인 컷 | hub /post Edit | ✅ |
| 46 | Picture Lock | 픽쳐 락 | hub /post | 🟡 |
| 47 | VFX Shot Production | VFX 샷 제작 | hub /post VFX | ✅ [AI-VID] |
| 48 | VFX Review / Approvals | VFX 검토·승인 | hub /post | 🟡 |
| 49 | ADR / Dubbing | 후시녹음·더빙 | script-writer 노드 | ❌ [AI-AUD] **Sprint 6** |
| 50 | Sound Design | 사운드 디자인 | hub /post Sound | ✅ [AI-AUD] |
| 51 | Foley | 폴리 | script-writer 노드 | ❌ [AI-AUD] **Sprint 6** |
| 52 | Music Composition | 음악 작곡 | script-writer 노드 | ❌ [AI-AUD] **Sprint 6** |
| 53 | Music Licensing | 음악 라이선싱 | hub route | ❌ |
| 54 | Final Mix (5.1/7.1/Atmos) | 최종 믹싱 | hub /post Sound | 🟡 |
| 55 | Color Grading | 컬러 그레이딩 | hub /post Color | ✅ |
| 56 | Title Design / Credits | 타이틀·크레딧 | hub route | ❌ **Sprint 5** |
| 57 | Conform / Onlining | 컨폼·온라이닝 | hub route | ❌ |
| 58 | Final Video Assembly (ffmpeg) | 최종 비디오 어셈블리 | hub /post | ❌ **Quick-win 후보** |
| 59 | Deliverables Prep | 납품물 준비 | hub /post Delivery | 🟡 |

### Phase 5 — Distribution & Release (배급·개봉) · 11 공정 · [LIBRARY]

| # | 공정 | 국문 | 호스팅 | 상태 |
|---|---|---|---|---|
| 60 | QC (Quality Control) | 최종 QC | hub route | ❌ |
| 61 | DCP Mastering | DCP 마스터링 | hub route | ❌ |
| 62 | Festival Strategy / Submissions | 영화제 출품 | hub route | ❌ **Sprint 7** |
| 63 | Sales / Distribution Deal | 판매·배급 계약 | hub route | ❌ |
| 64 | Theatrical Release Planning | 극장 개봉 계획 | hub route | ❌ |
| 65 | Marketing — Trailer / Poster | 트레일러·포스터 | hub route | ❌ [AI-VID][AI-IMG] **Sprint 7** |
| 66 | PR / Press Kit | 홍보·보도자료 | hub route | ❌ |
| 67 | Content Library Registration | 라이브러리 등록 | hub /library | ✅ |
| 68 | Theatrical Release | 극장 개봉 | hub route | ❌ |
| 69 | Streaming / VOD Release | 스트리밍·VOD | hub /library | 🟡 **Sprint 7** |
| 70 | International Distribution | 해외 배급 | hub route | ❌ |

### Phase 6 — Post-release / Analytics (사후·분석) · 4 공정 · [LIBRARY]

| # | 공정 | 국문 | 호스팅 | 상태 |
|---|---|---|---|---|
| 71 | Box Office / Audience Analytics | 박스오피스·관객 분석 | hub route | ❌ **Sprint 8** |
| 72 | Reviews / Critic Aggregation | 평론 집계 | hub route | ❌ **Sprint 8** |
| 73 | Awards Campaign | 시상식 캠페인 | hub route | ❌ |
| 74 | Archive / Rights Management | 아카이브·권리 관리 | hub route | ❌ |

## 4. AI 프롬프트 모듈 우선 삽입 지점

사용자 지정: "이미지·비디오 프롬프트가 우선 들어간다"

| 삽입 지점 | 공정 번호 | 상태 |
|---|---|---|
| Pre-production 비주얼 디자인 | #24.1, 24.4~24.10, #25 | ✅ + 🟡 (4 Sprint로 완성) |
| Pre-production Previz | #24.12, #28 | ✅ |
| Production 대체 (이미지·비디오·오디오) | #33, #34, #35 | ✅ |
| Post VFX | #47 | ✅ |
| Post Sound 확장 | #49, #51, #52 | ❌ Sprint 6 |
| Marketing 생성 | #65 | ❌ Sprint 7 |

**AI 모듈 coverage**: 18개 공정 중 11개 완성(61%), 4개 부분, 3개 갭. → AI 비주얼 사실상 완성, AI 오디오 확장 여지.

## 5. 호스팅 패턴 (3가지)

| 패턴 | 위치 | 공정 수 | 예시 |
|---|---|---|---|
| **(가) Hub route** | `apps/contents-studio/apps/web/app/(dashboard)/[module]/` | ~45 | #16 Schedule, #17 Budget, #20 Casting |
| **(나) Script-writer 노드** | Design/Video Track 확장 | ~20 | #24.1~24.13, #33~35, #47 |
| **(다) 독립 앱 유지** | 별도 `apps/*` | ~8 | analysis-system, storyboard-maker, studio |

## 6. 모듈 표준 Anatomy (필수 4 deliverable)

```
1. Route namespace           /[module-slug] (hub) or Design/Video Track node (script-writer)
2. Progress API endpoint     GET /api/[module]/progress?paperclipId=
3. Deep-link support         ?paperclipId= auto-select
4. Hub aggregator 등록        apps/contents-studio/apps/web/app/api/projects/[id]/progress/route.ts
```

Hub route 표준 파일 구조:

```
app/(dashboard)/[module]/
├── page.tsx                 — 메인 (리스트·캘린더·대시보드)
├── [id]/page.tsx            — 상세 (선택)
└── ../api/[module]/
    ├── progress/route.ts
    └── *.ts                  — 모듈 CRUD
```

**페이지 수 결정 가이드**: 기본 1 페이지. 다음 중 해당 있으면 분리:
- 한 뷰에 정보가 3 화면 이상 스크롤
- Drill-down 컨텍스트가 원뷰와 다름
- URL로 특정 상태 공유 필요

## 7. 개발 로드맵 (9 Sprint)

| Sprint | 내용 | 공정 | 기간 |
|---|---|---|---|
| **0** | CI 안정화 (prompt-adapters typecheck) | — | 1일 |
| **0.5 (옵션)** | Final Video Assembly (#58, Beat Savior 실데이터) | #58 | 2~3일 |
| **1** | Pre-production Ops 3종 | #16, #17, #20 | 1~2주 |
| **2** *(재정의 2026-04-18)* | **Design Track provider 정렬** — script-writer apiMap ↔ storyboard-maker endpoints 복구. 새 노드 추가 아님 (이미 16개 정의 존재). | #24.5~.9 재활성화 | 별도 세션 |
| **3** | Design Track 확장 + VFX Previs | #24.10, #28 | 2주 |
| **4** | Pre-production 부대 | #18, #23 | 1주 |
| **5** | Post-production 보강 | #42, #56, #58 | 2주 |
| **6** | AI Audio 확장 [AI-AUD] | #49, #51, #52 | 2주 |
| **7** | Distribution | #62, #65, #69 | 2주 |
| **8** | Analytics | #71, #72 | 1~2주 |
| **9+** | 나머지 갭 (Development #1/#6/#9/#11~13, Production 부대, 등) | 나머지 20개 | 연속 |

**총 coverage 목표**: Sprint 8 종료 시점 ≥ 80% (60/73).

## 8. 통계 스냅샷 (2026-04-18 기준)

| 상태 | 개수 | 비율 |
|---|---|---|
| ✅ 완전 존재 | 22 | 30% |
| 🟡 부분 존재 | 11 | 15% |
| ❌ 부재 | 40 | 55% |

## 9. Out of Scope (의식적 제외)

- `analysis-system` 흡수 — 투자자용 독립 모듈 유지
  - **Typecheck 정책**: 135개 pre-existing 타입 debt 존재. CI에서는 advisory (exit 0 + 메시지)로 운영. 로컬에서 `tsc --noEmit` 실행하여 audit 가능. 부채 청산 세션은 별도 계획.
- `studio` 흡수 — Supabase + react-flow 별도 플랜 필요
- `shorts-factory` 흡수 — 별개 제품군 (K-POP 숏폼)
- `production-pipeline-system` — deprecated, 별도 결정 세션 필요
- `marionette-web` — 선-MVP 필요

## 10. 고도화 편의성 보장 (독립 모듈 원칙의 ROI)

각 모듈이 독립이므로 미래 업그레이드 경로가 **열려 있음**:

| 업그레이드 | 방법 |
|---|---|
| AI provider 교체 (Midjourney→Flux) | 해당 노드의 `providers.ts`만 수정 |
| 한 공정만 전용 앱 승격 | Phase 5a/5b 역패턴 (route → standalone) |
| 다국어 지원 | 모듈별 `messages/*.json` 독립 |
| 권한/인증 차별화 | 모듈별 middleware |
| 실시간 협업 추가 | 모듈별 WS 엔드포인트 |
| A/B 테스트 | 모듈별 flag |

**실증 증거** — Phase 5.1에서 hub 포트를 `:4001`→`:3000`으로 변경 시 **소스 코드 수정 0줄**. 독립 모듈 + env 주소 체계의 복리 효과.

## 변경 이력

- **v2.0** (2026-04-18): 73공정 확정, 6 Phase, Sprint 0~9+ 로드맵, AI 우선 삽입 지점 6곳 명시.
