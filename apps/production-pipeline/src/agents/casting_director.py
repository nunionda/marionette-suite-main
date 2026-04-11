"""
마리오네트 스튜디오 — CastingDirector (캐스팅 디렉터) 에이전트
PRE-PRODUCTION

characters.json 기반으로 각 캐릭터의 비주얼 레퍼런스 시트 생성
정면/측면/전신 + 캐릭터별 표정 변화 시트
"""
import os
from typing import Optional, Union, List
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types
from PIL import Image


class CastingDirectorAgent:
    """캐스팅 디렉터 — 캐릭터 레퍼런스 시트 생성"""

    def __init__(self, output_dir: str = "output/characters", api_key: str = None):
        load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
        self.api_key = api_key or os.getenv("Gemini_Api_Key") or os.getenv("GEMINI_API_KEY")
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
            self.model = "gemini-2.5-flash-image"
            self.use_real_api = True
            print("🎭 CastingDirector: Gemini Flash Image API 연동 완료")
        else:
            self.client = None
            self.use_real_api = False
            print("⚠️ CastingDirector: API 키 미설정 — Mock 모드")

    def generate_character_sheets(self, characters_path: str) -> list[str]:
        """캐릭터 설정 파일에서 레퍼런스 시트 생성"""
        print(f"🎭 캐스팅 디렉터가 캐릭터 레퍼런스 시트를 생성합니다...")

        with open(characters_path, "r", encoding="utf-8") as f:
            characters = json.load(f)

        generated = []
        for char in characters:
            name = char.get("name", "Unknown")
            age = char.get("age", "")
            role = char.get("role", "")
            persona = char.get("persona", "")[:200]
            casting = char.get("casting", {})
            actors = casting.get("actor", "") if isinstance(casting, dict) else ""

            print(f"🖼️ {name} ({role})")

            prompt = (
                f"Character reference sheet for a film. "
                f"Webtoon illustration style, clean lines, cel-shading. "
                f"Character: {name}, age {age}. Role: {role}. "
                f"Visual reference actors: {actors}. "
                f"Description: {persona[:150]}. "
                f"Show: front view portrait (head and shoulders), "
                f"3/4 angle view, and full body standing pose. "
                f"All three views side by side on a white/neutral background. "
                f"Label each view. Professional character design sheet layout."
            )

            if self.use_real_api:
                filepath = self._generate_image(prompt, name)
                if filepath:
                    generated.append(filepath)
                    size_kb = os.path.getsize(filepath) / 1024
                    print(f"   ✅ 캐릭터 시트: {filepath} ({size_kb:.0f}KB)")
                else:
                    mock = self._mock(name, prompt)
                    generated.append(mock)
            else:
                mock = self._mock(name, prompt)
                generated.append(mock)

        print(f"\n🎭 캐릭터 시트 생성 완료! ({len(generated)}명)")
        return generated

    def _generate_image(self, prompt: str, name: str) -> Optional[str]:
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_modalities=["image", "text"],
                    temperature=0.7,
                ),
            )

            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    safe_name = name.split("(")[0].strip().replace(" ", "_")
                    filename = f"char_{safe_name}.png"
                    filepath = os.path.join(self.output_dir, filename)
                    with open(filepath, "wb") as f:
                        f.write(part.inline_data.data)
                    return filepath
            return None
        except Exception as e:
            print(f"   ❌ 이미지 생성 오류: {e}")
            return None

    def _mock(self, name: str, prompt: str) -> str:
        from PIL import ImageDraw, ImageFont
        safe_name = name.split("(")[0].strip().replace(" ", "_")
        filepath = os.path.join(self.output_dir, f"char_{safe_name}_mock.png")

        # 1:1 square character sheet placeholder (1024×1024)
        img = Image.new("RGB", (1024, 1024), color=(35, 35, 45))
        draw = ImageDraw.Draw(img)

        label = f"CHARACTER  {name}"
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 36)
            small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 22)
        except OSError:
            font = ImageFont.load_default()
            small = font

        # Character name centred
        bbox = draw.textbbox((0, 0), label, font=font)
        x = (1024 - (bbox[2] - bbox[0])) // 2
        draw.text((x, 460), label, fill=(180, 180, 200), font=font)

        # Subtitle
        sub = "[MOCK REFERENCE SHEET]"
        bbox2 = draw.textbbox((0, 0), sub, font=small)
        x2 = (1024 - (bbox2[2] - bbox2[0])) // 2
        draw.text((x2, 510), sub, fill=(100, 100, 120), font=small)

        img.save(filepath, "PNG")
        print(f"   ✅ Mock: {filepath}")
        return filepath
