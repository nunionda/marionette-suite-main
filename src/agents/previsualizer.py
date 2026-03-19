"""
마리오네트 스튜디오 — Previsualizer (프리비주얼라이저) 에이전트
PRE-PRODUCTION

스토리보드 이미지 + DirectionPlan을 기반으로
카메라 블로킹 및 간단한 프리비즈 영상 생성 (이미지→비디오 변환)
"""
import os
import json
import time
from dotenv import load_dotenv
from google import genai
from google.genai import types
from src.models.schemas import DirectionPlan


class PrevisualizerAgent:
    """프리비주얼라이저 — 스토리보드 이미지 기반 프리비즈 영상 생성"""

    def __init__(self, output_dir: str = "output/previs", api_key: str = None):
        load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
        self.api_key = api_key or os.getenv("Gemini_Api_Key") or os.getenv("GEMINI_API_KEY")
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
            self.model = "veo-3.0-fast-generate-001"  # 빠른 프리비즈용
            self.use_real_api = True
            print("🎬 Previsualizer: Veo 3.0 Fast 프리비즈 모드")
        else:
            self.client = None
            self.use_real_api = False
            print("⚠️ Previsualizer: Mock 모드")

    def generate_previs(self, json_path: str, storyboard_dir: str = "output/storyboards") -> list[str]:
        """
        스토리보드 이미지 기반 프리비즈 영상 생성
        이미지를 참조하여 카메라 무빙이 적용된 짧은 프리비즈 클립 생성
        """
        print("🎬 프리비주얼라이저가 프리비즈 영상을 생성합니다...")

        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        plan = DirectionPlan(**data)

        generated = []
        for scene in plan.scenes:
            num = scene.scene_number
            storyboard_path = os.path.join(storyboard_dir, f"scene_{num:03d}.png")

            if not os.path.exists(storyboard_path):
                print(f"   ⏭️ S#{num}: 스토리보드 이미지 없음 (스킵)")
                continue

            print(f"🎬 S#{num} — {scene.setting} ({scene.camera_angle})")

            previs_prompt = (
                f"Simple camera movement previsualization. "
                f"Low-resolution, fast render. "
                f"Camera: {scene.camera_angle}. "
                f"Slowly pan across the scene, establishing the environment. "
                f"Duration: 4 seconds."
            )

            if self.use_real_api:
                filepath = self._generate_previs_video(previs_prompt, num, storyboard_path)
                if filepath:
                    generated.append(filepath)
                    size_kb = os.path.getsize(filepath) / 1024
                    print(f"   ✅ 프리비즈: {filepath} ({size_kb:.0f}KB)")
                else:
                    mock = self._mock(num)
                    generated.append(mock)
            else:
                mock = self._mock(num)
                generated.append(mock)

        print(f"\n🎬 프리비즈 생성 완료! ({len(generated)}클립)")
        return generated

    def _generate_previs_video(self, prompt: str, scene_number: int, image_path: str = None) -> str | None:
        """Veo Fast로 프리비즈 영상 생성"""
        try:
            # 이미지 레퍼런스가 있으면 image-to-video
            config = types.GenerateVideosConfig(
                aspect_ratio="16:9",
                number_of_videos=1,
            )

            if image_path and os.path.exists(image_path):
                # 이미지 → 비디오 (image reference)
                with open(image_path, "rb") as f:
                    image_bytes = f.read()

                operation = self.client.models.generate_videos(
                    model=self.model,
                    prompt=prompt,
                    image=types.Image(image_bytes=image_bytes, mime_type="image/png"),
                    config=config,
                )
            else:
                operation = self.client.models.generate_videos(
                    model=self.model,
                    prompt=prompt,
                    config=config,
                )

            print(f"   ⏳ S#{scene_number} 프리비즈 생성 중...")
            while not operation.done:
                time.sleep(5)
                operation = self.client.operations.get(operation)

            if operation.response and operation.response.generated_videos:
                video = operation.response.generated_videos[0]
                video_data = self.client.files.download(file=video.video)

                filename = f"previs_s{scene_number:03d}.mp4"
                filepath = os.path.join(self.output_dir, filename)
                with open(filepath, "wb") as f:
                    f.write(video_data)
                return filepath

            return None

        except Exception as e:
            print(f"   ❌ 프리비즈 생성 오류: {e}")
            return None

    def _mock(self, scene_number: int) -> str:
        filepath = os.path.join(self.output_dir, f"previs_s{scene_number:03d}_mock.txt")
        with open(filepath, "w") as f:
            f.write(f"[MOCK PREVIS] Scene {scene_number}\n")
        print(f"   ✅ Mock: {filepath}")
        return filepath
