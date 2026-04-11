"""
마리오네트 스튜디오 — 프리셋 서비스
파이프라인 프리셋 관리 및 노드 그래프 자동 생성
"""
from server.models.database import PipelinePreset, NodeGraph, generate_uuid

# ─── 에이전트 메타데이터 (14-agent pipeline) ───

AGENT_META = {
    "WRIT": {"label": "Writer", "phase": "PRE"},
    "SCPT": {"label": "Script Analyst", "phase": "PRE"},
    "CNCP": {"label": "Concept Artist", "phase": "PRE"},
    "SETD": {"label": "Set Designer", "phase": "PRE"},
    "ASST": {"label": "Asset Forge", "phase": "PRE"},
    "GEN":  {"label": "Previsualizer", "phase": "MAIN"},
    "CINE": {"label": "Cinematographer", "phase": "MAIN"},
    "VFX":  {"label": "VFX Artist", "phase": "POST"},
    "VOIC": {"label": "Voice Talent", "phase": "POST"},
    "EDIT": {"label": "Editor", "phase": "POST"},
    "GRDE": {"label": "Colorist", "phase": "POST"},
    "SOND": {"label": "Sound Designer", "phase": "POST"},
    "SCOR": {"label": "Composer", "phase": "POST"},
    "MSTR": {"label": "Mastering", "phase": "POST"},
}

DEFAULT_PRESETS = [
    {
        "category": "film",
        "name": "Hollywood Feature Film",
        "description": "Full 14-agent pipeline for feature film production",
        "agent_steps": [
            {"agent": "WRIT", "order": 1, "required": True, "defaultParams": {}},
            {"agent": "SCPT", "order": 2, "required": True, "defaultParams": {}},
            {"agent": "CNCP", "order": 3, "required": True, "defaultParams": {}},
            {"agent": "SETD", "order": 4, "required": True, "defaultParams": {}},
            {"agent": "ASST", "order": 5, "required": False, "defaultParams": {}},
            {"agent": "GEN",  "order": 6, "required": True, "defaultParams": {}},
            {"agent": "CINE", "order": 7, "required": True, "defaultParams": {}},
            {"agent": "VFX",  "order": 8, "required": False, "defaultParams": {}},
            {"agent": "VOIC", "order": 9, "required": False, "defaultParams": {}},
            {"agent": "EDIT", "order": 10, "required": True, "defaultParams": {}},
            {"agent": "GRDE", "order": 11, "required": True, "defaultParams": {}},
            {"agent": "SOND", "order": 12, "required": True, "defaultParams": {}},
            {"agent": "SCOR", "order": 13, "required": False, "defaultParams": {}},
            {"agent": "MSTR", "order": 14, "required": True, "defaultParams": {}},
        ],
    },
    {
        "category": "drama_series",
        "name": "Drama Series (per episode)",
        "description": "13-agent pipeline for episodic drama production",
        "agent_steps": [
            {"agent": "WRIT", "order": 1, "required": True, "defaultParams": {"format": "episode_script"}},
            {"agent": "SCPT", "order": 2, "required": True, "defaultParams": {}},
            {"agent": "CNCP", "order": 3, "required": True, "defaultParams": {}},
            {"agent": "SETD", "order": 4, "required": True, "defaultParams": {}},
            {"agent": "GEN",  "order": 5, "required": True, "defaultParams": {}},
            {"agent": "CINE", "order": 6, "required": True, "defaultParams": {}},
            {"agent": "VFX",  "order": 7, "required": False, "defaultParams": {}},
            {"agent": "VOIC", "order": 8, "required": False, "defaultParams": {}},
            {"agent": "EDIT", "order": 9, "required": True, "defaultParams": {}},
            {"agent": "GRDE", "order": 10, "required": True, "defaultParams": {}},
            {"agent": "SOND", "order": 11, "required": True, "defaultParams": {}},
            {"agent": "SCOR", "order": 12, "required": False, "defaultParams": {}},
            {"agent": "MSTR", "order": 13, "required": True, "defaultParams": {}},
        ],
    },
    {
        "category": "commercial",
        "name": "Brand Commercial (30s-60s)",
        "description": "7-agent fast pipeline for short-form advertising",
        "agent_steps": [
            {"agent": "WRIT", "order": 1, "required": True, "defaultParams": {"format": "ad_copy"}},
            {"agent": "CNCP", "order": 2, "required": True, "defaultParams": {}},
            {"agent": "GEN",  "order": 3, "required": True, "defaultParams": {}},
            {"agent": "CINE", "order": 4, "required": True, "defaultParams": {}},
            {"agent": "EDIT", "order": 5, "required": True, "defaultParams": {}},
            {"agent": "GRDE", "order": 6, "required": True, "defaultParams": {}},
            {"agent": "MSTR", "order": 7, "required": True, "defaultParams": {}},
        ],
    },
    {
        "category": "youtube_short",
        "name": "YouTube Short-form",
        "description": "5-agent minimal pipeline for social media content",
        "agent_steps": [
            {"agent": "WRIT", "order": 1, "required": True, "defaultParams": {"format": "youtube_script"}},
            {"agent": "GEN",  "order": 2, "required": True, "defaultParams": {}},
            {"agent": "EDIT", "order": 3, "required": True, "defaultParams": {}},
            {"agent": "SOND", "order": 4, "required": True, "defaultParams": {}},
            {"agent": "MSTR", "order": 5, "required": True, "defaultParams": {}},
        ],
    },
    {
        "category": "short_film",
        "name": "Short Film (5-30min)",
        "description": "10-agent pipeline for short film production",
        "agent_steps": [
            {"agent": "WRIT", "order": 1, "required": True, "defaultParams": {"format": "short_screenplay"}},
            {"agent": "SCPT", "order": 2, "required": True, "defaultParams": {}},
            {"agent": "CNCP", "order": 3, "required": True, "defaultParams": {}},
            {"agent": "SETD", "order": 4, "required": False, "defaultParams": {}},
            {"agent": "GEN",  "order": 5, "required": True, "defaultParams": {}},
            {"agent": "CINE", "order": 6, "required": True, "defaultParams": {}},
            {"agent": "EDIT", "order": 7, "required": True, "defaultParams": {}},
            {"agent": "GRDE", "order": 8, "required": True, "defaultParams": {}},
            {"agent": "SOND", "order": 9, "required": True, "defaultParams": {}},
            {"agent": "MSTR", "order": 10, "required": True, "defaultParams": {}},
        ],
    },
    {
        "category": "music_video",
        "name": "Music Video",
        "description": "8-agent visual-heavy pipeline for music videos",
        "agent_steps": [
            {"agent": "CNCP", "order": 1, "required": True, "defaultParams": {"format": "mv_concept"}},
            {"agent": "SETD", "order": 2, "required": True, "defaultParams": {}},
            {"agent": "GEN",  "order": 3, "required": True, "defaultParams": {}},
            {"agent": "CINE", "order": 4, "required": True, "defaultParams": {}},
            {"agent": "VFX",  "order": 5, "required": True, "defaultParams": {}},
            {"agent": "EDIT", "order": 6, "required": True, "defaultParams": {}},
            {"agent": "GRDE", "order": 7, "required": True, "defaultParams": {}},
            {"agent": "MSTR", "order": 8, "required": True, "defaultParams": {}},
        ],
    },
    {
        "category": "corporate",
        "name": "Corporate / Explainer Video",
        "description": "6-agent pipeline for corporate and educational content",
        "agent_steps": [
            {"agent": "WRIT", "order": 1, "required": True, "defaultParams": {"format": "corporate_script"}},
            {"agent": "CNCP", "order": 2, "required": True, "defaultParams": {}},
            {"agent": "GEN",  "order": 3, "required": True, "defaultParams": {}},
            {"agent": "VOIC", "order": 4, "required": True, "defaultParams": {}},
            {"agent": "EDIT", "order": 5, "required": True, "defaultParams": {}},
            {"agent": "MSTR", "order": 6, "required": True, "defaultParams": {}},
        ],
    },
    {
        "category": "youtube_long",
        "name": "YouTube Long-form (10min+)",
        "description": "7-agent pipeline for long-form YouTube content",
        "agent_steps": [
            {"agent": "WRIT", "order": 1, "required": True, "defaultParams": {"format": "youtube_longform"}},
            {"agent": "CNCP", "order": 2, "required": False, "defaultParams": {}},
            {"agent": "GEN",  "order": 3, "required": True, "defaultParams": {}},
            {"agent": "VOIC", "order": 4, "required": True, "defaultParams": {}},
            {"agent": "EDIT", "order": 5, "required": True, "defaultParams": {}},
            {"agent": "SOND", "order": 6, "required": True, "defaultParams": {}},
            {"agent": "MSTR", "order": 7, "required": True, "defaultParams": {}},
        ],
    },
]


def generate_graph_from_preset(project_id: str, agent_steps: list) -> NodeGraph:
    """프리셋의 agent_steps로부터 노드 그래프를 자동 생성"""
    nodes = []
    edges = []
    x_spacing = 280
    y_base = 200

    input_id = f"input_{generate_uuid()[:8]}"
    nodes.append({
        "id": input_id,
        "type": "input",
        "agentId": None,
        "label": "Project Input",
        "position": {"x": 0, "y": y_base},
        "params": {},
        "status": "completed",
    })

    prev_id = input_id
    for step in sorted(agent_steps, key=lambda s: s["order"]):
        agent_id = step["agent"]
        meta = AGENT_META.get(agent_id, {"label": agent_id, "phase": "PRE"})
        node_id = f"{agent_id.lower()}_{generate_uuid()[:8]}"

        nodes.append({
            "id": node_id,
            "type": "agent",
            "agentId": agent_id,
            "label": meta["label"],
            "position": {"x": step["order"] * x_spacing, "y": y_base},
            "params": step.get("defaultParams", {}),
            "status": "idle",
        })

        edges.append({
            "id": f"e_{prev_id}_{node_id}",
            "source": prev_id,
            "target": node_id,
        })
        prev_id = node_id

    output_id = f"output_{generate_uuid()[:8]}"
    nodes.append({
        "id": output_id,
        "type": "output",
        "agentId": None,
        "label": "Final Output",
        "position": {"x": (len(agent_steps) + 1) * x_spacing, "y": y_base},
        "params": {},
        "status": "idle",
    })
    edges.append({
        "id": f"e_{prev_id}_{output_id}",
        "source": prev_id,
        "target": output_id,
    })

    return NodeGraph(
        project_id=project_id,
        nodes=nodes,
        edges=edges,
        version=1,
    )


def seed_default_presets(db_session):
    """기본 프리셋이 없으면 시드 데이터 삽입"""
    existing = db_session.query(PipelinePreset).count()
    if existing > 0:
        return

    for preset_data in DEFAULT_PRESETS:
        preset = PipelinePreset(
            category=preset_data["category"],
            name=preset_data["name"],
            description=preset_data["description"],
            agent_steps=preset_data["agent_steps"],
            is_default=1,
        )
        db_session.add(preset)

    db_session.commit()
    print(f"🌱 Seeded {len(DEFAULT_PRESETS)} default pipeline presets")
