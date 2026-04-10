import json
from pathlib import Path
from fastapi import APIRouter, Depends
from typing import Dict, Any
from server.core.config import settings

from server.services.auditor import auditor

router = APIRouter(prefix="/api/system", tags=["system"])

@router.get("/health")
def get_system_health() -> Dict[str, Any]:
    """현재 시스템 무결성 상태 및 진단 결과 조회"""
    return auditor.last_results

@router.post("/audit")
async def trigger_audit() -> Dict[str, Any]:
    """즉시 시스템 자가 진단 수행"""
    await auditor.run_audit()
    return auditor.last_results

@router.get("/benchmarks")
def get_benchmarks() -> Dict[str, Any]:
    """에이전트별 최적 모델 벤치마킹 데이터 조회"""
    path = Path(settings.PROJECT_ROOT) / "apps/production-pipeline/server/data/agent_benchmarks.json"
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"agents": {}, "error": "Benchmark data not found", "benchmark_metadata": {"last_sync": "N/A", "economy_mode_rule": "N/A"}}

@router.get("/masters")
def get_master_prompts() -> Dict[str, Any]:
    """할리우드 거장(Storyboard, Set, Costume 등) 디자인 데이터베이스 조회"""
    path = Path(settings.PROJECT_ROOT) / "apps/production-pipeline/server/data/master_prompts_db.json"
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"error": "Master prompts database not found"}
