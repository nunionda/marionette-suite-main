"""
마리오네트 스튜디오 — 파이프라인 프리셋 API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from server.core.database import get_db
from server.models.database import PipelinePreset
from server.models.schemas import PresetCreate, PresetResponse

router = APIRouter()


@router.get("/", response_model=List[PresetResponse])
def list_presets(category: str = None, db: Session = Depends(get_db)):
    """모든 프리셋 또는 카테고리별 프리셋 조회"""
    query = db.query(PipelinePreset)
    if category:
        query = query.filter(PipelinePreset.category == category)
    presets = query.order_by(PipelinePreset.category).all()
    return [PresetResponse(**p.to_dict()) for p in presets]


@router.get("/default/{category}", response_model=PresetResponse)
def get_default_preset(category: str, db: Session = Depends(get_db)):
    """특정 카테고리의 기본 프리셋 조회"""
    preset = db.query(PipelinePreset).filter(
        PipelinePreset.category == category,
        PipelinePreset.is_default == 1,
    ).first()
    if not preset:
        raise HTTPException(status_code=404, detail=f"카테고리 '{category}'의 기본 프리셋이 없습니다")
    return PresetResponse(**preset.to_dict())


@router.post("/", response_model=PresetResponse, status_code=201)
def create_preset(data: PresetCreate, db: Session = Depends(get_db)):
    """커스텀 프리셋 생성"""
    preset = PipelinePreset(
        category=data.category,
        name=data.name,
        description=data.description,
        agent_steps=[step.model_dump() for step in data.agent_steps],
        is_default=0,
    )
    db.add(preset)
    db.commit()
    db.refresh(preset)
    return PresetResponse(**preset.to_dict())
