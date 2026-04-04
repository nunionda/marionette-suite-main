from __future__ import annotations

import json
import os
from dataclasses import dataclass, field


@dataclass
class Scene:
    scene_id: str
    description: str
    camera_angle: str = "medium shot"
    mood: str = "neutral"
    characters: list[str] = field(default_factory=list)
    location: str = ""
    notes: str = ""


@dataclass
class ScenarioData:
    project: str
    scenes: list[Scene]
    style: str = "all"
    style_overrides: dict = field(default_factory=dict)
    output_format: str = "both"


class SceneParser:
    def parse_text(self, text: str, project: str = "Untitled") -> ScenarioData:
        scene = Scene(scene_id="SC001", description=text.strip())
        return ScenarioData(project=project, scenes=[scene])

    def parse_json(self, json_path: str) -> ScenarioData:
        with open(json_path) as f:
            data = json.load(f)

        scenes = []
        for i, s in enumerate(data.get("scenes", []), 1):
            scenes.append(Scene(
                scene_id=s.get("scene_id", f"SC{i:03d}"),
                description=s["description"],
                camera_angle=s.get("camera_angle", "medium shot"),
                mood=s.get("mood", "neutral"),
                characters=s.get("characters", []),
                location=s.get("location", ""),
                notes=s.get("notes", ""),
            ))

        return ScenarioData(
            project=data.get("project", "Untitled"),
            scenes=scenes,
            style=data.get("style", "all"),
            style_overrides=data.get("style_overrides", {}),
            output_format=data.get("output_format", "both"),
        )

    def parse_input(self, input_value: str) -> ScenarioData:
        if input_value.endswith(".json") and os.path.isfile(input_value):
            return self.parse_json(input_value)
        return self.parse_text(input_value)
