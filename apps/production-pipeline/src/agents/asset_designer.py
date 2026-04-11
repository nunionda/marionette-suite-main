import os
import json
from datetime import datetime, timezone
from typing import List
from src.models.schemas import DirectionPlan

PROP_KEYWORDS = {
    "car", "table", "chair", "gun", "knife", "phone", "computer", "door",
    "window", "book", "bottle", "weapon", "camera", "screen", "light",
    "candle", "bag", "case", "box", "vehicle", "train", "ship", "sword",
    "document", "letter", "mirror", "clock", "radio", "television",
}

class AssetDesignerAgent:
    def __init__(self, output_dir: str = "output/assets/3d"):
        """
        AI 에셋 디자이너 초기화
        """
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def generate_3d_assets(self, json_path: str) -> List[str]:
        """
        기획안 JSON을 파싱하여 구조화된 에셋 매니페스트(assets_manifest.json)를 생성합니다.
        캐릭터, 로케이션, 프랍(소품) 목록을 추출하여 JSON 파일로 저장합니다.
        """
        print(f"🧊 AI 에셋 디자이너가 에셋 매니페스트를 구축 중입니다...")

        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        try:
            plan = DirectionPlan(**data)
        except Exception as e:
            print(f"❌ 기획안 파싱 실패: {e}")
            return []

        print("🛠️ 씬별 로케이션 및 소품 스캐닝 중...")

        # 유니크 로케이션 수집
        locations = list(dict.fromkeys(
            scene.setting for scene in plan.scenes if scene.setting
        ))

        # 액션 묘사에서 소품 키워드 추출
        props = set()
        for scene in plan.scenes:
            if scene.action_description:
                for word in scene.action_description.split():
                    if word.lower().rstrip(".,!?;:") in PROP_KEYWORDS:
                        props.add(word.lower().rstrip(".,!?;:"))

        manifest = {
            "project": plan.title,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "characters": plan.character_settings,
            "locations": locations,
            "props": sorted(props),
            "total_scenes": len(plan.scenes),
        }

        asset_path = os.path.join(self.output_dir, "assets_manifest.json")
        with open(asset_path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, ensure_ascii=False, indent=2)

        print(f"   ✅ 에셋 매니페스트 생성 완료: {asset_path}")
        print(f"🎉 에셋 디벨롭 작업 완료!")
        return [asset_path]
