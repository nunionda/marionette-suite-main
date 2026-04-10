import os
import requests
import random
from typing import Optional
from pathlib import Path

class FreeCreativeEngine:
    """
    Pollinations.ai 기반의 무료 생성 엔진
    API 키 없이 이미지 및 비디오(시뮬레이션) 생성 제공
    """
    
    BASE_URL = "https://image.pollinations.ai/prompt"
    
    @staticmethod
    def generate_image(prompt: str, output_path: str, width: int = 1024, height: int = 1024) -> str:
        """
        Pollinations.ai를 통해 이미지 생성 및 저장
        """
        seed = random.randint(0, 999999)
        # 공백 및 특수문자 인코딩
        safe_prompt = requests.utils.quote(prompt)
        url = f"{FreeCreativeEngine.BASE_URL}/{safe_prompt}?width={width}&height={height}&seed={seed}&nologo=true"
        
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            # Content-Type 확인 (이미지여야 함)
            content_type = response.headers.get("Content-Type", "")
            if "image" not in content_type:
                print(f"⚠️ Pollinations returned non-image content: {content_type}")
                return ""

            # 저장 디렉토리 확인
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            
            with open(output_path, "wb") as f:
                f.write(response.content)
            
            return output_path
        except Exception as e:
            print(f"❌ Free Image Gen Error: {e}")
            return ""

    @staticmethod
    def generate_video(prompt: str, output_path: str) -> str:
        """
        무료 비디오 생성 (Pollinations.ai 이미지 시퀀스 또는 실험적 엔드포인트 활용)
        현재는 고해상도 시네마틱 이미지를 비디오 파일처럼 저장 (Mock simulation)
        """
        # 비디오 생성을 위해 'Cinematic motion' 프롬프트 강화
        enhanced_prompt = f"Cinematic film clip, slow motion, high quality imagery, {prompt}"
        
        # 실제 비디오 엔진이 아니므로 .mp4 확장자 요청 시 이미지를 다운로드하고 로그에 남김
        # (현 시점에서는 'Free Video Simulation' 모드로 동작)
        image_path = output_path.replace(".mp4", ".png")
        result = FreeCreativeEngine.generate_image(enhanced_prompt, image_path, width=1280, height=720)
        
        if result:
            # 텍스트 파일로 비디오 메타데이터 기록 (플레이어 호환을 위해)
            meta_path = output_path.replace(".mp4", ".txt")
            with open(meta_path, "w") as f:
                f.write(f"[FREE_VIDEO_SIMULATION]\nPROMPT: {prompt}\nSOURCE: Pollinations.ai\nIMAGE: {result}")
            return result
        return ""
