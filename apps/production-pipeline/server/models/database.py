"""
마리오네트 스튜디오 — 데이터베이스 모델
SQLAlchemy + SQLite (개발) / PostgreSQL (프로덕션)
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship, DeclarativeBase
import enum


class Base(DeclarativeBase):
    pass


class ProjectStatus(str, enum.Enum):
    DEVELOPMENT = "development"
    PRE_PRODUCTION = "pre_production"
    IN_PRODUCTION = "in_production"
    POST_PRODUCTION = "post_production"
    COMPLETED = "completed"


class PipelineStep(str, enum.Enum):
    SCRIPT_WRITER = "script_writer"
    CONCEPT_ARTIST = "concept_artist"
    GENERALIST = "generalist"
    ASSET_DESIGNER = "asset_designer"
    VFX_COMPOSITOR = "vfx_compositor"
    MASTER_EDITOR = "master_editor"
    SOUND_DESIGNER = "sound_designer"


class RunStatus(str, enum.Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


def generate_uuid():
    return str(uuid.uuid4())


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False)
    genre = Column(String(100), default="")
    logline = Column(Text, default="")
    idea = Column(Text, default="")
    status = Column(String(50), default=ProjectStatus.DEVELOPMENT.value)
    progress = Column(Float, default=0.0)

    # 캐릭터 & 세계관
    protagonist = Column(Text, default="")
    antagonist = Column(Text, default="")
    worldview = Column(Text, default="")
    script = Column(Text, default="")

    direction_plan_json = Column(JSON, nullable=True)
    direction_plan_path = Column(String(500), nullable=True)

    # 🔗 통합 상태 추적 (Phase 60)
    analysis_id = Column(String(100), nullable=True)
    analysis_status = Column(String(50), default="none")  # none | analyzing | done
    art_bible_status = Column(String(50), default="none")  # none | generating | ready | failed
    production_book_path = Column(String(500), nullable=True)

    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 관계
    pipeline_runs = relationship("PipelineRun", back_populates="project", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "genre": self.genre,
            "logline": self.logline,
            "idea": self.idea,
            "status": self.status,
            "progress": self.progress,
            "protagonist": self.protagonist,
            "antagonist": self.antagonist,
            "worldview": self.worldview,
            "script": self.script,
            "direction_plan_json": self.direction_plan_json,
            "analysis_id": self.analysis_id,
            "analysis_status": self.analysis_status,
            "art_bible_status": self.art_bible_status,
            "production_book_path": self.production_book_path,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class PipelineRun(Base):
    __tablename__ = "pipeline_runs"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)

    # 실행 설정
    steps = Column(JSON, default=list)  # ["script_writer", "concept_artist", ...]
    current_step = Column(String(50), nullable=True)
    status = Column(String(50), default=RunStatus.QUEUED.value)

    # 진행 상황
    progress = Column(Float, default=0.0)
    step_results = Column(JSON, default=dict)  # { "script_writer": { "status": "completed", "output_path": "..." } }
    error_message = Column(Text, nullable=True)

    # 타임스탬프
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # 관계
    project = relationship("Project", back_populates="pipeline_runs")

    def to_dict(self):
        return {
            "id": self.id,
            "project_id": self.project_id,
            "steps": self.steps,
            "current_step": self.current_step,
            "status": self.status,
            "progress": self.progress,
            "step_results": self.step_results,
            "error_message": self.error_message,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
