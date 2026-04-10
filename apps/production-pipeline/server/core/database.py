"""
마리오네트 스튜디오 — 데이터베이스 세션 관리
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from server.core.config import settings
from server.models.database import Base

engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """데이터베이스 테이블 생성"""
    Base.metadata.create_all(bind=engine)


def get_db():
    """FastAPI 의존성 주입용 DB 세션 제너레이터"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
