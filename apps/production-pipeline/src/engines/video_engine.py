from abc import abstractmethod
from typing import Optional, List
from .base import BaseEngine, EngineResult
from pydantic import BaseModel

class VideoConfig(BaseModel):
    aspect_ratio: str = "16:9"
    duration: int = 5
    fps: int = 24
    resolution: str = "1080p"
    high_fidelity: bool = True

class VideoEngine(BaseEngine):
    """비디오 생성 전용 인터페이스"""
    
    @abstractmethod
    def generate_video(self, prompt: str, image_ref: Optional[str] = None, config: Optional[VideoConfig] = None) -> EngineResult:
        pass
