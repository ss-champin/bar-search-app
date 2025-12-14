"""データベース接続とセッション管理"""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.models.base import Base

__all__ = ["Base", "engine", "SessionLocal", "get_db", "create_tables", "drop_tables"]

# データベースエンジンの作成
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,  # DEBUGモードでSQLログを出力
    pool_pre_ping=True,  # 接続の有効性を確認
    pool_size=5,  # コネクションプールのサイズ
    max_overflow=10,  # プールがいっぱいの時の追加接続数
)

# セッションファクトリーの作成
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db() -> Generator[Session, None, None]:
    """
    データベースセッションを取得する依存性注入関数

    Yields:
        Session: SQLAlchemyセッション
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables() -> None:
    """全てのテーブルを作成する"""
    Base.metadata.create_all(bind=engine)


def drop_tables() -> None:
    """全てのテーブルを削除する（開発用）"""
    Base.metadata.drop_all(bind=engine)
