from abc import abstractmethod
from typing import Optional, List
from .base import BaseEngine, EngineResult
from pydantic import BaseModel

class ImageConfig(BaseModel):
    aspect_ratio: str = "2.35:1"
    style_preset: str = "webtoon"
    resolution: str = "1024x1024"
    high_fidelity: bool = True

class ImageEngine(BaseEngine):
    """이미지(스토리보드/컨셉아트) 생성 인터페이스"""
    
    @abstractmethod
    def generate_image(self, prompt: str, config: Optional[ImageConfig] = None) -> EngineResult:
        pass
