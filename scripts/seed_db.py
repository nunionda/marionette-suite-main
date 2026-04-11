import sqlite3
import uuid
import json
from datetime import datetime

DB_PATH = "apps/production-pipeline/marionette.db"

def seed_pipeline_presets():
    """마리오네트 v2 기본 파이프라인 프리셋 시드"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    presets = [
        {
            "id": str(uuid.uuid4()),
            "category": "film",
            "name": "Hollywood Feature Film",
            "description": "Complete 14-agent pipeline for feature film production",
            "agent_steps": [
                {"agent": "WRIT", "order": 1, "required": True, "defaultParams": {}},
                {"agent": "SCPT", "order": 2, "required": True, "defaultParams": {}},
                {"agent": "CNCP", "order": 3, "required": True, "defaultParams": {}},
                {"agent": "SETD", "order": 4, "required": True, "defaultParams": {}},
                {"agent": "ASST", "order": 5, "required": False, "defaultParams": {}},
                {"agent": "GEN", "order": 6, "required": True, "defaultParams": {}},
                {"agent": "CINE", "order": 7, "required": True, "defaultParams": {}},
                {"agent": "VFX", "order": 8, "required": False, "defaultParams": {}},
                {"agent": "VOIC", "order": 9, "required": False, "defaultParams": {}},
                {"agent": "EDIT", "order": 10, "required": True, "defaultParams": {}},
                {"agent": "GRDE", "order": 11, "required": True, "defaultParams": {}},
                {"agent": "SOND", "order": 12, "required": True, "defaultParams": {}},
                {"agent": "SCOR", "order": 13, "required": False, "defaultParams": {}},
                {"agent": "MSTR", "order": 14, "required": True, "defaultParams": {}}
            ],
            "is_default": 1
        },
        {
            "id": str(uuid.uuid4()),
            "category": "commercial",
            "name": "Brand Commercial (30s-60s)",
            "description": "Streamlined 7-agent pipeline for commercial production",
            "agent_steps": [
                {"agent": "WRIT", "order": 1, "required": True, "defaultParams": {"format": "ad_copy"}},
                {"agent": "CNCP", "order": 2, "required": True, "defaultParams": {}},
                {"agent": "GEN", "order": 3, "required": True, "defaultParams": {}},
                {"agent": "CINE", "order": 4, "required": True, "defaultParams": {}},
                {"agent": "EDIT", "order": 5, "required": True, "defaultParams": {}},
                {"agent": "GRDE", "order": 6, "required": True, "defaultParams": {}},
                {"agent": "MSTR", "order": 7, "required": True, "defaultParams": {}}
            ],
            "is_default": 1
        },
        {
            "id": str(uuid.uuid4()),
            "category": "youtube_short",
            "name": "YouTube Short-form",
            "description": "Fast 5-agent pipeline for social media content",
            "agent_steps": [
                {"agent": "WRIT", "order": 1, "required": True, "defaultParams": {"format": "youtube_script"}},
                {"agent": "GEN", "order": 2, "required": True, "defaultParams": {}},
                {"agent": "EDIT", "order": 3, "required": True, "defaultParams": {}},
                {"agent": "SOND", "order": 4, "required": True, "defaultParams": {}},
                {"agent": "MSTR", "order": 5, "required": True, "defaultParams": {}}
            ],
            "is_default": 1
        },
        {
            "id": str(uuid.uuid4()),
            "category": "drama_series",
            "name": "Drama Series (per episode)",
            "description": "13-agent episodic content pipeline with character continuity",
            "agent_steps": [
                {"agent": "WRIT", "order": 1, "required": True, "defaultParams": {"format": "episode_script"}},
                {"agent": "SCPT", "order": 2, "required": True, "defaultParams": {}},
                {"agent": "CNCP", "order": 3, "required": True, "defaultParams": {}},
                {"agent": "SETD", "order": 4, "required": True, "defaultParams": {}},
                {"agent": "GEN", "order": 5, "required": True, "defaultParams": {}},
                {"agent": "CINE", "order": 6, "required": True, "defaultParams": {}},
                {"agent": "VFX", "order": 7, "required": False, "defaultParams": {}},
                {"agent": "VOIC", "order": 8, "required": False, "defaultParams": {}},
                {"agent": "EDIT", "order": 9, "required": True, "defaultParams": {}},
                {"agent": "GRDE", "order": 10, "required": True, "defaultParams": {}},
                {"agent": "SOND", "order": 11, "required": True, "defaultParams": {}},
                {"agent": "SCOR", "order": 12, "required": False, "defaultParams": {}},
                {"agent": "MSTR", "order": 13, "required": True, "defaultParams": {}}
            ],
            "is_default": 1
        }
    ]

    for preset in presets:
        cursor.execute("""
            INSERT OR REPLACE INTO pipeline_presets (
                id, category, name, description, agent_steps, is_default, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            preset["id"],
            preset["category"],
            preset["name"],
            preset["description"],
            json.dumps(preset["agent_steps"]),
            preset["is_default"],
            datetime.now().isoformat(),
            datetime.now().isoformat()
        ))

    conn.commit()
    print("✅ Pipeline presets seed complete")
    conn.close()

def seed_projects():
    """기본 프로젝트 시드"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    project_id = str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO projects (
            id, title, genre, idea, logline, protagonist, antagonist, worldview, script, status, progress, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        project_id,
        "THE_QUANTUM_ORCHESTRA",
        "Cyber-Thriller / Sci-Fi",
        "A symphony of data that controls the world's financial markets.",
        "A high-stakes algorithmic thriller.",
        "Q (Quantum Analyst)",
        "The Shadow Protocol",
        "Neo-Seoul Financial District",
        "INT. SERVER ROOM - NIGHT...",
        "in_production",
        0.0,
        datetime.now().isoformat(),
        datetime.now().isoformat()
    ))

    conn.commit()
    print(f"✅ Project seed complete: {project_id}")
    conn.close()

def seed():
    """전체 시드 실행"""
    print("🌱 Starting marionette v2 database seeding...")
    seed_pipeline_presets()
    seed_projects()
    print("🌱 Seeding complete!")

if __name__ == "__main__":
    seed()
