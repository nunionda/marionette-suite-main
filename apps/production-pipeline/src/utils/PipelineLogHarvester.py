import requests
import json
import os
from datetime import datetime

class PipelineLogHarvester:
    def __init__(self, run_id: str, server_url: str = None):
        self.run_id = run_id
        
        # .env 로드 및 서버 URL 결정
        if not server_url:
            from dotenv import load_dotenv
            load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
            port = os.getenv("PORT", "3005")
            self.server_url = f"http://localhost:{port}"
        else:
            self.server_url = server_url
            
        self.broadcast_url = f"{self.server_url}/broadcast"
        print(f"📡 [Harvester] 초기화됨 (URL: {self.broadcast_url}, RUN_ID: {self.run_id})")

    def send_event(self, event_type: str, step: str, progress: int = 0, data: dict = None):
        """
        이벤트를 서버로 전송하여 WebSocket 브로드캐스트를 유발합니다.
        
        event_type 종류: 
        - step_started
        - step_completed
        - step_failed
        - quality_check_completed
        """
        payload = {
            "run_id": self.run_id,
            "type": event_type,
            "step": step,
            "progress": progress,
            "timestamp": datetime.now().isoformat()
        }
        if data:
            payload.update(data)

        try:
            requests.post(self.broadcast_url, json=payload, timeout=2)
        except Exception as e:
            # 서버가 떠있지 않을 수도 있으므로 에러는 무시하되 출력
            print(f"📡 [Harvester] 브로드캐스트 실패 (서버 오프라인?): {e}")

    def notify_step_started(self, step: str):
        self.send_event("step_started", step, progress=10)

    def notify_step_completed(self, step: str, output_path: str = None):
        data = {"output_path": output_path} if output_path else None
        self.send_event("step_completed", step, progress=100, data=data)

    def notify_quality_check(self, step: str, soq_score: float, feedback: str):
        data = {
            "soq": {
                "soq_score": soq_score,
                "feedback": feedback
            }
        }
        self.send_event("quality_check_completed", step, data=data)
