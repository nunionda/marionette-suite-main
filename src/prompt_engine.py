from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from .scene_parser import Scene, ScenarioData
from .style_selector import ArtistStyle, FormatStyle


@dataclass
class PromptBundle:
    scene: Scene
    style: ArtistStyle
    positive_prompt: str
    negative_prompt: str
    output_filename: str
    format_style: Optional[FormatStyle] = None


NEGATIVE_PROMPTS = {
    "kurosawa": "black and white, sharp lines, digital art, flat colors, geometric, minimal",
    "ridley_scott": "color, photorealistic, watercolor, blurry, soft focus, cartoon",
    "bong": "color, painterly, blurry, watercolor, impressionistic, abstract",
    "saul_bass": "color, photorealistic, blurry, low contrast, detailed texture, soft edges, gradient shading",
    "miyazaki": "color, photorealistic, sharp, digital render, western comic style",
    "scorsese": "detailed, photorealistic, color, clean lines, polished, digital art",
    "mad_max": "black and white, static, calm, minimal, photorealistic, soft focus",
    "anderson_jt": "color, photorealistic, painterly, blurry, watercolor, impressionistic",
    "lowery": "color, cartoon, abstract, minimal, flat, watercolor",
    "anderson_wes": "asymmetrical, gritty, dark, photorealistic, rough, abstract",
}


class PromptEngine:
    def build_prompt(self, scene: Scene, style: ArtistStyle,
                     format_style: FormatStyle | None = None) -> str:
        parts = []

        # Format prefix (if provided)
        if format_style and format_style.prompt_prefix:
            parts.append(format_style.prompt_prefix)

        # Core style prompt
        parts.append(f"Cinematic storyboard frame, {style.medium} technique.")
        parts.append(style.prompt_keywords + ".")
        parts.append(f"Scene: {scene.description}.")

        if scene.camera_angle:
            parts.append(f"Camera angle: {scene.camera_angle}.")
        if scene.mood and scene.mood != "neutral":
            parts.append(f"Mood: {scene.mood}.")
        if scene.location:
            parts.append(f"Location: {scene.location}.")

        parts.append(f"{style.composition} composition, {style.detail_level} detail level.")

        # Always generate in 4:3 canvas, gate line will mark actual frame
        parts.append("4:3 aspect ratio canvas, full frame storyboard drawing.")

        # Format suffix (if provided)
        if format_style and format_style.prompt_suffix:
            parts.append(format_style.prompt_suffix)

        return " ".join(parts)

    def build_negative_prompt(self, style: ArtistStyle) -> str:
        return NEGATIVE_PROMPTS.get(style.key, "")

    def build_batch(
        self, scenario: ScenarioData, styles: list[ArtistStyle],
        format_style: FormatStyle | None = None,
    ) -> list[PromptBundle]:
        bundles = []
        fmt_tag = f"_{format_style.key}" if format_style else ""
        for scene in scenario.scenes:
            for style in styles:
                bundles.append(PromptBundle(
                    scene=scene,
                    style=style,
                    positive_prompt=self.build_prompt(scene, style, format_style),
                    negative_prompt=self.build_negative_prompt(style),
                    output_filename=f"{scene.scene_id}_{style.key}{fmt_tag}.png",
                    format_style=format_style,
                ))
        return bundles
