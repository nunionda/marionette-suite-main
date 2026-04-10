import os
from typing import Optional, Union, List
import json
from src.models.schemas import DirectionPlan

class AssetDesignerAgent:
    def __init__(self, output_dir: str = "output/assets/3d"):
        """
        AI 에셋 디자이너 초기화
        """
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)
        
    def generate_3d_assets(self, json_path: str):
        """
        기획안 JSON을 분석하여 필요한 3D 프랍 및 모델(Mock)을 생성합니다.
        """
        print(f"🧊 AI 에셋 디자이너가 3D 모델과 텍스처를 구축 중입니다...")
        
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        try:
            plan = DirectionPlan(**data)
        except Exception as e:
            print(f"❌ 기획안 파싱 실패: {e}")
            return
            
        # 3D 에셋은 씬 전체에 사용할 공통 에셋 세트 모음 느낌으로 Mocking
        print("🛠️ 씬별 요구되는 캐릭터/환경 3D 모델링 스캐닝 중...")
        asset_filename = "project_assets.obj"
        asset_path = os.path.join(self.output_dir, asset_filename)
        
        with open(asset_path, "w", encoding="utf-8") as asset_file:
            asset_file.write(f"Mock 3D Asset Package for '{plan.title}'\n")
            asset_file.write(f"Character Settings: {plan.character_settings}\n")
            
        print(f"   ✅ 3D 에셋 패키징 완료: {asset_path}")    
        print(f"🎉 3D 에셋 디벨롭 작업 완료!")
        return [asset_path]
