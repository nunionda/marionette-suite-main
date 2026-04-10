"""
마리오네트 스튜디오 — Smart Vault (Digital Backlot) 매니저
자산 인덱싱, 검색 및 지능형 재사용 제안을 담당합니다.
"""
import os
import json
from datetime import datetime
from sqlalchemy.orm import Session
from server.core.database import SessionLocal
from server.models.database import GlobalAsset, Project

class VaultManager:
    def __init__(self, db: Session = None):
        self.db = db or SessionLocal()

    def promote_to_vault(self, project_id: str, asset_type: str, name: str, output_path: str, soq_score: float, metadata: dict = None, tags: str = ""):
        """에셋을 글로벌 Vault(Digital Backlot)로 승격"""
        try:
            asset = GlobalAsset(
                project_id=project_id,
                name=name,
                asset_type=asset_type,
                output_path=output_path,
                metadata_json={
                    "soq_score": soq_score,
                    "promoted_at": datetime.utcnow().isoformat(),
                    **(metadata or {})
                },
                tags=tags,
                is_verified=1 if soq_score >= 85 else 0
            )
            self.db.add(asset)
            self.db.commit()
            print(f"🏛️  [Vault] 자산 승격 완료: {name} (SOQ: {soq_score})")
            return asset.id
        except Exception as e:
            self.db.rollback()
            print(f"❌ [Vault] 자산 승격 실패: {e}")
            return None

    def find_reusable_asset(self, asset_type: str, tags: list, min_soq: float = 80.0):
        """유사한 태그를 가진 재사용 가능한 자산 검색"""
        try:
            query = self.db.query(GlobalAsset).filter(
                GlobalAsset.asset_type == asset_type,
                GlobalAsset.is_verified == 1
            )
            
            assets = query.all()
            best_match = None
            max_intersection = 0
            
            search_tags = set(tags)
            
            for asset in assets:
                asset_tags = set([t.strip() for t in (asset.tags or "").split(",")])
                intersection = len(search_tags.intersection(asset_tags))
                
                if intersection > max_intersection:
                    # SOQ 점수 체크 (metadata_json 내부에 저장됨)
                    soq = asset.metadata_json.get("soq_score", 0) if asset.metadata_json else 0
                    if soq >= min_soq:
                        max_intersection = intersection
                        best_match = asset
            
            if best_match:
                print(f"🏛️  [Vault] 재사용 가능한 자산 발견: {best_match.name} (매칭 태그 수: {max_intersection})")
                return best_match
                
            return None
        except Exception as e:
            print(f"❌ [Vault] 자산 검색 중 오류: {e}")
            return None

    def close(self):
        self.db.close()

if __name__ == "__main__":
    # 테스트 코드
    mgr = VaultManager()
    print("Vault Manager 초기화 완료.")
    mgr.close()
