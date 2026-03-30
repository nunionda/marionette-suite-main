# Meeting Minutes — Dev Team Sprint 1 Kickoff

**Date:** 2026-03-30
**Meeting Type:** Team Meeting — Sprint 1 Schedule Review
**Chair:** CTO
**Attendees:** Dev Team Lead, Frontend Developer, Backend Developer, DevOps Engineer, QA Engineer
**Status:** CLOSED — Action items assigned

---

## Agenda

1. Sprint 1 현황 점검 (Day 2)
2. 각 팀원 주간 목표 및 블로커 공유
3. 전체 스프린트 스케줄 재확인
4. 오늘(Mar 30) EOD 액션 아이템 확정

---

## Sprint 1 목표 (Mar 29 – Apr 4)

**Production Unlock:** 분석팀이 실제 데이터로 대시보드를 사용할 수 있도록
- OpenAI/DeepSeek 전면 제거, 무료 provider chain 구현
- `apps/web` 대시보드 실제 API 연동 (localStorage/mock 제거)
- gstack 워크스페이스 설정 완료

---

## 팀별 보고 요약

### Dev Team Lead
- Sprint 1 태스크 목록 정리 완료 (12개 태스크, P0 3개 진행 중)
- PR 리뷰 SLA: 제출 후 4시간 이내
- **리스크:** API 계약서 미확정 시 Frontend→Sprint 2 블로킹

### Frontend Developer
- `apps/web` 13개 컴포넌트 파악 완료 — 전부 mock 데이터 의존
- Task 1.4 (API wiring), 1.6 (report history), 1.7 (draft comparison) 이번 주 완료 목표
- **블로커:** Backend Task 1.5 (API 스키마) 오늘 완료 필요

### Backend Developer
- `packages/ai-gateway` provider chain 재설계 범위 특정
- Task 1.1 (OpenAI 제거 Mar 31), 1.2 (provider chain Apr 1), 1.5 (API 계약 오늘)
- Sprint 2용 `CastingDirector`, `LocationScout`, `Cinematographer` 인터페이스 스펙 Apr 4까지
- **블로커:** Ollama 로컬 인스턴스 → DevOps 지원 요청

### DevOps Engineer
- `gstack setup` + `$B health` 오늘 완료
- GitHub Actions CI 스켈레톤 Apr 3 목표
- **결정:** gstack 바이너리 CI 이미지 포함 → CTO 승인 완료

### QA Engineer
- Provider chain unit test Apr 2, gstack `/qa` Apr 3 목표
- Sprint 1 QA Gate 체크리스트 Apr 4 서명 목표
- **블로커:** DevOps gstack setup (Task 1.8) 오늘 완료 후 `/qa` 실행 가능

---

## 전체 스프린트 스케줄

| Sprint | 기간 | 핵심 작업 | Production Unlock |
|--------|------|----------|-------------------|
| S1 | Mar 29–Apr 4 | Free LLM 교체 · 대시보드 API wiring · gstack setup | 분석 대시보드 실데이터 |
| S2 | Apr 5–Apr 11 | CastingDirector · LocationScout · Cinematographer | 캐릭터시트 · 로케이션 아트 |
| S3 | Apr 12–Apr 18 | Colorist · MixingEngineer · Previsualizer · 14-agent E2E | 씬 전체 파이프라인 |
| S4 | Apr 19–Apr 25 | Docker · /ship · /canary · 회귀 테스트 | 자동 배포 + 모니터링 |
| S5 | Apr 26–May 2 | 인증 · 베타 론치 | 외부 50명 사용자 |

**Sprint Gate 정책:**
- S3 완료 시 Production 팀 사인오프 없으면 S4 시작 불가
- S1 API 계약 미확정 시 Frontend S2 Day 1 착수 불가

---

## Action Items (Mar 30 EOD)

| # | Owner | Action | Deadline |
|---|-------|--------|----------|
| A1 | Backend Dev | API 스키마 문서화 및 공유 (`/analyze`, `/report/:id`, `/reports`, `/compare`) | 18:00 |
| A2 | DevOps | `gstack setup` + `$B health` 검증 완료 | 15:00 |
| A3 | DevOps | Ollama 로컬 환경 설정 (Backend Dev 지원) | 17:00 |
| A4 | Dev Team Lead | Sprint 1 태스크 Paperclip 티켓 등록 | 12:00 |
| A5 | QA | gstack `/qa` 실행 환경 사전 점검 (A2 완료 후) | 16:00 |

---

## Decisions

| Decision | Detail | Rationale |
|----------|--------|-----------|
| gstack CI 이미지 포함 승인 | Sprint 4 `/ship` 워크플로우 의존성 | CTO 즉석 결정 |
| API 계약 오늘 확정 | Backend → Frontend 블로킹 해소 필수 | Sprint 2 일정 보호 |
| Sprint Gate 정책 재확인 | Dev = Production 지원 원칙 준수 | Execution Plan §6 |

---

## Next Meetings

- **Sprint 1 중간 점검:** 2026-04-01 — P0 태스크 완료 여부
- **Sprint 1 클로징:** 2026-04-04 — QA Gate 서명 + Sprint 2 킥오프

---

*Minutes recorded by CTO · Marionette Studios · 2026-03-30*
