"""
마리오네트 스튜디오 — 서버 실행
usage: python -m server.run
"""
import uvicorn
from server.core.config import settings

if __name__ == "__main__":
    uvicorn.run(
        "server.app:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info",
    )
