"""お気に入りAPIエンドポイントのテスト"""

from typing import Any

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


class TestGetFavorites:
    """お気に入り一覧取得のテスト"""

    def test_get_favorites_without_auth(self, client: TestClient) -> None:
        """認証なしでのアクセステスト"""
        response = client.get("/api/favorites")
        assert response.status_code == 401

    def test_get_favorites_empty(
        self, authenticated_client: TestClient, test_profile: dict[str, Any]
    ) -> None:
        """お気に入りが0件の場合のテスト"""
        response = authenticated_client.get("/api/favorites")
        assert response.status_code == 200

        data = response.json()
        assert data["total"] == 0
        assert len(data["favorites"]) == 0

    def test_get_favorites_with_data(
        self,
        authenticated_client: TestClient,
        test_profile: dict[str, Any],
        test_bar: dict[str, Any],
        db: Session,
    ) -> None:
        """お気に入りが存在する場合のテスト"""
        # お気に入りを追加
        from app.models.favorite import Favorite

        favorite = Favorite(
            bar_id=test_bar["id"],
            user_id=test_profile["user_id"],
        )
        db.add(favorite)
        db.commit()

        response = authenticated_client.get("/api/favorites")
        assert response.status_code == 200

        data = response.json()
        assert data["total"] == 1
        assert len(data["favorites"]) == 1
        assert data["favorites"][0]["bar"]["name"] == test_bar["name"]


class TestCreateFavorite:
    """お気に入り追加のテスト"""

    def test_create_favorite_without_auth(
        self, client: TestClient, test_bar: dict[str, Any]
    ) -> None:
        """認証なしでのアクセステスト"""
        response = client.post("/api/favorites", json={"bar_id": test_bar["id"]})
        assert response.status_code == 401

    def test_create_favorite_success(
        self,
        authenticated_client: TestClient,
        test_profile: dict[str, Any],
        test_bar: dict[str, Any],
    ) -> None:
        """お気に入り追加成功のテスト"""
        response = authenticated_client.post("/api/favorites", json={"bar_id": test_bar["id"]})
        assert response.status_code == 201

        data = response.json()
        assert data["bar_id"] == test_bar["id"]
        assert data["user_id"] == test_profile["user_id"]
        assert "id" in data
        assert "created_at" in data

    def test_create_favorite_duplicate(
        self,
        authenticated_client: TestClient,
        test_profile: dict[str, Any],
        test_bar: dict[str, Any],
        db: Session,
    ) -> None:
        """重複お気に入り追加のテスト"""
        # 既にお気に入りに追加
        from app.models.favorite import Favorite

        favorite = Favorite(
            bar_id=test_bar["id"],
            user_id=test_profile["user_id"],
        )
        db.add(favorite)
        db.commit()

        # 再度追加を試みる
        response = authenticated_client.post("/api/favorites", json={"bar_id": test_bar["id"]})
        assert response.status_code == 409  # Conflict

    def test_create_favorite_bar_not_found(
        self, authenticated_client: TestClient, test_profile: dict[str, Any]
    ) -> None:
        """存在しないバーへのお気に入り追加テスト"""
        fake_bar_id = "00000000-0000-0000-0000-000000000000"
        response = authenticated_client.post("/api/favorites", json={"bar_id": fake_bar_id})
        assert response.status_code == 404


class TestDeleteFavorite:
    """お気に入り削除のテスト"""

    def test_delete_favorite_without_auth(self, client: TestClient) -> None:
        """認証なしでのアクセステスト"""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = client.delete(f"/api/favorites/{fake_id}")
        assert response.status_code == 401

    def test_delete_favorite_success(
        self,
        authenticated_client: TestClient,
        test_profile: dict[str, Any],
        test_bar: dict[str, Any],
        db: Session,
    ) -> None:
        """お気に入り削除成功のテスト"""
        # お気に入りを追加
        from app.models.favorite import Favorite

        favorite = Favorite(
            bar_id=test_bar["id"],
            user_id=test_profile["user_id"],
        )
        db.add(favorite)
        db.commit()
        db.refresh(favorite)

        # 削除
        response = authenticated_client.delete(f"/api/favorites/{favorite.id}")
        assert response.status_code == 204

        # 削除されたことを確認
        response = authenticated_client.get("/api/favorites")
        data = response.json()
        assert data["total"] == 0

    def test_delete_favorite_not_found(self, authenticated_client: TestClient) -> None:
        """存在しないお気に入りの削除テスト"""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = authenticated_client.delete(f"/api/favorites/{fake_id}")
        assert response.status_code == 404
