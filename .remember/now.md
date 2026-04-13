# 현재 세션 상태 (2026-04-13)

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

## 서비스 포트
- script-writer frontend: :5174 (Vite)
- script-writer backend: :3006 (Bun + Elysia)
- studio: :3001 (Next.js)
- storyboard-concept-maker: :3007 (Python)

## 다음 세션 태스크
- cine-analysis-system 정식 연동
- 최종 비디오 어셈블리 (ffmpeg)
- 유료 API 전환 시 providers.ts만 수정
