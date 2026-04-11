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
from server.models.database import PipelineRun, Project, RunStatus, NodeGraph


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

    async def update_node_status(self, db_session, project_id: str, agent_id: str, status: str):
        """NodeGraph에서 특정 에이전트 노드의 상태 업데이트"""
        graph = db_session.query(NodeGraph).filter(NodeGraph.project_id == project_id).first()
        if not graph:
            return

        # 해당 에이전트 노드 찾기 및 상태 업데이트
        nodes = graph.nodes or []
        updated = False
        updated_node = None
        for node in nodes:
            if node.get("agentId") == agent_id.upper():
                node["status"] = status
                updated = True
                updated_node = node
                break

        if updated:
            graph.nodes = nodes
            graph.version += 1
            db_session.commit()

            # 노드 상태 변경을 WebSocket으로 브로드캐스트
            await self.notify({
                "type": "node_status_updated",
                "project_id": project_id,
                "node_id": updated_node["id"],
                "agent_id": agent_id.upper(),
                "status": status,
                "graph_version": graph.version,
            })

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

                # 노드 상태를 "running"으로 업데이트
                await self.update_node_status(db_session, project.id, step, "running")

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

                # 노드 상태를 "completed"로 업데이트
                await self.update_node_status(db_session, project.id, step, "completed")

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
                # 노드 상태를 "failed"로 업데이트
                await self.update_node_status(db_session, project.id, step, "failed")

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
        ScriptWriter: Gemini API | 시각 단계: Pollinations.ai 무료 API | 나머지: Mock
        """
        if step == "script_writer":
            return await self._run_script_writer(idea or project.idea or project.title)
        elif step == "concept_artist":
            return await self._run_concept_artist(project, json_path)
        elif step == "generalist":
            return await self._run_generalist(project, json_path)
        elif step == "asset_designer":
            return await self._run_asset_designer(project, json_path)
        elif step == "vfx_compositor":
            return await self._run_vfx_compositor(project, json_path)
        elif step == "master_editor":
            return await self._run_master_editor(project, json_path)
        elif step == "sound_designer":
            return await self._run_sound_designer(project, json_path)
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

    async def _run_concept_artist(self, project: Project, json_path: str) -> dict:
        """컨셉 아티스트 — Pollinations.ai로 씬별 스토리보드 이미지 생성"""
        loop = asyncio.get_event_loop()
        direction = project.direction_plan_json or {}
        scenes = direction.get("scenes", []) if isinstance(direction, dict) else []

        storyboard_dir = settings.STORYBOARDS_DIR / project.id
        storyboard_dir.mkdir(parents=True, exist_ok=True)

        generated = []
        # 최대 3씬만 생성 (Pollinations API 부하 제어)
        for i, scene in enumerate(scenes[:3]):
            scene_desc = scene.get("description") or scene.get("title") or f"Scene {i+1}"
            visual_style = ""
            if project.visual_dna and isinstance(project.visual_dna, dict):
                visual_style = ", ".join(str(v) for v in list(project.visual_dna.values())[:2])
            prompt = f"Cinematic storyboard frame, {scene_desc}, {visual_style}, film grain, professional cinematography"

            output_path = str(storyboard_dir / f"storyboard_scene_{i+1:02d}.png")
            result = await loop.run_in_executor(
                None,
                lambda p=prompt, o=output_path: __import__(
                    "server.utils.free_engine", fromlist=["FreeCreativeEngine"]
                ).FreeCreativeEngine.generate_image(p, o, 1280, 720),
            )
            if result:
                generated.append(result)

        count = len(generated)
        return {
            "output_path": str(storyboard_dir),
            "message": f"✅ 컨셉 아티스트 — 스토리보드 {count}장 생성 완료 (Pollinations.ai)",
        }

    async def _run_generalist(self, project: Project, json_path: str) -> dict:
        """제너럴리스트 — 씬별 시네마틱 샷 이미지 생성"""
        loop = asyncio.get_event_loop()
        direction = project.direction_plan_json or {}
        scenes = direction.get("scenes", []) if isinstance(direction, dict) else []

        shots_dir = settings.OUTPUT_DIR / "shots" / project.id
        shots_dir.mkdir(parents=True, exist_ok=True)

        generated = []
        for i, scene in enumerate(scenes[:3]):
            scene_desc = scene.get("description") or scene.get("title") or f"Scene {i+1}"
            prompt = f"Wide cinematic shot, {scene_desc}, dramatic lighting, 35mm film, high production value"
            output_path = str(shots_dir / f"shot_scene_{i+1:02d}.png")
            result = await loop.run_in_executor(
                None,
                lambda p=prompt, o=output_path: __import__(
                    "server.utils.free_engine", fromlist=["FreeCreativeEngine"]
                ).FreeCreativeEngine.generate_image(p, o, 1280, 720),
            )
            if result:
                generated.append(result)

        count = len(generated)
        return {
            "output_path": str(shots_dir),
            "message": f"✅ 제너럴리스트 — 시네마틱 샷 {count}개 생성 완료",
        }

    async def _run_asset_designer(self, project: Project, json_path: str) -> dict:
        """에셋 디자이너 — 캐릭터 및 핵심 소품 이미지 생성"""
        loop = asyncio.get_event_loop()
        assets_dir = settings.OUTPUT_DIR / "assets" / project.id
        assets_dir.mkdir(parents=True, exist_ok=True)

        targets = []
        if project.protagonist:
            targets.append(("protagonist", project.protagonist))
        if project.antagonist:
            targets.append(("antagonist", project.antagonist))
        if not targets:
            targets = [("character", f"Main character from {project.title}")]

        generated = []
        for label, desc in targets[:2]:
            prompt = f"Character concept art, {desc}, full body, professional character design, studio lighting"
            output_path = str(assets_dir / f"asset_{label}.png")
            result = await loop.run_in_executor(
                None,
                lambda p=prompt, o=output_path: __import__(
                    "server.utils.free_engine", fromlist=["FreeCreativeEngine"]
                ).FreeCreativeEngine.generate_image(p, o, 768, 1024),
            )
            if result:
                generated.append(result)

        count = len(generated)
        return {
            "output_path": str(assets_dir),
            "message": f"✅ 에셋 디자이너 — 캐릭터 에셋 {count}개 생성 완료",
        }

    async def _run_vfx_compositor(self, project: Project, json_path: str) -> dict:
        """VFX 컴포지터 — 합성 키 아트 및 포스터 이미지 생성"""
        loop = asyncio.get_event_loop()
        vfx_dir = settings.OUTPUT_DIR / "vfx" / project.id
        vfx_dir.mkdir(parents=True, exist_ok=True)

        visual_style = ""
        if project.visual_dna and isinstance(project.visual_dna, dict):
            visual_style = ", ".join(str(v) for v in list(project.visual_dna.values())[:3])

        prompt = (
            f"Movie key art poster, {project.title}, {project.logline or ''}, "
            f"{visual_style}, epic composition, cinematic VFX, dramatic atmosphere"
        )
        output_path = str(vfx_dir / "key_art.png")
        result = await loop.run_in_executor(
            None,
            lambda: __import__(
                "server.utils.free_engine", fromlist=["FreeCreativeEngine"]
            ).FreeCreativeEngine.generate_image(prompt, output_path, 1024, 1536),
        )

        return {
            "output_path": output_path if result else None,
            "message": "✅ VFX 컴포지터 — 키 아트 합성 완료" if result else "⚠️ VFX 컴포지터 — 이미지 생성 실패",
        }

    async def _run_master_editor(self, project: Project, json_path: str) -> dict:
        """마스터 에디터 — 생성된 에셋 목록을 편집 매니페스트로 정리"""
        import json as json_mod
        manifest_dir = settings.OUTPUT_DIR / "manifests"
        manifest_dir.mkdir(parents=True, exist_ok=True)

        # 생성된 에셋 경로 수집
        asset_paths = []
        for sub in ["storyboards", "shots", "assets", "vfx"]:
            sub_dir = settings.OUTPUT_DIR / sub / project.id
            if sub_dir.exists():
                for f in sorted(sub_dir.glob("*.png")):
                    asset_paths.append(str(f))

        manifest = {
            "project_id": project.id,
            "title": project.title,
            "generated_at": datetime.utcnow().isoformat(),
            "assets": asset_paths,
            "total_frames": len(asset_paths),
        }

        manifest_path = str(manifest_dir / f"{project.id}_manifest.json")
        with open(manifest_path, "w", encoding="utf-8") as f:
            json_mod.dump(manifest, f, ensure_ascii=False, indent=2)

        return {
            "output_path": manifest_path,
            "manifest": manifest,
            "message": f"✅ 마스터 에디터 — {len(asset_paths)}개 에셋 편집 매니페스트 생성 완료",
        }

    async def _run_sound_designer(self, project: Project, json_path: str) -> dict:
        """
        사운드 디자이너 — 씬별 나레이션 스크립트 생성 및 저장
        direction plan의 scene description에서 나레이션을 추출해 .txt로 저장.
        실제 TTS API 연동 전 사용 가능한 텍스트 기반 구현.
        """
        await asyncio.sleep(1)

        audio_dir = settings.AUDIO_DIR / project.id
        audio_dir.mkdir(parents=True, exist_ok=True)

        direction = project.direction_plan_json or {}
        scenes = direction.get("scenes", []) if isinstance(direction, dict) else []

        lines = [
            f"# 🎙️ 나레이션 스크립트 — {project.title}",
            f"# Generated by Marionette Sound Designer",
            f"# Project ID: {project.id}",
            "",
        ]

        if scenes:
            for i, scene in enumerate(scenes, 1):
                title = scene.get("title") or f"Scene {i}"
                desc = scene.get("description") or scene.get("narration") or ""
                dialogue = scene.get("dialogue") or ""
                lines.append(f"## Scene {i}: {title}")
                if desc:
                    lines.append(f"[NARRATION] {desc}")
                if dialogue:
                    lines.append(f"[DIALOGUE] {dialogue}")
                lines.append("")
        else:
            # direction plan이 없으면 프로젝트 기본 정보로 생성
            lines.append(f"## Opening Narration")
            lines.append(f"[NARRATION] {project.logline or project.idea or project.title}")
            lines.append("")
            if project.worldview:
                lines.append(f"## World")
                lines.append(f"[NARRATION] {project.worldview}")
                lines.append("")

        narration_text = "\n".join(lines)
        output_path = str(audio_dir / "sound_designer_narration.txt")

        with open(output_path, "w", encoding="utf-8") as f:
            f.write(narration_text)

        scene_count = len(scenes) if scenes else 1
        return {
            "output_path": output_path,
            "message": f"✅ 사운드 디자이너 — 나레이션 스크립트 {scene_count}씬 생성 완료 (TTS 연동 대기)",
        }

    async def _run_mock_step(self, step: str, json_path: str, description: str) -> dict:
        """Mock 단계 실행 (API 미연동 에이전트용, 현재 미사용)"""
        await asyncio.sleep(2)
        return {
            "output_path": None,
            "message": f"⚠️ {step} — {description} (Mock: API 연동 대기 중)",
        }
