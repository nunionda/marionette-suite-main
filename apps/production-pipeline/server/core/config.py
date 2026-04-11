"""
마리오네트 스튜디오 — 서버 설정
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# .env 로드
ENV_PATH = Path(__file__).parent.parent.parent / ".env"
load_dotenv(ENV_PATH)


class Settings:
    # 서버
    APP_NAME: str = "Marionette Studio API"
    VERSION: str = "0.1.0"
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "3005"))

    # CORS — 모든 프론트엔드 서비스 허용
    CORS_ORIGINS: list = [
        "http://localhost:5173",    # Production Pipeline Vite dev
        "http://localhost:5174",    # Script Writer Vite dev
        "http://localhost:3000",    # Homepage
        "http://localhost:3001",    # Studio Hub (Next.js)
        "http://localhost:3005",    # API self
        "http://localhost:4007",    # Analysis System Web (Next.js)
    ]

    # 데이터베이스 (개발: SQLite 인메모리 or 로컬파일, 프로덕션: PostgreSQL)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///marionette.db"
    )

    # AI API 키
    GEMINI_API_KEY: str = os.getenv("Gemini_Api_Key", "") or os.getenv("GEMINI_API_KEY", "")
    ELEVENLABS_API_KEY: str = os.getenv("ELEVENLABS_API_KEY", "")
    SUNO_API_KEY: str = os.getenv("SUNO_API_KEY", "")

    # 파일 경로
    PROJECT_ROOT: Path = Path(__file__).parent.parent.parent
    OUTPUT_DIR: Path = PROJECT_ROOT / "output"
    PLANS_DIR: Path = OUTPUT_DIR / "plans"
    STORYBOARDS_DIR: Path = OUTPUT_DIR / "storyboards"
    VIDEOS_DIR: Path = OUTPUT_DIR / "videos"
    AUDIO_DIR: Path = OUTPUT_DIR / "audio"

    def ensure_dirs(self):
        """모든 출력 디렉토리가 존재하는지 확인"""
        for d in [self.OUTPUT_DIR, self.PLANS_DIR, self.STORYBOARDS_DIR, self.VIDEOS_DIR, self.AUDIO_DIR]:
            d.mkdir(parents=True, exist_ok=True)


settings = Settings()
