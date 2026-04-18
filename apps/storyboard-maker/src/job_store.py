from __future__ import annotations

import sqlite3
from datetime import datetime, timezone
from pathlib import Path


class JobStore:
    def __init__(self, db_path: str):
        self._path = db_path
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self._path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._connect() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS jobs (
                    paperclip_id TEXT PRIMARY KEY,
                    started_at   TEXT NOT NULL,
                    updated_at   TEXT NOT NULL,
                    image_done   INTEGER NOT NULL DEFAULT 0,
                    video_done   INTEGER NOT NULL DEFAULT 0
                )
            """)

    def upsert(self, paperclip_id: str, *, image_done: bool, video_done: bool):
        now = datetime.now(timezone.utc).isoformat()
        with self._connect() as conn:
            conn.execute("""
                INSERT INTO jobs (paperclip_id, started_at, updated_at, image_done, video_done)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(paperclip_id) DO UPDATE SET
                    updated_at  = excluded.updated_at,
                    image_done  = excluded.image_done,
                    video_done  = excluded.video_done
            """, (paperclip_id, now, now, int(image_done), int(video_done)))

    def get(self, paperclip_id: str) -> dict | None:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT * FROM jobs WHERE paperclip_id = ?", (paperclip_id,)
            ).fetchone()
        return dict(row) if row else None

    def list_recent(self, limit: int = 50) -> list[dict]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT * FROM jobs ORDER BY updated_at DESC LIMIT ?", (limit,)
            ).fetchall()
        return [dict(r) for r in rows]
