# Marionette Suite v2: Universal Video Production Platform

## Problem

The current Marionette Suite is designed around feature film production with a fixed 14-agent pipeline. To become a universal video production solution covering films, dramas, commercials, and YouTube content, the system needs: (1) project-type-aware adaptive pipelines, (2) a visual node graph system, and (3) complete backend API + database alignment.

## Design

### 1. Project Type System + Adaptive Pipeline

A single 14-agent pipeline with "project type presets" that control which agents activate, in what order, and with what default parameters.

**Project Categories:**

| Type | Active Agents | Steps | Use Case |
|------|-------------|-------|----------|
| FILM | 14/14 full | ~25 | Feature films (current behavior) |
| DRAMA_SERIES | 13/14 | ~20 | Episodic content with character arc continuity |
| COMMERCIAL | 7/14 (WRIT→CNCP→GEN→CINE→EDIT→GRDE→MSTR) | ~10 | Short-form ads with brand guidelines |
| YOUTUBE_SHORT | 5/14 (WRIT→GEN→EDIT→SOND→MSTR) | ~7 | Fast turnaround social content |
| CUSTOM | User-defined | Variable | Node editor custom workflows |

**DB Schema Additions:**

```prisma
enum ProjectCategory {
  FILM
  DRAMA_SERIES
  COMMERCIAL
  YOUTUBE_SHORT
  CUSTOM
}

model PipelinePreset {
  id          String          @id @default(cuid())
  category    ProjectCategory
  name        String
  description String?
  agentSteps  Json            // [{agent: "WRIT", order: 1, required: true, defaultParams: {}}]
  isDefault   Boolean         @default(false)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  @@unique([category, name])
}
```

**Behavior:** When a project is created with a category, the system looks up the default PipelinePreset for that category and generates a NodeGraph from it.

### 2. Node Graph System

Each project has a NodeGraph that visually represents its production pipeline. Presets auto-generate graphs; users can adjust parameters, skip nodes, or add nodes.

**DB Schema:**

```prisma
model NodeGraph {
  id          String   @id @default(cuid())
  projectId   String   @unique
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  nodes       Json     // [{id, type, agentId, position: {x,y}, params, status}]
  edges       Json     // [{id, source, target, sourceHandle, targetHandle}]
  version     Int      @default(1)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Node Schema (within JSON):**
```typescript
interface PipelineNode {
  id: string;
  type: "agent" | "input" | "output" | "branch";
  agentId?: string;  // e.g. "WRIT", "CNCP", "GEN"
  label: string;
  position: { x: number; y: number };
  params: Record<string, unknown>;
  status: "idle" | "queued" | "running" | "completed" | "failed" | "skipped";
}

interface PipelineEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}
```

**Phase 1 (this session):** Backend APIs + simple linear graph for Commercial/YouTube.
**Phase 2 (future):** Full React Flow drag-and-drop editor with branching and parallel execution.

### 3. Backend API Changes

**New endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/presets` | List all pipeline presets |
| GET | `/api/presets/:category` | Get default preset for category |
| POST | `/api/presets` | Create custom preset |
| GET | `/api/projects/:id/graph` | Get project node graph |
| PUT | `/api/projects/:id/graph` | Update node graph (add/remove/reorder nodes) |
| POST | `/api/projects/:id/graph/execute` | Execute pipeline from node graph |
| GET | `/api/projects/:id/graph/status` | Get real-time node execution status |

**Modified endpoints:**

| Method | Path | Change |
|--------|------|--------|
| POST | `/api/projects` | Accept `category` field; auto-generate NodeGraph from preset |

### 4. Pipeline Orchestrator Changes

The existing `PipelineRunner` will be updated to:

1. Read the project's NodeGraph edges to determine execution order
2. Topological sort of the graph to handle future branching/parallelism
3. Execute each node's agent in order, updating node status via WebSocket
4. Skip nodes marked as "skipped" by the user

**Execution flow:**
```
NodeGraph.edges → topological sort → execution queue → 
  for each node:
    broadcast(node.status = "running")
    agent = AgentRegistry.get(node.agentId)
    result = agent.execute(input + node.params)
    broadcast(node.status = result.success ? "completed" : "failed")
```

### 5. Project Schema Migration

Changes to existing `Project` model:

```prisma
model Project {
  // ... existing fields ...
  category    ProjectCategory @default(FILM)  // was String @default("")
  nodeGraph   NodeGraph?                       // new relation
}
```

### 6. Seed Data — Default Presets

Four default presets will be seeded:

```json
[
  {
    "category": "FILM",
    "name": "Hollywood Feature Film",
    "agentSteps": [
      {"agent": "WRIT", "order": 1, "required": true},
      {"agent": "SCPT", "order": 2, "required": true},
      {"agent": "CNCP", "order": 3, "required": true},
      {"agent": "SETD", "order": 4, "required": true},
      {"agent": "ASST", "order": 5, "required": false},
      {"agent": "GEN",  "order": 6, "required": true},
      {"agent": "CINE", "order": 7, "required": true},
      {"agent": "VFX",  "order": 8, "required": false},
      {"agent": "VOIC", "order": 9, "required": false},
      {"agent": "EDIT", "order": 10, "required": true},
      {"agent": "GRDE", "order": 11, "required": true},
      {"agent": "SOND", "order": 12, "required": true},
      {"agent": "SCOR", "order": 13, "required": false},
      {"agent": "MSTR", "order": 14, "required": true}
    ]
  },
  {
    "category": "COMMERCIAL",
    "name": "Brand Commercial (30s-60s)",
    "agentSteps": [
      {"agent": "WRIT", "order": 1, "required": true, "defaultParams": {"format": "ad_copy"}},
      {"agent": "CNCP", "order": 2, "required": true},
      {"agent": "GEN",  "order": 3, "required": true},
      {"agent": "CINE", "order": 4, "required": true},
      {"agent": "EDIT", "order": 5, "required": true},
      {"agent": "GRDE", "order": 6, "required": true},
      {"agent": "MSTR", "order": 7, "required": true}
    ]
  },
  {
    "category": "YOUTUBE_SHORT",
    "name": "YouTube Short-form",
    "agentSteps": [
      {"agent": "WRIT", "order": 1, "required": true, "defaultParams": {"format": "youtube_script"}},
      {"agent": "GEN",  "order": 2, "required": true},
      {"agent": "EDIT", "order": 3, "required": true},
      {"agent": "SOND", "order": 4, "required": true},
      {"agent": "MSTR", "order": 5, "required": true}
    ]
  },
  {
    "category": "DRAMA_SERIES",
    "name": "Drama Series (per episode)",
    "agentSteps": [
      {"agent": "WRIT", "order": 1, "required": true, "defaultParams": {"format": "episode_script"}},
      {"agent": "SCPT", "order": 2, "required": true},
      {"agent": "CNCP", "order": 3, "required": true},
      {"agent": "SETD", "order": 4, "required": true},
      {"agent": "GEN",  "order": 5, "required": true},
      {"agent": "CINE", "order": 6, "required": true},
      {"agent": "VFX",  "order": 7, "required": false},
      {"agent": "VOIC", "order": 8, "required": false},
      {"agent": "EDIT", "order": 9, "required": true},
      {"agent": "GRDE", "order": 10, "required": true},
      {"agent": "SOND", "order": 11, "required": true},
      {"agent": "SCOR", "order": 12, "required": false},
      {"agent": "MSTR", "order": 13, "required": true}
    ]
  }
]
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│ Client: Next.js Studio (apps/studio)            │
│   - Role-based views (Director, Producer, CEO)  │
│   - Node Graph Viewer (React Flow) [Phase 2]    │
│   - Real-time WebSocket status updates          │
├─────────────────────────────────────────────────┤
│ API: FastAPI Server (apps/production-pipeline)   │
│   - /api/projects (CRUD + category)             │
│   - /api/presets (pipeline presets)             │
│   - /api/projects/:id/graph (node graph CRUD)   │
│   - /api/pipeline (execution)                   │
│   - /api/analysis (script analysis)             │
│   - WebSocket (real-time node status)           │
├─────────────────────────────────────────────────┤
│ DB: PostgreSQL via Prisma                        │
│   - Project, NodeGraph, PipelinePreset          │
│   - PipelineRun, Asset, BatchRun, SceneTask     │
│   - AnalysisReport, CreativeRiskAudit           │
├─────────────────────────────────────────────────┤
│ Agents: Bun TypeScript (packages/agents)         │
│   - 14 BaseAgent implementations                │
│   - Graph-aware PipelineRunner                   │
│   - AI Gateway (Gemini Free → Groq → Claude)    │
└─────────────────────────────────────────────────┘
```

## This Session Scope

1. **DB Migration**: Add ProjectCategory enum, PipelinePreset model, NodeGraph model, update Project
2. **Seed Default Presets**: 4 default presets for Film/Drama/Commercial/YouTube
3. **API Routes**: Presets CRUD, NodeGraph CRUD, graph-based execution endpoint
4. **Pipeline Runner Update**: Read NodeGraph edges for execution order
5. **Verify**: Run migration, seed data, test API endpoints

## Out of Scope (Future Sessions)

- React Flow frontend node editor UI
- Full drag-and-drop custom workflow builder
- Authentication/multi-tenant system
- Drama series episode continuity tracking
- Brand guidelines import for commercials
