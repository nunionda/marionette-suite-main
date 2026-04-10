from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

class BaseEngine(ABC):
    """
    마리오네트 스튜디오 — AI 엔진 베이스 클래스
    다양한 멀티모달 모델(Gemma, Gemini, Veo 등)의 추상화 계층
    """
    
    @abstractmethod
    async def generate_text(self, prompt: str, **kwargs) -> str:
        """텍스트 생성 (시나리오, 대사 등)"""
        pass

    @abstractmethod
    async def generate_image(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """이미지 생성 (컨셉아트, 스토리보드 등)"""
        pass

    @abstractmethod
    async def generate_video(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """비디오 생성 (Veo, Sora 등)"""
        pass

    @property
    @abstractmethod
    def engine_id(self) -> str:
        """엔전 고유 ID"""
        pass

    @property
    @abstractmethod
    def engine_type(self) -> str:
        """엔진 타입: Cloud, Local, Hybrid"""
        pass
