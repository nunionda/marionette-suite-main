"""
마리오네트 스튜디오 — FastAPI 메인 애플리케이션
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from server.core.config import settings
from server.core.database import init_db
from server.api import projects, pipeline, websocket
from server.api.websocket import manager
from server.models.schemas import HealthResponse


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.VERSION,
        description="AI 기반 완전 자동화 영상 콘텐츠 제작 파이프라인 API",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # ─── CORS ───
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ─── 라우터 등록 ───
    app.include_router(projects.router)
    app.include_router(pipeline.router)
    app.include_router(websocket.router)

    # ─── WebSocket 브로드캐스트 함수를 파이프라인 서비스에 주입 ───
    pipeline.set_broadcast_fn(manager.broadcast)

    # ─── 정적 파일 서빙 (산출물 다운로드) ───
    output_dir = settings.OUTPUT_DIR
    if output_dir.exists():
        app.mount("/output", StaticFiles(directory=str(output_dir)), name="output")

    # ─── 이벤트 핸들러 ───
    @app.on_event("startup")
    async def startup():
        init_db()
        settings.ensure_dirs()
        print(f"🎬 {settings.APP_NAME} v{settings.VERSION} 서버 시작!")
        print(f"📖 API 문서: http://{settings.HOST}:{settings.PORT}/docs")
        if settings.GEMINI_API_KEY:
            print(f"✅ Gemini API 키 감지됨")
        else:
            print(f"⚠️  Gemini API 키 미설정 — ScriptWriter 실행 불가")

    # ─── 헬스체크 ───
    @app.get("/api/health", response_model=HealthResponse, tags=["system"])
    def health_check():
        return HealthResponse(
            status="ok",
            version=settings.VERSION,
            service="marionette-studio-api",
        )

    @app.get("/api/config", tags=["system"])
    def get_config():
        """서버 설정 (민감 정보 제외)"""
        return {
            "version": settings.VERSION,
            "debug": settings.DEBUG,
            "has_gemini_key": bool(settings.GEMINI_API_KEY),
            "has_elevenlabs_key": bool(settings.ELEVENLABS_API_KEY),
            "has_suno_key": bool(settings.SUNO_API_KEY),
            "pipeline_steps": [
                {"id": "script_writer", "name": "AI 시나리오 작가", "status": "ready" if settings.GEMINI_API_KEY else "no_api_key"},
                {"id": "concept_artist", "name": "AI 컨셉 아티스트", "status": "mock"},
                {"id": "generalist", "name": "AI 제너럴리스트", "status": "mock"},
                {"id": "asset_designer", "name": "AI 에셋 디자이너", "status": "mock"},
                {"id": "vfx_compositor", "name": "AI VFX 컴포지터", "status": "mock"},
                {"id": "master_editor", "name": "AI 마스터 에디터", "status": "ready"},
                {"id": "sound_designer", "name": "AI 사운드 디자이너", "status": "mock"},
            ],
        }

    return app


app = create_app()
