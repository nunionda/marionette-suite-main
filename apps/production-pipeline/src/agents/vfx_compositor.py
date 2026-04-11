import os
import re
import subprocess
from typing import List
import json

_SAFE_FILENAME = re.compile(r'^[\w][\w\-. ]+\.mp4$', re.IGNORECASE)

class VFXCompositorAgent:
    def __init__(self, output_dir: str = "output/vfx"):
        """
        AI VFX 컴포지터 초기화
        """
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def apply_vfx_and_composite(self, json_path: str) -> List[str]:
        """
        생성된 영상 에셋에 FFmpeg를 사용하여 1920x1080 정규화 합성을 수행합니다.
        output/videos/ 에서 실제 MP4 클립(10KB 초과)을 스캔하고,
        각 클립에 scale+pad 필터를 적용하여 블랙바 포함 1920x1080으로 출력합니다.
        실제 클립이 없으면 FFmpeg로 3초짜리 블랙 플레이스홀더를 생성합니다.
        """
        print(f"✨ AI VFX 컴포지터가 FFmpeg 기반 합성 처리를 시작합니다...")

        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            scene_count = len(data.get("scenes", []))

        # output/videos/ 에서 실제 MP4 클립 스캔 (10KB 초과)
        videos_dir = os.path.join(os.path.dirname(json_path), "..", "videos")
        videos_dir = os.path.normpath(videos_dir)
        real_clips = []
        if os.path.isdir(videos_dir):
            for fname in sorted(os.listdir(videos_dir)):
                if fname.lower().endswith(".mp4") and _SAFE_FILENAME.match(fname):
                    fpath = os.path.join(videos_dir, fname)
                    if os.path.getsize(fpath) > 10240:
                        real_clips.append(fpath)

        composited_videos = []
        vf = "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2"

        for i in range(1, scene_count + 1):
            comp_filename = f"composited_scene_{i:02d}.mp4"
            comp_path = os.path.join(self.output_dir, comp_filename)

            if i <= len(real_clips):
                src = real_clips[i - 1]
                cmd = [
                    "ffmpeg", "-y", "-i", src,
                    "-vf", vf,
                    "-c:v", "libx264", "-preset", "fast",
                    "-c:a", "copy",
                    comp_path,
                ]
                try:
                    subprocess.run(cmd, check=True, capture_output=True)
                    composited_videos.append(comp_path)
                    print(f"   ✅ 씬 {i} VFX 합성 렌더링 완료: {comp_path}")
                except subprocess.CalledProcessError as e:
                    print(f"   ⚠️  씬 {i} FFmpeg 처리 실패, 건너뜀: {e}")
                    continue
            else:
                # 실제 클립 없음 — 블랙 플레이스홀더 생성
                cmd = [
                    "ffmpeg", "-y",
                    "-t", "3",
                    "-f", "lavfi", "-i", "color=black:s=1920x1080",
                    "-c:v", "libx264",
                    comp_path,
                ]
                try:
                    subprocess.run(cmd, check=True, capture_output=True)
                    composited_videos.append(comp_path)
                    print(f"   ✅ 씬 {i} 플레이스홀더 생성 완료: {comp_path}")
                except subprocess.CalledProcessError as e:
                    print(f"   ⚠️  씬 {i} 플레이스홀더 생성 실패, 건너뜀: {e}")
                    continue

        print(f"🎉 VFX 컴포지팅 작업 완료!")
        return composited_videos
