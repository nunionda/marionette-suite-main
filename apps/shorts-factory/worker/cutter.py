"""
cutter.py — FFmpeg cut + format-aware crop/scale.

Supports two output formats:
  vertical   — 9:16 (1080x1920) for YouTube Shorts
  horizontal — 16:9 (1920x1080) for long-form YouTube
"""

import subprocess
import os
import sys


OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "output", "clips")

FORMATS = {
    "vertical":   {"w": 1080, "h": 1920, "vf": "crop='min(iw,ih*9/16)':ih,scale=1080:1920"},
    "horizontal": {"w": 1920, "h": 1080, "vf": "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2"},
}


def cut_and_crop(
    source_path: str,
    start_sec: float,
    end_sec: float,
    render_job_id: int,
    fmt: str = "vertical",
) -> str:
    """
    Cut [start_sec, end_sec] from source_path and crop/scale to target format.
    fmt: 'vertical' (9:16) or 'horizontal' (16:9).
    Returns the output file path.
    """
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    out_path = os.path.join(OUTPUT_DIR, f"{render_job_id}_clip.mp4")

    duration = end_sec - start_sec
    if duration <= 0:
        raise ValueError(f"Invalid range: {start_sec}s → {end_sec}s")

    spec = FORMATS.get(fmt, FORMATS["vertical"])
    vf = spec["vf"]

    cmd = [
        "ffmpeg", "-y",
        "-ss", str(start_sec),
        "-to", str(end_sec),
        "-i", source_path,
        "-vf", vf,
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-c:a", "aac",
        "-b:a", "192k",
        "-movflags", "+faststart",
        out_path,
    ]

    print(f"[cutter] {fmt} {start_sec}s–{end_sec}s → {out_path}")
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
    if result.returncode != 0:
        raise RuntimeError(f"FFmpeg failed:\n{result.stderr[-2000:]}")

    if not os.path.exists(out_path):
        raise RuntimeError("FFmpeg succeeded but output file not found")

    size_mb = os.path.getsize(out_path) / 1_048_576
    print(f"[cutter] done: {out_path} ({size_mb:.1f} MB)")
    return out_path


if __name__ == "__main__":
    if len(sys.argv) < 5:
        print("Usage: cutter.py <source> <start_sec> <end_sec> <render_job_id> [format]")
        sys.exit(1)
    fmt = sys.argv[5] if len(sys.argv) > 5 else "vertical"
    result = cut_and_crop(sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), int(sys.argv[4]), fmt)
    print(result)
