import asyncio
import json
import os
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from pathlib import Path

from server.models.database import Project, PipelineRun, PipelineTake
from server.core.config import settings
from src.agents.generalist import GeneralistAgent
from src.agents.vfx_compositor import VFXCompositorAgent
from src.agents.concept_artist import ConceptArtistAgent
from src.agents.quality_evaluator import QualityEvaluatorAgent

class ShotgunService:
    """
    Shotgun (Multi-Take) Generation Service
    병렬로 여러 영상/이미지 변주를 생성하고 DB에 기록
    """

    def __init__(self, db_session: Session):
        self.db = db_session

    async def generate_takes(
        self, 
        project_id: str, 
        run_id: str, 
        step: str, 
        num_takes: int = 4,
        shot_id: Optional[str] = None
    ) -> List[PipelineTake]:
        """
        특정 단계에 대해 병렬로 변주 생성
        """
        project = self.db.query(Project).filter(Project.id == project_id).first()
        run = self.db.query(PipelineRun).filter(PipelineRun.id == run_id).first()
        
        if not project or not run:
            raise ValueError("Project or Run not found")

        print(f"🔫 Shotgun: Generating {num_takes} takes for step {step}...")

        tasks = []
        for i in range(num_takes):
            tasks.append(self._generate_single_take(project, run, step, i, shot_id))

        results = await asyncio.gather(*tasks)
        
        takes = []
        for res in results:
            if res:
                take = PipelineTake(
                    run_id=run.id,
                    project_id=project.id,
                    step=step,
                    shot_id=shot_id,
                    output_path=res["output_path"],
                    engine=res["engine"],
                    description=res.get("description", ""),
                    soq_score=res.get("soq_score", 0.0)
                )
                self.db.add(take)
                takes.append(take)
        
        self.db.commit()

        # 자동 마스터 테이크 선정 (가장 높은 SOQ 점수)
        if takes:
            best_take = max(takes, key=lambda x: x.soq_score)
            if best_take.soq_score >= 60: # 최소 품질 기준
                print(f"🌟 Shotgun: Auto-selecting Master Take (ID: {best_take.id}, SOQ: {best_take.soq_score})")
                self.set_master_take(best_take.id)

        return takes

    async def _generate_single_take(self, project: Project, run: PipelineRun, step: str, variant_idx: int, shot_id: Optional[str]) -> dict:
        """개별 테이크 생성 로직 (백그라운드 에이전트 호출)"""
        json_path = project.direction_plan_path
        visual_dna = str(project.visual_dna or "None")
        set_concept = str(project.set_concept or "None")

        loop = asyncio.get_event_loop()
        
        try:
            if step == "generalist":
                agent = GeneralistAgent(api_key=settings.GEMINI_API_KEY)
                # 시드 변주 주입 시뮬레이션 (실제 에이전트 파라미터 확장 필요)
                videos = await loop.run_in_executor(None, agent.generate_videos, json_path)
                return {
                    "output_path": videos[0] if videos else None,
                    "engine": "Veo 3.1",
                    "description": f"Variant {variant_idx + 1} - Automated Seed Variation"
                }
            
            elif step == "concept_artist":
                agent = ConceptArtistAgent(api_key=settings.GEMINI_API_KEY)
                images = await loop.run_in_executor(None, agent.generate_storyboard_images, json_path)
                output_path = images[0] if images else None
                
                # 품질 평가 수행
                eval_res = await self._evaluate_soq(project, output_path)
                
                return {
                    "output_path": output_path,
                    "engine": "Gemini 2.5 Artist",
                    "description": f"Visual Variant {variant_idx + 1}",
                    "soq_score": eval_res.get("soq_score", 0.0)
                }
            
            elif step == "vfx_compositor":
                agent = VFXCompositorAgent(api_key=settings.GEMINI_API_KEY)
                results = await loop.run_in_executor(None, agent.apply_vfx, json_path)
                return {
                    "output_path": results[0] if results else None,
                    "engine": "Marionette VFX Node",
                    "description": f"VFX Pass {variant_idx + 1}"
                }
            
            # 미지원 스텝 — 실제 출력 없음
            await asyncio.sleep(2)
            return {
                "output_path": None,
                "engine": "Mock Engine",
                "description": f"Mock Variant {variant_idx + 1} (미지원 스텝)"
            }
            
        except Exception as e:
            print(f"⚠️ Shotgun Take {variant_idx} 실패: {e}")
            return None

    async def _evaluate_soq(self, project: Project, asset_path: str) -> dict:
        """품질 평가 에이전트 호출 브릿지"""
        if not asset_path or not os.path.exists(asset_path):
            return {"soq_score": 0, "decision": "FileMissing"}

        evaluator = QualityEvaluatorAgent(api_key=settings.GEMINI_API_KEY)
        
        # DNA와 컨셉 데이터를 문자열로 변환
        visual_dna = json.dumps(project.visual_dna) if project.visual_dna else "Standard Cinematic DNA"
        set_concept = json.dumps(project.set_concept) if project.set_concept else "Standard Set Concept"
        
        result = await evaluator.evaluate_asset(asset_path, visual_dna, set_concept)
        return result

    def set_master_take(self, take_id: str):
        """특정 테이크를 최종 마스터로 승인"""
        take = self.db.query(PipelineTake).filter(PipelineTake.id == take_id).first()
        if not take:
            raise ValueError("Take not found")

        # 기존 마스터 해제
        self.db.query(PipelineTake).filter(
            PipelineTake.project_id == take.project_id,
            PipelineTake.step == take.step,
            PipelineTake.shot_id == take.shot_id
        ).update({"is_master": 0})

        take.is_master = 1
        self.db.commit()
        return take
