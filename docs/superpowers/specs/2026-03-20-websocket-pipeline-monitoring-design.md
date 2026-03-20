# WebSocket 실시간 파이프라인 모니터링

> Date: 2026-03-20 | Status: Approved

## Problem

파이프라인 모니터링 UI가 3초 간격 HTTP 폴링(`setInterval(fetchRuns, 3000)`)에 의존. 불필요한 네트워크 요청, 최대 3초 지연, 서버 부하 증가.

## Solution

Bun 네이티브 WebSocket + Hono 업그레이드로 서버→클라이언트 실시간 이벤트 푸시. 연결 실패 시 기존 폴링 자동 폴백.

## Architecture

```
[PipelineOrchestrator]  ──emit──→  [PipelineEventBus]  ──ws.send──→  [Browser]
      (agents pkg)                    (api singleton)                 (Next.js)
```

### PipelineEventBus

- `packages/agents/src/base/pipeline-events.ts` — EventEmitter 싱글톤
- 오케스트레이터가 진행 시 `bus.emit("pipeline:event", wsEvent)` 호출
- API 서버에서 동일 인스턴스를 import하여 WebSocket 클라이언트에 브릿지

### WebSocket Server

- `apps/api/src/ws/handler.ts` — 연결 관리, 클라이언트 Set 관리
- Bun 서버의 `websocket` 옵션으로 핸들러 등록
- `/api/pipeline/ws` 경로로 업그레이드 요청 처리

### Client Hook

- `apps/web/hooks/use-pipeline-ws.ts` — `useWebSocket` 커스텀 훅
- 자동 연결, 자동 재연결 (3초 간격, 최대 5회), 폴링 폴백

## Event Types

```typescript
// packages/shared/src/types/ws-events.ts

export type PipelineWSEvent =
  | { type: "run:started"; runId: string; projectId: string; steps: string[] }
  | { type: "step:started"; runId: string; step: string; stepIndex: number }
  | { type: "step:completed"; runId: string; step: string; success: boolean; message?: string }
  | { type: "progress"; runId: string; progress: number; currentStep: string }
  | { type: "run:completed"; runId: string; status: "completed" | "failed"; error?: string }
```

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `packages/shared/src/types/ws-events.ts` | CREATE | WSEvent 타입 정의 |
| `packages/shared/src/index.ts` | MODIFY | ws-events export 추가 |
| `packages/agents/src/base/pipeline-events.ts` | CREATE | PipelineEventBus 싱글톤 |
| `packages/agents/src/base/pipeline.ts` | MODIFY | 이벤트 발행 추가 |
| `apps/api/src/ws/handler.ts` | CREATE | WebSocket 연결 관리 |
| `apps/api/src/index.ts` | MODIFY | Bun WebSocket 서버 설정 |
| `apps/web/hooks/use-pipeline-ws.ts` | CREATE | useWebSocket 커스텀 훅 |
| `apps/web/app/(dashboard)/pipeline/page.tsx` | MODIFY | 폴링→WebSocket 전환 |

## Fallback Strategy

1. WebSocket 연결 시도
2. 연결 실패 → 3초 후 재연결 (최대 5회)
3. 5회 모두 실패 → 기존 3초 HTTP 폴링으로 자동 폴백
4. WebSocket 재연결 성공 시 폴링 중단

## Constraints

- 추가 npm 의존성 없음 (Bun 네이티브 WebSocket, Hono 내장)
- 로컬 맥북 환경 우선
- 기존 API 엔드포인트 유지 (폴백용)
