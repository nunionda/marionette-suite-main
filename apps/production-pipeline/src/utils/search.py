import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

class ResearchAgent:
    def __init__(self, api_key: str = None):
        """
        초기화 시 API 키를 받거나 환경 변수에서 로드합니다.
        """
        load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
        self.api_key = api_key or os.getenv("Gemini_Api_Key") or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("Gemini API Key 환경 변수가 설정되지 않았습니다.")
            
        self.client = genai.Client(api_key=self.api_key)
        # 검색 태스크에 적합한 빠른 모델 사용
        self.model = "gemini-2.5-flash" 

    def gather_context(self, user_idea: str) -> str:
        """
        Google Search Grounding을 사용하여 사용자의 아이디어(예: 고유 IP, 최신 트렌드)와 관련된
        최신 정보를 검색하고 요약하여 반환합니다.
        """
        print(f"🔍 리서치 요원이 '{user_idea}'에 대한 정보 수집 및 세계관을 분석 중입니다...")
        
        system_instruction = (
            "You are a meticulous Research Assistant at Marionette Studio. "
            "Your job is to search the web for the user's topic (especially specific characters, IP, or recent trends) "
            "and provide a concise, factual summary of the core concepts, visual styles, and context so the Creative Director can write an accurate storyboard. "
            "If the user asks about a specific IP like 'Teenieping', describe its character designs, colors, world-building, and typical themes. "
            "Write the report in Korean."
        )

        user_prompt = f"Please research the background and visual style for the following idea: '{user_idea}'"

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.3, # 사실적인 리서치를 위해 낮춤
                    tools=[{"google_search": {}}], # 구글 웹 검색 툴(Grounding) 활성화
                ),
            )
            
            research_result = response.text
            return research_result
            
        except Exception as e:
            print(f"❌ 정보 검색 중 오류 발생: {e}")
            # 검색이 실패해도 크리에이티브 디렉터가 멈추지 않도록 빈 컨텍스트 반환
            return "검색 결과를 가져오는 데 실패했습니다."
