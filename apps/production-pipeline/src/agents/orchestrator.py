"""
마리오네트 스튜디오 — Orchestrator 에이전트
전체 파이프라인을 순차 조율하는 프로덕션 매니저

파이프라인 모드:
  A. idea → ScriptWriter → ConceptArtist → ... (아이디어 기반)
  B. script → Scripter → ConceptArtist → ... (완성 대본 기반)
"""
import os

from src.agents.script_writer import ScriptWriterAgent
from src.agents.scripter import ScripterAgent
from src.agents.concept_artist import ConceptArtistAgent
from src.agents.cinematographer import CinematographerAgent
from src.agents.generalist import GeneralistAgent
from src.agents.asset_designer import AssetDesignerAgent
from src.agents.vfx_compositor import VFXCompositorAgent
from src.agents.master_editor import MasterEditorAgent
from src.agents.sound_designer import SoundDesignerAgent


class OrchestratorAgent:
    def __init__(self, style: str = "webtoon"):
        """
        마리오네트 파이프라인 엔지니어(오케스트레이터) 초기화
        """
        self.style = style

    def run_full_pipeline(self, idea: str):
        """
        모드 A: 아이디어 → 전체 파이프라인
        """
        print("\n⚙️  [Orchestrator] 파이프라인 모드: 아이디어 기반 (idea → full)")
        print(f"💡 아이디어: '{idea}'\n")

        # Step 1: ScriptWriter
        print("🚀 [Step 1/7] AI 시나리오 작가 (ScriptWriter)")
        writer = ScriptWriterAgent()
        plan, json_path, md_path = writer.run_pipeline(idea)
        if not json_path:
            print("❌ ScriptWriter 실패: JSON 기획안이 생성되지 않았습니다.")
            return
        print(f"   ✅ 기획안 생성: {json_path}\n")

        # Step 2~7: 공통 파이프라인
        self._run_production_pipeline(json_path)

    def run_from_script(
        self,
        script_path: str,
        characters_path: str = None,
        outline_path: str = None,
        scene_range: tuple[int, int] = None,
        steps: list[str] = None,
    ):
        """
        모드 B: 완성 대본 → 전체 파이프라인

        Args:
            script_path: 대본 .md 파일 경로
            characters_path: characters.json 경로 (선택)
            outline_path: outline.md 경로 (선택)
            scene_range: (시작씬, 끝씬) 튜플
            steps: 실행할 단계 리스트 (없으면 전체)
                   ["parse", "storyboard", "video", "asset", "vfx", "edit", "sound"]
        """
        all_steps = ["parse", "storyboard", "video", "asset", "vfx", "edit", "sound"]
        active_steps = steps or all_steps
        range_str = f"S#{scene_range[0]}~S#{scene_range[1]}" if scene_range else "전체"

        print("\n⚙️  [Orchestrator] 파이프라인 모드: 완성 대본 기반 (script → production)")
        print(f"📖 대본: {script_path}")
        print(f"🎯 범위: {range_str}")
        print(f"🎭 스타일: {self.style}")
        print(f"📋 단계: {' → '.join(active_steps)}\n")

        json_path = None

        # Step 1: Scripter — 대본 → DirectionPlan JSON
        if "parse" in active_steps:
            print("🚀 [Step 1] AI 스크립트 파서 (Scripter)")
            parser = ScripterAgent()
            plan, json_path, md_path = parser.run_pipeline(
                script_path=script_path,
                characters_path=characters_path,
                outline_path=outline_path,
                scene_range=scene_range,
            )
            if not json_path:
                print("❌ Scripter 실패")
                return
            print(f"   ✅ DirectionPlan 생성: {json_path} ({len(plan.scenes)}씬)\n")

        # Step 2~7: 프로덕션 파이프라인
        if json_path:
            self._run_production_pipeline(json_path, active_steps)
        else:
            print("⚠️  JSON 경로가 없습니다. --input으로 기존 JSON을 지정하세요.")

    def _run_production_pipeline(self, json_path: str, active_steps: list[str] = None):
        """
        프로덕션 파이프라인 공통 실행부 (Step 2~8)
        """
        all_steps = active_steps or ["storyboard", "cinematography", "video", "asset", "vfx", "edit", "sound"]

        # Step 2: ConceptArtist — 스토리보드 이미지 생성
        if "storyboard" in all_steps:
            print("🚀 [Step 2/8] AI 컨셉 아티스트 (ConceptArtist)")
            artist = ConceptArtistAgent(style=self.style)
            images = artist.generate_storyboard_images(json_path)
            print(f"   ✅ 스토리보드 {len(images)}장 생성\n")

        # Step 3: Cinematographer — 촬영 감독 (프롬프트 최적화 연구)
        if "cinematography" in all_steps:
            print("🚀 [Step 3/8] AI 촬영 감독 (Cinematographer) - 자율 연구 모드")
            CinematographerAgent().enhance_prompts(json_path, iterations=3)
            print()

        # Step 4: Generalist — 비디오 푸티지
        if "video" in all_steps:
            print("🚀 [Step 4/8] AI 제너럴리스트 (Generalist)")
            GeneralistAgent().generate_videos(json_path)
            print()

        # Step 5: AssetDesigner — 3D 에셋
        if "asset" in all_steps:
            print("🚀 [Step 5/8] AI 에셋 디자이너 (AssetDesigner)")
            AssetDesignerAgent().generate_3d_assets(json_path)
            print()

        # Step 6: VFXCompositor — VFX 합성
        if "vfx" in all_steps:
            print("🚀 [Step 6/8] AI VFX 컴포지터 (VFXCompositor)")
            VFXCompositorAgent().apply_vfx_and_composite(json_path)
            print()

        # Step 7: MasterEditor — 편집
        if "edit" in all_steps:
            print("🚀 [Step 7/8] AI 마스터 에디터 (MasterEditor)")
            MasterEditorAgent().edit_and_color_grade(json_path)
            print()

        # Step 8: SoundDesigner — 사운드
        if "sound" in all_steps:
            print("🚀 [Step 8/9] AI 사운드 디자이너 (SoundDesigner)")
            SoundDesignerAgent().generate_audio(json_path)
            print()

        # Step 9: Visual QA (gstack) — 시각적 일관성 검토
        if "qa" in all_steps:
            print("🚀 [Step 9/9] gstack Visual QA — 자율 검증 모드")
            from scripts.qa_visual_consistency import run_gstack_qa
            run_gstack_qa(json_path)
            print()

        print("🎬 마리오네트 OS: 파이프라인 최적화 및 검증 완료! 🎬\n")
