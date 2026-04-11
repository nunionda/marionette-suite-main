"""
마리오네트 스튜디오 — ConceptArtist 에이전트
DirectionPlan JSON의 image_prompt를 기반으로 Gemini Flash Image API로 스토리보드 이미지 생성

기본 스타일: 웹툰 (Webtoon illustration)
기본 비율: 2.35:1 (CinemaScope anamorphic widescreen)
"""
import os
import json
import base64
from dotenv import load_dotenv
from google import genai
from google.genai import types
from PIL import Image
from src.models.schemas import DirectionPlan


# ─── 비율 프리셋 ───

ASPECT_RATIOS = {
    "2.35:1": 2.35,      # CinemaScope anamorphic
    "16:9": 16 / 9,      # Standard widescreen
    "1.85:1": 1.85,      # Academy flat widescreen
    "4:3": 4 / 3,        # Classic TV
    "1:1": 1.0,          # Square
}
DEFAULT_ASPECT = "2.35:1"


# ─── 스타일 프리셋 ───

STYLE_PRESETS = {
    "webtoon": {
        "name": "Webtoon",
        "prompt_prefix": (
            "Digital webtoon illustration style. "
            "Clean ink outlines with cel-shading, rich saturated colors, "
            "dramatic lighting with strong rim lights and deep shadows. "
            "Detailed character faces with expressive eyes. "
            "Korean manhwa / webtoon aesthetic with cinematic composition. "
        ),
        "aspect": "2.35:1",
    },
    "photorealistic": {
        "name": "Photorealistic",
        "prompt_prefix": (
            "Hyperrealistic cinematic still frame. "
            "Shot on ARRI Alexa 65mm with anamorphic lens flare. "
            "Film grain, shallow depth of field, professional color grading. "
        ),
        "aspect": "2.35:1",
    },
    "anime": {
        "name": "Anime",
        "prompt_prefix": (
            "High-quality anime illustration. "
            "Detailed anime character design, vibrant palette, "
            "dynamic action lines, Studio Ghibli meets Makoto Shinkai lighting. "
        ),
        "aspect": "16:9",
    },
    "noir": {
        "name": "Neo-Noir",
        "prompt_prefix": (
            "Dark neo-noir graphic novel style. "
            "High contrast black and white with selective neon color accents. "
            "Heavy chiaroscuro, rain-slicked surfaces, moody atmospheric fog. "
        ),
        "aspect": "2.35:1",
    },
    "concept_art": {
        "name": "Concept Art",
        "prompt_prefix": (
            "Professional film concept art. "
            "Painterly digital matte painting style, "
            "atmospheric perspective, detailed environment design, "
            "cinematic color palette with teal and orange grading. "
        ),
        "aspect": "2.35:1",
    },
}

DEFAULT_STYLE = "webtoon"


class ConceptArtistAgent:
    def __init__(
        self,
        output_dir: str = "output/storyboards",
        api_key: str = None,
        style: str = DEFAULT_STYLE,
    ):
        """
        AI 컨셉 아티스트 초기화

        Args:
            output_dir: 이미지 출력 디렉토리
            api_key: Gemini API 키
            style: 스타일 프리셋 키 (webtoon, photorealistic, anime, noir, concept_art)
        """
        load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
        self.api_key = api_key or os.getenv("Gemini_Api_Key") or os.getenv("GEMINI_API_KEY")

        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

        # 스타일 설정
        self.style_key = style if style in STYLE_PRESETS else DEFAULT_STYLE
        self.style = STYLE_PRESETS[self.style_key]

        # 비율 설정
        self.aspect_key = self.style.get("aspect", DEFAULT_ASPECT)
        self.aspect_ratio = ASPECT_RATIOS.get(self.aspect_key, 2.35)

        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
            self.model = "gemini-2.5-flash-image"
            self.use_real_api = True
            print(f"🎨 ConceptArtist: Gemini Flash Image API 연동 완료")
            print(f"   스타일: {self.style['name']} | 비율: {self.aspect_key}")
        else:
            self.client = None
            self.use_real_api = False
            print(f"⚠️  ConceptArtist: API 키 미설정 — Mock 모드")

    def set_style(self, style: str):
        """스타일 프리셋 변경"""
        if style in STYLE_PRESETS:
            self.style_key = style
            self.style = STYLE_PRESETS[style]
            self.aspect_key = self.style.get("aspect", DEFAULT_ASPECT)
            self.aspect_ratio = ASPECT_RATIOS.get(self.aspect_key, 2.35)
            print(f"🎨 스타일 변경: {self.style['name']} | 비율: {self.aspect_key}")
        else:
            print(f"⚠️  알 수 없는 스타일: {style}")
            print(f"   사용 가능: {', '.join(STYLE_PRESETS.keys())}")

    def _crop_to_aspect(self, filepath: str) -> str:
        """
        생성된 이미지를 목표 비율로 센터 크롭 + 레터박스 처리
        Gemini Flash Image는 항상 1024x1024를 출력하므로 후처리 필수
        """
        img = Image.open(filepath)
        w, h = img.size
        target_ratio = self.aspect_ratio

        current_ratio = w / h

        if abs(current_ratio - target_ratio) < 0.05:
            return filepath  # 이미 목표 비율에 근접

        if target_ratio > current_ratio:
            # 가로가 더 넓어야 함 → 상하 크롭
            new_h = int(w / target_ratio)
            top = (h - new_h) // 2
            cropped = img.crop((0, top, w, top + new_h))
        else:
            # 세로가 더 높아야 함 → 좌우 크롭
            new_w = int(h * target_ratio)
            left = (w - new_w) // 2
            cropped = img.crop((left, 0, left + new_w, h))

        # 최종 출력: 가로 1024 기준으로 리사이즈
        final_w = 1024
        final_h = int(final_w / target_ratio)
        resized = cropped.resize((final_w, final_h), Image.LANCZOS)

        resized.save(filepath, "PNG")
        return filepath

    @staticmethod
    def list_styles() -> dict:
        """사용 가능한 스타일 프리셋 목록"""
        return {k: v["name"] for k, v in STYLE_PRESETS.items()}

    def _generate_image_real(self, prompt: str, scene_number: int) -> str | None:
        """
        Gemini Flash Image API로 실제 이미지 생성
        스타일 프리셋 + 2.35:1 비율 적용
        """
        enhanced_prompt = (
            f"Generate a cinematic storyboard image in ultra-wide {self.aspect_key} aspect ratio. "
            f"{self.style['prompt_prefix']}"
            f"Compose the scene horizontally — place key subjects in the center-third, "
            f"leave cinematic breathing room on both sides. "
            f"Think anamorphic widescreen film frame. "
            f"\n\n{prompt}"
        )

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=enhanced_prompt,
                config=types.GenerateContentConfig(
                    response_modalities=["image", "text"],
                    temperature=0.8,
                ),
            )

            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    image_data = part.inline_data.data
                    mime_type = part.inline_data.mime_type or "image/png"

                    ext = "png" if "png" in mime_type else "jpg"
                    filename = f"scene_{scene_number:03d}.{ext}"
                    filepath = os.path.join(self.output_dir, filename)

                    with open(filepath, "wb") as f:
                        f.write(image_data)

                    # 후처리: 목표 비율로 크롭
                    filepath = self._crop_to_aspect(filepath)
                    return filepath

            print(f"   ⚠️  씬 {scene_number}: 이미지 파트 없음 (텍스트만 반환됨)")
            return None

        except Exception as e:
            print(f"   ❌ 씬 {scene_number} 이미지 생성 오류: {e}")
            return None

    def _generate_image_mock(self, prompt: str, scene_number: int) -> str:
        """PIL로 회색 플레이스홀더 PNG 생성 (API 미연동 시)"""
        from PIL import ImageDraw, ImageFont
        filename = f"scene_{scene_number:03d}_placeholder.png"
        filepath = os.path.join(self.output_dir, filename)

        # 2.35:1 기준 1024x436
        w, h = 1024, int(1024 / self.aspect_ratio)
        img = Image.new("RGB", (w, h), color=(40, 40, 40))
        draw = ImageDraw.Draw(img)

        # 씬 번호 + 스타일 텍스트
        label = f"Scene {scene_number:03d}  [{self.style['name']}]"
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 36)
        except OSError:
            font = ImageFont.load_default()
        bbox = draw.textbbox((0, 0), label, font=font)
        x = (w - (bbox[2] - bbox[0])) // 2
        y = (h - (bbox[3] - bbox[1])) // 2
        draw.text((x, y), label, fill=(160, 160, 160), font=font)

        img.save(filepath, "PNG")
        return filepath

    def generate_storyboard_images(self, json_path: str) -> list[str]:
        """
        기획안 JSON에서 씬별 이미지 프롬프트를 추출하여 스토리보드 이미지 생성

        Args:
            json_path: DirectionPlan JSON 파일 경로

        Returns:
            생성된 이미지 파일 경로 리스트
        """
        print(f"🎨 AI 컨셉 아티스트가 기획안을 분석 중입니다...")
        print(f"   📂 입력: {json_path}")
        print(f"   🎭 스타일: {self.style['name']} | 📐 비율: {self.aspect_key} ({self.aspect_ratio:.2f})")

        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        try:
            plan = DirectionPlan(**data)
        except Exception as e:
            print(f"❌ 기획안 파싱 실패: {e}")
            return []

        print(f"📖 작품명: {plan.title} (총 {len(plan.scenes)}개 씬)")
        print(f"🖼️  모드: {'실제 API' if self.use_real_api else 'Mock'}")

        generated_images = []

        for scene in plan.scenes:
            print(f"🖌️  씬 {scene.scene_number} — {scene.setting} ({scene.time_of_day})")
            print(f"   프롬프트: {scene.image_prompt[:80]}...")

            if self.use_real_api:
                filepath = self._generate_image_real(scene.image_prompt, scene.scene_number)
                if filepath:
                    generated_images.append(filepath)
                    size_kb = os.path.getsize(filepath) / 1024
                    print(f"   ✅ 이미지 생성 완료: {filepath} ({size_kb:.1f}KB)")
                else:
                    mock_path = self._generate_image_mock(scene.image_prompt, scene.scene_number)
                    generated_images.append(mock_path)
                    print(f"   ⚠️  플레이스홀더 폴백: {mock_path}")
            else:
                mock_path = self._generate_image_mock(scene.image_prompt, scene.scene_number)
                generated_images.append(mock_path)
                print(f"   ✅ 플레이스홀더: {mock_path}")

        print(f"\n🎉 스토리보드 생성 완료! ({len(generated_images)}장)")
        print(f"   📁 출력 폴더: {self.output_dir}")
        print(f"   🎭 스타일: {self.style['name']}")
        return generated_images
