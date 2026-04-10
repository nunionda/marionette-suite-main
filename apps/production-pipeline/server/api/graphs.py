"""
마리오네트 스튜디오 — 노드 그래프 API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from server.core.database import get_db
from server.models.database import NodeGraph, Project, PipelineRun
from server.models.schemas import NodeGraphResponse, NodeGraphUpdate

router = APIRouter()


@router.get("/{project_id}/graph", response_model=NodeGraphResponse)
def get_graph(project_id: str, db: Session = Depends(get_db)):
    """프로젝트의 노드 그래프 조회"""
    graph = db.query(NodeGraph).filter(NodeGraph.project_id == project_id).first()
    if not graph:
        raise HTTPException(status_code=404, detail="노드 그래프가 없습니다")
    return NodeGraphResponse(**graph.to_dict())


@router.put("/{project_id}/graph", response_model=NodeGraphResponse)
def update_graph(project_id: str, data: NodeGraphUpdate, db: Session = Depends(get_db)):
    """노드 그래프 업데이트 (노드 추가/제거/파라미터 수정)"""
    graph = db.query(NodeGraph).filter(NodeGraph.project_id == project_id).first()
    if not graph:
        raise HTTPException(status_code=404, detail="노드 그래프가 없습니다")

    if data.nodes is not None:
        graph.nodes = [n.model_dump() for n in data.nodes]
    if data.edges is not None:
        graph.edges = [e.model_dump() for e in data.edges]
    graph.version += 1

    db.commit()
    db.refresh(graph)
    return NodeGraphResponse(**graph.to_dict())


@router.post("/{project_id}/graph/execute")
def execute_graph(project_id: str, db: Session = Depends(get_db)):
    """노드 그래프 기반 파이프라인 실행 요청"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")

    graph = db.query(NodeGraph).filter(NodeGraph.project_id == project_id).first()
    if not graph:
        raise HTTPException(status_code=404, detail="노드 그래프가 없습니다")

    # Extract agent execution order from node positions (left→right = execution order)
    agent_nodes = [n for n in graph.nodes if n.get("type") == "agent"]
    sorted_agents = sorted(agent_nodes, key=lambda n: n.get("position", {}).get("x", 0))
    steps = [n["agentId"].lower() for n in sorted_agents if n.get("agentId")]

    run = PipelineRun(
        project_id=project_id,
        steps=steps,
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    return {
        "run_id": run.id,
        "steps": steps,
        "message": f"파이프라인 실행 시작: {len(steps)}개 에이전트",
    }
