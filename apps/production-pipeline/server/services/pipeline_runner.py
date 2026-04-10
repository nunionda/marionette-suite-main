"""
마리오네트 스튜디오 — 파이프라인 실행 서비스
비동기 백그라운드 태스크로 에이전트 파이프라인을 순차 실행
"""
import asyncio
import json
import traceback
from datetime import datetime
from pathlib import Path
from typing import Optional, Callable

from server.core.config import settings
from server.models.database import PipelineRun, Project, RunStatus


# 파이프라인 단계 정의 (순서)
PIPELINE_STEPS = [
    "script_writer",
    "concept_artist",
    "generalist",
    "asset_designer",
    "vfx_compositor",
    "master_editor",
    "sound_designer",
]

# 진행률 가중치 (각 단계의 상대적 비중)
STEP_WEIGHTS = {
    "script_writer": 20,
    "concept_artist": 15,
    "generalist": 25,
    "asset_designer": 10,
    "vfx_compositor": 10,
    "master_editor": 10,
    "sound_designer": 10,
}


class PipelineRunner:
    """
    파이프라인 실행 매니저
    각 단계(에이전트)를 순차 실행하고 WebSocket으로 진행 상황을 브로드캐스트
    """

    def __init__(self, broadcast_fn: Optional[Callable] = None):
        self.broadcast_fn = broadcast_fn

    async def notify(self, message: dict):
        """WebSocket 브로드캐스트"""
        if self.broadcast_fn:
            await self.broadcast_fn(message)

    async def run_pipeline(self, run: PipelineRun, project: Project, db_session, idea: str = ""):
        """
        파이프라인 전체 실행
        """
        steps = run.steps or ["script_writer"]
        total_weight = sum(STEP_WEIGHTS.get(s, 10) for s in steps)
        completed_weight = 0

        run.status = RunStatus.RUNNING.value
        run.started_at = datetime.utcnow()
        db_session.commit()

        await self.notify({
            "type": "pipeline_started",
            "run_id": run.id,
            "project_id": project.id,
            "steps": steps,
        })

        json_path = None  # ScriptWriter 산출물 경로 (후속 단계 인풋)

        for step in steps:
            try:
                run.current_step = step
                db_session.commit()

                await self.notify({
                    "type": "step_started",
                    "run_id": run.id,
                    "project_id": project.id,
                    "step": step,
                    "progress": (completed_weight / total_weight) * 100,
                })

                # ─── 각 단계 실행 ───
                result = await self._execute_step(step, project, idea, json_path)

                # 결과 저장
                step_results = run.step_results or {}
                step_results[step] = {
                    "status": "completed",
                    "output_path": result.get("output_path"),
                    "message": result.get("message", f"{step} 완료"),
                    "completed_at": datetime.utcnow().isoformat(),
                }
                run.step_results = step_results

                # ScriptWriter 결과물 → 후속 단계 인풋으로 전달
                if step == "script_writer" and result.get("json_path"):
                    json_path = result["json_path"]
                    # DirectionPlan JSON을 프로젝트에도 저장
                    if result.get("direction_plan"):
                        project.direction_plan_json = result["direction_plan"]
                        project.direction_plan_path = json_path
                        if result.get("logline"):
                            project.logline = result["logline"]
                        if result.get("genre"):
                            project.genre = result["genre"]

                completed_weight += STEP_WEIGHTS.get(step, 10)
                progress = (completed_weight / total_weight) * 100
                run.progress = progress
                project.progress = progress
                db_session.commit()

                await self.notify({
                    "type": "step_completed",
                    "run_id": run.id,
                    "project_id": project.id,
                    "step": step,
                    "progress": progress,
                    "message": result.get("message", f"{step} 완료"),
                })

            except Exception as e:
                error_msg = f"{step} 실행 중 오류: {str(e)}\n{traceback.format_exc()}"
                step_results = run.step_results or {}
                step_results[step] = {"status": "failed", "error": str(e)}
                run.step_results = step_results
                run.status = RunStatus.FAILED.value
                run.error_message = error_msg
                run.completed_at = datetime.utcnow()
                db_session.commit()

                await self.notify({
                    "type": "step_failed",
                    "run_id": run.id,
                    "project_id": project.id,
                    "step": step,
                    "error": str(e),
                })
                return

        # 파이프라인 완료
        run.status = RunStatus.COMPLETED.value
        run.progress = 100.0
        run.completed_at = datetime.utcnow()
        project.progress = 100.0
        project.status = "completed"
        db_session.commit()

        await self.notify({
            "type": "pipeline_completed",
            "run_id": run.id,
            "project_id": project.id,
            "progress": 100.0,
        })

    async def _execute_step(self, step: str, project: Project, idea: str, json_path: str = None) -> dict:
        """
        개별 단계 실행
        현재는 ScriptWriter만 실제 API 연동, 나머지는 Mock
        """
        if step == "script_writer":
            return await self._run_script_writer(idea or project.idea or project.title)
        elif step == "concept_artist":
            return await self._run_mock_step(step, json_path, "스토리보드 이미지 생성")
        elif step == "generalist":
            return await self._run_mock_step(step, json_path, "비디오 푸티지 생성")
        elif step == "asset_designer":
            return await self._run_mock_step(step, json_path, "3D 에셋 생성")
        elif step == "vfx_compositor":
            return await self._run_mock_step(step, json_path, "VFX 합성")
        elif step == "master_editor":
            return await self._run_mock_step(step, json_path, "편집 및 컬러 그레이딩")
        elif step == "sound_designer":
            return await self._run_mock_step(step, json_path, "사운드 디자인")
        else:
            raise ValueError(f"알 수 없는 파이프라인 단계: {step}")

    async def _run_script_writer(self, idea: str) -> dict:
        """ScriptWriter 에이전트 실행 (실제 Gemini API 호출)"""
        import sys
        sys.path.insert(0, str(settings.PROJECT_ROOT))

        from src.agents.script_writer import ScriptWriterAgent

        # 블로킹 호출을 별도 스레드에서 실행
        loop = asyncio.get_event_loop()
        agent = ScriptWriterAgent(api_key=settings.GEMINI_API_KEY)

        plan, json_path, md_path = await loop.run_in_executor(
            None, agent.run_pipeline, idea
        )

        return {
            "output_path": md_path,
            "json_path": json_path,
            "direction_plan": plan.model_dump(),
            "logline": plan.logline,
            "genre": plan.genre,
            "message": f"✅ '{plan.title}' 기획안 생성 완료 ({len(plan.scenes)}씬)",
        }

    async def _run_mock_step(self, step: str, json_path: str, description: str) -> dict:
        """Mock 단계 실행 (API 미연동 에이전트용)"""
        # 실제 구현 전까지 2초 딜레이로 시뮬레이션
        await asyncio.sleep(2)

        step_names = {
            "concept_artist": "AI 컨셉 아티스트",
            "generalist": "AI 제너럴리스트",
            "asset_designer": "AI 에셋 디자이너",
            "vfx_compositor": "AI VFX 컴포지터",
            "master_editor": "AI 마스터 에디터",
            "sound_designer": "AI 사운드 디자이너",
        }

        return {
            "output_path": None,
            "message": f"⚠️ {step_names.get(step, step)} — {description} (Mock: API 연동 대기 중)",
        }
