from abc import abstractmethod
from typing import Optional, Dict, Any
from .base import BaseEngine, EngineResult
from pydantic import BaseModel

class TextEngine(BaseEngine):
    """텍스트 생성 및 시나리오 분석 인터페이스"""
    
    @abstractmethod
    def analyze_script(self, script_text: str, context: Optional[Dict[str, Any]] = None) -> EngineResult:
        pass
