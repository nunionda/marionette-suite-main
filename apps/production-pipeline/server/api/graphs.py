"""
마리오네트 스튜디오 — 노드 그래프 API
"""
import asyncio
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from server.core.database import get_db, SessionLocal
from server.models.database import NodeGraph, Project, PipelineRun, RunStatus
from server.models.schemas import NodeGraphResponse, NodeGraphUpdate
from server.api import pipeline as pipeline_api
from server.services.pipeline_runner import PipelineRunner

router = APIRouter()


async def update_node_status(project_id: str, agent_id: str, status: str, db_session):
    """Update a specific node's status in the project's NodeGraph"""
    graph = db_session.query(NodeGraph).filter(NodeGraph.project_id == project_id).first()
    if graph:
        nodes = graph.nodes
        for node in nodes:
            if node.get("agentId") and node["agentId"].lower() == agent_id.lower():
                node["status"] = status
        graph.nodes = nodes
        db_session.commit()


async def _run_graph_pipeline_background(run_id: str, project_id: str, idea: str):
    """
    백그라운드 태스크: 그래프 기반 파이프라인 실행
    별도 DB 세션으로 실행하여 요청 세션과 분리, 노드 상태도 함께 업데이트
    """
    db = SessionLocal()
    try:
        run = db.query(PipelineRun).filter(PipelineRun.id == run_id).first()
        project = db.query(Project).filter(Project.id == project_id).first()
        if not run or not project:
            return

        # Reuse broadcast from pipeline module, wrap to also update node statuses
        original_broadcast = pipeline_api._broadcast_fn

        async def broadcast_with_node_status(message: dict):
            if original_broadcast:
                await original_broadcast(message)
            msg_type = message.get("type", "")
            step = message.get("step")
            if step:
                if msg_type == "step_started":
                    await update_node_status(project_id, step, "running", db)
                elif msg_type == "step_completed":
                    await update_node_status(project_id, step, "completed", db)
                elif msg_type == "step_failed":
                    await update_node_status(project_id, step, "failed", db)

        runner = PipelineRunner(broadcast_fn=broadcast_with_node_status)
        await runner.run_pipeline(run, project, db, idea=idea)
    finally:
        db.close()


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
        status=RunStatus.QUEUED.value,
    )
    db.add(run)
    project.status = "in_production"
    db.commit()
    db.refresh(run)

    idea = project.idea or project.title or ""

    # 백그라운드 태스크로 파이프라인 실행
    asyncio.create_task(_run_graph_pipeline_background(run.id, project_id, idea))

    return {
        "run_id": run.id,
        "steps": steps,
        "message": f"파이프라인 실행 시작: {len(steps)}개 에이전트",
    }
