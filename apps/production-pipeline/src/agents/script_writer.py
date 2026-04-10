import os
from typing import Optional, Union, List
from google import genai
from google.genai import types
from dotenv import load_dotenv
from src.models.schemas import DirectionPlan
from src.utils.prompts import SCRIPTWRITER_SYSTEM_PROMPT, get_user_prompt
from src.utils.file_io import save_output
from src.utils.search import ResearchAgent

class ScriptWriterAgent:
    def __init__(self, api_key: str = None):
        """
        초기화 시 API 키를 받거나 환경 변수에서 로드합니다.
        """
        load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
        self.api_key = api_key or os.getenv("Gemini_Api_Key") or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("Gemini API Key 환경 변수가 설정되지 않았습니다.")
            
        self.client = genai.Client(api_key=self.api_key)
        self.model = "gemini-2.5-flash" 

    def generate_direction_plan(self, user_idea: str, research_context: str = "") -> DirectionPlan:
        """
        사용자의 짧은 아이디어를 바탕으로 구조화된 연출기획안을 생성합니다.
        Pydantic 스키마를 Gemini의 Structured Outputs에 적용합니다.
        """
        print(f"🎬 AI 크리에이티브 디렉터가 뇌를 가동 중입니다...")
        print(f"💡 주제: '{user_idea}'")
        
        system_prompt = SCRIPTWRITER_SYSTEM_PROMPT
        if research_context:
            system_prompt += f"\n\n[Background Research & Context]\n{research_context}\n\nPlease use this context to ensure character traits, visual styles, and world-building are accurate to the source material if applicable."

        user_prompt = get_user_prompt(user_idea, research_context)

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    response_mime_type="application/json",
                    response_schema=DirectionPlan,
                    temperature=0.7, 
                ),
            )

            direction_plan = DirectionPlan.model_validate_json(response.text)
            return direction_plan
            
        except Exception as e:
            print(f"❌ 기획안 생성 중 오류 발생: {e}")
            raise e

    def run_pipeline(self, user_idea: str):
        """
        1. 정보 검색 -> 2. 스토리보드 생성 -> 3. 파일 저장의 파이프라인을 실행합니다.
        """
        researcher = ResearchAgent(api_key=self.api_key)
        research_context = researcher.gather_context(user_idea)
        
        plan = self.generate_direction_plan(user_idea, research_context=research_context)
        json_path, md_path = save_output(plan)
        return plan, json_path, md_path
