"""
worker.py — Main render job queue loop.

Polls render_jobs WHERE status='queued', runs the full pipeline:
  cutter → subtitler → compositor

Status updates go via REST API (PATCH /api/render/:id) so writes
stay in the TypeScript server. SQLite is read-only from here (WAL mode
allows concurrent reads from multiple processes).

Usage:
  python worker.py                   # continuous polling loop
  python worker.py render <job_id>   # single job (called by worker-bridge)
"""

import os
import sys
import time
import sqlite3
import json
import urllib.request
import urllib.error

from cutter import cut_and_crop
from subtitler import generate_subtitles
from compositor import compose

APP_DIR = os.path.join(os.path.dirname(__file__), "..")
DB_PATH = os.path.join(APP_DIR, "shorts_factory.db")
API_BASE = os.environ.get("SHORTS_API_BASE", "http://localhost:3008")
POLL_INTERVAL = 5  # seconds between polls when queue is empty

JOB_QUERY = """
    SELECT
        rj.id,
        rj.lang_set,
        rj.template_id,
        cc.start_sec,
        cc.end_sec,
        a.raw_file_path,
        et.subtitle_style,
        et.credit_text   AS template_credit,
        s.credit_text    AS source_credit
    FROM render_jobs rj
    JOIN candidate_clips cc ON cc.id = rj.candidate_clip_id
    JOIN assets a            ON a.id  = cc.asset_id
    LEFT JOIN edit_templates et ON CAST(et.id AS TEXT) = rj.template_id
    LEFT JOIN sources s         ON s.id = a.source_id
    WHERE rj.status = 'queued'
    ORDER BY rj.created_at ASC
    LIMIT 1
"""

SINGLE_JOB_QUERY = JOB_QUERY.replace("WHERE rj.status = 'queued'", "WHERE rj.id = ?")


# ─── API helpers ──────────────────────────────────────────────────────────

def patch_job(job_id: int, payload: dict):
    """PATCH /api/render/:id — update job status/stage/paths."""
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        f"{API_BASE}/api/render/{job_id}",
        data=data,
        headers={"Content-Type": "application/json"},
        method="PATCH",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read())
    except Exception as e:
        print(f"[worker] PATCH /api/render/{job_id} failed: {e}", file=sys.stderr)


# ─── Pipeline ─────────────────────────────────────────────────────────────

def process_job(row) -> bool:
    """Run the full render pipeline for one job. Returns True on success."""
    job_id      = row["id"]
    start_sec   = row["start_sec"]
    end_sec     = row["end_sec"]
    raw_path    = row["raw_file_path"]
    lang_set    = row["lang_set"] or "kr,en"
    style_str   = row["subtitle_style"] or ""
    credit_text = row["template_credit"] or row["source_credit"] or ""
    translate   = "en" in lang_set

    print(f"\n[worker] ─── Job {job_id}: {start_sec}s → {end_sec}s ───")

    if not raw_path or not os.path.exists(raw_path):
        patch_job(job_id, {
            "status": "error",
            "stage": "cut",
            "errorCode": "SOURCE_NOT_FOUND",
            "errorMessage": f"Source file not found: {raw_path}",
        })
        return False

    # Stage 1: Cut + 9:16 crop
    patch_job(job_id, {"status": "processing", "stage": "cut"})
    try:
        clip_path = cut_and_crop(raw_path, start_sec, end_sec, job_id)
    except Exception as e:
        patch_job(job_id, {
            "status": "error", "stage": "cut",
            "errorCode": "CUT_FAILED", "errorMessage": str(e)[:500],
        })
        return False

    # Stage 2: Subtitles (non-fatal — empty ASS if Whisper fails)
    patch_job(job_id, {"stage": "subtitles"})
    try:
        ass_path = generate_subtitles(clip_path, job_id, style_str=style_str, translate=translate)
    except Exception as e:
        print(f"[worker] subtitle warning (non-fatal): {e}", file=sys.stderr)
        ass_path = None

    # Stage 3: Final composite
    patch_job(job_id, {"stage": "composite"})
    try:
        out_path = compose(clip_path, ass_path, credit_text, job_id)
    except Exception as e:
        patch_job(job_id, {
            "status": "error", "stage": "composite",
            "errorCode": "COMPOSITE_FAILED", "errorMessage": str(e)[:500],
        })
        return False

    patch_job(job_id, {
        "status": "done",
        "stage": "done",
        "outputFilePath": out_path,
        "subtitleFilePath": ass_path,
    })
    print(f"[worker] Job {job_id} complete → {out_path}")
    return True


# ─── Entry points ─────────────────────────────────────────────────────────

def run_loop():
    """Continuous polling loop — runs until interrupted."""
    print(f"[worker] polling loop started (db={DB_PATH}, api={API_BASE})")
    while True:
        try:
            conn = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)
            conn.row_factory = sqlite3.Row
            row = conn.execute(JOB_QUERY).fetchone()
            conn.close()

            if row:
                process_job(row)
            else:
                time.sleep(POLL_INTERVAL)
        except KeyboardInterrupt:
            print("\n[worker] stopped")
            break
        except sqlite3.OperationalError as e:
            # DB not ready yet (server hasn't created tables)
            print(f"[worker] DB not ready: {e}", file=sys.stderr)
            time.sleep(POLL_INTERVAL)
        except Exception as e:
            print(f"[worker] loop error: {e}", file=sys.stderr)
            time.sleep(POLL_INTERVAL)


def run_single(job_id: int):
    """Process a single render job (called by worker-bridge on demand)."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    row = conn.execute(SINGLE_JOB_QUERY, (job_id,)).fetchone()
    conn.close()

    if not row:
        print(f"[worker] render job {job_id} not found", file=sys.stderr)
        sys.exit(1)

    success = process_job(row)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "render":
        run_single(int(sys.argv[2]))
    else:
        run_loop()
