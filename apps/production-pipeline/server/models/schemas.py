"""
마리오네트 스튜디오 — Pydantic API 스키마
FastAPI 요청/응답 모델
"""
from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime


# ─── Project 스키마 ───

class ProjectCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="프로젝트 제목")
    category: str = Field(default="film", description="프로젝트 카테고리: film, drama_series, commercial, youtube_short, custom")
    genre: str = Field(default="", description="장르")
    logline: str = Field(default="", description="로그라인")
    idea: str = Field(default="", description="기획 아이디어")


class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    genre: Optional[str] = None
    logline: Optional[str] = None
    idea: Optional[str] = None
    status: Optional[str] = None
    protagonist: Optional[str] = None
    antagonist: Optional[str] = None
    worldview: Optional[str] = None
    script: Optional[str] = None
    analysis_id: Optional[str] = None
    analysis_status: Optional[str] = None
    art_bible_status: Optional[str] = None
    production_book_path: Optional[str] = None


class ProjectResponse(BaseModel):
    id: str
    title: str
    category: str = "film"
    genre: str
    logline: str
    idea: str
    status: str
    progress: float
    protagonist: str
    antagonist: str
    worldview: str
    script: str
    analysis_id: Optional[str] = None
    analysis_status: Optional[str] = "none"
    art_bible_status: Optional[str] = "none"
    production_book_path: Optional[str] = None
    direction_plan_json: Optional[dict] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    model_config = {"from_attributes": True}


# ─── Pipeline 스키마 ───

class PipelineRunCreate(BaseModel):
    steps: List[str] = Field(
        default=["script_writer"],
        description="실행할 파이프라인 단계 목록"
    )
    idea: Optional[str] = Field(None, description="ScriptWriter용 아이디어 (첫 단계가 script_writer일 때 필수)")


class PipelineRunResponse(BaseModel):
    id: str
    project_id: str
    steps: list
    current_step: Optional[str]
    status: str
    progress: float
    step_results: dict
    error_message: Optional[str]
    started_at: Optional[str]
    completed_at: Optional[str]
    created_at: Optional[str]

    model_config = {"from_attributes": True}


class PipelineStepUpdate(BaseModel):
    """WebSocket으로 전송되는 파이프라인 진행 상황"""
    run_id: str
    project_id: str
    step: str
    status: str  # "started" | "completed" | "failed"
    progress: float
    message: str
    output_path: Optional[str] = None


# ─── 공통 ───

class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "0.1.0"
    service: str = "marionette-studio-api"


class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None


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
