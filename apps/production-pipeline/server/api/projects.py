"""
마리오네트 스튜디오 — 프로젝트 API 라우터
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from server.core.database import get_db
from server.models.database import Project, PipelinePreset, PipelineRun, Asset, _make_initials
from server.models.schemas import (
    ProjectCreate, ProjectUpdate, ProjectResponse,
    SceneListResponse, SceneMetaResponse, SequenceResponse,
    AgentWithQueueResponse, AgentStatsResponse, AgentQueueItemResponse,
)
from server.services.preset_service import generate_graph_from_preset

# pipeline step → agent type + display label
_STEP_AGENT_META = {
    "script_writer":   ("prompt",    "Script Writer"),
    "concept_artist":  ("image_gen", "Concept Artist"),
    "generalist":      ("image_gen", "Generalist"),
    "asset_designer":  ("image_gen", "Asset Designer"),
    "vfx_compositor":  ("video_gen", "VFX Compositor"),
    "master_editor":   ("video_gen", "Master Editor"),
    "sound_designer":  ("audio_gen", "Sound Designer"),
}

router = APIRouter()


@router.get("/", response_model=List[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    """모든 프로젝트 목록 조회"""
    projects = db.query(Project).order_by(Project.updated_at.desc()).all()
    return [ProjectResponse(**p.to_dict()) for p in projects]


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, db: Session = Depends(get_db)):
    """특정 프로젝트 조회"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")
    return ProjectResponse(**project.to_dict())


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
    db.flush()

    # 카테고리에 맞는 기본 프리셋 조회 → 노드 그래프 자동 생성
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


@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: str, data: ProjectUpdate, db: Session = Depends(get_db)):
    """프로젝트 업데이트"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(project, key, value)

    db.commit()
    db.refresh(project)
    return ProjectResponse(**project.to_dict())


@router.patch("/{project_id}/status", response_model=ProjectResponse)
def update_project_status(project_id: str, data: ProjectUpdate, db: Session = Depends(get_db)):
    """서비스 간 자동화를 위한 프로젝트 상태 전용 업데이트"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")

    # 업데이트 가능한 필드 제한 (보안 및 데이터 정합성)
    allowed_fields = ["analysis_status", "analysis_id", "art_bible_status", "production_book_path", "status"]
    update_data = data.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        if key in allowed_fields:
            setattr(project, key, value)

    db.commit()
    db.refresh(project)
    return ProjectResponse(**project.to_dict())


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: str, db: Session = Depends(get_db)):
    """프로젝트 삭제"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")
    db.delete(project)
    db.commit()


@router.get("/{project_id}/scenes", response_model=SceneListResponse)
def get_project_scenes(project_id: str, db: Session = Depends(get_db)):
    """direction_plan_json 에서 씬 목록 조출 — Asset 테이블로 완료 상태 보강"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")

    plan: dict = project.direction_plan_json or {}
    raw_scenes: list = plan.get("scenes", [])
    initials = _make_initials(project.title)

    # completed scene_numbers (IMAGE assets produced for that scene)
    completed_scene_nums: set[int] = {
        a.scene_number
        for a in db.query(Asset).filter(
            Asset.project_id == project_id,
            Asset.type == "IMAGE",
        ).all()
        if a.scene_number is not None
    }

    CUTS_PER_SCENE = 4  # default placeholder until cut-level tracking lands

    scenes_out: list[SceneMetaResponse] = []
    for raw in raw_scenes:
        n = raw.get("scene_number", 0)
        slug = f"sc{n:03d}"
        seq_num = (n - 1) // 5 + 1
        seq_id = f"{project_id[:8]}_seq{seq_num}"
        is_done = n in completed_scene_nums
        scenes_out.append(SceneMetaResponse(
            id=str(uuid.uuid5(uuid.NAMESPACE_URL, f"{project_id}/{slug}")),
            slug=slug,
            displayId=f"{initials}_{slug}",
            number=n,
            sequenceId=seq_id,
            title=raw.get("setting", f"Scene {n}"),
            location=raw.get("setting", ""),
            timeOfDay=raw.get("time_of_day", ""),
            summary=raw.get("action_description", "")[:200],
            coverImageUrl="",
            cutCount=CUTS_PER_SCENE,
            completedCutCount=CUTS_PER_SCENE if is_done else 0,
            status="done" if is_done else "pending",
        ))

    # build sequence summaries
    seq_map: dict[str, list[SceneMetaResponse]] = {}
    for s in scenes_out:
        seq_map.setdefault(s.sequenceId, []).append(s)

    sequences_out = [
        SequenceResponse(
            id=seq_id,
            number=int(seq_id.split("seq")[-1]),
            title=f"Sequence {seq_id.split('seq')[-1]}",
            projectId=project_id,
            sceneCount=len(members),
            completedSceneCount=sum(1 for m in members if m.status == "done"),
        )
        for seq_id, members in sorted(seq_map.items())
    ]

    return SceneListResponse(
        scenes=scenes_out,
        sequences=sequences_out,
        totalCount=len(scenes_out),
    )


@router.get("/{project_id}/agents", response_model=List[AgentWithQueueResponse])
def get_project_agents(project_id: str, db: Session = Depends(get_db)):
    """최신 파이프라인 런의 단계별 에이전트 상태 조회"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")

    latest_run: PipelineRun | None = (
        db.query(PipelineRun)
        .filter(PipelineRun.project_id == project_id)
        .order_by(PipelineRun.created_at.desc())
        .first()
    )

    steps: list[str] = (latest_run.steps if latest_run else []) or list(_STEP_AGENT_META.keys())
    step_results: dict = (latest_run.step_results if latest_run else {}) or {}
    current_step: str | None = latest_run.current_step if latest_run else None
    run_status: str = latest_run.status if latest_run else "queued"

    agents_out: list[AgentWithQueueResponse] = []
    for step in steps:
        agent_type, label = _STEP_AGENT_META.get(step, ("prompt", step.replace("_", " ").title()))
        result = step_results.get(step, {})
        step_status = result.get("status", "pending")

        if step == current_step and run_status == "running":
            agent_status = "running"
        elif step_status == "completed":
            agent_status = "done"
        elif step_status == "failed":
            agent_status = "error"
        else:
            agent_status = "idle"

        processed = 1 if agent_status == "done" else 0
        history = (
            [AgentQueueItemResponse(
                id=str(uuid.uuid5(uuid.NAMESPACE_URL, f"{project_id}/{step}/done")),
                sceneSlug="sc001", cutSlug="cut001",
                displayId=f"{step}/done",
                status="done",
                durationMs=result.get("duration_ms"),
            )]
            if agent_status == "done" else []
        )

        agents_out.append(AgentWithQueueResponse(
            id=str(uuid.uuid5(uuid.NAMESPACE_URL, f"{project_id}/{step}")),
            type=agent_type,
            projectId=project_id,
            status=agent_status,
            label=label,
            paused=False,
            stats=AgentStatsResponse(processed=processed, errors=0, queueSize=0),
            queue=[],
            history=history,
        ))

    return agents_out
