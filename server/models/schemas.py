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


class ProjectResponse(BaseModel):
    id: str
    title: str
    genre: str
    logline: str
    idea: str
    status: str
    progress: float
    protagonist: str
    antagonist: str
    worldview: str
    script: str
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
