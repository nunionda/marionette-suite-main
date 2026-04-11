"""
Qwen3-TTS-12Hz-1.7B-CustomVoice provider
유튜브 카테고리 Primary — instruction-based control, Korean "Sohee" voice.

Requirements: pip install qwen-tts torch
Model: Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice (Apache 2.0)
"""
from __future__ import annotations

import io
import struct
import wave
from typing import Optional

from src.providers import BaseTTSProvider, TTSResult


class QwenTTSProvider(BaseTTSProvider):
    """Qwen3-TTS wrapper — instruction control + streaming."""

    name = "qwen"

    def __init__(self) -> None:
        self._model = None
        self._available: Optional[bool] = None

    def is_available(self) -> bool:
        if self._available is not None:
            return self._available
        try:
            from qwen_tts import Qwen3TTSModel  # type: ignore[import-untyped]
            self._available = True
        except ImportError:
            print("⚠️  QwenTTSProvider: qwen-tts 패키지 미설치 — pip install qwen-tts")
            self._available = False
        return self._available

    def _load_model(self):
        if self._model is not None:
            return self._model
        try:
            import torch
            from qwen_tts import Qwen3TTSModel  # type: ignore[import-untyped]
            self._model = Qwen3TTSModel.from_pretrained(
                "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice",
                device_map="auto",
                dtype=torch.bfloat16,
            )
            print("✅ QwenTTSProvider: 모델 로드 완료")
        except Exception as e:
            print(f"❌ QwenTTSProvider: 모델 로드 실패 — {e}")
            self._available = False
        return self._model

    def generate(
        self,
        text: str,
        voice: str = "Sohee",
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
            kwargs = {"text": text, "speaker": voice}
            if instruction:
                kwargs["instruct"] = instruction

            wavs, sr = model.generate_custom_voice(**kwargs)

            # tensor → PCM bytes → WAV
            pcm = wavs[0]
            if hasattr(pcm, "cpu"):
                pcm = pcm.cpu().numpy()

            buf = io.BytesIO()
            with wave.open(buf, "wb") as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2)
                wf.setframerate(sr)
                # float32 → int16
                import numpy as np
                int16_data = (pcm * 32767).astype(np.int16)
                wf.writeframes(int16_data.tobytes())

            wav_bytes = buf.getvalue()
            duration_ms = int(len(pcm) / sr * 1000)

            return TTSResult(
                wav_bytes=wav_bytes,
                sample_rate=sr,
                duration_ms=duration_ms,
                provider_name=self.name,
            )
        except Exception as e:
            print(f"❌ QwenTTSProvider: 생성 실패 — {e}")
            return None
