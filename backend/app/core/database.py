"""データベース接続とセッション管理（非同期対応）"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy import create_engine

from app.core.config import settings
from app.models.base import Base

__all__ = [
    "Base",
    "engine",
    "async_engine",
    "SessionLocal",
    "AsyncSessionLocal",
    "get_db",
    "get_async_db",
    "create_tables",
    "drop_tables",
]

# 同期エンジン（マイグレーション用）
engine = create_engine(
    settings.DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://"),
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

# 非同期エンジン（API用）
async_engine = create_async_engine(
    settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"),
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

# 同期セッションファクトリー
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=Session,
)

# 非同期セッションファクトリー
AsyncSessionLocal = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


def get_db() -> AsyncGenerator[Session, None]:
    """
    同期データベースセッションを取得する依存性注入関数（後方互換性のため）

    Yields:
        Session: SQLAlchemyセッション
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """
    非同期データベースセッションを取得する依存性注入関数

    Yields:
        AsyncSession: SQLAlchemy非同期セッション
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


def create_tables() -> None:
    """全てのテーブルを作成する（同期）"""
    Base.metadata.create_all(bind=engine)


def drop_tables() -> None:
    """全てのテーブルを削除する（開発用、同期）"""
    Base.metadata.drop_all(bind=engine)
