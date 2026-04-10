from abc import abstractmethod
from typing import Optional, List, Dict, Any
from .base import BaseEngine, EngineResult

class VisionEngine(BaseEngine):
    """비주얼 분석 및 품질 검수 인터페이스 (SAIL Loop용)"""
    
    @abstractmethod
    def evaluate_quality(self, media_path: str, criteria: Dict[str, Any]) -> EngineResult:
        """영상/이미지 품질 및 일관성 평가"""
        pass
