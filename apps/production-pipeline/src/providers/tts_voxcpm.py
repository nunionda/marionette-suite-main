"""
VoxCPM2 provider
광고 카테고리 Primary — 48 kHz studio quality, voice design from text description.

Requirements: pip install voxcpm soundfile
Model: openbmb/VoxCPM2 (Apache 2.0, 2B params, ~8 GB VRAM)
"""
from __future__ import annotations

import io
import wave
from typing import Optional

from src.providers import BaseTTSProvider, TTSResult


class VoxCPMProvider(BaseTTSProvider):
    """VoxCPM2 wrapper — voice design + 48 kHz studio output."""

    name = "voxcpm"

    def __init__(self) -> None:
        self._model = None
        self._available: Optional[bool] = None

    def is_available(self) -> bool:
        if self._available is not None:
            return self._available
        try:
            from voxcpm import VoxCPM  # type: ignore[import-untyped]
            self._available = True
        except ImportError:
            print("⚠️  VoxCPMProvider: voxcpm 패키지 미설치 — pip install voxcpm")
            self._available = False
        return self._available

    def _load_model(self):
        if self._model is not None:
            return self._model
        try:
            from voxcpm import VoxCPM  # type: ignore[import-untyped]
            self._model = VoxCPM.from_pretrained("openbmb/VoxCPM2", load_denoiser=False)
            print("✅ VoxCPMProvider: 모델 로드 완료 (48 kHz)")
        except Exception as e:
            print(f"❌ VoxCPMProvider: 모델 로드 실패 — {e}")
            self._available = False
        return self._model

    def generate(
        self,
        text: str,
        voice: str = "default",
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
            kwargs: dict = {
                "text": text,
                "cfg_value": 2.0,
                "inference_timesteps": 10,
            }

            # voice_design: 텍스트로 목소리 특성 지정
            # 예: "전문적이고 신뢰감 있는 30대 남성, 밝고 명확한 톤"
            if voice_design:
                kwargs["voice_description"] = voice_design

            wav_array = model.generate(**kwargs)
            sample_rate = model.tts_model.sample_rate  # 48000

            # numpy array → WAV bytes
            import numpy as np
            if wav_array.dtype != np.int16:
                if wav_array.max() <= 1.0:
                    wav_array = (wav_array * 32767).astype(np.int16)
                else:
                    wav_array = wav_array.astype(np.int16)

            buf = io.BytesIO()
            with wave.open(buf, "wb") as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2)
                wf.setframerate(sample_rate)
                wf.writeframes(wav_array.tobytes())

            wav_bytes = buf.getvalue()
            duration_ms = int(len(wav_array) / sample_rate * 1000)

            return TTSResult(
                wav_bytes=wav_bytes,
                sample_rate=sample_rate,
                duration_ms=duration_ms,
                provider_name=self.name,
            )
        except Exception as e:
            print(f"❌ VoxCPMProvider: 생성 실패 — {e}")
            return None
