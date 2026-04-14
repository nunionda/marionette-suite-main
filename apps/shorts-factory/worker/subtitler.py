"""
subtitler.py — Groq Whisper STT + Gemini translation → ASS subtitle file.

Flow:
  1. Extract audio from clip (ffmpeg -vn)
  2. Send to Groq Whisper API (free tier) → SRT text
  3. Optionally translate KR→EN via Gemini Free
  4. Convert SRT to ASS with K-POP style presets
  5. Return path to .ass file

If GROQ_API_KEY is not set, generates an empty ASS file (no subtitles).
"""

import os
import sys
import json
import subprocess
import tempfile
import urllib.request
import urllib.error
from typing import Optional


SUBTITLES_DIR = os.path.join(os.path.dirname(__file__), "..", "output", "subtitles")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

# Default ASS style for K-POP shorts
DEFAULT_ASS_STYLE = (
    "FontName=Arial,FontSize=22,PrimaryColour=&H00FFFFFF,"
    "OutlineColour=&H00000000,BackColour=&H80000000,"
    "Bold=1,Italic=0,Outline=2,Shadow=1,Alignment=2,"
    "MarginL=30,MarginR=30,MarginV=60"
)


def seconds_to_ass_time(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = seconds % 60
    return f"{h}:{m:02d}:{s:05.2f}"


def srt_time_to_seconds(t: str) -> float:
    """Convert SRT timestamp '00:01:23,456' to seconds."""
    t = t.replace(",", ".")
    parts = t.split(":")
    return int(parts[0]) * 3600 + int(parts[1]) * 60 + float(parts[2])


def parse_srt(srt_text: str) -> list[dict]:
    """Parse SRT into list of {start, end, text} dicts."""
    entries = []
    blocks = srt_text.strip().split("\n\n")
    for block in blocks:
        lines = block.strip().splitlines()
        if len(lines) < 3:
            continue
        # line 0: sequence number, line 1: timing, line 2+: text
        timing_line = lines[1]
        if "-->" not in timing_line:
            continue
        start_str, end_str = timing_line.split("-->")
        text = " ".join(lines[2:]).strip()
        entries.append({
            "start": srt_time_to_seconds(start_str.strip()),
            "end": srt_time_to_seconds(end_str.strip()),
            "text": text,
        })
    return entries


def build_ass(entries: list[dict], style_str: str = DEFAULT_ASS_STYLE) -> str:
    """Build ASS subtitle file content."""
    # Parse style string into key=value dict
    style_dict = {}
    for part in style_str.split(","):
        if "=" in part:
            k, v = part.split("=", 1)
            style_dict[k.strip()] = v.strip()

    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{style_dict.get("FontName", "Arial")},{style_dict.get("FontSize", "22")},{style_dict.get("PrimaryColour", "&H00FFFFFF")},&H000000FF,{style_dict.get("OutlineColour", "&H00000000")},{style_dict.get("BackColour", "&H80000000")},{style_dict.get("Bold", "1")},0,0,0,100,100,0,0,1,{style_dict.get("Outline", "2")},{style_dict.get("Shadow", "1")},{style_dict.get("Alignment", "2")},{style_dict.get("MarginL", "30")},{style_dict.get("MarginR", "30")},{style_dict.get("MarginV", "60")},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    dialogue_lines = []
    for e in entries:
        start = seconds_to_ass_time(e["start"])
        end = seconds_to_ass_time(e["end"])
        text = e["text"].replace("\n", "\\N")
        dialogue_lines.append(f"Dialogue: 0,{start},{end},Default,,0,0,0,,{text}")

    return header + "\n".join(dialogue_lines) + "\n"


def extract_audio(clip_path: str, tmp_dir: str) -> str:
    """Extract audio from video clip to WAV for Whisper."""
    audio_path = os.path.join(tmp_dir, "audio.m4a")
    cmd = [
        "ffmpeg", "-y",
        "-i", clip_path,
        "-vn",
        "-c:a", "aac",
        "-b:a", "128k",
        audio_path,
    ]
    result = subprocess.run(cmd, capture_output=True, timeout=120)
    if result.returncode != 0:
        raise RuntimeError(f"Audio extraction failed: {result.stderr.decode()[-1000:]}")
    return audio_path


def transcribe_groq(audio_path: str) -> str:
    """Send audio to Groq Whisper API, return SRT text."""
    boundary = "----FormBoundary7MA4YWxkTrZu0gW"
    with open(audio_path, "rb") as f:
        audio_data = f.read()

    filename = os.path.basename(audio_path)
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        f"Content-Type: audio/mp4\r\n\r\n"
    ).encode() + audio_data + (
        f"\r\n--{boundary}\r\n"
        f'Content-Disposition: form-data; name="model"\r\n\r\n'
        f"whisper-large-v3-turbo\r\n"
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="response_format"\r\n\r\n'
        f"srt\r\n"
        f"--{boundary}--\r\n"
    ).encode()

    req = urllib.request.Request(
        "https://api.groq.com/openai/v1/audio/transcriptions",
        data=body,
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return resp.read().decode()
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Groq API error {e.code}: {e.read().decode()[:500]}")


def translate_entries_gemini(entries: list[dict]) -> list[dict]:
    """Translate subtitle entries Korean → English using Gemini Free."""
    if not GEMINI_API_KEY or not entries:
        return entries

    texts = [e["text"] for e in entries]
    prompt = (
        "Translate the following Korean subtitle lines to English. "
        "Return a JSON array of strings in the same order. "
        "Keep each translation short and natural for subtitles.\n\n"
        + json.dumps(texts, ensure_ascii=False)
    )

    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.3, "maxOutputTokens": 2048},
    }).encode()

    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
        translated_json = data["candidates"][0]["content"]["parts"][0]["text"]
        # Strip markdown code fences if present
        translated_json = translated_json.strip().strip("```json").strip("```").strip()
        translated = json.loads(translated_json)
        for i, e in enumerate(entries):
            if i < len(translated):
                e["text"] = translated[i]
    except Exception as ex:
        print(f"[subtitler] Gemini translation skipped: {ex}", file=sys.stderr)

    return entries


def generate_subtitles(
    clip_path: str,
    render_job_id: int,
    style_str: str = DEFAULT_ASS_STYLE,
    translate: bool = True,
) -> Optional[str]:
    """
    Full subtitle generation pipeline.
    Returns path to .ass file, or None if subtitling is skipped.
    """
    os.makedirs(SUBTITLES_DIR, exist_ok=True)
    ass_path = os.path.join(SUBTITLES_DIR, f"{render_job_id}.ass")

    if not GROQ_API_KEY:
        print("[subtitler] GROQ_API_KEY not set — generating empty subtitle file")
        with open(ass_path, "w") as f:
            f.write(build_ass([]))
        return ass_path

    with tempfile.TemporaryDirectory() as tmp_dir:
        print(f"[subtitler] extracting audio from {clip_path}")
        try:
            audio_path = extract_audio(clip_path, tmp_dir)
        except Exception as e:
            print(f"[subtitler] audio extraction failed: {e}", file=sys.stderr)
            with open(ass_path, "w") as f:
                f.write(build_ass([]))
            return ass_path

        print("[subtitler] transcribing via Groq Whisper...")
        try:
            srt_text = transcribe_groq(audio_path)
            entries = parse_srt(srt_text)
            print(f"[subtitler] got {len(entries)} subtitle entries")
        except Exception as e:
            print(f"[subtitler] Whisper failed: {e}", file=sys.stderr)
            with open(ass_path, "w") as f:
                f.write(build_ass([]))
            return ass_path

        if translate and GEMINI_API_KEY and entries:
            print("[subtitler] translating KR→EN via Gemini...")
            entries = translate_entries_gemini(entries)

    with open(ass_path, "w", encoding="utf-8") as f:
        f.write(build_ass(entries, style_str))

    print(f"[subtitler] ASS written: {ass_path}")
    return ass_path


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: subtitler.py <clip_path> <render_job_id>")
        sys.exit(1)
    result = generate_subtitles(sys.argv[1], int(sys.argv[2]))
    print(result)
