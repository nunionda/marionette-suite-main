"""
assembler.py — Multi-clip assembler for long-form videos.

Takes a list of clip paths and concatenates them with optional crossfade
transitions. Outputs a single MP4 ready for compositor (subtitle + credit overlay).

Usage:
  from assembler import assemble
  out = assemble(["clip1.mp4", "clip2.mp4", "clip3.mp4"], render_job_id=42)
"""

import subprocess
import os
import sys
import tempfile


OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "output", "assembled")


def assemble(
    clip_paths: list[str],
    render_job_id: int,
    crossfade_sec: float = 0.5,
    intro_path: str | None = None,
    outro_path: str | None = None,
) -> str:
    """
    Concatenate multiple clips into a single video.

    If crossfade_sec > 0, applies audio+video crossfade between clips.
    Optional intro/outro clips are prepended/appended.

    Returns the output file path.
    """
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    out_path = os.path.join(OUTPUT_DIR, f"{render_job_id}_assembled.mp4")

    all_clips = []
    if intro_path and os.path.exists(intro_path):
        all_clips.append(intro_path)
    all_clips.extend(clip_paths)
    if outro_path and os.path.exists(outro_path):
        all_clips.append(outro_path)

    if len(all_clips) == 0:
        raise ValueError("No clips to assemble")

    if len(all_clips) == 1:
        # Single clip — just copy
        cmd = [
            "ffmpeg", "-y",
            "-i", all_clips[0],
            "-c", "copy",
            "-movflags", "+faststart",
            out_path,
        ]
        print(f"[assembler] single clip → {out_path}")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        if result.returncode != 0:
            raise RuntimeError(f"FFmpeg copy failed:\n{result.stderr[-2000:]}")
        return out_path

    if crossfade_sec > 0 and len(all_clips) <= 10:
        return _assemble_with_crossfade(all_clips, out_path, crossfade_sec)
    else:
        return _assemble_concat(all_clips, out_path)


def _assemble_concat(clips: list[str], out_path: str) -> str:
    """Simple concat demuxer — no transitions, fastest method."""
    concat_file = out_path + ".txt"
    with open(concat_file, "w") as f:
        for clip in clips:
            safe = os.path.abspath(clip).replace("'", "'\\''")
            f.write(f"file '{safe}'\n")

    cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0",
        "-i", concat_file,
        "-c:v", "libx264", "-preset", "fast", "-crf", "23",
        "-c:a", "aac", "-b:a", "192k",
        "-movflags", "+faststart",
        out_path,
    ]

    print(f"[assembler] concat {len(clips)} clips → {out_path}")
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
    os.remove(concat_file)

    if result.returncode != 0:
        raise RuntimeError(f"FFmpeg concat failed:\n{result.stderr[-2000:]}")

    _report(out_path, len(clips))
    return out_path


def _assemble_with_crossfade(clips: list[str], out_path: str, fade_sec: float) -> str:
    """
    Crossfade between clips using xfade (video) + acrossfade (audio).
    Limited to ~10 clips due to filter_complex complexity.
    """
    n = len(clips)
    inputs = []
    for clip in clips:
        inputs.extend(["-i", clip])

    # Build xfade chain: [0][1]xfade → [v01], [v01][2]xfade → [v012], ...
    vf_parts = []
    af_parts = []

    # We need clip durations to calculate offsets
    durations = []
    for clip in clips:
        dur = _get_duration(clip)
        durations.append(dur)

    # Video crossfade chain
    offset = durations[0] - fade_sec
    prev_label = "0:v"
    for i in range(1, n):
        out_label = f"v{i}"
        vf_parts.append(
            f"[{prev_label}][{i}:v]xfade=transition=fade:duration={fade_sec}:offset={offset:.3f}[{out_label}]"
        )
        if i < n - 1:
            offset += durations[i] - fade_sec
        prev_label = out_label

    # Audio crossfade chain
    prev_alabel = "0:a"
    for i in range(1, n):
        out_alabel = f"a{i}"
        af_parts.append(
            f"[{prev_alabel}][{i}:a]acrossfade=d={fade_sec}:c1=tri:c2=tri[{out_alabel}]"
        )
        prev_alabel = out_alabel

    filter_complex = ";".join(vf_parts + af_parts)
    video_out = f"v{n-1}"
    audio_out = f"a{n-1}"

    cmd = [
        "ffmpeg", "-y",
        *inputs,
        "-filter_complex", filter_complex,
        "-map", f"[{video_out}]",
        "-map", f"[{audio_out}]",
        "-c:v", "libx264", "-preset", "fast", "-crf", "23",
        "-c:a", "aac", "-b:a", "192k",
        "-movflags", "+faststart",
        out_path,
    ]

    print(f"[assembler] crossfade {n} clips (fade={fade_sec}s) → {out_path}")
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=900)
    if result.returncode != 0:
        # Fallback to simple concat if crossfade fails
        print(f"[assembler] crossfade failed, falling back to concat: {result.stderr[-200:]}")
        return _assemble_concat(clips, out_path)

    _report(out_path, n)
    return out_path


def _get_duration(path: str) -> float:
    """Get video duration in seconds via ffprobe."""
    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    try:
        return float(result.stdout.strip())
    except ValueError:
        return 10.0  # fallback


def _report(out_path: str, clip_count: int):
    size_mb = os.path.getsize(out_path) / 1_048_576
    dur = _get_duration(out_path)
    print(f"[assembler] done: {out_path} ({clip_count} clips, {dur:.1f}s, {size_mb:.1f} MB)")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: assembler.py <render_job_id> <clip1> <clip2> ... [--crossfade N]")
        sys.exit(1)

    rid = int(sys.argv[1])
    crossfade = 0.5
    clips = []
    i = 2
    while i < len(sys.argv):
        if sys.argv[i] == "--crossfade":
            crossfade = float(sys.argv[i + 1])
            i += 2
        else:
            clips.append(sys.argv[i])
            i += 1

    result = assemble(clips, rid, crossfade_sec=crossfade)
    print(result)
