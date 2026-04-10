import json
import os
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from typing import List, Dict

from server.models.database import Project, PipelineRun, RunStatus
from server.services.pipeline_runner import PipelineRunner
from server.core.config import settings

BENCHMARK_SUITES = {
    "noir_mini": {
        "title": "Noir Mini Benchmark",
        "genre": "Neo-Noir",
        "idea": "A gritty detective investigation in a rain-slicked cyberpunk city.",
        "steps": ["script_writer", "concept_artist", "generalist"],
        "shots_count": 3
    },
    "scifi_standard": {
        "title": "Sci-Fi Standard Benchmark",
        "genre": "Sci-Fi",
        "idea": "Space exploration mission encountering a mysterious nebula.",
        "steps": ["script_writer", "concept_artist", "location_scout", "generalist"],
        "shots_count": 5
    },
    "fantasy_stress": {
        "title": "Fantasy Stress Level",
        "genre": "Epic Fantasy",
        "idea": "A large scale battle between mythical creatures in a magical forest.",
        "steps": ["script_writer", "concept_artist", "asset_designer", "location_scout", "vfx_compositor", "generalist"],
        "shots_count": 8
    }
}

class BenchmarkService:
    def __init__(self, db: Session, runner: PipelineRunner):
        self.db = db
        self.runner = runner

    async def list_suites(self) -> Dict:
        return BENCHMARK_SUITES

    async def run_benchmark(self, suite_key: str, economy_mode: bool = True) -> str:
        """벤치마크 실행 트리거"""
        suite = BENCHMARK_SUITES.get(suite_key)
        if not suite:
            raise ValueError(f"Unknown benchmark suite: {suite_key}")

        # 1. 벤치마크용 프로젝트 생성
        project = Project(
            id=f"bench_{uuid.uuid4().hex[:8]}",
            title=f"[BENCHMARK] {suite['title']}",
            genre=suite['genre'],
            idea=suite['idea'],
            status="benchmark_pending"
        )
        self.db.add(project)

        # 2. 벤치마크용 실행 생성
        run = PipelineRun(
            project_id=project.id,
            steps=suite['steps'],
            is_economy_mode=1 if economy_mode else 0,
            is_test_run=1, # 벤치마크는 효율을 위해 대표 컷 모드 사용 권장
            is_benchmark=1,
            status=RunStatus.RUNNING.value
        )
        self.db.add(run)
        self.db.commit()
        self.db.refresh(run)

        # 3. 비동기 실행 (PipelineRunner에 위임)
        # 실제로는 Celery나 BackgroundTasks를 사용하겠지만, 
        # 여기서는 PipelineRunner의 비동기 루프를 직접 호출 (시연용)
        import asyncio
        asyncio.create_task(self.runner.run_pipeline(run.id, self.db))

        return run.id

    async def get_benchmark_report(self, run_id: str) -> Dict:
        """벤치마크 결과 레포트 생성"""
        run = self.db.query(PipelineRun).filter(PipelineRun.id == run_id).first()
        if not run:
            return {"error": "Run not found"}

        if run.status != "completed":
            return {"status": run.status, "progress": run.progress}

        results = run.step_results or {}
        
        # 전체 통계 계산
        durations = [res.get("duration_sec", 0) for res in results.values() if "duration_sec" in res]
        scores = [res.get("soq_score", 0) for res in results.values() if res.get("soq_score", 0) > 0]
        
        report = {
            "run_id": run_id,
            "suite_title": run.project.title,
            "total_duration_sec": round(sum(durations), 2),
            "average_soq_score": sum(scores) / len(scores) if scores else 0,
            "step_breakdown": results,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return report
