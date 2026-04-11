"""
MeloTTS-Korean provider
공통 Fallback — CPU 실시간 추론, 경량, MIT 라이선스.

Requirements: pip install melo-tts
Model: myshell-ai/MeloTTS-Korean (MIT, ~100M params)
"""
from __future__ import annotations

import contextlib
import io
import wave
from typing import Optional

from src.providers import BaseTTSProvider, TTSResult


class MeloTTSProvider(BaseTTSProvider):
    """MeloTTS-Korean wrapper — lightweight CPU-friendly fallback."""

    name = "melo"

    def __init__(self) -> None:
        self._model = None
        self._speaker_ids: dict = {}
        self._available: Optional[bool] = None

    def is_available(self) -> bool:
        if self._available is not None:
            return self._available
        try:
            from melo.api import TTS  # type: ignore[import-untyped]
            self._available = True
        except ImportError:
            print("⚠️  MeloTTSProvider: melo-tts 패키지 미설치 — pip install melo-tts")
            self._available = False
        return self._available

    def _load_model(self):
        if self._model is not None:
            return self._model
        try:
            from melo.api import TTS  # type: ignore[import-untyped]
            self._model = TTS(language="KR", device="cpu")
            self._speaker_ids = self._model.hps.data.spk2id
            print("✅ MeloTTSProvider: 모델 로드 완료 (CPU)")
        except Exception as e:
            print(f"❌ MeloTTSProvider: 모델 로드 실패 — {e}")
            self._available = False
        return self._model

    def generate(
        self,
        text: str,
        voice: str = "KR",
        *,
        instruction: Optional[str] = None,
        voice_design: Optional[str] = None,
    ) -> Optional[TTSResult]:
        if not self.is_available():
            return None

        model = self._load_model()
        if model is None:
            return None

        try:
            import tempfile
            import os

            speaker_id = self._speaker_ids.get(voice, self._speaker_ids.get("KR", 0))

            # MeloTTS는 파일로 출력 → 임시파일 사용 후 bytes 읽기
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                tmp_path = tmp.name

            try:
                model.tts_to_file(text, speaker_id, tmp_path, speed=1.0)

                with open(tmp_path, "rb") as f:
                    wav_bytes = f.read()

                # duration 계산
                with wave.open(io.BytesIO(wav_bytes), "rb") as wf:
                    frames = wf.getnframes()
                    rate = wf.getframerate()
                    duration_ms = int(frames / rate * 1000)
                    sample_rate = rate
            finally:
                with contextlib.suppress(OSError):
                    os.unlink(tmp_path)

            return TTSResult(
                wav_bytes=wav_bytes,
                sample_rate=sample_rate,
                duration_ms=duration_ms,
                provider_name=self.name,
            )
        except Exception as e:
            print(f"❌ MeloTTSProvider: 생성 실패 — {e}")
            return None
