# Marionette Studio - AI 영화제작 파이프라인 플랫폼 설계

> 버전: v1.1 | 2026-03-19
> 기존 Python 파이프라인을 TypeScript/Bun 기반 풀스택 플랫폼으로 재구축

---

## 1. Context

### 문제
현재 Marionette Studio는 Python CLI + Flask API + SQLite로 구성된 프로토타입 상태. 8개 AI 에이전트가 구현되어 있으나, 프론트엔드 없이 CLI로만 운영되고, 프로젝트 관리/모니터링이 불편. 시나리오 개발부터 유튜브 업로드까지의 원스탑 솔루션을 위해 체계적인 플랫폼이 필요.

### 목표
- Pre/Main/Post Production 단계별 AI 에이전트 관리 플랫폼
- 도메인 중심 설계로 14개 에이전트를 체계적으로 조직
- 멀티 AI 프로바이더 지원 (Gemini, OpenAI, Claude, Suno 등)
- 대시보드 UI로 프로젝트/파이프라인 관리 및 모니터링

### 결정사항
- **런타임**: Bun (전체 TypeScript)
- **프론트엔드**: Next.js 15 (App Router)
- **백엔드 API**: Hono (Bun 네이티브)
- **DB**: PostgreSQL + Prisma ORM
- **구조**: Bun Workspace Monorepo + Domain Modules
- **AI**: 멀티 프로바이더 AI Gateway 패턴

---

## 2. 아키텍처

### 2.1 Monorepo 구조

```
marionette-studio/
├── package.json                    # Bun workspace root
├── tsconfig.json                   # Base TS config
│
├── apps/
│   ├── web/                        # Next.js 15 프론트엔드
│   │   ├── app/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── projects/       # 프로젝트 CRUD
│   │   │   │   ├── pipeline/       # 파이프라인 모니터링
│   │   │   │   └── agents/         # 에이전트 상태/설정
│   │   │   ├── api/                # BFF API Routes
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   └── lib/
│   │
│   └── api/                        # Hono API 서버
│       └── src/
│           ├── index.ts
│           ├── routes/             # projects, pipeline, agents
│           ├── services/           # 비즈니스 로직
│           └── middleware/
│
├── packages/
│   ├── agents/                     # 14개 AI 에이전트
│   │   └── src/
│   │       ├── base/               # BaseAgent 추상 클래스
│   │       ├── pre-production/     # ScriptWriter, Scripter, ConceptArtist, ...
│   │       ├── main-production/    # Cinematographer, Generalist, ...
│   │       └── post-production/    # VFXCompositor, MasterEditor, ...
│   │
│   ├── ai-gateway/                 # 멀티 AI 프로바이더 추상화
│   │   └── src/
│   │       ├── gateway.ts
│   │       ├── providers/          # gemini, openai, claude, suno
│   │       └── types.ts
│   │
│   ├── db/                         # Prisma + DB
│   │   ├── prisma/schema.prisma
│   │   └── src/client.ts
│   │
│   └── shared/                     # 공통 타입/유틸
│       └── src/
│           ├── types/              # project, pipeline, agent 타입
│           └── utils/              # logger, file utils
│
└── scripts/                        # 시나리오 데이터 (기존 유지)
```

### 2.2 데이터 플로우

```
[사용자] → [Next.js 대시보드] → [Hono API] → [Pipeline Orchestrator]
                                                     │
                                    ┌────────────────┼────────────────┐
                                    ▼                ▼                ▼
                              Pre-Production   Main-Production  Post-Production
                              (Scripter, ...)  (Generalist,...) (Editor, ...)
                                    │                │                │
                                    └────────┬───────┘                │
                                             ▼                        │
                                        [AI Gateway]                  │
                                    ┌───────┼───────┐                 │
                                    ▼       ▼       ▼                 │
                                 Gemini  OpenAI  Claude               │
                                    │       │       │                 │
                                    └───────┼───────┘                 │
                                            ▼                         │
                                     [Asset Storage]  ←───────────────┘
                                            │
                                            ▼
                                     [PostgreSQL DB]
```

---

## 3. 에이전트 인벤토리

### 전체 에이전트 매핑 (Python → TypeScript)

| # | Phase | 에이전트 | Python 소스 | TS 대상 | 구현 Phase |
|---|-------|---------|------------|---------|-----------|
| 1 | PRE | ScriptWriter | `src/agents/script_writer.py` | `pre-production/script-writer.ts` | Phase 1 |
| 2 | PRE | Scripter (Parser) | `src/agents/scripter.py` | `pre-production/scripter.ts` | Phase 1 |
| 3 | PRE | ConceptArtist | `src/agents/concept_artist.py` | `pre-production/concept-artist.ts` | Phase 1 |
| 4 | PRE | Previsualizer | 미구현 (🆕) | `pre-production/previsualizer.ts` | Phase 2 |
| 5 | PRE | CastingDirector | 미구현 (🆕) | `pre-production/casting-director.ts` | Phase 2 |
| 6 | PRE | LocationScout | 미구현 (🆕) | `pre-production/location-scout.ts` | Phase 2 |
| 7 | MAIN | Cinematographer | 미구현 (🆕) | `main-production/cinematographer.ts` | Phase 2 |
| 8 | MAIN | Generalist | `src/agents/generalist.py` | `main-production/generalist.ts` | Phase 2 |
| 9 | MAIN | AssetDesigner | `src/agents/asset_designer.py` (Mock) | `main-production/asset-designer.ts` | Phase 3 |
| 10 | POST | VFXCompositor | `src/agents/vfx_compositor.py` (Mock) | `post-production/vfx-compositor.ts` | Phase 3 |
| 11 | POST | MasterEditor | `src/agents/master_editor.py` | `post-production/master-editor.ts` | Phase 2 |
| 12 | POST | Colorist | 미구현 (🆕) | `post-production/colorist.ts` | Phase 3 |
| 13 | POST | SoundDesigner | `src/agents/sound_designer.py` | `post-production/sound-designer.ts` | Phase 2 |
| 14 | POST | Composer | 미구현 (🆕) | `post-production/composer.ts` | Phase 3 |
| 15 | POST | MixingEngineer | 미구현 (🆕) | `post-production/mixing-engineer.ts` | Phase 3 |

> **참고**: `script_writer.py` (idea → DirectionPlan, 생성형)와 `scripter.py` (screenplay.md → DirectionPlan, 파싱형)는 별도 에이전트. 대시보드 파이프라인 실행 시에는 ScriptWriter를 사용.

---

## 4. 데이터 모델 (Prisma)

### Project
- `id` (cuid), `title`, `genre`, `logline`, `idea`
- `status` (DRAFT → PRE_PRODUCTION → MAIN_PRODUCTION → POST_PRODUCTION → COMPLETED → ARCHIVED)
- `progress` (0.0~1.0)
- `script` (마스터 시나리오 텍스트)
- `directionPlan` (JSON - DirectionPlan)
- `directionPlanPath` (파일 경로 - 기존 호환)
- `protagonist` (주인공 설정 텍스트)
- `antagonist` (적대자 설정 텍스트)
- `characters` (JSON - characters.json 전체 데이터)
- `worldview` (세계관 텍스트)
- Relations: `pipelineRuns[]`, `assets[]`

### PipelineRun
- `id`, `projectId` → Project
- `phase` (PRE | MAIN | POST)
- `steps` (JSON - 실행할 에이전트 목록)
- `currentStep`, `status` (QUEUED → RUNNING → COMPLETED / FAILED / CANCELLED)
- `progress`, `stepResults` (JSON), `errorMessage`
- Timestamps: `startedAt`, `completedAt`, `createdAt`

> **상태 흐름**: QUEUED(DB 생성) → RUNNING(백그라운드 실행 시작) → COMPLETED/FAILED/CANCELLED

### Asset
- `id`, `projectId` → Project
- `type` (IMAGE | VIDEO | AUDIO | MODEL_3D | DOCUMENT)
- `phase`, `agentName`, `sceneNumber`
- `filePath`, `fileName`, `mimeType`, `fileSize`
- `metadata` (JSON - 에이전트별 추가 정보)

### AgentConfig
- `id`, `agentName` (unique)
- `phase`, `provider`, `model`
- `enabled` (boolean), `config` (JSON)

---

## 5. AI Gateway

### 인터페이스 (Capability-based)

```typescript
// 능력 기반 서브 인터페이스 — 프로바이더는 지원하는 것만 구현
interface TextProvider {
  generateText(prompt: string, options?: TextOptions): Promise<string>
}

interface ImageProvider {
  generateImage(prompt: string, options?: ImageOptions): Promise<Buffer>
}

interface VideoProvider {
  generateVideo(prompt: string, options?: VideoOptions): Promise<VideoResult>
}

interface AudioProvider {
  generateAudio(prompt: string, options?: AudioOptions): Promise<Buffer>
}

interface TTSProvider {
  generateTTS(text: string, options?: TTSOptions): Promise<Buffer>
}

// 프로바이더는 지원하는 능력만 구현
// GeminiProvider implements TextProvider, ImageProvider, VideoProvider, TTSProvider
// SunoProvider implements AudioProvider
// OpenAIProvider implements TextProvider, ImageProvider

// Gateway는 capability registry로 적절한 프로바이더 라우팅
class AIGateway {
  text(prompt: string, provider?: string): Promise<string>
  image(prompt: string, provider?: string): Promise<Buffer>
  video(prompt: string, provider?: string): Promise<VideoResult>
  audio(prompt: string, provider?: string): Promise<Buffer>
  tts(text: string, provider?: string): Promise<Buffer>
}
```

### 프로바이더 매핑 (기존 Python → TS)
| 에이전트 | 기존 Python API | TS 프로바이더 |
|---------|---------------|-------------|
| ScriptWriter | Gemini 2.5 Flash | `gemini.generateText()` |
| Scripter | Gemini 2.5 Flash (구조화 출력) | `gemini.generateText()` |
| ConceptArtist | Gemini Flash Image | `gemini.generateImage()` |
| Generalist | Veo 3.0 | `gemini.generateVideo()` |
| SoundDesigner | Gemini TTS | `gemini.generateTTS()` |
| MasterEditor | FFMPEG (로컬) | 로컬 처리 (gateway 미사용) |
| Composer | Suno (예정) | `suno.generateAudio()` |

### 구현 우선순위
1. GeminiProvider (Phase 1 에이전트 커버)
2. LocalProvider (FFMPEG 기반 로컬 처리)
3. 나머지 (OpenAI, Claude, Suno)는 Phase 2+

---

## 6. BaseAgent 패턴

```typescript
abstract class BaseAgent {
  abstract name: string
  abstract phase: ProductionPhase
  abstract description: string

  constructor(protected gateway: AIGateway, protected db: PrismaClient)

  abstract execute(input: AgentInput): Promise<AgentOutput>

  protected async saveAsset(data: AssetData): Promise<Asset>
  protected async updateProgress(runId: string, progress: number): void
  protected async log(message: string): void
}
```

각 에이전트는 BaseAgent를 상속하고 `execute()` 메서드만 구현.

---

## 7. API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/projects` | 프로젝트 목록 |
| POST | `/api/projects` | 프로젝트 생성 |
| GET | `/api/projects/:id` | 프로젝트 상세 |
| PATCH | `/api/projects/:id` | 프로젝트 수정 |
| DELETE | `/api/projects/:id` | 프로젝트 삭제 |
| POST | `/api/pipeline/:projectId/run` | 파이프라인 실행 |
| GET | `/api/pipeline/:projectId/runs` | 실행 이력 |
| GET | `/api/pipeline/run/:runId` | 실행 상태 (폴링) |
| GET | `/api/agents` | 에이전트 목록/상태 |
| PATCH | `/api/agents/:name/config` | 에이전트 설정 |
| GET | `/api/assets/:projectId` | 에셋 목록 |
| GET | `/api/assets/:assetId/download` | 에셋 다운로드 |

> **Phase 1에서는 폴링 방식 사용**: `GET /api/pipeline/run/:runId`로 상태 조회. WebSocket은 Phase 2에서 추가.

---

## 8. Phase 1 구현 범위

### 포함
1. **Monorepo 세팅**: Bun workspace, tsconfig, ESLint
2. **packages/shared**: 타입 정의 (DirectionPlan, Scene 등 기존 Pydantic → TS)
3. **packages/db**: Prisma 스키마 + PostgreSQL 연결 + seed
4. **packages/ai-gateway**: AIGateway + GeminiProvider (Google AI JS SDK)
5. **packages/agents**: BaseAgent + ScriptWriter + Scripter + ConceptArtist
6. **apps/api**: Hono 서버 + Project/Pipeline CRUD API (폴링 기반 상태 조회)
7. **apps/web**: Next.js 대시보드 (프로젝트 목록/상세, 파이프라인 실행 버튼)

### 제외 (Phase 2+)
- Main/Post Production 에이전트 구현 (폴더 구조만 준비)
- YouTube 업로드 기능
- 인증/권한 관리
- 실시간 WebSocket 파이프라인 모니터링 (Phase 2)
- Suno/OpenAI/Claude 프로바이더

---

## 9. 기존 코드 참조 (마이그레이션 소스)

| 기존 Python 파일 | → TS 대상 | 비고 |
|-----------------|----------|------|
| `src/models/schemas.py` | `packages/shared/src/types/project.ts` | Scene, DirectionPlan 타입 |
| `server/models/schemas.py` | `packages/shared/src/types/pipeline.ts` | API 요청/응답 스키마 |
| `server/models/database.py` | `packages/db/prisma/schema.prisma` | DB 모델 (protagonist, antagonist 포함) |
| `src/agents/script_writer.py` | `packages/agents/src/pre-production/script-writer.ts` | idea → DirectionPlan (생성형) |
| `src/agents/scripter.py` | `packages/agents/src/pre-production/scripter.ts` | screenplay.md → DirectionPlan (파싱형) |
| `src/agents/concept_artist.py` | `packages/agents/src/pre-production/concept-artist.ts` | Gemini Image 호출 + 1024×1024→2.35:1 크롭 (`sharp` 사용) |
| `server/app.py` | `apps/api/src/index.ts` | Flask → Hono |
| `server/api/projects.py` | `apps/api/src/routes/projects.ts` | 프로젝트 CRUD |
| `server/services/pipeline_runner.py` | `apps/api/src/services/pipeline.service.ts` | 파이프라인 오케스트레이션 |

### ConceptArtist 마이그레이션 참고
- Gemini Flash Image 출력은 항상 1024×1024 → `sharp`로 2.35:1 (CinemaScope) 비율 크롭 필요
- 5가지 스타일 프리셋 지원: `webtoon`, `photorealistic`, `anime`, `noir`, `concept_art`
- 프리셋별 aspect ratio 오버라이드 가능
- `ImageOptions`에 `style`, `aspectRatio` 필드 포함 필요

---

## 10. 검증 계획

### 단위 테스트 (bun:test)
- `packages/shared`: 타입 유효성 검증
- `packages/ai-gateway`: 프로바이더 mock 테스트
- `packages/agents`: 에이전트 execute() 테스트
- `apps/api`: API 엔드포인트 테스트

### 통합 테스트
1. `bun run typecheck` — 전체 타입 체크
2. `bun run test` — 전체 테스트 통과
3. `bun run lint` — 린트 통과
4. API 서버 실행 → 프로젝트 생성 → ScriptWriter 에이전트 실행 → DirectionPlan 생성 확인
5. Next.js 대시보드에서 프로젝트 목록 확인

### E2E 시나리오
- 프로젝트 생성 → 아이디어 입력 → Pre-Production 파이프라인 실행 → DirectionPlan 생성 → 스토리보드 이미지 생성 확인
