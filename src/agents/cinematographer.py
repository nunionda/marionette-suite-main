"""
마리오네트 스튜디오 — Cinematographer (촬영 감독 / DP) 에이전트
MAIN PRODUCTION

DirectionPlan의 camera_angle, setting, time_of_day를 분석하여
video_prompt를 전문 촬영 감독 수준으로 강화 (조명 설계, 렌즈 선택, 카메라 무빙 디테일)

입력: DirectionPlan JSON
출력: 강화된 DirectionPlan JSON (video_prompt 업그레이드)
"""
import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types
from src.models.schemas import DirectionPlan


CINEMATOGRAPHER_SYSTEM_PROMPT = """You are a world-class Cinematographer (Director of Photography) at Marionette Studio.
Your job: Take each scene's existing video_prompt and UPGRADE it with professional cinematography details.

For each scene, enhance the video_prompt by adding:
1. **Lens choice**: specific focal length (e.g., 35mm anamorphic, 85mm portrait, 14mm ultra-wide)
2. **Camera movement**: precise movement description (dolly speed, crane height, Steadicam path)
3. **Lighting design**: key/fill/rim light setup, color temperature, practical lights
4. **Depth of field**: f-stop, focus pull targets, bokeh quality
5. **Color palette**: dominant colors, contrast ratio, specific color gels
6. **Atmosphere**: haze, rain, dust particles, volumetric light

RULES:
- Output MUST be in English
- Keep the original prompt's content, ADD cinematography details
- Think David Fincher (Se7en, Fight Club) meets Park Chan-wook (Oldboy) meets Roger Deakins
- Tone: dark neon tech-noir, anamorphic 2.35:1, high contrast
- Each enhanced prompt should be 3-5 sentences
- Include [Audio] tag at the end preserving original audio direction
"""


class CinematographerAgent:
    """촬영 감독 — video_prompt를 전문 수준으로 강화"""

    def __init__(self, api_key: str = None):
        load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
        self.api_key = api_key or os.getenv("Gemini_Api_Key") or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("Gemini API Key가 설정되지 않았습니다.")
        self.client = genai.Client(api_key=self.api_key)
        self.model = "gemini-2.5-flash"
        print("🎥 Cinematographer: 촬영 감독 에이전트 초기화 완료")

    def enhance_prompts(self, json_path: str) -> str:
        """
        DirectionPlan JSON의 video_prompt를 강화하고 새 JSON으로 저장

        Returns: 강화된 JSON 파일 경로
        """
        print(f"🎥 촬영 감독이 씬별 비디오 프롬프트를 강화합니다...")

        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        plan = DirectionPlan(**data)
        scenes_text = ""
        for s in plan.scenes:
            scenes_text += f"""
--- Scene {s.scene_number} ---
Setting: {s.setting}
Time: {s.time_of_day}
Camera: {s.camera_angle}
Original video_prompt: {s.video_prompt}
"""

        user_prompt = f"""Enhance the video_prompt for each scene below.
Return a JSON array of objects with "scene_number" and "enhanced_video_prompt".

Title: {plan.title}
Genre: {plan.genre}
Global Audio: {plan.global_audio_concept}

{scenes_text}
"""

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=CINEMATOGRAPHER_SYSTEM_PROMPT,
                    response_mime_type="application/json",
                    response_schema={
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "scene_number": {"type": "integer"},
                                "enhanced_video_prompt": {"type": "string"},
                            },
                            "required": ["scene_number", "enhanced_video_prompt"],
                        },
                    },
                    temperature=0.5,
                ),
            )

            enhanced = json.loads(response.text)
            enhanced_map = {e["scene_number"]: e["enhanced_video_prompt"] for e in enhanced}

            # 원본 JSON에 반영
            for scene in data["scenes"]:
                num = scene["scene_number"]
                if num in enhanced_map:
                    scene["video_prompt"] = enhanced_map[num]
                    print(f"   ✅ S#{num} 프롬프트 강화 완료")

            # 강화된 JSON 저장 (원본 덮어쓰기)
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

            print(f"🎥 촬영 감독 작업 완료! ({len(enhanced)}씬 강화)")
            return json_path

        except Exception as e:
            print(f"❌ 촬영 감독 오류: {e}")
            return json_path  # 실패 시 원본 그대로 반환
