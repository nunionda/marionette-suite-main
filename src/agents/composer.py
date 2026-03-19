"""
마리오네트 스튜디오 — Composer (작곡가) 에이전트
POST-PRODUCTION

global_audio_concept + 씬별 [Audio] 태그 기반으로 BGM 지시서 생성
Suno API 연동 시 실제 BGM 생성, 미연동 시 BGM 지시서(텍스트) 출력

현재: Gemini로 BGM 프롬프트 지시서 생성 (Suno API 연동 예정)
"""
import os
import json
import re
from dotenv import load_dotenv
from google import genai
from google.genai import types
from src.models.schemas import DirectionPlan


COMPOSER_SYSTEM_PROMPT = """You are a Film Score Composer at Marionette Studio.
Your job: Analyze the script's audio concept and each scene's [Audio] tag to design a detailed BGM/score brief.

For each scene, generate:
1. **mood**: emotional tone (e.g., "tension building", "melancholic", "triumphant")
2. **tempo**: BPM range (e.g., "90-100 BPM, slow burn")
3. **instruments**: key instruments (e.g., "cello ostinato, synth pad, glitchy percussion")
4. **reference**: real-world music reference (e.g., "Hans Zimmer - Time meets Trent Reznor")
5. **suno_prompt**: A ready-to-use prompt for Suno AI music generation (in English, 1-2 sentences)

RULES:
- Analyze the [Audio] tag in video_prompt for each scene
- Match the global_audio_concept tone
- Output in English
- suno_prompt should be concise and descriptive for AI music generation
"""


class ComposerAgent:
    """작곡가 — BGM/스코어 설계 및 생성"""

    def __init__(self, output_dir: str = "output/audio", api_key: str = None):
        load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
        self.api_key = api_key or os.getenv("Gemini_Api_Key") or os.getenv("GEMINI_API_KEY")
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)
        self.suno_api_key = os.getenv("SUNO_API_KEY", "")

        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
            self.model = "gemini-2.5-flash"
            print("🎵 Composer: Gemini 기반 BGM 설계 모드")
            if self.suno_api_key:
                print("   🎵 Suno API 감지 — 실제 BGM 생성 가능")
        else:
            self.client = None
            print("⚠️ Composer: API 키 미설정")

    def compose_score(self, json_path: str) -> str:
        """
        BGM 스코어 지시서 생성

        Returns: BGM 지시서 JSON 파일 경로
        """
        print("🎵 작곡가가 BGM 스코어를 설계합니다...")

        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        plan = DirectionPlan(**data)

        # [Audio] 태그 추출
        scenes_info = ""
        for s in plan.scenes:
            audio_match = re.search(r'\[Audio\]\s*(.+?)$', s.video_prompt, re.IGNORECASE)
            audio_tag = audio_match.group(1).strip() if audio_match else "No specific audio direction"
            scenes_info += f"\nScene {s.scene_number} ({s.setting}, {s.time_of_day}): [Audio] {audio_tag}"

        user_prompt = f"""Design a film score brief for each scene.

Title: {plan.title}
Genre: {plan.genre}
Global Audio Concept: {plan.global_audio_concept}

Scenes:
{scenes_info}

Return a JSON array of objects with: scene_number, mood, tempo, instruments, reference, suno_prompt
"""

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=COMPOSER_SYSTEM_PROMPT,
                    response_mime_type="application/json",
                    response_schema={
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "scene_number": {"type": "integer"},
                                "mood": {"type": "string"},
                                "tempo": {"type": "string"},
                                "instruments": {"type": "string"},
                                "reference": {"type": "string"},
                                "suno_prompt": {"type": "string"},
                            },
                            "required": ["scene_number", "mood", "tempo", "instruments", "suno_prompt"],
                        },
                    },
                    temperature=0.6,
                ),
            )

            score_brief = json.loads(response.text)

            # 지시서 저장
            brief_path = os.path.join(self.output_dir, "score_brief.json")
            with open(brief_path, "w", encoding="utf-8") as f:
                json.dump(score_brief, f, ensure_ascii=False, indent=2)

            for item in score_brief:
                print(f"   🎵 S#{item['scene_number']}: {item['mood']} — {item['tempo']}")

            print(f"\n🎵 스코어 설계 완료! ({len(score_brief)}씬)")
            print(f"   📄 지시서: {brief_path}")
            return brief_path

        except Exception as e:
            print(f"❌ 작곡가 오류: {e}")
            return ""
