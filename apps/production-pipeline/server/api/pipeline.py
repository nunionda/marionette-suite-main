"""
마리오네트 스튜디오 — 파이프라인 실행 API 라우터
"""
import asyncio
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from server.core.database import get_db, SessionLocal
from server.models.database import Project, PipelineRun, RunStatus
from server.models.schemas import PipelineRunCreate, PipelineRunResponse
from server.services.pipeline_runner import PipelineRunner, PIPELINE_STEPS

router = APIRouter(prefix="/api/pipeline", tags=["pipeline"])

# WebSocket 브로드캐스트 함수 (app.py에서 주입)
_broadcast_fn = None


def set_broadcast_fn(fn):
    global _broadcast_fn
    _broadcast_fn = fn


async def _run_pipeline_background(run_id: str, project_id: str, idea: str):
    """
    백그라운드 태스크: 파이프라인 실행
    별도 DB 세션으로 실행하여 요청 세션과 분리
    """
    db = SessionLocal()
    try:
        run = db.query(PipelineRun).filter(PipelineRun.id == run_id).first()
        project = db.query(Project).filter(Project.id == project_id).first()
        if not run or not project:
            return

        runner = PipelineRunner(broadcast_fn=_broadcast_fn)
        await runner.run_pipeline(run, project, db, idea=idea)
    finally:
        db.close()


@router.post("/{project_id}/run", response_model=PipelineRunResponse, status_code=201)
async def start_pipeline(
    project_id: str,
    data: PipelineRunCreate,
    db: Session = Depends(get_db),
):
    """파이프라인 실행 시작"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")

    # 이미 실행 중인 파이프라인이 있는지 확인
    active_run = db.query(PipelineRun).filter(
        PipelineRun.project_id == project_id,
        PipelineRun.status.in_([RunStatus.QUEUED.value, RunStatus.RUNNING.value])
    ).first()
    if active_run:
        raise HTTPException(status_code=409, detail="이미 실행 중인 파이프라인이 있습니다")

    # 단계 검증
    for step in data.steps:
        if step not in PIPELINE_STEPS:
            raise HTTPException(status_code=400, detail=f"알 수 없는 파이프라인 단계: {step}")

    # ScriptWriter 실행 시 아이디어 필수
    idea = data.idea or project.idea or project.title
    if "script_writer" in data.steps and not idea:
        raise HTTPException(status_code=400, detail="ScriptWriter 실행에는 아이디어(idea)가 필요합니다")

    # PipelineRun 생성
    run = PipelineRun(
        project_id=project_id,
        steps=data.steps,
        status=RunStatus.QUEUED.value,
    )
    db.add(run)
    project.status = "in_production"
    db.commit()
    db.refresh(run)

    # 백그라운드 태스크로 파이프라인 실행
    asyncio.create_task(_run_pipeline_background(run.id, project_id, idea))

    return PipelineRunResponse(**run.to_dict())


@router.get("/{project_id}/runs", response_model=List[PipelineRunResponse])
def list_pipeline_runs(project_id: str, db: Session = Depends(get_db)):
    """프로젝트의 파이프라인 실행 이력 조회"""
    runs = db.query(PipelineRun).filter(
        PipelineRun.project_id == project_id
    ).order_by(PipelineRun.created_at.desc()).all()
    return [PipelineRunResponse(**r.to_dict()) for r in runs]


@router.get("/{project_id}/runs/{run_id}", response_model=PipelineRunResponse)
def get_pipeline_run(project_id: str, run_id: str, db: Session = Depends(get_db)):
    """특정 파이프라인 실행 상태 조회"""
    run = db.query(PipelineRun).filter(
        PipelineRun.id == run_id,
        PipelineRun.project_id == project_id,
    ).first()
    if not run:
        raise HTTPException(status_code=404, detail="파이프라인 실행을 찾을 수 없습니다")
    return PipelineRunResponse(**run.to_dict())


@router.post("/{project_id}/runs/{run_id}/cancel", response_model=PipelineRunResponse)
def cancel_pipeline_run(project_id: str, run_id: str, db: Session = Depends(get_db)):
    """파이프라인 실행 취소"""
    run = db.query(PipelineRun).filter(
        PipelineRun.id == run_id,
        PipelineRun.project_id == project_id,
    ).first()
    if not run:
        raise HTTPException(status_code=404, detail="파이프라인 실행을 찾을 수 없습니다")
    if run.status not in [RunStatus.QUEUED.value, RunStatus.RUNNING.value]:
        raise HTTPException(status_code=400, detail="취소할 수 없는 상태입니다")

    run.status = RunStatus.CANCELLED.value
    db.commit()
    db.refresh(run)
    return PipelineRunResponse(**run.to_dict())


@router.post("/{project_id}/mastering/approve")
async def approve_mastering(
    project_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """4K 마스터링 최종 승인 및 실행"""
    from server.models.database import Project, Asset, PipelineRun, RunStatus
    import json
    import os

    # 1. 프로젝트 확인
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")

    # 2. 마스터링 대상 에셋 탐색 (최신 비디오 우선)
    target_asset = db.query(Asset).filter(
        Asset.project_id == project_id,
        Asset.type == "VIDEO"
    ).order_by(Asset.created_at.desc()).first()

    if not target_asset:
        # 비디오가 없으면 이미지 시도
        target_asset = db.query(Asset).filter(
            Asset.project_id == project_id,
            Asset.type == "IMAGE"
        ).order_by(Asset.created_at.desc()).first()

    if not target_asset:
        raise HTTPException(status_code=400, detail="마스터링할 수 있는 소스 에셋이 없습니다")

    # 3. 새로운 마스터링 전용 PipelineRun 생성
    run = PipelineRun(
        project_id=project_id,
        steps=["mastering"],
        status=RunStatus.RUNNING.value,
        current_step="mastering",
        started_at=datetime.utcnow(),
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    # 4. 백그라운드에서 TS 에이전트 CLI 호출 (YOLO Bridge)
    async def _trigger_ts_mastering(run_id: str, asset_id: str):
        # TS 에이전트 패키지 경로
        agents_dir = os.path.join(settings.PROJECT_ROOT, "apps/production-pipeline/packages/agents")
        
        input_data = {
            "projectId": project_id,
            "runId": run_id,
            "assetId": asset_id,
            "targetResolution": "4K"
        }
        
        cmd = [
            "bun", "run", "src/cli.ts", 
            "mastering", 
            json.dumps(input_data)
        ]
        
        print(f"[MasteringBridge] Triggering: {' '.join(cmd)}")
        
        try:
            process = await asyncio.create_subprocess_exec(
                *cmd,
                cwd=agents_dir,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                print(f"[MasteringBridge] Success: {stdout.decode().split('--- RESULT START ---')[-1]}")
            else:
                print(f"[MasteringBridge] Failed: {stderr.decode()}")
        except Exception as e:
            print(f"[MasteringBridge] Error: {str(e)}")

    background_tasks.add_task(_trigger_ts_mastering, run.id, target_asset.id)

    return {"status": "accepted", "run_id": run.id, "target_asset": target_asset.file_name}
