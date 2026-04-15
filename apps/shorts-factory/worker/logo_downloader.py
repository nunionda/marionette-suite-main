"""
logo_downloader.py — yt-dlp을 사용해 YouTube 채널 공식 로고(아바타)를 다운로드.
output/logos/{channel_id}.png 에 저장 (이미 있으면 재사용).

Flow:
  1. yt-dlp --flat-playlist -j 로 채널 첫 영상 메타데이터 추출 → avatar URL
  2. 실패 시 채널 HTML 페이지에서 og:image 추출
  3. ffmpeg -i {url} {out_path} 로 PNG 변환 저장
"""

import os
import re
import sys
import json
import subprocess
import urllib.request

LOGOS_DIR = os.path.join(os.path.dirname(__file__), "..", "output", "logos")


def download_channel_logo(channel_id: str, channel_url: str) -> str | None:
    """채널 아바타 PNG를 output/logos/{channel_id}.png 에 저장. 경로 반환."""
    os.makedirs(LOGOS_DIR, exist_ok=True)
    out_path = os.path.abspath(os.path.join(LOGOS_DIR, f"{channel_id}.png"))

    if os.path.exists(out_path):
        print(f"[logo] cached: {out_path}")
        return out_path

    thumb_url = _get_avatar_url_via_ytdlp(channel_url) or _get_avatar_url_via_html(channel_url)

    if not thumb_url:
        print(f"[logo] Could not find logo for {channel_id}", file=sys.stderr)
        return None

    return _download_as_png(thumb_url, out_path)


def _get_avatar_url_via_ytdlp(channel_url: str) -> str | None:
    """yt-dlp로 채널 첫 영상 메타데이터에서 채널 아바타 URL 추출."""
    try:
        result = subprocess.run(
            [
                "yt-dlp", "--flat-playlist",
                "-I", "1:1",
                "-j", "--no-warnings",
                channel_url + "/videos",
            ],
            capture_output=True, text=True, timeout=30,
        )
        if not result.stdout.strip():
            return None
        data = json.loads(result.stdout.splitlines()[0])

        # channel_avatar 직접 필드 (yt-dlp 2024+)
        if data.get("channel_avatar"):
            return data["channel_avatar"]

        # thumbnails 배열에서 "avatar" ID를 가진 항목 탐색
        for t in data.get("thumbnails", []):
            if "avatar" in t.get("id", ""):
                return t["url"]

    except Exception as e:
        print(f"[logo] yt-dlp metadata failed: {e}", file=sys.stderr)

    return None


def _get_avatar_url_via_html(channel_url: str) -> str | None:
    """YouTube 채널 HTML 페이지에서 og:image 또는 avatar JSON 추출."""
    try:
        req = urllib.request.Request(
            channel_url,
            headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"},
        )
        with urllib.request.urlopen(req, timeout=15) as r:
            html = r.read().decode(errors="ignore")

        # ytInitialData 내 avatar thumbnails
        m = re.search(r'"avatar":\{"thumbnails":\[{"url":"([^"]+)"', html)
        if m:
            return m.group(1)

        # og:image fallback
        m = re.search(r'<meta property="og:image" content="([^"]+)"', html)
        if m:
            return m.group(1)

    except Exception as e:
        print(f"[logo] HTML fallback failed: {e}", file=sys.stderr)

    return None


def _download_as_png(url: str, out_path: str) -> str | None:
    """URL에서 이미지를 다운로드해 PNG로 저장. 성공 시 경로 반환."""
    try:
        result = subprocess.run(
            ["ffmpeg", "-y", "-i", url, out_path],
            capture_output=True, timeout=30,
        )
        if result.returncode == 0 and os.path.exists(out_path):
            print(f"[logo] saved: {out_path}")
            return out_path
        else:
            err = result.stderr.decode(errors="ignore")[-500:]
            print(f"[logo] ffmpeg failed: {err}", file=sys.stderr)
    except Exception as e:
        print(f"[logo] download failed: {e}", file=sys.stderr)

    return None


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: logo_downloader.py <channel_id> <channel_url>")
        sys.exit(1)
    result = download_channel_logo(sys.argv[1], sys.argv[2])
    print(result or "FAILED")
    sys.exit(0 if result else 1)
