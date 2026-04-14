"""
cutter.py — FFmpeg cut + 9:16 center crop.

Takes a source video and a time range, outputs a vertical-format MP4
suitable for YouTube Shorts (1080x1920).
"""

import subprocess
import os
import sys


OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "output", "clips")


def cut_and_crop(
    source_path: str,
    start_sec: float,
    end_sec: float,
    render_job_id: int,
) -> str:
    """
    Cut [start_sec, end_sec] from source_path and center-crop to 9:16.
    Returns the output file path.
    Raises RuntimeError on failure.
    """
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    out_path = os.path.join(OUTPUT_DIR, f"{render_job_id}_clip.mp4")

    duration = end_sec - start_sec
    if duration <= 0:
        raise ValueError(f"Invalid range: {start_sec}s → {end_sec}s")

    # crop=ih*9/16:ih takes the center vertical strip of a landscape video
    # scale=1080:1920 upscales to full Shorts resolution
    vf = "crop=ih*9/16:ih,scale=1080:1920"

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

    print(f"[cutter] {start_sec}s–{end_sec}s → {out_path}")
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    if result.returncode != 0:
        raise RuntimeError(f"FFmpeg failed:\n{result.stderr[-2000:]}")

    if not os.path.exists(out_path):
        raise RuntimeError("FFmpeg succeeded but output file not found")

    size_mb = os.path.getsize(out_path) / 1_048_576
    print(f"[cutter] done: {out_path} ({size_mb:.1f} MB)")
    return out_path


if __name__ == "__main__":
    if len(sys.argv) < 5:
        print("Usage: cutter.py <source> <start_sec> <end_sec> <render_job_id>")
        sys.exit(1)
    result = cut_and_crop(sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), int(sys.argv[4]))
    print(result)
