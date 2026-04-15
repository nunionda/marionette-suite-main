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

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from cutter import cut_and_crop
from subtitler import generate_subtitles
from compositor import compose
from logo_downloader import download_channel_logo

APP_DIR = os.path.join(os.path.dirname(__file__), "..")
DB_PATH = os.path.join(APP_DIR, "shorts_factory.db")
API_BASE = os.environ.get("SHORTS_API_BASE", "http://localhost:3008")
WORKER_SECRET = os.environ.get("WORKER_SECRET", "")
POLL_INTERVAL = 5  # seconds between polls when queue is empty

JOB_QUERY = """
    SELECT
        rj.id,
        rj.status,
        rj.lang_set,
        rj.template_id,
        rj.subtitle_entries,
        cc.start_sec,
        cc.end_sec,
        a.raw_file_path,
        et.subtitle_style,
        et.credit_text   AS template_credit,
        s.credit_text    AS source_credit,
        s.channel_id     AS source_channel_id,
        s.channel_url    AS source_channel_url
    FROM render_jobs rj
    JOIN candidate_clips cc ON cc.id = rj.candidate_clip_id
    JOIN assets a            ON a.id  = cc.asset_id
    LEFT JOIN edit_templates et ON CAST(et.id AS TEXT) = rj.template_id
    LEFT JOIN sources s         ON s.id = a.source_id
    WHERE rj.status = 'queued'
    ORDER BY rj.created_at ASC
    LIMIT 1
"""

# Same fields — picks up confirmed subtitle jobs for composite step
CONFIRMED_QUERY = """
    SELECT
        rj.id,
        rj.status,
        rj.lang_set,
        rj.template_id,
        rj.subtitle_entries,
        cc.start_sec,
        cc.end_sec,
        a.raw_file_path,
        et.subtitle_style,
        et.credit_text   AS template_credit,
        s.credit_text    AS source_credit,
        s.channel_id     AS source_channel_id,
        s.channel_url    AS source_channel_url
    FROM render_jobs rj
    JOIN candidate_clips cc ON cc.id = rj.candidate_clip_id
    JOIN assets a            ON a.id  = cc.asset_id
    LEFT JOIN edit_templates et ON CAST(et.id AS TEXT) = rj.template_id
    LEFT JOIN sources s         ON s.id = a.source_id
    WHERE rj.status = 'subtitle_review_confirmed'
    ORDER BY rj.created_at ASC
    LIMIT 1
"""

SINGLE_JOB_QUERY = """
    SELECT
        rj.id,
        rj.status,
        rj.lang_set,
        rj.template_id,
        rj.subtitle_entries,
        cc.start_sec,
        cc.end_sec,
        a.raw_file_path,
        et.subtitle_style,
        et.credit_text   AS template_credit,
        s.credit_text    AS source_credit,
        s.channel_id     AS source_channel_id,
        s.channel_url    AS source_channel_url
    FROM render_jobs rj
    JOIN candidate_clips cc ON cc.id = rj.candidate_clip_id
    JOIN assets a            ON a.id  = cc.asset_id
    LEFT JOIN edit_templates et ON CAST(et.id AS TEXT) = rj.template_id
    LEFT JOIN sources s         ON s.id = a.source_id
    WHERE rj.id = ?
"""


# ─── API helpers ──────────────────────────────────────────────────────────

def patch_job(job_id: int, payload: dict):
    """PATCH /api/render/:id — update job status/stage/paths."""
    data = json.dumps(payload).encode()
    headers = {"Content-Type": "application/json"}
    if WORKER_SECRET:
        headers["X-Worker-Secret"] = WORKER_SECRET
    req = urllib.request.Request(
        f"{API_BASE}/api/render/{job_id}",
        data=data,
        headers=headers,
        method="PATCH",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read())
    except Exception as e:
        print(f"[worker] PATCH /api/render/{job_id} failed: {e}", file=sys.stderr)


# ─── Pipeline ─────────────────────────────────────────────────────────────

def _transcribe_only(clip_path: str, job_id: int, style_str: str, translate: bool) -> list:
    """Run STT (and optional translation) without writing ASS. Returns entry list."""
    from subtitler import extract_audio, transcribe_groq, translate_entries_gemini, GROQ_API_KEY
    import tempfile

    if not GROQ_API_KEY:
        print("[worker] GROQ_API_KEY not set — empty subtitles")
        return []

    with tempfile.TemporaryDirectory() as tmp_dir:
        audio_path = extract_audio(clip_path, tmp_dir)
        entries = transcribe_groq(audio_path)
        print(f"[worker] Whisper: {len(entries)} segments")

        if translate:
            from subtitler import translate_entries_gemini, GEMINI_API_KEY
            if GEMINI_API_KEY and entries:
                entries = translate_entries_gemini(entries)

    return entries


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
    channel_id  = row["source_channel_id"] or ""
    channel_url = row["source_channel_url"] or ""

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

    # Stage 2: Transcribe + subtitle review gate
    # Run STT (and optional KR→EN translation), persist entries, pause for operator review.
    # Composite is triggered after the operator confirms/edits via subtitle_review_confirmed.
    patch_job(job_id, {"status": "processing", "stage": "subtitle"})
    try:
        entries = _transcribe_only(clip_path, job_id, style_str, translate)
    except Exception as e:
        # STT failure is non-fatal — proceed without subtitles rather than blocking the job
        print(f"[worker] STT failed (non-fatal): {e}", file=sys.stderr)
        entries = []

    # Persist entries and pause for operator subtitle review
    patch_job(job_id, {
        "status": "subtitle_review",
        "stage": "subtitle",
        "subtitleEntries": json.dumps(entries),
    })
    print(f"[worker] Job {job_id} paused for subtitle review ({len(entries)} segments)")
    return True  # resume_composite() picks up after operator confirms


def resume_composite(row) -> bool:
    """Resume pipeline from composite stage using confirmed subtitle entries."""
    job_id      = row["id"]
    style_str   = row["subtitle_style"] or ""
    credit_text = row["template_credit"] or row["source_credit"] or ""
    channel_id  = row["source_channel_id"] or ""
    channel_url = row["source_channel_url"] or ""

    print(f"\n[worker] ─── Resume composite Job {job_id} ───")

    # Reconstruct clip path (already produced in Stage 1)
    app_dir = os.path.join(os.path.dirname(__file__), "..")
    clip_path = os.path.abspath(os.path.join(app_dir, "output", "clips", f"{job_id}_clip.mp4"))
    if not os.path.exists(clip_path):
        patch_job(job_id, {
            "status": "error", "stage": "composite",
            "errorCode": "CLIP_NOT_FOUND", "errorMessage": f"Clip missing: {clip_path}",
        })
        return False

    # Load confirmed/edited subtitle entries from DB
    entries = []
    entries_json = row["subtitle_entries"] or "[]"
    try:
        entries = json.loads(entries_json)
    except Exception:
        pass

    # Write ASS from saved entries
    ass_path = None
    try:
        from subtitler import build_ass, DEFAULT_ASS_STYLE, SUBTITLES_DIR
        os.makedirs(SUBTITLES_DIR, exist_ok=True)
        ass_path = os.path.join(SUBTITLES_DIR, f"{job_id}.ass")
        style = style_str if style_str else DEFAULT_ASS_STYLE
        with open(ass_path, "w", encoding="utf-8") as f:
            f.write(build_ass(entries, style))
        print(f"[worker] ASS written from confirmed entries: {ass_path} ({len(entries)} lines)")
    except Exception as e:
        print(f"[worker] ASS write failed (non-fatal): {e}", file=sys.stderr)
        ass_path = None

    # Fetch channel logo (cached)
    logo_path = None
    if channel_id and channel_url:
        try:
            logo_path = download_channel_logo(channel_id, channel_url)
        except Exception as e:
            print(f"[worker] logo download warning (non-fatal): {e}", file=sys.stderr)

    # Composite
    patch_job(job_id, {"status": "processing", "stage": "composite"})
    try:
        out_path = compose(clip_path, ass_path, credit_text, job_id, logo_path=logo_path)
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
            # Priority: confirmed subtitle jobs first, then fresh queued jobs
            confirmed_row = conn.execute(CONFIRMED_QUERY).fetchone()
            row = conn.execute(JOB_QUERY).fetchone() if not confirmed_row else None
            conn.close()

            if confirmed_row:
                resume_composite(confirmed_row)
                time.sleep(1)  # brief pause between jobs to avoid DB hammering
            elif row:
                process_job(row)
                time.sleep(1)
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

    if row["status"] == "subtitle_review_confirmed":
        success = resume_composite(row)
    else:
        success = process_job(row)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "render":
        run_single(int(sys.argv[2]))
    else:
        run_loop()
