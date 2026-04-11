"""TTS provider wrappers — 통일된 인터페이스로 다양한 TTS 모델을 제공."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional


@dataclass
class TTSResult:
    """TTS 생성 결과."""
    wav_bytes: bytes
    sample_rate: int
    duration_ms: int
    provider_name: str


class BaseTTSProvider:
    """모든 TTS provider의 공통 인터페이스."""

    name: str = "base"

    def is_available(self) -> bool:
        """provider가 사용 가능한지 확인 (모델 로드, API 키 등)."""
        return False

    def generate(
        self,
        text: str,
        voice: str = "default",
        *,
        instruction: Optional[str] = None,
        voice_design: Optional[str] = None,
    ) -> Optional[TTSResult]:
        """텍스트 → 음성 생성. 실패 시 None 반환."""
        raise NotImplementedError
