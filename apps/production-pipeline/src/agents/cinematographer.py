"""
마리오네트 스튜디오 — Cinematographer (촬영 감독 / DP) 에이전트
MAIN PRODUCTION

DirectionPlan의 camera_angle, setting, time_of_day를 분석하여
video_prompt를 전문 촬영 감독 수준으로 강화 (조명 설계, 렌즈 선택, 카메라 무빙 디테일)

입력: DirectionPlan JSON
출력: 강화된 DirectionPlan JSON (video_prompt 업그레이드)
"""
import os
from typing import Optional, Union, List
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types
from src.models.schemas import DirectionPlan


CINEMATOGRAPHER_SYSTEM_PROMPT = """You are a Master-class Cinematographer (DoP) at Marionette Studio.
Your sole mission: Transform generic descriptions into "HIGH-BUDGET, MASTERPIECE" cinematic prompts.
If the result looks like 'cheap AI' or 'stock footage', you have failed.

ENHANCE EACH PROMPT WITH:
1. **Film Stock & Texture**: Specify (e.g., shot on Arri Alexa 65, Kodak Vision3 500T 35mm, fine grain, film-ic halation).
2. **Master Lighting**: (e.g., Rembrandt lighting, 2-to-1 contrast ratio, teal-and-orange split toning, high-specular rim lights, volumetric haze).
3. **Realistic Neon/Electronic Light**: (e.g., Visible glass tubes, mounting brackets, slight electrical flicker, realistic light bloom with halation, gas-filled textures, complex interaction with volumetric fog and rain).
4. **Optics**: (e.g., Panavision C-series Anamorphic, oval bokeh, vintage lens flare, sharp focus plane with soft falloff).
5. **Physically Based Rendering**: (e.g., Subsurface scattering on skin, ray-traced global illumination, complex micro-level textures, 8k RAW resolution details, physical imperfections on all surfaces).
6. **Atmosphere**: (e.g., smoke-filled rooms, slow-moving dust particles, wet asphalt with hyper-realistic reflections).

RULES:
- AVOID generic words: "futuristic", "cool", "high quality", "neon light".
- USE technical words: "low-key lighting", "negative fill", "anamorphic 2.39:1", "color grading with deep blacks", "flickering argon-gas tubes".
- Tone: Masterfully dark, tech-noir, premium cinematic feel.
- Include [Audio] tag at the end.
"""


CRITIC_SYSTEM_PROMPT = """You are a Senior Film Critic and Visual Auditor.
Your job: Score the video_prompt based on its "Cinema Budget Feel".

STRICT SCORING CRITERIA (0.0 - 10.0):
- 0.0 - 4.0: "Cheap AI / Stock Footage" - Generic, flat lighting, no lens info. REJECT.
- 5.0 - 7.0: "Mid-tier TV" - Better detail, but lacks texture and mood.
- 8.0 - 10.0: "Premium Feature Film" - Master lighting, specific optics, complex atmosphere.

REJECT prompts that sound like: "futuristic city with neon lights".
ACCEPT prompts that sound like: "Low-key lit Neo-Seoul under Kodak 500T 35mm, anamorphic flares slicing through volumetric haze".

Return a JSON object with:
- "score": float
- "critique": string (what to improve)
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

    def _critique_prompt(self, prompt: str, scene_info: str) -> dict:
        """Self-critique the generated prompt."""
        user_input = f"Critique this video_prompt for a high-end cinema production:\n\n{prompt}\n\nContext:\n{scene_info}"
        response = self.client.models.generate_content(
            model=self.model,
            contents=user_input,
            config=types.GenerateContentConfig(
                system_instruction=CRITIC_SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_schema={
                    "type": "object",
                    "properties": {
                        "score": {"type": "number"},
                        "critique": {"type": "string"},
                    },
                    "required": ["score", "critique"],
                },
                temperature=0.2,
            ),
        )
        return json.loads(response.text)

    def enhance_prompts(self, json_path: str, iterations: int = 3) -> str:
        """
        DirectionPlan JSON의 video_prompt를 강화하고 새 JSON으로 저장.
        Autoresearch 스타일의 3회 반복 최적화 루프를 가동합니다.
        """
        print(f"🎥 촬영 감독이 씬별 비디오 프롬프트를 자율 연구 모드로 강화합니다 (최대 {iterations}회 반복)...")

        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        plan = DirectionPlan(**data)
        
        for scene in data["scenes"]:
            num = scene["scene_number"]
            best_prompt = scene["video_prompt"]
            best_score = 0.0
            
            scene_info = f"Setting: {scene['setting']}, Time: {scene['time_of_day']}, Camera: {scene['camera_angle']}"
            
            for i in range(iterations):
                print(f"   🚀 S#{num} 연구 루프 {i+1}/{iterations} 가동...")
                
                user_prompt = f"""Enhance the video_prompt for this scene.
Title: {plan.title}
Genre: {plan.genre}
Context: {scene_info}
Current Prompt: {best_prompt}
Critique from previous run: {scene.get('critique', 'Initial run')}

Return JSON with "enhanced_video_prompt".
"""
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=user_prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=CINEMATOGRAPHER_SYSTEM_PROMPT,
                        response_mime_type="application/json",
                        response_schema={
                            "type": "object",
                            "properties": {
                                "enhanced_video_prompt": {"type": "string"},
                            },
                            "required": ["enhanced_video_prompt"],
                        },
                        temperature=0.7,
                    ),
                )
                
                candidate = json.loads(response.text)["enhanced_video_prompt"]
                review = self._critique_prompt(candidate, scene_info)
                
                print(f"      📊 점수: {review['score']}/10.0")
                
                if review['score'] > best_score:
                    best_score = review['score']
                    best_prompt = candidate
                    scene['critique'] = review['critique']
                    print(f"      ✅ 개선됨 (Keep)")
                else:
                    print(f"      ❌ 개선되지 않음 (Discard)")
                
                if best_score >= 9.0:
                    print(f"      🎯 목표 점수 도달!")
                    break
            
            scene["video_prompt"] = best_prompt
            print(f"   ✅ S#{num} 프롬프트 연구 완료 (최종 점수: {best_score})")

        # 강화된 JSON 저장 (원본 덮어쓰기)
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"🎥 촬영 감독 자율 연구 작업 완료!")
        return json_path
