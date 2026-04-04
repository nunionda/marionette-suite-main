import os
from pathlib import Path

import click
from dotenv import load_dotenv

load_dotenv()

from src.scene_parser import SceneParser
from src.style_selector import StyleSelector
from src.prompt_engine import PromptEngine
from src.image_generator import ImageGenerator
from src.post_processor import PostProcessor
from src.sheet_composer import SheetComposer


def _get_selector():
    return StyleSelector()

ARTIST_KEYS = _get_selector().get_artist_keys()
FORMAT_KEYS = _get_selector().get_format_keys()

STYLE_CHOICES = ARTIST_KEYS + ["all"]
FORMAT_CHOICES = FORMAT_KEYS + ["none"]


@click.group()
def cli():
    """Storyboard Concept Maker — 10 Masters + Format Styles."""
    pass


@cli.command()
@click.option("--scene", type=str, help="Scene description text")
@click.option("--script", type=click.Path(exists=True), help="Scenario JSON file")
@click.option("--style", type=click.Choice(STYLE_CHOICES, case_sensitive=False),
              default="all", help="Artist style (or 'all')")
@click.option("--format", "fmt", type=click.Choice(FORMAT_CHOICES, case_sensitive=False),
              default="none", help="Content format (commercial, drama_series, etc.)")
@click.option("--output", type=click.Choice(["png", "pdf", "both"]),
              default="both", help="Output format")
@click.option("--output-dir", type=str, default="output", help="Output directory")
def generate(scene, script, style, fmt, output, output_dir):
    """Generate storyboard frames from scene descriptions."""
    if not scene and not script:
        raise click.UsageError("--scene 또는 --script 중 하나를 지정하세요.")

    parser = SceneParser()
    selector = StyleSelector()
    engine = PromptEngine()
    generator = ImageGenerator(output_dir=output_dir)
    processor = PostProcessor()
    defaults = selector.get_defaults()
    composer = SheetComposer(
        columns=defaults.get("grid_columns", 3),
        rows=defaults.get("grid_rows", 2),
        output_width=defaults.get("output_width", 1024),
    )

    # Parse input
    input_value = script if script else scene
    scenario = parser.parse_input(input_value)

    # Override style from CLI
    if style != "all":
        scenario.style = style

    # Get styles
    if scenario.style == "all":
        styles = selector.get_all_styles()
    else:
        s = selector.get_style(scenario.style)
        if scenario.style_overrides:
            s = selector.apply_overrides(s, scenario.style_overrides)
        styles = [s]

    # Get format style
    format_style = None
    if fmt and fmt != "none":
        format_style = selector.get_format(fmt)

    # Build prompts
    bundles = engine.build_batch(scenario, styles, format_style)
    fmt_name = format_style.name if format_style else "Standard"
    print(f"\n📋 프로젝트: {scenario.project}")
    print(f"🎬 씬: {len(scenario.scenes)}개 × 스타일: {len(styles)}개 = 총 {len(bundles)}개 프레임")
    print(f"📐 형식: {fmt_name}")

    # Generate images
    ref_dir = str(Path(__file__).parent / "styles" / "references")
    image_paths = generator.generate_batch(bundles, reference_dir=ref_dir)

    # Post-process by style
    processed_paths = []
    for bundle, img_path in zip(bundles, image_paths):
        if img_path:
            processed = processor.process(img_path, bundle.style)
            processed_paths.append(processed)
            print(f"  🖌 후처리 완료: {processed}")
        else:
            processed_paths.append(None)

    # Compose sheets per style
    output_dir_path = Path(output_dir)
    fmt_tag = f"_{fmt}" if fmt and fmt != "none" else ""
    for s in styles:
        style_paths = [p for b, p in zip(bundles, processed_paths)
                       if b.style.key == s.key and p]
        style_scenes = [b.scene for b in bundles if b.style.key == s.key]

        if not style_paths:
            continue

        if output in ("png", "both"):
            grid_path = str(output_dir_path / f"storyboard_{s.key}{fmt_tag}.png")
            composer.compose_grid(style_paths, style_scenes, s, grid_path,
                                  project_name=scenario.project)
            print(f"\n📄 그리드 시트: {grid_path}")

        if output in ("pdf", "both"):
            pdf_path = str(output_dir_path / f"storyboard_{s.key}{fmt_tag}.pdf")
            composer.compose_pdf(style_paths, style_scenes, s, pdf_path,
                                 project_name=scenario.project)
            print(f"📑 PDF: {pdf_path}")

    print("\n✅ 스토리보드 생성 완료!")


@cli.command()
@click.option("--scene", type=str, required=True, help="Scene description to compare")
@click.option("--format", "fmt", type=click.Choice(FORMAT_CHOICES, case_sensitive=False),
              default="none", help="Content format")
@click.option("--output", type=str, default="output/comparison.png", help="Output file path")
def compare(scene, fmt, output):
    """Generate same scene in all artist styles side-by-side."""
    parser = SceneParser()
    selector = StyleSelector()
    engine = PromptEngine()
    generator = ImageGenerator(output_dir=str(Path(output).parent))
    processor = PostProcessor()
    composer = SheetComposer()

    scenario = parser.parse_text(scene)
    styles = selector.get_all_styles()
    target_scene = scenario.scenes[0]

    format_style = None
    if fmt and fmt != "none":
        format_style = selector.get_format(fmt)

    fmt_name = format_style.name if format_style else "Standard"
    print(f"\n🎬 스타일 비교: \"{scene}\"")
    print(f"  아티스트: {', '.join(s.name for s in styles)}")
    print(f"  형식: {fmt_name}")

    style_images = {}
    for s in styles:
        bundle = engine.build_batch(scenario, [s], format_style)[0]
        img_path = generator.generate_image(bundle)

        if img_path:
            processed = processor.process(img_path, s)
            style_images[s.key] = (s, processed)
        else:
            style_images[s.key] = (s, None)

    composer.compose_comparison(target_scene, style_images, output)
    print(f"\n📊 비교 시트: {output}")
    print("✅ 완료!")


@cli.command("list")
def list_styles():
    """List all available artist styles and content formats."""
    selector = StyleSelector()

    print("\n🎨 아티스트 스타일 (10 Masters)")
    print("=" * 60)
    for i, s in enumerate(selector.get_all_styles(), 1):
        print(f"  {i:02d}. {s.key:<16s} {s.name:<25s} [{s.color_mode}]")

    print(f"\n📐 콘텐츠 형식")
    print("=" * 60)
    for f in selector.get_all_formats():
        tags = ", ".join(f.tags)
        print(f"  - {f.key:<16s} {f.name:<25s} [{tags}]")

    print(f"\n💡 사용 예시:")
    print(f'  python main.py generate --scene "주인공이 절벽에 서있다" --style kurosawa')
    print(f'  python main.py generate --scene "나이키 러닝화 클로즈업" --style ridley_scott --format commercial')
    print(f'  python main.py compare --scene "추격씬" --format feature_film')
    print(f'  python main.py showcase --scene "일몰의 도시 전경"')


@cli.command()
@click.option("--scene", type=str, required=True, help="Scene description")
@click.option("--format", "fmt", type=click.Choice(FORMAT_CHOICES, case_sensitive=False),
              default="none", help="Content format")
@click.option("--output-dir", type=str, default="output", help="Output directory")
def showcase(scene, fmt, output_dir):
    """Generate one scene in ALL 10 artist styles — full showcase output."""
    parser = SceneParser()
    selector = StyleSelector()
    engine = PromptEngine()
    processor = PostProcessor()
    defaults = selector.get_defaults()
    composer = SheetComposer(
        columns=defaults.get("grid_columns", 3),
        rows=defaults.get("grid_rows", 2),
        output_width=defaults.get("output_width", 1024),
    )

    scenario = parser.parse_text(scene)
    styles = selector.get_all_styles()
    target_scene = scenario.scenes[0]

    format_style = None
    if fmt and fmt != "none":
        format_style = selector.get_format(fmt)

    fmt_name = format_style.name if format_style else "Standard"
    fmt_tag = f"_{fmt}" if fmt and fmt != "none" else ""

    # Create output subdirectory
    output_path = Path(output_dir) / f"showcase{fmt_tag}"
    output_path.mkdir(parents=True, exist_ok=True)
    generator = ImageGenerator(output_dir=str(output_path))

    print(f"\n🎨 10 Masters Showcase")
    print(f"  씬: \"{scene}\"")
    print(f"  형식: {fmt_name}")
    print(f"  출력: {output_path}/")
    print(f"  총 {len(styles)}개 아티스트 스타일\n")

    results = {}
    for i, style in enumerate(styles, 1):
        bundle = engine.build_batch(scenario, [style], format_style)[0]
        print(f"[{i:02d}/{len(styles)}] {style.name} ({style.key})")
        print(f"  📝 프롬프트: {bundle.positive_prompt[:120]}...")

        img_path = generator.generate_image(bundle)
        if img_path:
            processed = processor.process(img_path, style)
            results[style.key] = (style, processed)
            print(f"  ✅ 완료: {processed}")
        else:
            results[style.key] = (style, None)
            print(f"  ❌ 생성 실패")

    # Generate comparison sheet
    successful = sum(1 for _, (_, p) in results.items() if p)
    if successful > 0:
        comp_path = str(output_path / f"comparison_all{fmt_tag}.png")
        composer.compose_comparison(target_scene, results, comp_path)
        print(f"\n📊 비교 시트: {comp_path}")

    print(f"\n✅ Showcase 완료! ({successful}/{len(styles)} 성공)")
    print(f"  📁 결과: {output_path}/")


if __name__ == "__main__":
    cli()
