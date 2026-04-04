from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

import yaml


@dataclass
class ArtistStyle:
    key: str
    name: str
    medium: str
    color_mode: str
    line_type: str
    line_weight: str
    composition: str
    detail_level: str
    prompt_keywords: str
    post_processing: list[str] = field(default_factory=list)
    aspect_ratio: str = "16:9"


@dataclass
class FormatStyle:
    key: str
    name: str
    prompt_prefix: str
    prompt_suffix: str
    aspect_ratio_override: str = ""
    tags: list[str] = field(default_factory=list)


class StyleSelector:
    def __init__(self, config_path: Optional[str] = None):
        if config_path is None:
            config_path = str(Path(__file__).parent.parent / "config" / "styles.yaml")
        self._config_path = config_path
        self._styles: dict[str, ArtistStyle] = {}
        self._formats: dict[str, FormatStyle] = {}
        self._defaults: dict = {}
        self._load()

    def _load(self):
        with open(self._config_path) as f:
            data = yaml.safe_load(f)

        self._defaults = data.get("defaults", {})

        for key, artist in data.get("artists", {}).items():
            self._styles[key] = ArtistStyle(
                key=key,
                name=artist["name"],
                medium=artist["medium"],
                color_mode=artist["color_mode"],
                line_type=artist["line_type"],
                line_weight=artist["line_weight"],
                composition=artist["composition"],
                detail_level=artist["detail_level"],
                prompt_keywords=artist["prompt_keywords"],
                post_processing=artist.get("post_processing", []),
                aspect_ratio=artist.get("aspect_ratio", "16:9"),
            )

        for key, fmt in data.get("formats", {}).items():
            self._formats[key] = FormatStyle(
                key=key,
                name=fmt["name"],
                prompt_prefix=fmt.get("prompt_prefix", ""),
                prompt_suffix=fmt.get("prompt_suffix", ""),
                aspect_ratio_override=fmt.get("aspect_ratio_override", ""),
                tags=fmt.get("tags", []),
            )

    def get_style(self, artist_key: str) -> ArtistStyle:
        if artist_key not in self._styles:
            available = ", ".join(self._styles.keys())
            raise ValueError(f"Unknown artist '{artist_key}'. Available: {available}")
        return self._styles[artist_key]

    def get_all_styles(self) -> list[ArtistStyle]:
        return list(self._styles.values())

    def get_artist_keys(self) -> list[str]:
        return list(self._styles.keys())

    def get_format(self, format_key: str) -> FormatStyle:
        if format_key not in self._formats:
            available = ", ".join(self._formats.keys())
            raise ValueError(f"Unknown format '{format_key}'. Available: {available}")
        return self._formats[format_key]

    def get_all_formats(self) -> list[FormatStyle]:
        return list(self._formats.values())

    def get_format_keys(self) -> list[str]:
        return list(self._formats.keys())

    def get_defaults(self) -> dict:
        return self._defaults

    def apply_overrides(self, style: ArtistStyle, overrides: dict) -> ArtistStyle:
        if not overrides:
            return style
        data = {k: v for k, v in style.__dict__.items()}
        for k, v in overrides.items():
            if k in data and k != "key":
                data[k] = v
        return ArtistStyle(**data)
