"""
마리오네트 스튜디오 — Quality Evaluator 에이전트 (SAIL System)
표준화된 VisionEngine 인터페이스를 통해 비주얼 에셋의 품질 검증 및 SAIL 무결성 점수(SOQ)를 산출합니다.
"""
import os
import json
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv
from src.engines.factory import EngineFactory


EVALUATOR_SYSTEM_PROMPT = """You are the Senior Quality Assurance Director. 
Evaluate SOQ (Shot Assessment & Integrity Loop) score.
Return JSON: {
  "soq_score": integer,
  "metrics": {"groundedness": int, "aesthetic_alignment": int, "technical_quality": int},
  "feedback": "Korean feedback",
  "actionable_feedback": "English technical directives",
  "decision": "Approved/Revision_Required"
}
"""

class QualityEvaluatorAgent:
    def __init__(self, api_key: str = None):
        load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
        # UEI: 엔진 팩토리를 통해 비전 엔진 획득
        self.vision_engine = EngineFactory.get_vision_engine()
        print(f"🔍 QualityEvaluator: {self.vision_engine.__class__.__name__} 인터페이스 활성화")

    async def evaluate_asset(self, asset_path: str, visual_dna: str, set_concept: str) -> Dict[str, Any]:
        print(f"🔍 SAIL 검증 시작: {asset_path}")
        
        context = {
            "visual_dna": visual_dna,
            "set_concept": set_concept,
            "system_instruction": EVALUATOR_SYSTEM_PROMPT
        }
        
        result = self.vision_engine.evaluate_quality(asset_path, context)
        
        if result.status == "success":
            try:
                # result.data가 JSON 문자열일 경우 파싱
                eval_data = json.loads(result.data)
                print(f"✅ SOQ SCORE: {eval_data.get('soq_score')} ({eval_data.get('decision')})")
                return eval_data
            except:
                return {"soq_score": 0, "decision": "Error", "feedback": "JSON 파싱 오류"}
        
        return {
            "soq_score": 0,
            "decision": "Error",
            "feedback": f"엔진 오류: {result.data}"
        }
