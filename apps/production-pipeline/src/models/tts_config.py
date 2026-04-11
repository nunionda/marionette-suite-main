"""
카테고리별 TTS 파이프라인 설정
영화/드라마/광고/유튜브 각각에 최적화된 모델·음성·SRT 설정을 정의한다.

Model selection (2025-04 research):
  - Film/Drama  → Gemini TTS (multi-speaker dialogue) + VoxCPM2 fallback
  - Commercial  → VoxCPM2 (48 kHz studio, voice design) + MeloTTS fallback
  - YouTube     → Qwen3-TTS (instruction control, Sohee KR) + MeloTTS fallback
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal

CategoryKey = Literal["FILM", "DRAMA_SERIES", "COMMERCIAL", "YOUTUBE_SHORT"]
NarrationSource = Literal["auto", "manual_first", "auto_first"]
ProviderName = Literal["gemini", "qwen", "voxcpm", "melo", "mock"]


@dataclass(frozen=True)
class CategoryTTSConfig:
    """한 카테고리의 TTS 파이프라인 설정."""

    label: str
    primary_provider: ProviderName
    fallback_provider: ProviderName
    multi_speaker: bool
    max_speakers: int
    narration_enabled: bool
    narration_source: NarrationSource
    srt_enabled: bool
    default_voices: tuple[str, ...] = field(default_factory=tuple)
    sample_rate_hint: int = 24000  # provider가 override 가능


CATEGORY_CONFIGS: dict[CategoryKey, CategoryTTSConfig] = {
    "FILM": CategoryTTSConfig(
        label="Film",
        primary_provider="gemini",
        fallback_provider="voxcpm",
        multi_speaker=True,
        max_speakers=5,
        narration_enabled=True,
        narration_source="auto",          # 선택적 (needs_narration flag)
        srt_enabled=True,
        default_voices=("Kore", "Charon", "Fenrir", "Aoede", "Puck"),
    ),
    "DRAMA_SERIES": CategoryTTSConfig(
        label="Drama Series",
        primary_provider="gemini",
        fallback_provider="voxcpm",
        multi_speaker=True,
        max_speakers=8,
        narration_enabled=True,
        narration_source="auto",
        srt_enabled=True,
        default_voices=("Kore", "Charon", "Fenrir", "Aoede", "Puck"),
    ),
    "COMMERCIAL": CategoryTTSConfig(
        label="Commercial",
        primary_provider="voxcpm",
        fallback_provider="melo",
        multi_speaker=False,
        max_speakers=1,
        narration_enabled=True,
        narration_source="manual_first",  # 수동 우선 → auto fallback
        srt_enabled=False,
        default_voices=("professional_male",),  # VoxCPM2 voice design prompt
        sample_rate_hint=48000,
    ),
    "YOUTUBE_SHORT": CategoryTTSConfig(
        label="YouTube",
        primary_provider="qwen",
        fallback_provider="melo",
        multi_speaker=False,
        max_speakers=1,
        narration_enabled=True,
        narration_source="auto_first",    # 자동 우선 → 수동 override
        srt_enabled=True,
        default_voices=("Sohee",),        # Qwen3-TTS Korean voice
    ),
}


def get_config(category: str) -> CategoryTTSConfig:
    """카테고리 키로 설정을 조회한다. 없으면 FILM 기본값 반환."""
    return CATEGORY_CONFIGS.get(category, CATEGORY_CONFIGS["FILM"])  # type: ignore[arg-type]
