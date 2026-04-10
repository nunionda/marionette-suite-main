"""
마리오네트 스튜디오 — 전략적 자가 진단 및 무결성 감사 서비스
"""
import asyncio
import time
import shutil
import httpx
from datetime import datetime
from typing import Dict, Any, List, Optional
from pathlib import Path

from server.core.config import settings

class StrategicAuditor:
    """
    실시간 시스템 무결성 감사 엔진.
    API 지연시간, 인프라 부하, 파이프라인 정합성을 주기적으로 체크합니다.
    """
    
    def __init__(self, broadcast_fn=None):
        self.broadcast_fn = broadcast_fn
        self.is_running = False
        self.last_audit_time: Optional[datetime] = None
        self.last_results: Dict[str, Any] = {
            "integrity_score": 100,
            "api_latency": {},
            "infrastructure": {},
            "pipeline": {},
            "logs": []
        }
        self.audit_interval = 60  # 60초 주기

    def add_log(self, message: str, level: str = "INFO"):
        """진단 로그 기록"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        log_entry = f"[{timestamp}] [{level}] {message}"
        self.last_results["logs"].insert(0, log_entry)
        # 로그는 최근 50개만 유지
        self.last_results["logs"] = self.last_results["logs"][:50]

    async def check_api_latency(self) -> Dict[str, float]:
        """주요 AI 서비스 지연시간 측정"""
        latencies = {}
        async with httpx.AsyncClient(timeout=5.0) as client:
            # 1. Google Gemini API (Mock or Health endpoint)
            start = time.perf_counter()
            try:
                # 실제 API 엔드포인트가 아닌 도달 가능성만 체크 (비용 절감)
                await client.get("https://generativelanguage.googleapis.com/")
                latencies["gemini"] = round((time.perf_counter() - start) * 1000, 2)
            except Exception as e:
                self.add_log(f"Gemini API Link Degraded: {str(e)}", "WARNING")
                latencies["gemini"] = -1
                
        return latencies

    async def check_infrastructure(self) -> Dict[str, Any]:
        """서버 리소스 및 인프라 상태 체크"""
        # 디스크 용량 체크 (settings.OUTPUT_DIR 기준)
        total, used, free = shutil.disk_usage(settings.OUTPUT_DIR)
        disk_usage_pct = (used / total) * 100
        
        status = "HEALTHY"
        if disk_usage_pct > 90:
            status = "CRITICAL"
            self.add_log("Disk usage exceeds 90% threshold", "CRITICAL")
        elif disk_usage_pct > 70:
            status = "WARNING"
            self.add_log("Disk usage exceeds 70% threshold", "WARNING")
            
        return {
            "disk_usage_pct": round(disk_usage_pct, 1),
            "disk_free_gb": round(free / (1024**3), 1),
            "status": status
        }

    def calculate_integrity_score(self, api: dict, infra: dict) -> int:
        """무결성 점수(0-100) 산정 로직"""
        score = 100
        
        # API 지연시간에 따른 감점
        gemini_lat = api.get("gemini", 0)
        if gemini_lat == -1: score -= 40
        elif gemini_lat > 1000: score -= 10
        
        # 인프라 상태에 따른 감점
        if infra["status"] == "CRITICAL": score -= 50
        elif infra["status"] == "WARNING": score -= 15
        
        return max(0, score)

    async def run_audit(self):
        """자가 진단 1회 수행"""
        self.add_log("Starting autonomous system audit...")
        
        # 진단 수행
        api_results = await self.check_api_latency()
        infra_results = await self.check_infrastructure()
        
        score = self.calculate_integrity_score(api_results, infra_results)
        
        # 결과 업데이트
        self.last_results.update({
            "integrity_score": score,
            "api_latency": api_results,
            "infrastructure": infra_results,
            "last_audit": datetime.now().isoformat()
        })
        self.last_audit_time = datetime.now()
        
        self.add_log(f"Audit completed. System Integrity: {score}%")
        
        # WebSocket 브로드캐스트 (전체 구독자에게 시스템 헬스 전파)
        if self.broadcast_fn:
            await self.broadcast_fn({
                "type": "system_health_update",
                "run_id": "GLOBAL",  # 글로벌 시스템 메시지용 run_id
                "data": self.last_results
            })

    async def start_daemon(self):
        """오디터 데몬 시작"""
        if self.is_running:
            return
            
        self.is_running = True
        self.add_log("Strategic Auditor engine online.")
        
        while self.is_running:
            try:
                await self.run_audit()
            except Exception as e:
                self.add_log(f"Auditor loop error: {str(e)}", "ERROR")
            
            await asyncio.sleep(self.audit_interval)

    def stop(self):
        self.is_running = False
        self.add_log("Strategic Auditor engine offline.")

# 싱글톤 인스턴스 (app.py에서 초기화 시 broadcast_fn 주입)
auditor = StrategicAuditor()
