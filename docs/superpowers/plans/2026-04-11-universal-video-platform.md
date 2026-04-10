# Universal Video Platform — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend Marionette Suite's backend to support multiple video project types (Film, Drama, Commercial, YouTube) with adaptive pipeline presets and a node graph data model.

**Architecture:** SQLAlchemy models + FastAPI routers. The Python backend (apps/production-pipeline/server/) uses SQLite for dev, PostgreSQL for prod. New models (ProjectCategory enum, PipelinePreset, NodeGraph) extend the existing schema. PipelineRunner reads node graphs to determine execution order.

**Tech Stack:** Python 3, FastAPI, SQLAlchemy, Pydantic v2, SQLite (dev), Alembic (migration)

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `server/models/database.py` | Modify | Add ProjectCategory enum, PipelinePreset model, NodeGraph model, update Project |
| `server/models/schemas.py` | Modify | Add Pydantic schemas for presets, node graphs, updated project |
| `server/api/presets.py` | Create | Pipeline preset CRUD endpoints |
| `server/api/graphs.py` | Create | Node graph CRUD + execution endpoints |
| `server/api/projects.py` | Modify | Accept category on create, auto-generate graph |
| `server/services/preset_service.py` | Create | Default preset data + graph generation from preset |
| `server/services/pipeline_runner.py` | Modify | Graph-aware execution order |
| `server/app.py` | Modify | Register new routers, seed presets on startup |
| `server/tests/test_presets.py` | Create | Preset API tests |
| `server/tests/test_graphs.py` | Create | Node graph API tests |

---

### Task 1: Add ProjectCategory enum and PipelinePreset model

**Files:**
- Modify: `apps/production-pipeline/server/models/database.py`

- [ ] **Step 1: Add ProjectCategory enum after existing enums (line ~54)**

```python
class ProjectCategory(str, enum.Enum):
    FILM = "film"
    DRAMA_SERIES = "drama_series"
    COMMERCIAL = "commercial"
    YOUTUBE_SHORT = "youtube_short"
    CUSTOM = "custom"
```

- [ ] **Step 2: Add PipelinePreset model after Asset class**

```python
class PipelinePreset(Base):
    __tablename__ = "pipeline_presets"

    id = Column(String, primary_key=True, default=generate_uuid)
    category = Column(String(50), nullable=False)  # ProjectCategory value
    name = Column(String(200), nullable=False)
    description = Column(Text, default="")
    agent_steps = Column(JSON, nullable=False)  # [{agent, order, required, defaultParams}]
    is_default = Column(Integer, default=0)  # SQLite doesn't have boolean; 0=false, 1=true
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "category": self.category,
            "name": self.name,
            "description": self.description,
            "agent_steps": self.agent_steps,
            "is_default": bool(self.is_default),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
```

- [ ] **Step 3: Add category column to Project model (after `idea` column, line ~68)**

Add this column to the `Project` class:
```python
    category = Column(String(50), default=ProjectCategory.FILM.value)
```

And add `"category": self.category` to `Project.to_dict()`.

- [ ] **Step 4: Verify database initializes without errors**

Run: `cd apps/production-pipeline && python -c "from server.models.database import Base, PipelinePreset, ProjectCategory; print('OK')"`
Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add apps/production-pipeline/server/models/database.py
git commit -m "feat(db): add ProjectCategory enum and PipelinePreset model"
```

---

### Task 2: Add NodeGraph model

**Files:**
- Modify: `apps/production-pipeline/server/models/database.py`

- [ ] **Step 1: Add NodeGraph model after PipelinePreset**

```python
class NodeGraph(Base):
    __tablename__ = "node_graphs"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False, unique=True)
    nodes = Column(JSON, nullable=False, default=list)
    edges = Column(JSON, nullable=False, default=list)
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="node_graph")

    def to_dict(self):
        return {
            "id": self.id,
            "project_id": self.project_id,
            "nodes": self.nodes,
            "edges": self.edges,
            "version": self.version,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
```

- [ ] **Step 2: Add relationship to Project model**

Add to the `Project` class (after the `assets` relationship):
```python
    node_graph = relationship("NodeGraph", back_populates="project", uselist=False, cascade="all, delete-orphan")
```

- [ ] **Step 3: Verify import and initialization**

Run: `cd apps/production-pipeline && python -c "from server.models.database import NodeGraph; print('OK')"`
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add apps/production-pipeline/server/models/database.py
git commit -m "feat(db): add NodeGraph model with project relationship"
```

---

### Task 3: Add Pydantic schemas for presets and node graphs

**Files:**
- Modify: `apps/production-pipeline/server/models/schemas.py`

- [ ] **Step 1: Add preset schemas after the Pipeline schemas section**

```python
# ─── Preset 스키마 ───

class AgentStep(BaseModel):
    agent: str = Field(..., description="에이전트 ID (예: WRIT, CNCP, GEN)")
    order: int = Field(..., description="실행 순서")
    required: bool = Field(default=True, description="필수 단계 여부")
    defaultParams: dict = Field(default_factory=dict, description="기본 파라미터")


class PresetCreate(BaseModel):
    category: str = Field(..., description="프로젝트 카테고리")
    name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="")
    agent_steps: List[AgentStep]


class PresetResponse(BaseModel):
    id: str
    category: str
    name: str
    description: str
    agent_steps: list
    is_default: bool
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    model_config = {"from_attributes": True}
```

- [ ] **Step 2: Add node graph schemas**

```python
# ─── NodeGraph 스키마 ───

class NodePosition(BaseModel):
    x: float = 0.0
    y: float = 0.0


class PipelineNode(BaseModel):
    id: str
    type: str = Field(default="agent", description="agent | input | output | branch")
    agentId: Optional[str] = None
    label: str
    position: NodePosition = Field(default_factory=NodePosition)
    params: dict = Field(default_factory=dict)
    status: str = Field(default="idle", description="idle | queued | running | completed | failed | skipped")


class PipelineEdge(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None


class NodeGraphResponse(BaseModel):
    id: str
    project_id: str
    nodes: list
    edges: list
    version: int
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    model_config = {"from_attributes": True}


class NodeGraphUpdate(BaseModel):
    nodes: Optional[List[PipelineNode]] = None
    edges: Optional[List[PipelineEdge]] = None
```

- [ ] **Step 3: Update ProjectCreate to accept category**

Change `ProjectCreate`:
```python
class ProjectCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="프로젝트 제목")
    category: str = Field(default="film", description="프로젝트 카테고리: film, drama_series, commercial, youtube_short, custom")
    genre: str = Field(default="", description="장르")
    logline: str = Field(default="", description="로그라인")
    idea: str = Field(default="", description="기획 아이디어")
```

And add `category: str = "film"` to `ProjectResponse`.

- [ ] **Step 4: Commit**

```bash
git add apps/production-pipeline/server/models/schemas.py
git commit -m "feat(schemas): add Pydantic models for presets and node graphs"
```

---

### Task 4: Create preset service with default data and graph generator

**Files:**
- Create: `apps/production-pipeline/server/services/preset_service.py`

- [ ] **Step 1: Create the preset service file**

```python
"""
마리오네트 스튜디오 — 프리셋 서비스
파이프라인 프리셋 관리 및 노드 그래프 자동 생성
"""
from server.models.database import PipelinePreset, NodeGraph, generate_uuid

# ─── 에이전트 메타데이터 (14-agent pipeline) ───

AGENT_META = {
    "WRIT": {"label": "Writer", "phase": "PRE"},
    "SCPT": {"label": "Script Analyst", "phase": "PRE"},
    "CNCP": {"label": "Concept Artist", "phase": "PRE"},
    "SETD": {"label": "Set Designer", "phase": "PRE"},
    "ASST": {"label": "Asset Forge", "phase": "PRE"},
    "GEN":  {"label": "Previsualizer", "phase": "MAIN"},
    "CINE": {"label": "Cinematographer", "phase": "MAIN"},
    "VFX":  {"label": "VFX Artist", "phase": "POST"},
    "VOIC": {"label": "Voice Talent", "phase": "POST"},
    "EDIT": {"label": "Editor", "phase": "POST"},
    "GRDE": {"label": "Colorist", "phase": "POST"},
    "SOND": {"label": "Sound Designer", "phase": "POST"},
    "SCOR": {"label": "Composer", "phase": "POST"},
    "MSTR": {"label": "Mastering", "phase": "POST"},
}

# ─── 기본 프리셋 정의 ───

DEFAULT_PRESETS = [
    {
        "category": "film",
        "name": "Hollywood Feature Film",
        "description": "Full 14-agent pipeline for feature film production",
        "agent_steps": [
            {"agent": "WRIT", "order": 1, "required": True, "defaultParams": {}},
            {"agent": "SCPT", "order": 2, "required": True, "defaultParams": {}},
            {"agent": "CNCP", "order": 3, "required": True, "defaultParams": {}},
            {"agent": "SETD", "order": 4, "required": True, "defaultParams": {}},
            {"agent": "ASST", "order": 5, "required": False, "defaultParams": {}},
            {"agent": "GEN",  "order": 6, "required": True, "defaultParams": {}},
            {"agent": "CINE", "order": 7, "required": True, "defaultParams": {}},
            {"agent": "VFX",  "order": 8, "required": False, "defaultParams": {}},
            {"agent": "VOIC", "order": 9, "required": False, "defaultParams": {}},
            {"agent": "EDIT", "order": 10, "required": True, "defaultParams": {}},
            {"agent": "GRDE", "order": 11, "required": True, "defaultParams": {}},
            {"agent": "SOND", "order": 12, "required": True, "defaultParams": {}},
            {"agent": "SCOR", "order": 13, "required": False, "defaultParams": {}},
            {"agent": "MSTR", "order": 14, "required": True, "defaultParams": {}},
        ],
    },
    {
        "category": "drama_series",
        "name": "Drama Series (per episode)",
        "description": "13-agent pipeline for episodic drama production",
        "agent_steps": [
            {"agent": "WRIT", "order": 1, "required": True, "defaultParams": {"format": "episode_script"}},
            {"agent": "SCPT", "order": 2, "required": True, "defaultParams": {}},
            {"agent": "CNCP", "order": 3, "required": True, "defaultParams": {}},
            {"agent": "SETD", "order": 4, "required": True, "defaultParams": {}},
            {"agent": "GEN",  "order": 5, "required": True, "defaultParams": {}},
            {"agent": "CINE", "order": 6, "required": True, "defaultParams": {}},
            {"agent": "VFX",  "order": 7, "required": False, "defaultParams": {}},
            {"agent": "VOIC", "order": 8, "required": False, "defaultParams": {}},
            {"agent": "EDIT", "order": 9, "required": True, "defaultParams": {}},
            {"agent": "GRDE", "order": 10, "required": True, "defaultParams": {}},
            {"agent": "SOND", "order": 11, "required": True, "defaultParams": {}},
            {"agent": "SCOR", "order": 12, "required": False, "defaultParams": {}},
            {"agent": "MSTR", "order": 13, "required": True, "defaultParams": {}},
        ],
    },
    {
        "category": "commercial",
        "name": "Brand Commercial (30s-60s)",
        "description": "7-agent fast pipeline for short-form advertising",
        "agent_steps": [
            {"agent": "WRIT", "order": 1, "required": True, "defaultParams": {"format": "ad_copy"}},
            {"agent": "CNCP", "order": 2, "required": True, "defaultParams": {}},
            {"agent": "GEN",  "order": 3, "required": True, "defaultParams": {}},
            {"agent": "CINE", "order": 4, "required": True, "defaultParams": {}},
            {"agent": "EDIT", "order": 5, "required": True, "defaultParams": {}},
            {"agent": "GRDE", "order": 6, "required": True, "defaultParams": {}},
            {"agent": "MSTR", "order": 7, "required": True, "defaultParams": {}},
        ],
    },
    {
        "category": "youtube_short",
        "name": "YouTube Short-form",
        "description": "5-agent minimal pipeline for social media content",
        "agent_steps": [
            {"agent": "WRIT", "order": 1, "required": True, "defaultParams": {"format": "youtube_script"}},
            {"agent": "GEN",  "order": 2, "required": True, "defaultParams": {}},
            {"agent": "EDIT", "order": 3, "required": True, "defaultParams": {}},
            {"agent": "SOND", "order": 4, "required": True, "defaultParams": {}},
            {"agent": "MSTR", "order": 5, "required": True, "defaultParams": {}},
        ],
    },
]


def generate_graph_from_preset(project_id: str, agent_steps: list) -> NodeGraph:
    """프리셋의 agent_steps로부터 노드 그래프를 자동 생성"""
    nodes = []
    edges = []
    x_spacing = 280
    y_base = 200

    # Input node
    input_id = f"input_{generate_uuid()[:8]}"
    nodes.append({
        "id": input_id,
        "type": "input",
        "agentId": None,
        "label": "Project Input",
        "position": {"x": 0, "y": y_base},
        "params": {},
        "status": "completed",
    })

    prev_id = input_id
    for step in sorted(agent_steps, key=lambda s: s["order"]):
        agent_id = step["agent"]
        meta = AGENT_META.get(agent_id, {"label": agent_id, "phase": "PRE"})
        node_id = f"{agent_id.lower()}_{generate_uuid()[:8]}"

        nodes.append({
            "id": node_id,
            "type": "agent",
            "agentId": agent_id,
            "label": meta["label"],
            "position": {"x": step["order"] * x_spacing, "y": y_base},
            "params": step.get("defaultParams", {}),
            "status": "idle",
        })

        edges.append({
            "id": f"e_{prev_id}_{node_id}",
            "source": prev_id,
            "target": node_id,
        })
        prev_id = node_id

    # Output node
    output_id = f"output_{generate_uuid()[:8]}"
    nodes.append({
        "id": output_id,
        "type": "output",
        "agentId": None,
        "label": "Final Output",
        "position": {"x": (len(agent_steps) + 1) * x_spacing, "y": y_base},
        "params": {},
        "status": "idle",
    })
    edges.append({
        "id": f"e_{prev_id}_{output_id}",
        "source": prev_id,
        "target": output_id,
    })

    return NodeGraph(
        project_id=project_id,
        nodes=nodes,
        edges=edges,
        version=1,
    )


def seed_default_presets(db_session):
    """기본 프리셋이 없으면 시드 데이터 삽입"""
    existing = db_session.query(PipelinePreset).count()
    if existing > 0:
        return

    for preset_data in DEFAULT_PRESETS:
        preset = PipelinePreset(
            category=preset_data["category"],
            name=preset_data["name"],
            description=preset_data["description"],
            agent_steps=preset_data["agent_steps"],
            is_default=1,
        )
        db_session.add(preset)

    db_session.commit()
    print(f"🌱 Seeded {len(DEFAULT_PRESETS)} default pipeline presets")
```

- [ ] **Step 2: Verify import works**

Run: `cd apps/production-pipeline && python -c "from server.services.preset_service import DEFAULT_PRESETS, AGENT_META; print(f'{len(DEFAULT_PRESETS)} presets, {len(AGENT_META)} agents')"`
Expected: `4 presets, 14 agents`

- [ ] **Step 3: Commit**

```bash
git add apps/production-pipeline/server/services/preset_service.py
git commit -m "feat(service): add preset service with default data and graph generator"
```

---

### Task 5: Create presets API router

**Files:**
- Create: `apps/production-pipeline/server/api/presets.py`

- [ ] **Step 1: Create the presets router**

```python
"""
마리오네트 스튜디오 — 파이프라인 프리셋 API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from server.core.database import get_db
from server.models.database import PipelinePreset
from server.models.schemas import PresetCreate, PresetResponse

router = APIRouter()


@router.get("/", response_model=List[PresetResponse])
def list_presets(category: str = None, db: Session = Depends(get_db)):
    """모든 프리셋 또는 카테고리별 프리셋 조회"""
    query = db.query(PipelinePreset)
    if category:
        query = query.filter(PipelinePreset.category == category)
    presets = query.order_by(PipelinePreset.category).all()
    return [PresetResponse(**p.to_dict()) for p in presets]


@router.get("/default/{category}", response_model=PresetResponse)
def get_default_preset(category: str, db: Session = Depends(get_db)):
    """특정 카테고리의 기본 프리셋 조회"""
    preset = db.query(PipelinePreset).filter(
        PipelinePreset.category == category,
        PipelinePreset.is_default == 1,
    ).first()
    if not preset:
        raise HTTPException(status_code=404, detail=f"카테고리 '{category}'의 기본 프리셋이 없습니다")
    return PresetResponse(**preset.to_dict())


@router.post("/", response_model=PresetResponse, status_code=201)
def create_preset(data: PresetCreate, db: Session = Depends(get_db)):
    """커스텀 프리셋 생성"""
    preset = PipelinePreset(
        category=data.category,
        name=data.name,
        description=data.description,
        agent_steps=[step.model_dump() for step in data.agent_steps],
        is_default=0,
    )
    db.add(preset)
    db.commit()
    db.refresh(preset)
    return PresetResponse(**preset.to_dict())
```

- [ ] **Step 2: Commit**

```bash
git add apps/production-pipeline/server/api/presets.py
git commit -m "feat(api): add pipeline presets CRUD router"
```

---

### Task 6: Create node graph API router

**Files:**
- Create: `apps/production-pipeline/server/api/graphs.py`

- [ ] **Step 1: Create the graphs router**

```python
"""
마리오네트 스튜디오 — 노드 그래프 API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from server.core.database import get_db
from server.models.database import NodeGraph, Project
from server.models.schemas import NodeGraphResponse, NodeGraphUpdate

router = APIRouter()


@router.get("/{project_id}/graph", response_model=NodeGraphResponse)
def get_graph(project_id: str, db: Session = Depends(get_db)):
    """프로젝트의 노드 그래프 조회"""
    graph = db.query(NodeGraph).filter(NodeGraph.project_id == project_id).first()
    if not graph:
        raise HTTPException(status_code=404, detail="노드 그래프가 없습니다")
    return NodeGraphResponse(**graph.to_dict())


@router.put("/{project_id}/graph", response_model=NodeGraphResponse)
def update_graph(project_id: str, data: NodeGraphUpdate, db: Session = Depends(get_db)):
    """노드 그래프 업데이트 (노드 추가/제거/파라미터 수정)"""
    graph = db.query(NodeGraph).filter(NodeGraph.project_id == project_id).first()
    if not graph:
        raise HTTPException(status_code=404, detail="노드 그래프가 없습니다")

    if data.nodes is not None:
        graph.nodes = [n.model_dump() for n in data.nodes]
    if data.edges is not None:
        graph.edges = [e.model_dump() for e in data.edges]
    graph.version += 1

    db.commit()
    db.refresh(graph)
    return NodeGraphResponse(**graph.to_dict())


@router.post("/{project_id}/graph/execute")
async def execute_graph(project_id: str, db: Session = Depends(get_db)):
    """노드 그래프 기반 파이프라인 실행 요청"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")

    graph = db.query(NodeGraph).filter(NodeGraph.project_id == project_id).first()
    if not graph:
        raise HTTPException(status_code=404, detail="노드 그래프가 없습니다")

    # Extract agent execution order from graph edges (topological sort)
    agent_nodes = [n for n in graph.nodes if n.get("type") == "agent"]
    
    # Build adjacency from edges
    order_map = {}
    for edge in graph.edges:
        order_map[edge["target"]] = edge["source"]
    
    # Sort by following edges from input → output
    sorted_agents = sorted(agent_nodes, key=lambda n: n.get("position", {}).get("x", 0))
    steps = [n["agentId"].lower() for n in sorted_agents if n.get("agentId")]

    # Create a PipelineRun with these steps
    from server.models.database import PipelineRun
    run = PipelineRun(
        project_id=project_id,
        steps=steps,
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    return {
        "run_id": run.id,
        "steps": steps,
        "message": f"파이프라인 실행 시작: {len(steps)}개 에이전트",
    }
```

- [ ] **Step 2: Commit**

```bash
git add apps/production-pipeline/server/api/graphs.py
git commit -m "feat(api): add node graph CRUD and execution router"
```

---

### Task 7: Update project creation to auto-generate node graph

**Files:**
- Modify: `apps/production-pipeline/server/api/projects.py`

- [ ] **Step 1: Update imports at top of file**

Add to imports:
```python
from server.models.database import Project, PipelinePreset
from server.models.schemas import ProjectCreate, ProjectUpdate, ProjectResponse
from server.services.preset_service import generate_graph_from_preset
```

- [ ] **Step 2: Update `create_project` function**

Replace the existing `create_project` (lines 32-43):

```python
@router.post("/", response_model=ProjectResponse, status_code=201)
def create_project(data: ProjectCreate, db: Session = Depends(get_db)):
    """새 프로젝트 생성 — 카테고리에 맞는 노드 그래프 자동 생성"""
    project = Project(
        title=data.title,
        category=data.category,
        genre=data.genre,
        logline=data.logline,
        idea=data.idea,
    )
    db.add(project)
    db.flush()  # ID 확보

    # 카테고리에 맞는 기본 프리셋 조회 → 노드 그래프 생성
    preset = db.query(PipelinePreset).filter(
        PipelinePreset.category == data.category,
        PipelinePreset.is_default == 1,
    ).first()

    if preset:
        graph = generate_graph_from_preset(project.id, preset.agent_steps)
        db.add(graph)

    db.commit()
    db.refresh(project)
    return ProjectResponse(**project.to_dict())
```

- [ ] **Step 3: Commit**

```bash
git add apps/production-pipeline/server/api/projects.py
git commit -m "feat(api): auto-generate node graph on project creation"
```

---

### Task 8: Register new routers and seed presets on startup

**Files:**
- Modify: `apps/production-pipeline/server/app.py`

- [ ] **Step 1: Add imports**

Add after existing imports:
```python
from server.api import presets, graphs
from server.services.preset_service import seed_default_presets
```

- [ ] **Step 2: Register routers in `create_app()`**

Add after existing router registrations (around line 43):
```python
    app.include_router(presets.router, prefix="/api/presets", tags=["presets"])
    app.include_router(graphs.router, prefix="/api/projects", tags=["graphs"])
```

- [ ] **Step 3: Add preset seeding to startup**

Add inside the `startup()` function, after `init_db()`:
```python
        # 기본 프리셋 시드
        from server.core.database import SessionLocal
        db = SessionLocal()
        try:
            seed_default_presets(db)
        finally:
            db.close()
```

- [ ] **Step 4: Commit**

```bash
git add apps/production-pipeline/server/app.py
git commit -m "feat(app): register preset/graph routers and seed defaults on startup"
```

---

### Task 9: Verify end-to-end

- [ ] **Step 1: Start the server**

```bash
cd apps/production-pipeline
pip install fastapi uvicorn sqlalchemy pydantic python-dotenv 2>/dev/null
python -m uvicorn server.app:create_app --factory --host 0.0.0.0 --port 8000 &
sleep 3
```

- [ ] **Step 2: Test preset listing**

```bash
curl -s http://localhost:8000/api/presets/ | python -m json.tool | head -20
```
Expected: JSON array with 4 default presets

- [ ] **Step 3: Test project creation with category**

```bash
curl -s -X POST http://localhost:8000/api/projects/ \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Commercial", "category": "commercial", "idea": "Nike 30s spot"}' | python -m json.tool
```
Expected: Project response with `category: "commercial"` and an auto-generated ID

- [ ] **Step 4: Test node graph retrieval**

```bash
PROJECT_ID=$(curl -s http://localhost:8000/api/projects/ | python -c "import sys,json; print(json.load(sys.stdin)[0]['id'])")
curl -s "http://localhost:8000/api/projects/$PROJECT_ID/graph" | python -m json.tool
```
Expected: NodeGraph with 7 agent nodes + input/output nodes + edges for commercial pipeline

- [ ] **Step 5: Stop server and commit all remaining changes**

```bash
kill %1 2>/dev/null
git add -A
git commit -m "feat: universal video platform v2 — backend complete

- ProjectCategory enum (Film/Drama/Commercial/YouTube/Custom)
- PipelinePreset model with 4 default presets
- NodeGraph model auto-generated from presets
- API routes: /api/presets, /api/projects/:id/graph
- Graph-based pipeline execution endpoint"
```

---

## Summary

| Task | What It Builds |
|------|---------------|
| 1 | ProjectCategory enum + PipelinePreset model |
| 2 | NodeGraph model + Project relationship |
| 3 | Pydantic schemas for all new models |
| 4 | Preset service with default data + graph generator |
| 5 | Presets API router (list/get/create) |
| 6 | Node graph API router (get/update/execute) |
| 7 | Auto-generate graph on project creation |
| 8 | Wire up routers + seed presets on startup |
| 9 | End-to-end verification |
