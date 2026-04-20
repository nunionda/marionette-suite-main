# Hub mock → real data 배선 전략

**작성일**: 2026-04-20
**동기**: Sprint 20/21이 만든 hub 모듈 다수가 `mock-entries.ts` static 데이터로만 작동. real-data 전환 설계 필요.
**전제**: PR #15/#17/#19 머지 완료 (2026-04-20). `elements-core`에 PgLite-backed Drizzle store 활성화됨.

---

## 1. 현재 상태 (실측)

### Sprint 20 모듈 9개 (전부 동일 패턴)

| 경로 | Charter # | `page.tsx` | `*-client.tsx` | `mock-entries.ts` | `app/api/{m}/` |
|---|---|---|---|---|---|
| lighting-design | #24.10 | ✅ | ✅ | ✅ | progress only |
| vfx-previs | #28 | ✅ | ✅ | ✅ | progress only |
| stunt | #29 | ✅ | ✅ | ✅ | progress only |
| script-supervisor-prep | #30 | ✅ | ✅ | ✅ | progress only |
| script-doctoring | #9 | ✅ | ✅ | ✅ | progress only |
| photography | #36 | ✅ | ✅ | ✅ | progress only |
| on-set-sound | #39 | ✅ | ✅ | ✅ | progress only |
| continuity | #40 | ✅ | ✅ | ✅ | progress only |
| conform | #57 | ✅ | ✅ | ✅ | progress only |

공통: 실 데이터 저장소 없음, 생성/입력 UI 없음, aggregator는 static mock 읽어감.

---

## 2. 두 그룹으로 분리

### Group A — LLM-wiring 후보 (2개)

script-writer `textDesigner.ts`에 대응 endpoint가 있는 모듈:

| Hub 경로 | script-writer endpoint |
|---|---|
| `/lighting-design` | `POST /api/design/lighting_design/execute` |
| `/vfx-previs` | `POST /api/design/vfx_previs/execute` |

real-data 방식: **LLM 생성 → human review → locked 승격**.

### Group B — DB-only (7개)

대응 LLM 없음. 실 데이터는 **현장/제작팀이 직접 입력**:

- stunt — 스턴트 안무 계획, 인력, 장비
- script-supervisor-prep — 스크립트 수퍼바이저 체크리스트
- script-doctoring — 스크립트 검토 노트
- photography — 촬영 일지
- on-set-sound — 사운드 일지
- continuity — 연속성 체크
- conform — 컨폼/온라이닝 체크

real-data 방식: **DB 테이블 + CRUD API + 폼 UI**.

---

## 3. 스키마 불일치 현황 (Group A 대표 사례)

### `/lighting-design` (hub) vs `lighting_design` (script-writer)

| 항목 | Hub mock | Script-writer LLM |
|---|---|---|
| Grain | project × location | scene |
| Field `keyLight`/`keySource` | `keyLight` string | `keySource` string |
| Equipment | ❌ | `equipment[]` |
| Color temp | `number` 6000 | `string` "5600K daylight" |
| Fill ratio | `fillRatio` | ❌ |
| Status workflow | 4-stage | 항상 draft-급 |
| Overall strategy | ❌ | `overallStrategy` |
| Practicals/mood/notes/timeOfDay | 공통 ✅ | 공통 ✅ |

두 계층이 **독립 세션에서 만들어져 merge 직전까지 서로 모름**. `/vfx-previs`도 동일한 불일치 추정 (shots vs project-grain).

---

## 4. 배선 결정 사항 (사용자 판단 필요)

### D1. Group A grain 전략

- **D1-a**: scene-level LLM 출력을 location으로 groupBy → 기존 hub UI 유지. `fillRatio`/`status` 필드는 사람이 보충.
- **D1-b**: hub UI 자체를 scene-level로 재설계 (mock-entries → LightingPlan per scene). Charter의 "scene-level 씬별 라이팅 플랜" 의도에 부합.
- **D1-c**: 두 뷰 병존 (project overview + scene detail drill-down).

권장: **D1-b**가 Charter 의도에 맞고 정보 중복 없음. 단 기존 mock UI 재작성 필요.

### D2. 저장소

- **D2-a**: 신규 Drizzle 테이블 `lighting_plans` / `vfx_shots` / 각 Group B당 1개 테이블.
- **D2-b**: 기존 `production_assets` 테이블의 JSON payload에 저장 (레거시).
- **D2-c**: elements-core의 `elements` 테이블에 kind별로 저장 (PR #17로 활성화된 PgLite 쓰기 가능).

권장: **D2-a** 혹은 **D2-c**. D2-c는 elements-core의 범용성 실증에 유리하지만 스키마 강제가 약함.

### D3. 생성 트리거 UI

- **D3-a**: 프로젝트 상세 페이지 상단 "Generate All Scenes" 버튼 + progress bar.
- **D3-b**: scene detail 페이지 per-scene "Generate" 버튼.
- **D3-c**: 둘 다.

권장: **D3-a 먼저** (효율), 이후 재생성 필요 시 per-scene.

### D4. Human review workflow

- LLM 출력 = `draft` 자동 기록.
- 사람이 `approved` → `locked` 승격 (현장 투입 확정).
- **현장 중 변경**: `locked` → `on-set-adjusted` 상태 전환 버튼.

이건 UI 추가만 하면 됨 (상태 필드는 이미 mock 타입에 있음).

### D5. Group B 폼 UI

각 모듈당 다음 필요:
- CRUD API (GET list, POST create, PATCH update, DELETE)
- 폼 컴포넌트 (필드는 기존 mock-entries.ts 타입에서 도출)
- 일괄 입력 vs 항목별 편집 UX 선택

권장: **Group B는 우선순위 낮음** (실제 제작 현장 투입 단계에서 필요). Group A가 LLM-heavy라 가치 더 큼.

---

## 5. 실행 순서 제안

1. **D1~D5 결정 → 메모하기** (plan doc 하단에 locked-in 섹션 추가)
2. **Group A 시범**: `/lighting-design` 한 모듈만 완전 배선 (D1-b + D2-c + D3-a + D4)
   - 작업 단위:
     a. Drizzle schema 추가 (or elements-core kind 정의)
     b. Bun+Hono route `POST /api/lighting-design/generate` — script-writer 프록시
     c. `page.tsx` → server fetch from DB (mock-entries.ts 제거)
     d. client에 generate 버튼 + status 전환 버튼
   - 테스트: Beat Savior (project 28) 122 scenes로 실행
3. **시범 결과 회고 → /vfx-previs에 동일 패턴 적용**
4. **Group A 완료 후 Group B 우선순위 재평가**

---

## 6. 주의사항

- **Script-writer LLM 비용 정책**: `apps/script-writer/CLAUDE.md` — 무료 모델 (Gemini Free / Ollama / HuggingFace / Groq Free) + Anthropic 크레딧 범위. 배선 시 Gemini Free 기본 사용.
- **Auth guard**: `apps/contents-studio/apps/api/src/index.ts`의 `authGuard`는 `/api/auth`와 `/api/health` 제외 전부 보호. 새 route는 auth 고려 필요.
- **Aggregator**: `/lighting-design/progress` 등 progress route는 이미 aggregator 49-leg에 연결. 실 데이터로 전환 시 progress 계산식만 갱신.
- **Sprint 10/11/19/21 모듈 (27개)**: 동일 audit 필요 — 이 plan은 Sprint 20만 커버.

---

## 7. 열린 질문

- Group A 시범은 `/lighting-design` vs `/vfx-previs` 어느 쪽 먼저? (복잡도는 lighting이 더 구조적, vfx는 shot breakdown이 단순)
- Drizzle schema는 `packages/elements-core`에 추가 vs `apps/contents-studio/apps/api/src` 에 신규 `packages/hub-schema`? (monorepo DB 구조 방향 결정 필요)
- Beat Savior 122 scenes 일괄 생성 시 rate limit 정책? (Gemini Free tier 기준 per-minute cap)

---

**다음 세션 진입**: D1~D5 결정 답변 → locked-in 섹션 추가 → 시범 작업 지침 확정 → 실행.

---

## 8. Locked-in 결정 (2026-04-20 저녁)

| 코드 | 결정 | 근거 |
|---|---|---|
| **D1** | **D1-b** scene-level UI 재설계 | script-writer `textDesigner.ts` 의 `scenes[]`가 SSoT. 매핑 로스 제거. |
| **D2** | **D2-c** elements-core PgLite (`kind: "lighting_plan" \| "vfx_shot" \| ...`) | PR #17로 즉시 활성화. 9 모듈 통합 스토어. Drizzle schema 1개 유지. |
| **D3** | **D3-a 먼저** 프로젝트 일괄 generate | Beat Savior 122 scenes 기준 수동 per-scene 비현실적. D3-b는 follow-up. |
| **D4** | **채택** — LLM 출력=draft / human: approved → locked / on-set-adjusted | Sprint 20 mock의 status 4단계 그대로 재사용. |
| **D5** | **defer** — Group B 7 모듈은 Group A 완료 후 재평가 | 실제 제작 투입 단계에서만 가치, 현 우선순위 낮음. |

### 시범 작업 세부 지침 (locked)

1. `packages/elements-core/src/store/schema.ts` — 현재 `elements` 테이블에 `kind` 컬럼 추가/확장 확인 필요. `lighting_plan`/`vfx_shot` kind 허용.
2. `apps/contents-studio/apps/api/src/routes/` 에 `lighting-design.ts` 신규 — `POST /api/hub/lighting-design/generate` (projectId 받음 → script-writer `/api/design/lighting_design/execute` 호출 → elements-core 저장).
3. `apps/contents-studio/apps/web/app/(dashboard)/lighting-design/page.tsx` — server component에서 elements-core query (`kind="lighting_plan"`, `projectId` 필터). mock-entries.ts 제거.
4. `lighting-design-client.tsx` — "Generate for project" 버튼 + 상태 드롭다운 + 감사로그 표시. scene-level 테이블로 재편.
5. Beat Savior (project 28, 122 scenes) 테스트.
6. `/vfx-previs` 동일 패턴 복제.

### 작업 단위 (commit 경계)

- **C1**: elements-core schema `kind` 확장 + 마이그레이션 (해당 필요 시)
- **C2**: hub API `lighting-design/generate` route (프록시 only, 저장 제외)
- **C3**: elements-core write path + generate route 저장 연동
- **C4**: `/lighting-design` page → DB fetch 전환
- **C5**: client generate 버튼 + status 드롭다운
- **C6**: Beat Savior 실행 검증 + 회고
- **C7**: `/vfx-previs` 복제 (C1~C5 동등 패턴)

---

## 9. 주의: 시범 시작 전 확인 필요

- `packages/elements-core`의 현재 `kind` 컬럼 타입이 extensible한지 (enum vs text)
- script-writer `/api/design/*/execute` 엔드포인트의 auth 요구사항 (hub proxy가 자체 토큰 전달 필요한지)
- Gemini Free tier rate limit이 122 scenes 일괄 호출 허용하는지 (throttle 필요 시 queue 추가)

