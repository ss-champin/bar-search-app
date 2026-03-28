"""pytest設定とフィクスチャ"""

from collections.abc import Generator
from typing import Any
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app

# テスト用のインメモリSQLiteデータベースを使用
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

# テスト用エンジンの作成
test_engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# テスト用セッションの作成
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture
def db() -> Generator[Session, None, None]:
    """テスト用データベースセッションを提供"""
    # テーブルを作成
    Base.metadata.create_all(bind=test_engine)

    # セッションを作成
    session = TestingSessionLocal()

    try:
        yield session
    finally:
        session.close()
        # テーブルを削除
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def client(db: Session) -> Generator[TestClient, None, None]:
    """テストクライアントを提供"""

    def override_get_db() -> Generator[Session, None, None]:
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    # create_tables()をモックしてPostgreSQLへの接続を回避
    with patch("app.main.create_tables"):
        with TestClient(app, raise_server_exceptions=True) as test_client:
            yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def test_user_id() -> str:
    """テスト用ユーザーIDを提供"""
    return "test-user-id-12345"


@pytest.fixture
def test_profile(db: Session, test_user_id: str) -> dict[str, Any]:
    """テスト用プロフィールを作成"""
    from app.models.profile import Profile

    profile = Profile(
        user_id=test_user_id,
        email="test@example.com",
        nickname="テストユーザー",
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    return {
        "user_id": profile.user_id,
        "email": profile.email,
        "nickname": profile.nickname,
    }


@pytest.fixture
def auth_headers(test_user_id: str) -> dict[str, str]:
    """テスト用認証ヘッダーを提供"""
    # 注: 実際の環境では有効なJWTトークンを生成する必要があります
    # ここでは簡易的にモックヘッダーを使用
    return {
        "Authorization": f"Bearer test-token-{test_user_id}",
    }


@pytest.fixture
def authenticated_client(client: TestClient, test_user_id: str) -> TestClient:
    """認証済みテストクライアントを提供（認証依存関係をモック）"""
    from app.dependencies import get_current_user_id

    async def override_get_current_user_id() -> str:
        return test_user_id

    app.dependency_overrides[get_current_user_id] = override_get_current_user_id
    return client


@pytest.fixture
def test_bar(db: Session, test_user_id: str) -> dict[str, Any]:
    """テスト用バーデータを作成"""
    from app.models.bar import Bar

    bar = Bar(
        name="テストバー",
        prefecture="東京都",
        address="渋谷区渋谷1-1-1",
        description="テスト用のバーです",
        image_urls=["https://example.com/image1.jpg"],
        created_by=test_user_id,
    )
    db.add(bar)
    db.commit()
    db.refresh(bar)

    return {
        "id": str(bar.id),
        "name": bar.name,
        "prefecture": bar.prefecture,
        "address": bar.address,
        "description": bar.description,
        "image_urls": bar.image_urls,
    }
