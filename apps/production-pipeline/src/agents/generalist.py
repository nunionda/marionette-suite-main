"""
마리오네트 스튜디오 — Generalist 에이전트
DirectionPlan JSON의 video_prompt를 기반으로 Veo 3.1 API로 비디오 클립 생성
"""
import os
import subprocess
from typing import Optional, Union, List
import json
import time
from dotenv import load_dotenv
from google import genai
from google.genai import types
from src.models.schemas import DirectionPlan


class GeneralistAgent:
    def __init__(self, output_dir: str = "output/videos", api_key: str = None):
        load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
        self.api_key = api_key or os.getenv("Gemini_Api_Key") or os.getenv("GEMINI_API_KEY")
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
            self.model = "veo-3.0-generate-001"  # Veo 3.0 GA (안정 버전)
            self.use_real_api = True
            print(f"📽️ Generalist: Veo 3.0 API 연동 완료")
        else:
            self.client = None
            self.use_real_api = False
            print(f"⚠️  Generalist: API 키 미설정 — Mock 모드")

    def _generate_video_real(self, prompt: str, scene_number: int) -> Optional[str]:
        """Veo API로 비디오 생성 (비동기 폴링)"""
        enhanced_prompt = (
            f"Cinematic film scene. Dark neon tech-noir aesthetic, high contrast. "
            f"Anamorphic 2.35:1 widescreen composition. 8 seconds. "
            f"\n\n{prompt}"
        )

        try:
            # Veo는 비동기 생성 — generate_videos → 폴링
            operation = self.client.models.generate_videos(
                model=self.model,
                prompt=enhanced_prompt,
                config=types.GenerateVideosConfig(
                    aspect_ratio="16:9",
                    number_of_videos=1,
                ),
            )

            # 폴링으로 완료 대기
            print(f"   ⏳ 씬 {scene_number} 비디오 생성 중 (Veo 비동기 처리)...")
            while not operation.done:
                time.sleep(10)
                operation = self.client.operations.get(operation)

            # 결과 추출
            if operation.response and operation.response.generated_videos:
                video = operation.response.generated_videos[0]
                video_data = self.client.files.download(file=video.video)

                filename = f"scene_{scene_number:03d}.mp4"
                filepath = os.path.join(self.output_dir, filename)

                with open(filepath, "wb") as f:
                    f.write(video_data)

                return filepath
            else:
                print(f"   ⚠️  씬 {scene_number}: 비디오 생성 결과 없음")
                return None

        except Exception as e:
            print(f"   ❌ 씬 {scene_number} 비디오 생성 오류: {e}")
            return None

    def _generate_video_mock(self, prompt: str, scene_number: int) -> Optional[str]:
        """FFmpeg 블랙 플레이스홀더 MP4 생성 (API 미연동 시)"""
        filename = f"scene_{scene_number:03d}_placeholder.mp4"
        filepath = os.path.join(self.output_dir, filename)
        cmd = [
            "ffmpeg", "-y",
            "-t", "5",
            "-f", "lavfi", "-i", "color=black:s=1920x1080",
            "-c:v", "libx264",
            filepath,
        ]
        try:
            subprocess.run(cmd, check=True, capture_output=True)
            return filepath
        except (subprocess.CalledProcessError, FileNotFoundError):
            print(f"   ⚠️  ffmpeg 없음 — 씬 {scene_number} 플레이스홀더 생성 실패")
            return None

    def generate_videos(self, json_path: str) -> list[str]:
        """기획안 JSON에서 씬별 비디오 클립 생성"""
        print(f"📽️ AI 제너럴리스트가 비디오 클립 생성을 시작합니다...")
        print(f"   📂 입력: {json_path}")
        print(f"   🎬 모드: {'Veo 3.0 API' if self.use_real_api else 'Mock'}")

        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        try:
            plan = DirectionPlan(**data)
        except Exception as e:
            print(f"❌ 기획안 파싱 실패: {e}")
            return []

        generated_videos = []
        for scene in plan.scenes:
            print(f"🎬 씬 {scene.scene_number} — {scene.setting}")
            print(f"   프롬프트: {scene.video_prompt[:80]}...")

            if self.use_real_api:
                filepath = self._generate_video_real(scene.video_prompt, scene.scene_number)
                if filepath:
                    generated_videos.append(filepath)
                    size_kb = os.path.getsize(filepath) / 1024
                    print(f"   ✅ 비디오 생성: {filepath} ({size_kb:.0f}KB)")
                else:
                    mock = self._generate_video_mock(scene.video_prompt, scene.scene_number)
                    if mock:
                        generated_videos.append(mock)
                        print(f"   ⚠️  플레이스홀더 폴백: {mock}")
            else:
                mock = self._generate_video_mock(scene.video_prompt, scene.scene_number)
                if mock:
                    generated_videos.append(mock)
                    print(f"   ✅ 플레이스홀더: {mock}")
                else:
                    print(f"   ⚠️  씬 {scene.scene_number} 건너뜀")

        print(f"\n🎉 비디오 클립 생성 완료! ({len(generated_videos)}클립)")
        return generated_videos
