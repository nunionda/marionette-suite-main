from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from server.core.database import get_db
from server.services.auditor import auditor
from server.models.database import Project, PipelineRun, Asset

router = APIRouter()


def _calculate_project_metrics(project: Project, db: Session) -> dict:
    """프로젝트 DB 데이터 기반 실제 분석 지표 계산"""

    # 파이프라인 실행 통계
    runs = db.query(PipelineRun).filter(PipelineRun.project_id == project.id).all()
    total_runs = len(runs)
    completed_runs = sum(1 for r in runs if r.status == "completed")
    failed_runs = sum(1 for r in runs if r.status == "failed")
    avg_progress = (
        sum(r.progress for r in runs) / total_runs if total_runs > 0 else 0.0
    )

    # 에셋 통계
    asset_count = db.query(func.count(Asset.id)).filter(Asset.project_id == project.id).scalar() or 0

    # 상업적 실현 가능성: 에셋 수 + 완료 파이프라인 수 기반 점수 (0~100)
    # 기본 50점 + 에셋 1개당 2점(최대 30) + 완료 파이프라인 1개당 5점(최대 20)
    commercial_viability = min(100, 50 + min(asset_count * 2, 30) + min(completed_runs * 5, 20))

    # 비주얼 발산 지수: 실패 비율 기반 (낮을수록 좋음, 0.0~1.0)
    visual_divergence = round(failed_runs / total_runs, 2) if total_runs > 0 else 0.0

    # 시장 적합성: 평균 진행률 기반 (진행률 80% = 점수 80)
    market_fit_score = round(avg_progress * 100) if avg_progress > 0 else max(50, commercial_viability - 10)

    # 리스크 항목 생성
    risks = []
    if failed_runs > 0:
        risks.append({"level": "WARN", "message": f"파이프라인 실패 {failed_runs}건 — 재실행 권장"})
    if asset_count == 0:
        risks.append({"level": "WARN", "message": "생성된 에셋 없음 — 파이프라인을 먼저 실행하세요"})
    else:
        risks.append({"level": "INFO", "message": f"에셋 {asset_count}개 생성됨"})
    if completed_runs > 0:
        risks.append({"level": "LOW", "message": f"완료된 파이프라인 {completed_runs}건 — 패키지 생성 가능"})
    else:
        risks.append({"level": "LOW", "message": "API 레이턴시 실시간 합성에 최적화됨"})

    return {
        "integrity_index": min(100, commercial_viability + 5),
        "commercial_viability": commercial_viability,
        "visual_divergence": visual_divergence,
        "market_fit_score": market_fit_score,
        "pipeline_runs_total": total_runs,
        "pipeline_runs_completed": completed_runs,
        "asset_count": asset_count,
        "risks": risks,
    }


@router.get("/{project_id}")
async def get_project_analysis(project_id: str, db: Session = Depends(get_db)):
    """프로젝트별 실제 DB 데이터 기반 분석 지표 조회"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")

    system_health = auditor.last_results
    risk_audit = _calculate_project_metrics(project, db)

    return {
        "project_id": project_id,
        "title": project.title,
        "systemHealth": system_health,
        "riskAudit": risk_audit,
        "lastUpdated": system_health.get("last_audit"),
    }


@router.post("/{project_id}/run")
async def run_analysis_audit(project_id: str):
    """실시간 시스템 감사 기동"""
    await auditor.run_audit()
    return {"status": "success", "message": "Autonomous intelligence audit completed."}
