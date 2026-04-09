import sqlite3
import uuid
from datetime import datetime

DB_PATH = "apps/production-pipeline/marionette.db"

def seed():
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

if __name__ == "__main__":
    seed()
