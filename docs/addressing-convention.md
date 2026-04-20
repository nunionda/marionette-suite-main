# Marionette Suite — Addressing Convention

## 환경변수 네이밍 규칙

- `NEXT_PUBLIC_*` — 브라우저에 노출 OK (deep link, redirect URL)
- `INTERNAL_*` — 서버에서만 사용 (절대 client bundle에 포함 안 됨)
- 그 외 (`DATABASE_URL`, `NODE_ENV` 등) — 표준 컨벤션 따름

## 현재 dev 포트 매핑

| 서비스 | port | 환경변수 | 종류 |
|---|---|---|---|
| contents-studio-web | 3000 | `NEXT_PUBLIC_HUB_URL` | Web (canonical entry) |
| script-writer-frontend | 5174 | `NEXT_PUBLIC_SCRIPT_WRITER_URL` | Web (Vite) |
| storyboard-maker | 3007 | `NEXT_PUBLIC_STORYBOARD_URL` | Web+API |
| studio | 3001 | `NEXT_PUBLIC_STUDIO_URL` | Web |
| scenario-web | 4000 | `NEXT_PUBLIC_SCENARIO_WEB_URL` | Web |
| analysis-web | 4007 | `NEXT_PUBLIC_ANALYSIS_WEB_URL` | Web |
| shorts-factory | 5178 | `NEXT_PUBLIC_SHORTS_FACTORY_URL` | Web |
| script-writer-backend | 3006 | `INTERNAL_SCRIPT_ENGINE_URL` | WAS |
| contents-studio-api | 3005 | `INTERNAL_CONTENTS_STUDIO_API_URL` | WAS |
| analysis-api | 4006 | `INTERNAL_ANALYSIS_API_URL` | WAS |

## 규칙 3개

1. **모든 fetch는 env 경유**: 코드에 `http://localhost:NNNN` 직접 쓰지 말 것
2. **fallback 명시 의무**: `process.env.X ?? "http://localhost:Y"` 패턴 — 빈 문자열 fallback 금지
3. **변경은 .env에서만**: 새 service 추가 시 `.env.example`에 항목 추가 + 본 표 업데이트

## 문서 SSoT 규칙

프로젝트별 자료(world bible, trailer plan, 캐릭터 프로파일, 시나리오 spec 등)의 SSoT는 항상 `docs/`.

1. **`docs/`가 canonical** — 인간 편집·읽기 우선, agent 도구도 `docs/` 경로를 참조
2. **`packages/*/blueprints/` 안에 사본 두지 말 것** — duplication은 drift를 만든다 (graphify `INFERRED 0.95 semantically_similar_to` edge로 자동 검출됨)
3. **코드가 런타임에 blueprint를 로드해야 할 경우** — `import` 또는 build-time copy로 `docs/`를 참조 (사본 commit 금지)

## 향후 변경 (Phase 5.2+)

production target은 단일 origin (`app.marionette.studio`). dev에서는 이미 `:3000`(hub)로 통일됨.
아직 남은 standalone web apps (script-writer, studio, scenario-web, analysis-web, shorts-factory)도 순차 흡수 예정.

## 변경 이력

- **Phase 5a** (2026-04-18): `content-library` (`:4003`) 서비스를 hub `/library` 경로로 흡수. 독립 앱 및 `NEXT_PUBLIC_CONTENT_LIBRARY_URL` 제거.
- **Phase 5b** (2026-04-18): `post-studio` (`:4002`) 서비스를 hub `/post` 경로로 흡수. 독립 앱 및 `NEXT_PUBLIC_POST_STUDIO_URL` 제거.
- **Phase 5.1** (2026-04-18): hub port `:4001` → `:3000` 이동 (Next.js 표준 port). Phase 5.0 env 인프라가 코드 수정 0으로 port 변경을 처리함을 실증.
- **Phase 5c-prep** (2026-04-20): 문서 SSoT 규칙 추가. `packages/agent-rules/blueprints/`에 있던 `DECODE_Trailer_Production.md`·`DECODE_World_Bible.md` 사본 제거 — graphify 분석에서 byte-identical duplication으로 검출. agent-rules 패키지의 import 사용처 0건이라 무손실 삭제.
