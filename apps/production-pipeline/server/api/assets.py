from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from server.core.database import get_db
from server.models.database import GlobalAsset, PipelineTake, Project
from server.models.schemas import AssetResponse, AssetPromotionRequest

router = APIRouter()

@router.get("/", response_model=List[AssetResponse])
def list_assets(
    asset_type: Optional[str] = None,
    tag: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """글로벌 백롯 자산 목록 조회"""
    query = db.query(GlobalAsset)
    
    if asset_type:
        query = query.filter(GlobalAsset.asset_type == asset_type)
    
    if tag:
        query = query.filter(GlobalAsset.tags.like(f"%{tag}%"))
    
    assets = query.order_by(GlobalAsset.created_at.desc()).all()
    return assets

@router.get("/{asset_id}", response_model=AssetResponse)
def get_asset(asset_id: str, db: Session = Depends(get_db)):
    """특정 자산 상세 조회"""
    asset = db.query(GlobalAsset).filter(GlobalAsset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found in vault")
    return asset

@router.post("/promote", response_model=AssetResponse)
def promote_take_to_vault(data: AssetPromotionRequest, db: Session = Depends(get_db)):
    """특정 테이크(결과물)를 글로벌 백롯으로 승격"""
    take = db.query(PipelineTake).filter(PipelineTake.id == data.take_id).first()
    if not take:
        raise HTTPException(status_code=404, detail="Pipeline take not found")

    # 이미 동일한 테이크가 승격되었는지 확인 (중복 방지)
    existing = db.query(GlobalAsset).filter(GlobalAsset.metadata_json["origin_take_id"].astext == data.take_id).first()
    if existing:
        return existing

    # 메타데이터 병합
    metadata = {
        "origin_take_id": take.id,
        "engine": take.engine,
        "soq_score": take.soq_score,
        "original_description": take.description,
    }
    if data.override_metadata:
        metadata.update(data.override_metadata)

    new_asset = GlobalAsset(
        project_id=take.project_id,
        name=data.name,
        asset_type=take.step, # Pipeline step name as asset type
        output_path=take.output_path,
        metadata_json=metadata,
        tags=data.tags,
        is_verified=1 # Promote implies manual or high-quality verification
    )

    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    return new_asset

@router.delete("/{asset_id}")
def delete_asset(asset_id: str, db: Session = Depends(get_db)):
    """백롯에서 자산 제거"""
    asset = db.query(GlobalAsset).filter(GlobalAsset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    db.delete(asset)
    db.commit()
    return {"message": "Asset removed from vault"}
