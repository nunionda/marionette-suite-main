from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict, List

from server.core.database import get_db
from server.services.benchmark_service import BenchmarkService
from server.services.pipeline_runner import PipelineRunner
from server.api.websocket import manager

router = APIRouter(prefix="/api/benchmark", tags=["benchmark"])

# 전역 PipelineRunner 인스턴스 (app.py에서 주입받아야 함)
_runner: PipelineRunner = None

def set_benchmark_runner(runner: PipelineRunner):
    global _runner
    _runner = runner

@router.get("/suites")
async def list_suites(db: Session = Depends(get_db)):
    """사용 가능한 벤치마크 스위트 목록"""
    service = BenchmarkService(db, _runner)
    return await service.list_suites()

@router.post("/run/{suite_key}")
async def run_benchmark(suite_key: str, economy: bool = True, db: Session = Depends(get_db)):
    """벤치마크 실행 시작"""
    if not _runner:
        raise HTTPException(status_code=500, detail="Pipeline runner not initialized")
    
    service = BenchmarkService(db, _runner)
    try:
        run_id = await service.run_benchmark(suite_key, economy_mode=economy)
        return {"run_id": run_id, "message": f"Benchmark {suite_key} started"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/report/{run_id}")
async def get_report(run_id: str, db: Session = Depends(get_db)):
    """벤치마크 결과 리포트 조회"""
    service = BenchmarkService(db, _runner)
    report = await service.get_benchmark_report(run_id)
    if "error" in report:
        raise HTTPException(status_code=404, detail=report["error"])
    return report

@router.get("/history")
async def get_benchmark_history(db: Session = Depends(get_db)):
    """이전 벤치마크 실행 결과 목록"""
    from server.models.database import PipelineRun
    runs = db.query(PipelineRun).filter(PipelineRun.is_benchmark == 1).order_by(PipelineRun.created_at.desc()).limit(10).all()
    return [run.to_dict() for run in runs]
