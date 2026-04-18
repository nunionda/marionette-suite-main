# Marionette Suite — Addressing Convention

## 환경변수 네이밍 규칙

- `NEXT_PUBLIC_*` — 브라우저에 노출 OK (deep link, redirect URL)
- `INTERNAL_*` — 서버에서만 사용 (절대 client bundle에 포함 안 됨)
- 그 외 (`DATABASE_URL`, `NODE_ENV` 등) — 표준 컨벤션 따름

## 현재 dev 포트 매핑

| 서비스 | port | 환경변수 | 종류 |
|---|---|---|---|
| contents-studio-web | 4001 | `NEXT_PUBLIC_HUB_URL` | Web |
| post-studio | 4002 | `NEXT_PUBLIC_POST_STUDIO_URL` | Web |
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

## 향후 변경 (Phase 5.1+)

production target은 단일 origin (`app.marionette.studio`). dev에서도 결국 `:3000`로 통일할 예정.
이 표는 Phase 5.1에서 갱신될 예정이며, 그때도 코드 변경 없이 .env만 바꾸면 적용됨.

## 변경 이력

- **Phase 5a**: `content-library` (`:4003`) 서비스를 hub `/library` 경로로 흡수. 독립 앱 및 `NEXT_PUBLIC_CONTENT_LIBRARY_URL` 제거.
