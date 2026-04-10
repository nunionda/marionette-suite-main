from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from server.core.database import get_db
from server.services.auditor import auditor
from server.models.database import Project
import random

router = APIRouter()

@router.get("/{project_id}")
async def get_project_analysis(project_id: str, db: Session = Depends(get_db)):
    """프로젝트별 지능형 무결성 및 리스크 분석 데이터 조회"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")

    # 시스템 무결성 데이터와 프로젝트 리스크 결합 (YOLO 지능 레이어)
    system_health = auditor.last_results
    
    # 리스크 감사 데이터 생성 (실제로는 AnalysisCore 연동 전까지 지능형 Mock 제공)
    risk_audit = {
        "integrity_index": system_health.get("integrity_score", 95),
        "commercial_viability": random.randint(75, 98),
        "visual_divergence": round(random.uniform(0.05, 0.2), 2),
        "market_fit_score": random.randint(80, 95),
        "risks": [
            {"level": "LOW", "message": "API Latency optimal for real-time synthesis"},
            {"level": "INFO", "message": "Visual DNA alignment check: 98% completed"}
        ]
    }

    return {
        "project_id": project_id,
        "title": project.title,
        "systemHealth": system_health,
        "riskAudit": risk_audit,
        "lastUpdated": system_health.get("last_audit")
    }

@router.post("/{project_id}/run")
async def run_analysis_audit(project_id: str):
    """실시간 지능형 감사 기동"""
    await auditor.run_audit()
    return {"status": "success", "message": "Autonomous intelligence audit completed."}
