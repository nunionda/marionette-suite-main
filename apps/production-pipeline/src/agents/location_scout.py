"""
마리오네트 스튜디오 — LocationScout (로케이션 스카우트) 에이전트
PRE-PRODUCTION

각 씬의 배경(setting)과 시간대(time_of_day) 기반으로
캐릭터 없는 환경 컨셉아트 / 로케이션 레퍼런스 이미지 생성
"""
import os
from typing import Optional, Union, List
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types
from PIL import Image
from src.models.schemas import DirectionPlan
from src.agents.concept_artist import ASPECT_RATIOS, DEFAULT_ASPECT


class LocationScoutAgent:
    """로케이션 스카우트 — 환경 컨셉아트 생성"""

    def __init__(self, output_dir: str = "output/locations", api_key: str = None):
        load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
        self.api_key = api_key or os.getenv("Gemini_Api_Key") or os.getenv("GEMINI_API_KEY")
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)
        self.aspect_ratio = ASPECT_RATIOS.get("2.35:1", 2.35)

        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
            self.model = "gemini-2.5-flash-image"
            self.use_real_api = True
            print("📍 LocationScout: Gemini Flash Image API 연동 완료")
        else:
            self.client = None
            self.use_real_api = False
            print("⚠️ LocationScout: Mock 모드")

    def scout_locations(self, json_path: str) -> list[str]:
        """DirectionPlan의 고유 로케이션별 환경 컨셉아트 생성"""
        print(f"📍 로케이션 스카우트가 배경 레퍼런스를 생성합니다...")

        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        plan = DirectionPlan(**data)

        # 고유 로케이션 추출 (중복 제거)
        seen = set()
        unique_locations = []
        for s in plan.scenes:
            key = s.setting.strip()
            if key not in seen:
                seen.add(key)
                unique_locations.append({"setting": s.setting, "time_of_day": s.time_of_day, "scene_number": s.scene_number})

        print(f"   📍 고유 로케이션: {len(unique_locations)}곳")

        generated = []
        for loc in unique_locations:
            print(f"🏙️ {loc['setting']} ({loc['time_of_day']})")

            prompt = (
                f"Cinematic environment concept art. NO PEOPLE, NO CHARACTERS. "
                f"Empty location establishing shot. "
                f"2.35:1 anamorphic widescreen composition. "
                f"Dark neon tech-noir aesthetic, high contrast, volumetric lighting. "
                f"Location: {loc['setting']}. "
                f"Time of day: {loc['time_of_day']}. "
                f"Architectural details, atmospheric mood, cinematic lighting. "
                f"Think Roger Deakins + Blade Runner 2049 aesthetic."
            )

            if self.use_real_api:
                filepath = self._generate_image(prompt, loc["scene_number"])
                if filepath:
                    # 2.35:1 크롭
                    filepath = self._crop_to_aspect(filepath)
                    generated.append(filepath)
                    size_kb = os.path.getsize(filepath) / 1024
                    print(f"   ✅ 로케이션 아트: {filepath} ({size_kb:.0f}KB)")
                else:
                    mock = self._mock(loc, prompt)
                    generated.append(mock)
            else:
                mock = self._mock(loc, prompt)
                generated.append(mock)

        print(f"\n📍 로케이션 스카우팅 완료! ({len(generated)}곳)")
        return generated

    def _generate_image(self, prompt: str, scene_number: int) -> Optional[str]:
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_modalities=["image", "text"],
                    temperature=0.8,
                ),
            )
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    filename = f"location_s{scene_number:03d}.png"
                    filepath = os.path.join(self.output_dir, filename)
                    with open(filepath, "wb") as f:
                        f.write(part.inline_data.data)
                    return filepath
            return None
        except Exception as e:
            print(f"   ❌ 이미지 생성 오류: {e}")
            return None

    def _crop_to_aspect(self, filepath: str) -> str:
        img = Image.open(filepath)
        w, h = img.size
        target = self.aspect_ratio
        if abs(w / h - target) < 0.05:
            return filepath
        new_h = int(w / target)
        top = (h - new_h) // 2
        cropped = img.crop((0, top, w, top + new_h))
        final_w, final_h = 1024, int(1024 / target)
        resized = cropped.resize((final_w, final_h), Image.LANCZOS)
        resized.save(filepath, "PNG")
        return filepath

    def _mock(self, loc: dict, prompt: str) -> str:
        filepath = os.path.join(self.output_dir, f"location_s{loc['scene_number']:03d}_mock.txt")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(f"[MOCK LOCATION] {loc['setting']}\n{prompt}\n")
        print(f"   ✅ Mock: {filepath}")
        return filepath
