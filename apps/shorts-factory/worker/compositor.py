"""
compositor.py — FFmpeg final render: clip + ASS subtitles + credit overlay.

Supports two formats:
  vertical   — 1080x1920 (Shorts)
  horizontal — 1920x1080 (long-form)

Credit text position and font size adapt to the output format.

Filter availability is probed at import time; missing filters are skipped
gracefully so the pipeline always produces output.
"""

import subprocess
import os
import sys


RENDERED_DIR = os.path.join(os.path.dirname(__file__), "..", "output", "rendered")

# ---------------------------------------------------------------------------
# One-time filter availability probes
# ---------------------------------------------------------------------------

def _ffmpeg_has_filter(name: str) -> bool:
    """Return True if FFmpeg reports the named filter as available."""
    result = subprocess.run(
        ["ffmpeg", "-filters"],
        capture_output=True, text=True,
    )
    return f" {name} " in result.stdout or f"\t{name}\t" in result.stdout or f" {name}\n" in result.stdout


_HAS_DRAWTEXT = _ffmpeg_has_filter("drawtext")
_HAS_ASS      = _ffmpeg_has_filter("ass")

if not _HAS_DRAWTEXT:
    print("[compositor] ⚠ drawtext filter unavailable (libfreetype not compiled in) — credit overlay skipped")
if not _HAS_ASS:
    print("[compositor] ⚠ ass filter unavailable (libass not compiled in) — subtitle burn skipped")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _has_dialogue(ass_path: str) -> bool:
    """Return True if the ASS file contains at least one Dialogue line."""
    try:
        with open(ass_path, encoding="utf-8", errors="ignore") as f:
            for line in f:
                if line.startswith("Dialogue:"):
                    return True
    except OSError:
        pass
    return False


# ---------------------------------------------------------------------------
# Main compose function
# ---------------------------------------------------------------------------

CREDIT_STYLE = {
    "vertical":   {"fontsize": 32, "y": "h-th-20", "logo_scale": 120},
    "horizontal": {"fontsize": 24, "y": "h-th-16", "logo_scale": 80},
}


def compose(
    clip_path: str,
    ass_path: str | None,
    credit_text: str,
    render_job_id: int,
    logo_path: str | None = None,
    fmt: str = "vertical",
    hook_zoom: bool = True,
) -> str:
    """
    Burn ASS subtitles, credit text overlay, and optional channel logo into the clip.
    fmt: 'vertical' (9:16) or 'horizontal' (16:9) — adjusts credit position/size.
    hook_zoom: if True, applies a subtle zoom-in on the first 0.8s for hook effect.
    Returns the output file path.
    """
    os.makedirs(RENDERED_DIR, exist_ok=True)
    out_path = os.path.join(RENDERED_DIR, f"{render_job_id}_final.mp4")

    vf_parts = []

    # Hook zoom: subtle 1.05x → 1.0x zoom-out in first 0.8s for attention grab
    if hook_zoom:
        # zoompan on video clips: scale up then use crop to simulate zoom
        # Uses expression: zoom from 1.05 to 1.0 over first 24 frames (0.8s at 30fps)
        vf_parts.append(
            "scale=iw*1.05:ih*1.05,"
            "crop=iw/1.05:ih/1.05:"
            "(iw-iw/1.05)/2*(1-min(1\\,t/0.8)):"
            "(ih-ih/1.05)/2*(1-min(1\\,t/0.8))"
        )

    # ASS subtitles — requires libass in FFmpeg
    if _HAS_ASS and ass_path and os.path.exists(ass_path) and _has_dialogue(ass_path):
        safe_ass = os.path.abspath(ass_path).replace("\\", "/").replace(":", "\\:")
        vf_parts.append(f"ass=filename={safe_ass}")

    # Credit text overlay — requires libfreetype in FFmpeg
    style = CREDIT_STYLE.get(fmt, CREDIT_STYLE["vertical"])
    if _HAS_DRAWTEXT and credit_text:
        safe_credit = (
            credit_text
            .replace("\\", "\\\\")
            .replace("'", "\\'")
            .replace(":", "\\:")
            .replace("%", "\\%")
        )
        vf_parts.append(
            f"drawtext="
            f"text='{safe_credit}':"
            f"fontsize={style['fontsize']}:"
            f"fontcolor=white:"
            f"x=(w-tw)/2:"
            f"y={style['y']}:"
            f"box=1:"
            f"boxcolor=black@0.55:"
            f"boxborderw=6"
        )

    use_logo = bool(logo_path and os.path.exists(logo_path))

    if use_logo:
        # filter_complex required when using 2 video inputs (clip + logo PNG)
        inner = ",".join(vf_parts) if vf_parts else "null"
        logo_scale = style["logo_scale"]
        filter_complex = (
            f"[0:v]{inner}[base];"
            f"[1:v]scale={logo_scale}:-1[logo];"
            f"[base][logo]overlay=W-w-30:30[out]"
        )
        cmd = [
            "ffmpeg", "-y",
            "-i", clip_path,
            "-i", logo_path,
            "-filter_complex", filter_complex,
            "-map", "[out]",
            "-map", "0:a",
            "-c:v", "libx264", "-preset", "medium", "-crf", "22",
            "-c:a", "aac", "-b:a", "192k",
            "-movflags", "+faststart",
            out_path,
        ]
        print(f"[compositor] filter_complex (logo overlay) → {out_path}")
    else:
        vf = ",".join(vf_parts) if vf_parts else "copy"
        cmd = [
            "ffmpeg", "-y",
            "-i", clip_path,
            "-vf", vf,
            "-c:v", "libx264", "-preset", "medium", "-crf", "22",
            "-c:a", "aac", "-b:a", "192k",
            "-movflags", "+faststart",
            out_path,
        ]
        print(f"[compositor] vf={vf!r}")
        print(f"[compositor] rendering → {out_path}")

    result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
    if result.returncode != 0:
        raise RuntimeError(f"FFmpeg compose failed:\n{result.stderr[-2000:]}")

    if not os.path.exists(out_path):
        raise RuntimeError("FFmpeg succeeded but output file not found")

    size_mb = os.path.getsize(out_path) / 1_048_576
    print(f"[compositor] done: {out_path} ({size_mb:.1f} MB)")
    return out_path


if __name__ == "__main__":
    if len(sys.argv) < 5:
        print("Usage: compositor.py <clip_path> <ass_path_or_none> <credit_text> <render_job_id> [logo_path] [format]")
        sys.exit(1)
    ass = sys.argv[2] if sys.argv[2] != "none" else None
    logo = sys.argv[5] if len(sys.argv) > 5 and sys.argv[5] != "none" else None
    fmt = sys.argv[6] if len(sys.argv) > 6 else "vertical"
    result = compose(sys.argv[1], ass, sys.argv[3], int(sys.argv[4]), logo_path=logo, fmt=fmt)
    print(result)
