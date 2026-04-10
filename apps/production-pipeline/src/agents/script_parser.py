"""
마리오네트 스튜디오 — ScriptParser 에이전트
완성된 마스터 씬 포맷 대본(.md)을 파싱하여 DirectionPlan JSON으로 변환

기존 ScriptWriter가 '아이디어 → 대본 + JSON'을 생성하는 반면,
ScriptParser는 '완성 대본 → JSON'을 추출하는 역방향 파이프라인.

참고: scriptmaker.md의 안티그래비티 시나리오 개발 워크플로우
  - outline.md (기획안)
  - characters.json (캐릭터 설정)
  - scene_logs_150.md (씬 로그)
  - ep1_draft_v2.md (완성 대본)
"""
import os
import json
import re
from typing import Optional, Optional, Union, List
from google import genai
from google.genai import types
from dotenv import load_dotenv
from src.models.schemas import DirectionPlan, Scene
from src.utils.file_io import save_output


# ─── 시스템 프롬프트 ───

PARSER_SYSTEM_PROMPT = """You are a precise Film Script Analyzer at Marionette Studio.

Your job: Read a completed Hollywood Master Scene Format screenplay and extract structured data for each scene into a DirectionPlan JSON.

## EXTRACTION RULES

For each scene (marked with ### S#N), extract:

1. **scene_number**: The scene number (integer)
2. **setting**: Location and environment description in Korean (from the slug line, e.g. "싱가포르 국제학교 정문")
3. **time_of_day**: Time from slug line (오전/오후/밤/새벽/심야/낮/저녁/Sunset etc.)
4. **camera_angle**: The FIRST and most prominent camera direction in the scene (WIDE SHOT, CLOSE UP, TRACKING SHOT, etc.)
5. **action_description**: Concise summary of what happens in the scene (2-3 sentences in Korean). Focus on VISUAL action, not dialogue.
6. **dialogue**: The most important or iconic dialogue line in the scene (Korean, 1-2 lines max). If no dialogue, use null.
7. **image_prompt**: A detailed English prompt for AI image generation following the 5-part formula:
   [Subject + Action] + [Environment/Background] + [Camera angle/Composition] + [Lighting/Atmosphere] + [Visual Style]
   Must be a single descriptive English paragraph. Be CINEMATIC and SPECIFIC.
8. **video_prompt**: A detailed English prompt for AI video generation following the 6-part formula:
   [Camera Movement] + [Subject Action] + [Environment] + [Lighting] + [Mood/Atmosphere] + [Audio: SFX/BGM description]
   Must include [Audio] tag at the end. Single English paragraph.

## CRITICAL RULES
- image_prompt and video_prompt MUST be in English
- All other fields in Korean
- Extract the VISUAL ESSENCE of each scene — what would a cinematographer shoot?
- For image_prompt: describe a SINGLE KEY FRAME that captures the scene's emotional peak
- For video_prompt: describe 5-8 seconds of the most cinematic moment with camera movement
- Respect the tone: "봉준호식 비주얼 패러독스 × 본 시리즈 첩보전" — dark, neon-lit, high contrast
- Include character names and their visual descriptions when they appear
"""


class ScriptParserAgent:
    """완성 대본 → DirectionPlan JSON 변환 에이전트"""

    def __init__(self, api_key: str = None):
        load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
        self.api_key = api_key or os.getenv("Gemini_Api_Key") or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("Gemini API Key가 설정되지 않았습니다.")
        self.client = genai.Client(api_key=self.api_key)
        self.model = "gemini-2.5-flash"

    def split_scenes(self, script_text: str) -> list[str]:
        """대본 텍스트를 씬 단위로 분리"""
        scene_pattern = r'(### S#\d+\..*?)(?=### S#\d+\.|## STAGE|\Z)'
        scenes = re.findall(scene_pattern, script_text, re.DOTALL)
        return [s.strip() for s in scenes if s.strip()]

    def parse_metadata(self, script_text: str) -> dict:
        """대본 상단의 메타데이터 (제목, 장르, 톤 등) 추출"""
        metadata = {}

        title_match = re.search(r'^#\s*(.+)', script_text, re.MULTILINE)
        if title_match:
            metadata['title'] = title_match.group(1).strip()

        genre_match = re.search(r'\*\*장르\*\*\s*[:：]\s*(.+)', script_text)
        if genre_match:
            metadata['genre'] = genre_match.group(1).strip()

        tone_match = re.search(r'\*\*톤\*\*\s*[:：]\s*(.+)', script_text)
        if tone_match:
            metadata['tone'] = tone_match.group(1).strip()

        return metadata

    def parse_scenes_batch(
        self,
        scene_texts: list[str],
        metadata: dict,
        characters_json: str = "",
        outline_text: str = "",
    ) -> list[dict]:
        """
        Gemini로 씬 배치를 DirectionPlan Scene 구조로 변환
        한 번에 최대 10씬씩 처리 (토큰 제한 고려)
        """
        context_parts = []
        if outline_text:
            context_parts.append(f"[OUTLINE]\n{outline_text[:3000]}")
        if characters_json:
            context_parts.append(f"[CHARACTERS]\n{characters_json[:5000]}")
        context = "\n\n".join(context_parts)

        scenes_block = "\n\n---\n\n".join(scene_texts)

        user_prompt = f"""Parse the following {len(scene_texts)} scenes from the screenplay "{metadata.get('title', 'Untitled')}".

Genre: {metadata.get('genre', 'Thriller')}
Tone: {metadata.get('tone', 'Dark, cinematic')}

{f"[CONTEXT]{chr(10)}{context}" if context else ""}

[SCENES TO PARSE]
{scenes_block}

Return a JSON array of Scene objects. Each object MUST have all 8 fields.
"""

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=PARSER_SYSTEM_PROMPT,
                    response_mime_type="application/json",
                    response_schema={
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "scene_number": {"type": "integer"},
                                "setting": {"type": "string"},
                                "time_of_day": {"type": "string"},
                                "camera_angle": {"type": "string"},
                                "action_description": {"type": "string"},
                                "dialogue": {"type": "string"},
                                "image_prompt": {"type": "string"},
                                "video_prompt": {"type": "string"},
                            },
                            "required": ["scene_number", "setting", "time_of_day",
                                         "camera_angle", "action_description",
                                         "image_prompt", "video_prompt"],
                        },
                    },
                    temperature=0.3,
                ),
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"❌ 씬 파싱 오류: {e}")
            raise

    def parse_script(
        self,
        script_path: str,
        characters_path: str = None,
        outline_path: str = None,
        scene_range: tuple[int, int] = None,
    ) -> DirectionPlan:
        """
        완성 대본 파일을 DirectionPlan으로 변환

        Args:
            script_path: 대본 .md 파일 경로
            characters_path: characters.json 경로 (선택)
            outline_path: outline.md 경로 (선택)
            scene_range: (시작씬, 끝씬) 튜플 — None이면 전체 파싱
        """
        print(f"📖 대본 로딩: {script_path}")
        with open(script_path, 'r', encoding='utf-8') as f:
            script_text = f.read()

        # 메타데이터 추출
        metadata = self.parse_metadata(script_text)
        print(f"🎬 제목: {metadata.get('title', 'Unknown')}")
        print(f"🎭 장르: {metadata.get('genre', 'Unknown')}")

        # 보조 자료 로딩
        characters_json = ""
        if characters_path and os.path.exists(characters_path):
            with open(characters_path, 'r', encoding='utf-8') as f:
                characters_json = f.read()
            print(f"👥 캐릭터 설정 로드 완료")

        outline_text = ""
        if outline_path and os.path.exists(outline_path):
            with open(outline_path, 'r', encoding='utf-8') as f:
                outline_text = f.read()
            print(f"📋 아웃라인 로드 완료")

        # 씬 분리
        all_scene_texts = self.split_scenes(script_text)
        print(f"✂️  총 {len(all_scene_texts)}개 씬 감지")

        # 범위 필터링
        if scene_range:
            start, end = scene_range
            filtered = []
            for st in all_scene_texts:
                m = re.search(r'S#(\d+)', st)
                if m:
                    num = int(m.group(1))
                    if start <= num <= end:
                        filtered.append(st)
            all_scene_texts = filtered
            print(f"🎯 S#{start}~S#{end} 범위 필터링 → {len(all_scene_texts)}개 씬")

        # 배치 처리 (10씬씩)
        BATCH_SIZE = 10
        all_parsed_scenes = []

        for i in range(0, len(all_scene_texts), BATCH_SIZE):
            batch = all_scene_texts[i:i + BATCH_SIZE]
            batch_start = i + 1
            batch_end = min(i + BATCH_SIZE, len(all_scene_texts))
            print(f"⚙️  배치 {i // BATCH_SIZE + 1}: 씬 {batch_start}~{batch_end} 파싱 중...")

            parsed = self.parse_scenes_batch(
                batch, metadata, characters_json, outline_text
            )
            all_parsed_scenes.extend(parsed)
            print(f"   ✅ {len(parsed)}개 씬 파싱 완료")

        # DirectionPlan 조립
        scenes = []
        for ps in all_parsed_scenes:
            scenes.append(Scene(
                scene_number=ps.get("scene_number", 0),
                setting=ps.get("setting", ""),
                time_of_day=ps.get("time_of_day", ""),
                camera_angle=ps.get("camera_angle", ""),
                action_description=ps.get("action_description", ""),
                dialogue=ps.get("dialogue"),
                image_prompt=ps.get("image_prompt", ""),
                video_prompt=ps.get("video_prompt", ""),
            ))

        plan = DirectionPlan(
            title=metadata.get("title", "Untitled"),
            logline=outline_text[:200] if outline_text else metadata.get("title", ""),
            genre=metadata.get("genre", "Thriller"),
            target_audience="성인 / 글로벌 시장",
            planning_intent=f"{metadata.get('tone', '')} 톤의 영상 제작 기획안",
            worldview_settings="",
            character_settings=characters_json[:500] if characters_json else "",
            global_audio_concept="Neon Tech-Noir ambient, electronic score with tension builds, tactical SFX",
            scenes=scenes,
        )

        return plan

    def run_pipeline(
        self,
        script_path: str,
        characters_path: str = None,
        outline_path: str = None,
        scene_range: tuple[int, int] = None,
    ):
        """
        전체 파이프라인: 대본 파싱 → JSON/MD 저장
        """
        plan = self.parse_script(
            script_path=script_path,
            characters_path=characters_path,
            outline_path=outline_path,
            scene_range=scene_range,
        )

        json_path, md_path = save_output(plan)
        print(f"\n🎉 파싱 완료! {len(plan.scenes)}개 씬")
        print(f"   📄 JSON: {json_path}")
        print(f"   📝 MD:   {md_path}")

        return plan, json_path, md_path
