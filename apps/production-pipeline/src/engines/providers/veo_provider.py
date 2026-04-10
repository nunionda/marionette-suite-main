import os
import time
from typing import Optional, List
from google import genai
from google.genai import types
from ..base import EngineResult
from ..video_engine import VideoEngine, VideoConfig

class VeoProvider(VideoEngine):
    """Google Veo 기반 비디오 생성 프로바이더"""
    
    def __init__(self, api_key: str = None, model_name: str = "veo-3.1-pro"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.client = genai.Client(api_key=self.api_key)
        self.model_name = model_name

    def generate(self, prompt: str, **kwargs) -> EngineResult:
        return self.generate_video(prompt, **kwargs)

    async def generate_async(self, prompt: str, **kwargs) -> EngineResult:
        # 실제 비동기 비디오 생성은 API 특성상 폴링이 필요함
        return self.generate_video(prompt, **kwargs)

    def generate_video(self, prompt: str, image_ref: Optional[str] = None, config: Optional[VideoConfig] = None) -> EngineResult:
        """Veo API를 통한 비디오 생성 및 폴링"""
        try:
            cfg = config or VideoConfig()
            
            gen_config = types.GenerateVideosConfig(
                aspect_ratio=cfg.aspect_ratio,
                number_of_videos=1,
            )
            
            # 이미지 레퍼런스 처리
            image_obj = None
            if image_ref and os.path.exists(image_ref):
                with open(image_ref, "rb") as f:
                    image_obj = types.Image(image_bytes=f.read(), mime_type="image/png")

            operation = self.client.models.generate_videos(
                model=self.model_name,
                prompt=prompt,
                image=image_obj,
                config=gen_config
            )

            print(f"   ⏳ Veo Job [{operation.name}] 생성 중...")
            
            # 폴링 (간소화된 블로킹 로직)
            while not operation.done:
                time.sleep(5)
                operation = self.client.operations.get(operation)

            if operation.response and operation.response.generated_videos:
                video = operation.response.generated_videos[0]
                video_data = self.client.files.download(file=video.video)
                
                # 임시 경로 저장 (현장에서는 실제 output/videos 경로 사용)
                output_path = f"output/videos/veo_result_{int(time.time())}.mp4"
                os.makedirs(os.path.dirname(output_path), exist_ok=True)
                with open(output_path, "wb") as f:
                    f.write(video_data)
                    
                return EngineResult(
                    status="success",
                    output_path=output_path,
                    engine_name=f"Veo ({self.model_name})"
                )
            
            return EngineResult(status="failed", engine_name="Veo", data="No video generated")

        except Exception as e:
            return EngineResult(status="failed", data=str(e), engine_name="Veo")
