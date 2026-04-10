from abc import abstractmethod
from typing import Optional
from .base import BaseEngine, EngineResult
from pydantic import BaseModel

class AudioConfig(BaseModel):
    voice_id: Optional[str] = None
    emotion: str = "neutral"
    stability: float = 0.5
    similarity_boost: float = 0.75
    format: str = "mp3"

class AudioEngine(BaseEngine):
    """오디오(TTS/SFX) 생성 전용 인터페이스"""
    
    @abstractmethod
    def generate_speech(self, text: str, config: Optional[AudioConfig] = None) -> EngineResult:
        pass
        
    @abstractmethod
    def generate_sfx(self, prompt: str, duration: int = 5) -> EngineResult:
        pass
