import os
from typing import Dict, Any, Type
from .base import BaseEngine
from .video_engine import VideoEngine
from .audio_engine import AudioEngine
from .text_engine import TextEngine
from .vision_engine import VisionEngine
from .providers.gemini_provider import GeminiProvider
from .providers.veo_provider import VeoProvider
from .providers.claude_provider import ClaudeProvider

class EngineFactory:
    """엔진 인스턴스를 관리하고 반환하는 싱글톤 팩토리"""
    
    _instances: Dict[str, Any] = {}

    @classmethod
    def get_video_engine(cls, engine_id: str = None) -> VideoEngine:
        engine_id = engine_id or os.getenv("DEFAULT_VIDEO_ENGINE", "veo-3.1-pro")
        
        if "veo" in engine_id:
            if "veo" not in cls._instances:
                cls._instances["veo"] = VeoProvider(model_name=engine_id)
            return cls._instances["veo"]
        
        # 기본값 (Fallback)
        return VeoProvider()

    @classmethod
    def get_text_engine(cls, engine_id: str = None) -> TextEngine:
        engine_id = engine_id or os.getenv("DEFAULT_TEXT_ENGINE", "gemini-2.5-flash")
        
        if "claude" in engine_id:
            if "claude" not in cls._instances:
                cls._instances["claude"] = ClaudeProvider(model_name=engine_id)
            return cls._instances["claude"]
            
        if "gemini" in engine_id:
            if "gemini" not in cls._instances:
                cls._instances["gemini"] = GeminiProvider(model_name=engine_id)
            return cls._instances["gemini"]
            
        return GeminiProvider()

    @classmethod
    def get_vision_engine(cls, engine_id: str = None) -> VisionEngine:
        # Gemini가 비전 엔진 역할도 수행
        return cls.get_text_engine(engine_id)

    @classmethod
    def get_audio_engine(cls, engine_id: str = None) -> AudioEngine:
        # 현재는 Mock 또는 Gemini TTS 구현이 필요 (여기서는 생략 또는 Mock 리턴)
        # 실제 구현시 ElevenLabsProvider 등을 추가 가능
        pass
