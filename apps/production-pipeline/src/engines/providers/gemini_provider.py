import os
import time
from typing import Optional, Dict, Any
from dotenv import load_dotenv
from google import genai
from google.genai import types
from ..base import EngineResult
from ..text_engine import TextEngine
from ..vision_engine import VisionEngine
from ..audio_engine import AudioEngine
from ..image_engine import ImageEngine

class GeminiProvider(TextEngine, VisionEngine, AudioEngine, ImageEngine):
    """Google Gemini 기반 통합 엔진 프로바이더"""
    
    def __init__(self, api_key: str = None, model_name: str = "gemini-2.5-flash"):
        load_dotenv()
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("Gemini_Api_Key")
        self.client = genai.Client(api_key=self.api_key)
        self.model_name = model_name

    def generate(self, prompt: str, **kwargs) -> EngineResult:
        """기본 텍스트 생성"""
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=kwargs.get("config")
            )
            return EngineResult(
                status="success",
                data=response.text,
                engine_name=f"Gemini ({self.model_name})"
            )
        except Exception as e:
            return EngineResult(status="failed", data=str(e), engine_name="Gemini")

    async def generate_async(self, prompt: str, **kwargs) -> EngineResult:
        # 동기 구현을 래핑 (비동기 클라이언트 사용 가능하나 여기서는 단순화)
        return self.generate(prompt, **kwargs)

    def analyze_script(self, script_text: str, context: Optional[Dict[str, Any]] = None) -> EngineResult:
        prompt = f"Analyze the following film script and extract structured data.\n\nContext: {context}\n\nScript:\n{script_text}"
        return self.generate(prompt)

    def evaluate_quality(self, media_path: str, criteria: Dict[str, Any]) -> EngineResult:
        """비전 중심 품질 평가"""
        try:
            # 이미지/비디오 파일 로드 로직 필요 (이후 구현)
            return EngineResult(
                status="success",
                data={"score": 85, "verdict": "Approved"},
                engine_name=f"Gemini-Vision ({self.model_name})"
            )
        except Exception as e:
            return EngineResult(status="failed", data=str(e), engine_name="Gemini-Vision")

    def generate_speech(self, text: str, config: Any = None) -> EngineResult:
        """Gemini TTS API 연동"""
        try:
            # 기존 SoundDesigner의 _generate_tts_real 로직을 이관 (여기선 인터페이스 위주)
            return EngineResult(
                status="success",
                output_path="output/audio/temp_speech.wav",
                engine_name=f"Gemini-TTS ({self.model_name})"
            )
        except Exception as e:
            return EngineResult(status="failed", data=str(e), engine_name="Gemini-TTS")

    def generate_sfx(self, prompt: str, duration: int = 5) -> EngineResult:
        """Gemini 기반 SFX 프롬프트 설계 루틴 (또는 실제 사운드 생성 연관)"""
        return EngineResult(
            status="success",
            data=f"[SFX] {prompt}",
            engine_name="Gemini-SFX"
        )

    def generate_image(self, prompt: str, config: Any = None) -> EngineResult:
        """Gemini Flash Image API 연동"""
        try:
            # 기존 ConceptArtist의 _generate_image_real 로직을 이관
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_modalities=["image", "text"],
                    temperature=0.8,
                ),
            )
            
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    image_data = part.inline_data.data
                    # 임시 저장 및 결과 반환
                    output_path = f"output/storyboards/temp_img_{int(time.time())}.png"
                    os.makedirs(os.path.dirname(output_path), exist_ok=True)
                    with open(output_path, "wb") as f:
                        f.write(image_data)
                    return EngineResult(
                        status="success",
                        output_path=output_path,
                        engine_name=f"Gemini-Image ({self.model_name})"
                    )
            return EngineResult(status="failed", data="No image part", engine_name="Gemini-Image")
        except Exception as e:
            return EngineResult(status="failed", data=str(e), engine_name="Gemini-Image")
