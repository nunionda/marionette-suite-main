from abc import ABC, abstractmethod
from typing import Any, Optional, Dict
from pydantic import BaseModel

class EngineResult(BaseModel):
    """엔진 생성 결과 표준 포맷"""
    status: str
    output_path: Optional[str] = None
    data: Optional[Any] = None
    engine_name: str
    metadata: Dict[str, Any] = {}

class BaseEngine(ABC):
    """모든 엔진의 최상위 추상 클래스"""
    
    @abstractmethod
    def generate(self, prompt: str, **kwargs) -> EngineResult:
        """동기 생성 메서드"""
        pass

    @abstractmethod
    async def generate_async(self, prompt: str, **kwargs) -> EngineResult:
        """비동기 생성 메서드"""
        pass

    def get_status(self, job_id: str) -> str:
        """비동기 작업 상태 조회 (옵션)"""
        return "not_supported"
