"""
마리오네트 스튜디오 — WebSocket 실시간 파이프라인 모니터링
"""
import json
from typing import Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["websocket"])


class ConnectionManager:
    """WebSocket 연결 관리자"""

    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        print(f"🔌 WebSocket 연결됨 (총 {len(self.active_connections)}개)")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        print(f"🔌 WebSocket 해제됨 (총 {len(self.active_connections)}개)")

    async def broadcast(self, message: dict):
        """모든 연결된 클라이언트에 메시지 브로드캐스트"""
        disconnected = set()
        data = json.dumps(message, ensure_ascii=False)

        for connection in self.active_connections:
            try:
                await connection.send_text(data)
            except Exception:
                disconnected.add(connection)

        # 끊어진 연결 정리
        for conn in disconnected:
            self.active_connections.discard(conn)


manager = ConnectionManager()


@router.websocket("/ws/pipeline")
async def websocket_pipeline(websocket: WebSocket):
    """
    파이프라인 실시간 모니터링 WebSocket

    클라이언트 → 서버: ping/subscribe 메시지
    서버 → 클라이언트: 파이프라인 진행 상황 이벤트

    이벤트 타입:
    - pipeline_started: 파이프라인 시작
    - step_started: 단계 시작
    - step_completed: 단계 완료
    - step_failed: 단계 실패
    - pipeline_completed: 파이프라인 완료
    """
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # 클라이언트 메시지 처리 (ping 등)
            try:
                msg = json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)
