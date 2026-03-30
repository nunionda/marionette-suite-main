# API Contracts

Base URLs:
- **Production Pipeline API**: `http://localhost:3001` (apps/api)
- **Scenario Analysis API**: `http://localhost:4005` (apps/scenario-api)

---

## Priority Endpoints (Frontend blocked)

### POST /analyze

**Server**: Scenario Analysis API (`apps/scenario-api`)

Run the full screenplay analysis pipeline (7 engines: beatSheet, emotion, rating, roi, coverage, vfx, trope).

**Request Body**:
```json
{
  "scriptText": "string (optional — raw .fountain/.txt content)",
  "scriptBase64": "string (optional — base64-encoded PDF)",
  "isPdf": "boolean (optional — true when sending PDF via scriptBase64)",
  "movieId": "string (optional — used for scriptId generation)",
  "fileName": "string (optional — original file name)",
  "strategy": "auto | fast | deep | custom | budget | premium | long-context (optional, default: auto)",
  "customProviders": {
    "beatSheet": "gemini | gemini-pro | gemini-long | anthropic | groq | mock (optional)",
    "emotion": "... (same union)",
    "rating": "...",
    "roi": "...",
    "coverage": "...",
    "vfx": "...",
    "trope": "..."
  },
  "market": "hollywood | korean (optional, default: korean)",
  "noFallback": "boolean (optional — disable provider fallback)"
}
```

**Query Params**:
| Param | Type | Description |
|---|---|---|
| `deterministic` | string | `"true"` to use deterministic mode |

**Response** `200 OK`:
```json
{
  "scriptId": "string",
  "beatSheet": [{ "name": "string", "description": "string", "pageRange": [number, number] }],
  "emotionGraph": [{ "sceneIndex": "number", "dominantEmotion": "string", "intensity": "number", "explanation": "string" }],
  "features": { "sceneCount": "number", "dialogueRatio": "number", "avgSceneLength": "number" },
  "predictions": {
    "rating": { "rating": "string", "reasons": ["string"], "confidence": "number" },
    "roi": { "tier": "string", "reasoning": "string", "budgetEstimate": "number" }
  },
  "tropes": ["string"],
  "coverage": {
    "genre": "string",
    "logline": "string",
    "synopsis": "string",
    "strengths": ["string"],
    "weaknesses": ["string"],
    "recommendation": "string",
    "categories": [{ "name": "string", "subcategories": [{ "name": "string", "score": "number", "assessment": "string" }] }]
  },
  "narrativeArc": {
    "arcDescription": "string",
    "genreFit": { "score": "number", "deviation": "string" },
    "pacingIssues": [{ "sceneIndex": "number", "description": "string" }]
  },
  "providers": { "beatSheet": "string", "emotion": "string", "...": "..." },
  "summary": { "protagonist": "string", "predictedRating": "string", "predictedRoi": "string" }
}
```

**Error Responses**:
| Code | Body | When |
|---|---|---|
| 422 | `{ "error": "validation message" }` | Invalid body schema |
| 500 | `{ "error": "string" }` | Analysis pipeline failure |

---

### GET /report/:id

**Server**: Scenario Analysis API (`apps/scenario-api`)

Retrieve a previously saved analysis report by its scriptId.

**Path Params**:
| Param | Type | Description |
|---|---|---|
| `id` | string | The scriptId (e.g. `전율미궁_260320_v001`) |

**Response** `200 OK`:
Same shape as `POST /analyze` response.

**Error Responses**:
| Code | Body | When |
|---|---|---|
| 200 | `{ "error": "Report not found" }` | No report with that scriptId |

---

### GET /reports

**Server**: Scenario Analysis API (`apps/scenario-api`)

List all saved analysis reports with cursor-based pagination.

**Query Params**:
| Param | Type | Default | Description |
|---|---|---|---|
| `page` | string (parsed as number) | `1` | Page number (1-indexed) |
| `pageSize` | string (parsed as number) | `20` | Items per page (max 100) |

**Response** `200 OK`:
```json
{
  "data": [
    { "scriptId": "string", "beatSheet": "...", "...": "... (full report shape)" }
  ],
  "total": "number",
  "page": "number",
  "pageSize": "number",
  "totalPages": "number"
}
```

---

### POST /compare

**Server**: Scenario Analysis API (`apps/scenario-api`)

Compare two script analysis reports (draft comparison).

**Request Body**:
```json
{
  "oldScriptId": "string",
  "newScriptId": "string"
}
```

**Response** `200 OK`:
```json
{
  "oldScriptId": "string",
  "newScriptId": "string",
  "diffs": {
    "beatSheet": { "added": [], "removed": [], "modified": [] },
    "emotions": { "shifts": [] },
    "rating": { "old": "string", "new": "string", "changed": "boolean" },
    "roi": { "old": "string", "new": "string", "delta": "number" },
    "coverage": { "scoreDeltas": {} },
    "tropes": { "added": [], "removed": [] }
  },
  "summary": "string"
}
```

**Error Responses**:
| Code | Body | When |
|---|---|---|
| 200 | `{ "error": "Report not found: <scriptId>" }` | Either report missing |

---

## Production Pipeline API — Full Endpoint List

Base: `http://localhost:3001`

### Auth (`/auth`)
| Method | Path | Description |
|---|---|---|
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | Authenticate user |
| GET | `/auth/me` | Get current user |
| POST | `/auth/logout` | Clear session |

### Projects (`/projects`)
| Method | Path | Description |
|---|---|---|
| GET | `/projects` | List projects (paginated: `?page=1&limit=20`) |
| POST | `/projects` | Create project |
| GET | `/projects/:id` | Get project |
| PATCH | `/projects/:id` | Update project |
| DELETE | `/projects/:id` | Delete project |

### Pipeline (`/pipeline`)
| Method | Path | Description |
|---|---|---|
| POST | `/pipeline/:projectId/run` | Start pipeline run |
| GET | `/pipeline/:projectId/runs` | List runs for project |
| GET | `/pipeline/run/:runId` | Get run status |

### Batch (`/batch`)
| Method | Path | Description |
|---|---|---|
| POST | `/batch/:projectId/run` | Start batch run |
| GET | `/batch/:projectId/runs` | List batch runs |
| GET | `/batch/:projectId/run/:batchRunId` | Get batch run detail |
| POST | `/batch/:batchRunId/cancel` | Cancel running batch |
| POST | `/batch/:batchRunId/scene/:n/regenerate` | Regenerate scene |
| POST | `/batch/:batchRunId/scene/:n/cut/:c/regenerate` | Regenerate cut |
| POST | `/batch/:batchRunId/rerun-from/:n` | Rerun from scene |

### Assets (`/assets`)
| Method | Path | Description |
|---|---|---|
| GET | `/assets/:projectId` | List assets (`?sceneNumber=&type=`) |
| GET | `/assets/download/:assetId` | Download asset file |

### Brainstorm (`/brainstorm`)
| Method | Path | Description |
|---|---|---|
| POST | `/brainstorm/generate-ideas` | Generate concept variations |
| POST | `/brainstorm/refine-concept` | Expand concept to full pitch |
| POST | `/brainstorm/generate-logline` | Regenerate specific section |

### Logline (`/logline`)
| Method | Path | Description |
|---|---|---|
| POST | `/logline/generate` | Generate logline from idea |
| POST | `/logline/analyze` | Analyze logline quality |
| POST | `/logline/variations` | Generate style variations |

### Prompt Guide (`/prompt-guide`)
| Method | Path | Description |
|---|---|---|
| POST | `/prompt-guide/image/generate` | Generate image prompt |
| POST | `/prompt-guide/video/generate` | Generate video prompt |
| POST | `/prompt-guide/analyze` | Analyze prompt quality |
| POST | `/prompt-guide/optimize` | Optimize for multiple models |
| GET | `/prompt-guide/models` | List available AI models |

### Agents (`/agents`)
| Method | Path | Description |
|---|---|---|
| GET | `/agents` | List agent configurations |
| PATCH | `/agents/:name/config` | Update agent config |

### Snapshots (`/snapshots`)
| Method | Path | Description |
|---|---|---|
| GET | `/snapshots/:projectId` | List snapshots |
| GET | `/snapshots/:projectId/:snapshotId` | Get snapshot |
| POST | `/snapshots/:projectId/:snapshotId/restore` | Restore snapshot |
| PATCH | `/snapshots/:projectId/:snapshotId` | Update label |

### Export (`/export`)
| Method | Path | Description |
|---|---|---|
| GET | `/export/:projectId` | Download project as ZIP |

---

## Scenario Analysis API — Full Endpoint List

Base: `http://localhost:4005`

| Method | Path | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/providers` | Available providers and strategies |
| POST | `/analyze` | Full script analysis (see above) |
| POST | `/benchmark` | Multi-model benchmark comparison |
| GET | `/report/:id` | Get saved report (see above) |
| GET | `/reports` | List reports paginated (see above) |
| POST | `/translate` | Translate report to Korean |
| POST | `/chat` | Interactive chat about analysis |
| POST | `/compare` | Compare two reports (see above) |
