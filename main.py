"""
마리오네트 스튜디오 — CLI 엔트리포인트

사용법:
  # 모드 A: 아이디어 → 전체 파이프라인
  python main.py --idea "주제 입력"

  # 모드 B: 완성 대본 → 파이프라인 (비트 세이버 기본 설정)
  python main.py --step fromScript --script scripts/quant/ep1_draft_v2.md --range 1 5

  # 모드 B: 단계 선택 실행 (파싱 + 스토리보드만)
  python main.py --step fromScript --script scripts/quant/ep1_draft_v2.md --range 1 15 --only parse storyboard

  # 모드 B: 스타일 변경
  python main.py --step fromScript --script scripts/quant/ep1_draft_v2.md --range 1 5 --style noir

  # 개별 에이전트 단독 실행
  python main.py --step scriptWriter --idea "주제 입력"
  python main.py --step scripter --script scripts/quant/ep1_draft_v2.md --range 1 10
  python main.py --step conceptArtist --input output/plans/direction_plan_XXX.json
  python main.py --step conceptArtist --input output/plans/direction_plan_XXX.json --style photorealistic
"""
import os
import argparse
from src.agents.script_writer import ScriptWriterAgent
from src.agents.concept_artist import ConceptArtistAgent


def main():
    parser = argparse.ArgumentParser(
        description="마리오네트 스튜디오 — AI 영상 제작 파이프라인",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--idea", type=str, help="영상 아이디어 시놉시스")
    parser.add_argument(
        "--step",
        type=str,
        choices=[
            "scriptWriter", "scripter", "conceptArtist",
            "generalist", "assetDesigner", "vfxCompositor",
            "masterEditor", "soundDesigner",
            "fromScript", "all",
        ],
        default="scriptWriter",
        help="실행할 파이프라인 단계",
    )
    parser.add_argument("--input", type=str, help="기존 JSON 기획안 파일 경로")
    parser.add_argument("--script", type=str, help="완성 대본 .md 파일 경로")
    parser.add_argument(
        "--characters", type=str,
        default="scripts/quant/characters.json",
        help="캐릭터 설정 JSON 경로 (기본: scripts/quant/characters.json)",
    )
    parser.add_argument(
        "--outline", type=str,
        default="scripts/quant/outline.md",
        help="아웃라인 .md 경로 (기본: scripts/quant/outline.md)",
    )
    parser.add_argument(
        "--range", type=int, nargs=2, metavar=("START", "END"),
        help="씬 범위 (예: --range 1 15)",
    )
    parser.add_argument(
        "--style", type=str, default="webtoon",
        choices=["webtoon", "photorealistic", "anime", "noir", "concept_art"],
        help="스토리보드 스타일 (기본: webtoon)",
    )
    parser.add_argument(
        "--only", type=str, nargs="+",
        choices=["parse", "storyboard", "video", "asset", "vfx", "edit", "sound"],
        help="특정 단계만 실행 (예: --only parse storyboard)",
    )

    args = parser.parse_args()
    step = args.step

    # ─── 모드 B: 완성 대본 기반 파이프라인 ───
    if step == "fromScript":
        script_path = args.script
        if not script_path:
            print("❌ --script 인자로 대본 파일 경로를 지정하세요.")
            print("   예: python main.py --step fromScript --script scripts/quant/ep1_draft_v2.md --range 1 5")
            return

        from src.agents.orchestrator import OrchestratorAgent
        orchestrator = OrchestratorAgent(style=args.style)

        scene_range = tuple(args.range) if args.range else None

        orchestrator.run_from_script(
            script_path=script_path,
            characters_path=args.characters,
            outline_path=args.outline,
            scene_range=scene_range,
            steps=args.only,
        )
        return

    # ─── 모드 A: 아이디어 기반 전체 파이프라인 ───
    if step in ["all"]:
        idea = args.idea
        if not idea:
            idea = input("🎬 어떤 영상의 기획안을 작성해 드릴까요? (아이디어 입력): ")
        if not idea.strip():
            print("아이디어가 입력되지 않아 종료합니다.")
            return

        from src.agents.orchestrator import OrchestratorAgent
        orchestrator = OrchestratorAgent(style=args.style)
        orchestrator.run_full_pipeline(idea)
        return

    # ─── ScriptWriter 단독 ───
    if step == "scriptWriter":
        idea = args.idea
        if not idea:
            idea = input("🎬 어떤 영상의 기획안을 작성해 드릴까요? (아이디어 입력): ")
        if not idea.strip():
            print("아이디어가 입력되지 않아 종료합니다.")
            return

        print("\n🚀 [Step 1] AI 시나리오 작가 (ScriptWriter)")
        agent = ScriptWriterAgent()
        agent.run_pipeline(idea)
        return

    # ─── Scripter 단독 ───
    if step == "scripter":
        script_path = args.script
        if not script_path:
            print("❌ --script 인자가 필요합니다.")
            return

        from src.agents.scripter import ScripterAgent
        print("\n🚀 Scripter: 대본 → DirectionPlan JSON")
        parser_agent = ScripterAgent()
        scene_range = tuple(args.range) if args.range else None
        parser_agent.run_pipeline(
            script_path=script_path,
            characters_path=args.characters,
            outline_path=args.outline,
            scene_range=scene_range,
        )
        return

    # ─── ConceptArtist 단독 ───
    if step == "conceptArtist":
        if not args.input:
            print("❌ --input 인자로 JSON 기획안 파일 경로를 제공하세요.")
            return
        print(f"\n🚀 AI 컨셉 아티스트 (스타일: {args.style})")
        artist = ConceptArtistAgent(style=args.style)
        artist.generate_storyboard_images(args.input)
        return

    # ─── 나머지 에이전트 단독 실행 ───
    if not args.input:
        print(f"❌ '{step}' 단독 실행에는 --input 인자가 필요합니다.")
        return

    json_path = args.input

    if step == "generalist":
        from src.agents.generalist import GeneralistAgent
        print(f"\n🚀 AI 제너럴리스트")
        GeneralistAgent().generate_videos(json_path)
    elif step == "assetDesigner":
        from src.agents.asset_designer import AssetDesignerAgent
        print(f"\n🚀 AI 에셋 디자이너")
        AssetDesignerAgent().generate_3d_assets(json_path)
    elif step == "vfxCompositor":
        from src.agents.vfx_compositor import VFXCompositorAgent
        print(f"\n🚀 AI VFX 컴포지터")
        VFXCompositorAgent().apply_vfx_and_composite(json_path)
    elif step == "masterEditor":
        from src.agents.master_editor import MasterEditorAgent
        print(f"\n🚀 AI 마스터 에디터")
        MasterEditorAgent().edit_and_color_grade(json_path)
    elif step == "soundDesigner":
        from src.agents.sound_designer import SoundDesignerAgent
        print(f"\n🚀 AI 사운드 디자이너")
        SoundDesignerAgent().generate_audio(json_path)


if __name__ == "__main__":
    main()
