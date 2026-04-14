"""
downloader.py — yt-dlp wrapper for shorts-factory.

Usage: python3 downloader.py <asset_id> <video_id>

Downloads the video to output/downloads/<video_id>.mp4 and updates
the asset record via the shorts-factory API.
"""

import sys
import os
import subprocess
import json
import urllib.request
import urllib.error

API_BASE = os.environ.get("SHORTS_API_BASE", "http://localhost:3008")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "output", "downloads")


def patch_asset(asset_id: int, payload: dict) -> None:
    """PATCH /api/assets/:id with JSON payload."""
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        f"{API_BASE}/api/assets/{asset_id}",
        data=data,
        headers={"Content-Type": "application/json"},
        method="PATCH",
    )
    try:
        urllib.request.urlopen(req, timeout=10)
    except urllib.error.URLError as e:
        print(f"[downloader] PATCH failed: {e}", file=sys.stderr)


def get_video_duration(file_path: str) -> int | None:
    """Use ffprobe to get duration in seconds."""
    try:
        result = subprocess.run(
            [
                "ffprobe", "-v", "error",
                "-show_entries", "format=duration",
                "-of", "json",
                file_path,
            ],
            capture_output=True,
            text=True,
            timeout=30,
        )
        info = json.loads(result.stdout)
        return int(float(info["format"]["duration"]))
    except Exception:
        return None


def download(asset_id: int, video_id: str) -> None:
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    out_path = os.path.join(OUTPUT_DIR, f"{video_id}.mp4")

    print(f"[downloader] starting: {video_id} → {out_path}")

    if os.path.exists(out_path):
        print(f"[downloader] already exists, skipping yt-dlp")
        duration = get_video_duration(out_path)
        patch_asset(asset_id, {
            "downloadStatus": "done",
            "rawFilePath": out_path,
            "duration": duration,
            "errorMessage": None,
        })
        return

    url = f"https://www.youtube.com/watch?v={video_id}"

    cmd = [
        "yt-dlp",
        "--format", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "--merge-output-format", "mp4",
        "--output", out_path,
        "--no-playlist",
        "--quiet",
        "--progress",
        url,
    ]

    try:
        result = subprocess.run(cmd, timeout=600)
        if result.returncode != 0:
            raise RuntimeError(f"yt-dlp exited with code {result.returncode}")
    except FileNotFoundError:
        msg = "yt-dlp not found. Install with: brew install yt-dlp"
        print(f"[downloader] ERROR: {msg}", file=sys.stderr)
        patch_asset(asset_id, {"downloadStatus": "error", "errorMessage": msg})
        return
    except subprocess.TimeoutExpired:
        msg = "Download timed out after 10 minutes"
        print(f"[downloader] ERROR: {msg}", file=sys.stderr)
        patch_asset(asset_id, {"downloadStatus": "error", "errorMessage": msg})
        return
    except Exception as e:
        msg = str(e)
        print(f"[downloader] ERROR: {msg}", file=sys.stderr)
        patch_asset(asset_id, {"downloadStatus": "error", "errorMessage": msg})
        return

    if not os.path.exists(out_path):
        msg = "yt-dlp succeeded but output file not found"
        patch_asset(asset_id, {"downloadStatus": "error", "errorMessage": msg})
        return

    duration = get_video_duration(out_path)
    print(f"[downloader] done: {video_id} ({duration}s)")
    patch_asset(asset_id, {
        "downloadStatus": "done",
        "rawFilePath": out_path,
        "duration": duration,
        "errorMessage": None,
    })


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: downloader.py <asset_id> <video_id>", file=sys.stderr)
        sys.exit(1)
    download(int(sys.argv[1]), sys.argv[2])
