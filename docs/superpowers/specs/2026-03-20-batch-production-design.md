# Phase 4-F: 배치 프로덕션 — 씬/컷 단위 순차 실행 + 재생성

> Date: 2026-03-20

## Goal

DirectionPlan의 씬/컷 구조를 기반으로, 전체 프로덕션 파이프라인을 씬 단위로 순차 실행하고, 완료된 씬/컷을 개별적으로 재생성할 수 있는 배치 프로덕션 시스템을 구축한다.

## Context

현재 파이프라인은 `PipelineOrchestrator`가 에이전트를 순차 실행하는 단일 런 구조. 씬이 96개인 프로젝트에서 전체를 한 번에 돌리면 중간에 실패한 씬 때문에 전체가 멈추고, 마음에 안 드는 결과를 개별적으로 수정할 방법이 없다.

## Design Principles

1. **안정성 우선** — 동시 처리보다 순차 처리로 에러 격리
2. **실패 격리** — 하나가 실패해도 나머지는 계속 진행
3. **세밀한 재생성** — 씬 전체 또는 컷 하나만 선택적으로 재생성
4. **기존 호환** — 단일 PipelineRun 구조는 그대로 유지

---

## Data Model

### TaskStatus Enum

기존 `RunStatus` (QUEUED, RUNNING, COMPLETED, FAILED, CANCELLED)와 별도로 배치 태스크 전용 enum을 정의한다.

```prisma
enum TaskStatus {
  QUEUED
  RUNNING
  COMPLETED
  FAILED
  CANCELLED
  REGENERATING
}
```

- `CANCELLED`: 배치 중단 시 아직 실행되지 않은 대기 중 태스크에 적용
- `REGENERATING`: 재생성 요청된 태스크 (재실행 대기 상태)

`BatchRun.status`는 기존 `RunStatus`를 재사용하되 `CANCELLED` 상태를 활용한다.

### BatchRun (배치 실행 단위)

```prisma
model BatchRun {
  id              String      @id @default(cuid())
  projectId       String
  project         Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  status          RunStatus   @default(QUEUED)
  totalScenes     Int
  completedScenes Int         @default(0)
  progress        Float       @default(0)
  errorMessage    String?
  sceneTasks      SceneTask[]
  startedAt       DateTime?
  completedAt     DateTime?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}
```

### SceneTask (씬별 작업 단위)

```prisma
model SceneTask {
  id           String        @id @default(cuid())
  batchRunId   String
  batchRun     BatchRun      @relation(fields: [batchRunId], references: [id], onDelete: Cascade)
  sceneNumber  Int
  status       TaskStatus    @default(QUEUED)
  currentStep  String?
  stepResults  Json          @default("{}")
  attempt      Int           @default(1)
  errorMessage String?
  cutTasks     CutTask[]
  startedAt    DateTime?
  completedAt  DateTime?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@unique([batchRunId, sceneNumber])
}
```

### CutTask (컷별 작업 단위)

```prisma
model CutTask {
  id           String      @id @default(cuid())
  sceneTaskId  String
  sceneTask    SceneTask   @relation(fields: [sceneTaskId], references: [id], onDelete: Cascade)
  cutNumber    Int
  status       TaskStatus  @default(QUEUED)
  steps        Json        // string[] — e.g. ["cinematographer", "generalist", "sound_designer"]
  currentStep  String?
  stepResults  Json        @default("{}")
  attempt      Int         @default(1)
  errorMessage String?
  startedAt    DateTime?
  completedAt  DateTime?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  @@unique([sceneTaskId, cutNumber])
}
```

### stepResults 형상

```typescript
// SceneTask.stepResults
type SceneStepResults = Record<string, {
  status: "completed" | "failed"
  message?: string
  outputPath?: string
  completedAt: string  // ISO date
}>

// CutTask.stepResults — 동일 형상
type CutStepResults = SceneStepResults
```

### Project relation 추가

```prisma
model Project {
  // ... existing fields
  batchRuns  BatchRun[]
}
```

---

## Execution Engine: BatchOrchestrator

### Agent Input 어댑터

기존 에이전트는 `AgentInput = { projectId, runId, ... }`을 받는다. BatchOrchestrator는 에이전트 호출 시 다음과 같이 어댑팅한다:

```typescript
interface BatchAgentInput extends AgentInput {
  projectId: string
  runId: string         // batchRunId를 전달 (에이전트 내부에서 PipelineRun 업데이트는 건너뜀)
  sceneNumber: number
  cutNumber?: number    // 컷 레벨 에이전트에만 제공
  batchRunId: string
  sceneTaskId: string
  cutTaskId?: string
}
```

에이전트의 `updateProgress()` 호출은 BatchOrchestrator가 오버라이드하여 `SceneTask`/`CutTask` 테이블을 업데이트한다. 기존 `PipelineRun` 테이블은 건드리지 않는다.

### DirectionPlan 타입 참조

기존 `packages/shared/src/types/project.ts`의 `Scene`, `Cut` 타입을 사용한다.

### 실행 흐름

```
BatchOrchestrator.run(batchRunId)
│
├── 1. DirectionPlan에서 씬/컷 목록 추출
├── 2. SceneTask + CutTask 레코드 일괄 생성
│
├── 3. 씬 순차 루프 (씬 1 → 씬 2 → ... → 씬 N)
│   │   [매 루프 시작 시 cancellation 체크]
│   │
│   ├── 3a. 씬 레벨 에이전트 실행
│   │   (concept_artist: 해당 씬 스토리보드 생성)
│   │
│   ├── 3b. 컷 순차 루프 (컷 1 → 컷 2 → ... → 컷 M)
│   │   ├── cinematographer (프롬프트 보강)
│   │   ├── generalist (비디오 생성)
│   │   └── sound_designer (TTS/SFX)
│   │
│   ├── 3c. 씬 완료 → WebSocket emit
│   └── 3d. progress 업데이트
│
└── 4. 전체 완료 → 후반작업 (master_editor 등)
```

### 클래스 구조

```typescript
class BatchOrchestrator {
  private abortController: AbortController | null = null

  constructor(
    private db: PrismaClient,
    private agentRegistry: Map<string, BaseAgent>,
    private eventBus: EventEmitter,
  ) {}

  // 메인 실행
  async run(batchRunId: string): Promise<void>

  // 씬 하나 실행 (씬 레벨 에이전트 + 컷 루프)
  private async executeScene(sceneTask: SceneTask, sceneData: Scene): Promise<void>

  // 컷 하나 실행 (에이전트 체인)
  private async executeCut(cutTask: CutTask, cutData: Cut, sceneContext: Record<string, unknown>): Promise<void>

  // 취소
  async cancel(batchRunId: string): Promise<void>

  // 재생성 (배치가 COMPLETED/FAILED 상태일 때만 허용)
  async regenerateScene(batchRunId: string, sceneNumber: number): Promise<void>
  async regenerateCut(sceneTaskId: string, cutNumber: number): Promise<void>
  async rerunFrom(batchRunId: string, fromSceneNumber: number): Promise<void>
}
```

### 취소 메커니즘

```
cancel(batchRunId)
│
├── 1. abortController.abort() — 현재 실행 중인 에이전트에 signal 전달
├── 2. BatchRun.status = CANCELLED
├── 3. RUNNING 상태인 SceneTask/CutTask → CANCELLED
├── 4. QUEUED 상태인 SceneTask/CutTask → CANCELLED
├── 5. emit batch:cancelled 이벤트
└── 6. 이미 COMPLETED/FAILED인 태스크는 그대로 유지
```

에이전트 실행 루프 내부에서 매 씬/컷 시작 전 `abortController.signal.aborted`를 확인하여 조기 종료한다.

### 재생성 동시성 정책

- **배치 RUNNING 중**: 재생성 요청 거부 (409 Conflict). 먼저 취소하거나 완료를 기다려야 함.
- **배치 COMPLETED/FAILED/CANCELLED 후**: 재생성 허용. 배치 상태를 RUNNING으로 변경 후 대상 태스크만 재실행.
- **동시 재생성 방지**: 배치당 하나의 실행만 허용. `BatchRun.status === RUNNING`이면 모든 재생성/재실행 요청 거부.

### 에러 처리 정책

- **컷 실패**: 해당 CutTask만 FAILED, 같은 씬의 나머지 컷은 계속 진행
- **씬 레벨 에이전트 실패**: 해당 SceneTask 전체 FAILED, 다음 씬으로 넘어감
- **전체 중단 없음**: 실패한 씬/컷은 나중에 개별 재생성 가능
- **BatchRun 최종 상태**: 모든 씬 COMPLETED → COMPLETED, 하나라도 FAILED → FAILED (하지만 중단하지 않음)
- **최대 재생성 횟수**: attempt 필드에 상한 없음 (사용자 자율). UI에서 attempt 횟수를 표시하여 과도한 재생성을 인지할 수 있게 함.

### Progress 계산

```
씬 가중치 = 각 씬의 컷 수에 비례
컷 내 스텝 가중치 = 1/스텝수 (예: 3개 에이전트면 각 0.33)
progress = (완료된 스텝 가중치 합 / 전체 스텝 가중치 합) × 100
```

컷 내부 스텝 완료도 progress에 반영하여 부드러운 진행률 표시.

---

## API Endpoints

### 배치 실행

```
POST /api/batch/:projectId/run
  Body: { steps?: string[] }  // 기본: ["concept_artist", "cinematographer", "generalist", "sound_designer"]
  Response: { batchRun: BatchRun }
  동작: DirectionPlan에서 씬/컷 추출 → BatchRun + SceneTask + CutTask 생성 → 비동기 실행
  가드: 해당 프로젝트에 RUNNING 상태 배치가 있으면 409

GET /api/batch/:projectId/runs
  Response: { batchRuns: BatchRun[] }

GET /api/batch/:projectId/run/:batchRunId
  Response: { batchRun: BatchRun & { sceneTasks: (SceneTask & { cutTasks: CutTask[] })[] } }
```

### 취소

```
POST /api/batch/:batchRunId/cancel
  동작: 실행 중인 배치를 취소, RUNNING/QUEUED 태스크를 CANCELLED로 변경
  가드: RUNNING 상태가 아니면 409
```

### 재생성

```
POST /api/batch/:batchRunId/scene/:sceneNumber/regenerate
  동작: SceneTask + 모든 CutTask 초기화 → attempt++ → 재실행
  가드: BatchRun.status가 RUNNING이면 409

POST /api/batch/:batchRunId/scene/:sceneNumber/cut/:cutNumber/regenerate
  동작: CutTask만 초기화 → attempt++ → 즉시 실행
  가드: BatchRun.status가 RUNNING이면 409

POST /api/batch/:batchRunId/rerun-from/:sceneNumber
  동작: 씬 N~끝까지 모든 SceneTask/CutTask 초기화 → 순차 재실행
  가드: BatchRun.status가 RUNNING이면 409
```

### 라우트 등록

```typescript
// apps/api/src/index.ts
import { batchRoutes } from "./routes/batch.ts"
app.route("/api/batch", batchRoutes)
```

---

## WebSocket Events

```typescript
// 기존 PipelineWSEvent에 추가
| { type: "batch:started"; batchRunId: string; projectId: string; totalScenes: number }
| { type: "batch:scene:started"; batchRunId: string; sceneNumber: number }
| { type: "batch:scene:completed"; batchRunId: string; sceneNumber: number; success: boolean }
| { type: "batch:cut:started"; batchRunId: string; sceneNumber: number; cutNumber: number; step: string }
| { type: "batch:cut:completed"; batchRunId: string; sceneNumber: number; cutNumber: number; success: boolean }
| { type: "batch:cut:step:completed"; batchRunId: string; sceneNumber: number; cutNumber: number; step: string; success: boolean }
| { type: "batch:progress"; batchRunId: string; progress: number; currentScene: number; currentCut?: number }
| { type: "batch:completed"; batchRunId: string; status: "completed" | "failed" | "cancelled" }
```

### WS Snapshot 확장

```typescript
// BatchRunSnapshot 타입
interface BatchRunSnapshot {
  batchRunId: string
  projectId: string
  projectTitle: string
  status: string
  progress: number
  totalScenes: number
  completedScenes: number
  currentScene?: number
}
```

WS 연결 시 `run:snapshot` 이벤트에 활성 BatchRun도 `batchRuns` 필드로 포함.

---

## UI: 배치 모니터

### 위치

프로젝트 상세 페이지 → Production 탭에 "배치 프로덕션" 섹션 추가.

### 레이아웃

```
┌──────────────────────────────────────────────────┐
│ 배치 프로덕션                       [실행] [중단]  │
│ Progress: ████████░░░░░░░░ 52% (씬 5/10)         │
├──────────────────────────────────────────────────┤
│ 씬 1  ✅ 완료  (컷 4/4)                 [재생성]  │
│ 씬 2  ✅ 완료  (컷 3/3)                 [재생성]  │
│ 씬 3  ❌ 실패  (컷 2 실패)              [재생성]  │
│   ├ 컷 1  ✅                                     │
│   ├ 컷 2  ❌ "Veo API timeout"       [재생성]    │
│   └ 컷 3  ✅                                     │
│ 씬 4  ✅ 완료  (컷 5/5)                 [재생성]  │
│ 씬 5  🔄 진행중 (컷 2/4 - generalist)            │
│   ├ 컷 1  ✅                                     │
│   ├ 컷 2  🔄 비디오 생성 중...                    │
│   ├ 컷 3  ⏳ 대기                                │
│   └ 컷 4  ⏳ 대기                                │
│ 씬 6~10  ⏳ 대기                                 │
├──────────────────────────────────────────────────┤
│ [씬 ▼ 부터 재실행]                                │
└──────────────────────────────────────────────────┘
```

### 컴포넌트 구조

```
BatchMonitor (메인 컨테이너)
├── BatchHeader (진행률 바, 실행/중단 버튼)
├── SceneTaskList (씬 목록)
│   └── SceneTaskRow (씬 1줄 — 접기/펼치기)
│       └── CutTaskList (컷 목록 — 펼친 상태)
│           └── CutTaskRow (컷 1줄)
└── RerunFromSelector (씬 N부터 재실행 드롭다운)
```

### 인터랙션

- **씬 접기/펼치기**: 기본 접힌 상태. 진행 중/실패 씬은 자동 펼침.
- **재생성 버튼**: 씬/컷별 개별 재생성. 확인 다이얼로그 후 실행. 배치 실행 중이면 비활성화.
- **중단 버튼**: 실행 중일 때만 활성화. 확인 다이얼로그 후 취소 API 호출.
- **실시간 업데이트**: WebSocket으로 상태/진행률 자동 갱신.
- **실행 버튼**: DirectionPlan이 있고 실행 중인 배치가 없을 때만 활성화.
- **attempt 표시**: 재생성된 씬/컷은 "(2회차)" 등 attempt 횟수 표시.

---

## Critical Files

| 파일 | 변경 | 설명 |
|------|------|------|
| `packages/db/prisma/schema.prisma` | 수정 | BatchRun, SceneTask, CutTask 모델 + TaskStatus enum |
| `packages/agents/src/base/batch-orchestrator.ts` | 신규 | BatchOrchestrator 클래스 |
| `apps/api/src/routes/batch.ts` | 신규 | 배치 API 라우트 |
| `apps/api/src/services/batch.service.ts` | 신규 | 배치 실행 서비스 (싱글톤 오케스트레이터) |
| `apps/api/src/index.ts` | 수정 | batchRoutes 등록 |
| `packages/shared/src/types/ws-events.ts` | 수정 | batch:* 이벤트 타입 + BatchRunSnapshot |
| `apps/api/src/ws/handler.ts` | 수정 | batch 이벤트 구독 + snapshot 포함 |
| `apps/web/components/batch-monitor.tsx` | 신규 | 배치 모니터 UI 컴포넌트 |
| `apps/web/app/(dashboard)/projects/[id]/page.tsx` | 수정 | Production 탭에 BatchMonitor 추가 |

---

## Scope Exclusions

- 에이전트 간 병렬 실행 (향후 확장)
- 동시 다중 배치 실행 (한 프로젝트에 동시에 하나만)
- 씬 순서 변경/건너뛰기
- 에이전트 체인 커스터마이징 UI (API에서만 steps 파라미터로 지원)
- 재생성 최대 횟수 제한 (사용자 자율, UI에서 attempt 횟수 표시)
