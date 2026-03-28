"""ユーザープロフィールAPIエンドポイントのテスト"""

from typing import Any

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


class TestGetMyProfile:
    """プロフィール取得のテスト"""

    def test_get_my_profile_without_auth(self, client: TestClient) -> None:
        """認証なしでのアクセステスト"""
        response = client.get("/api/users/me")
        assert response.status_code == 401

    def test_get_my_profile_success(
        self,
        authenticated_client: TestClient,
        test_profile: dict[str, Any],
    ) -> None:
        """プロフィール取得成功のテスト"""
        response = authenticated_client.get("/api/users/me")
        assert response.status_code == 200

        data = response.json()
        assert data["user_id"] == test_profile["user_id"]
        assert data["email"] == test_profile["email"]
        assert data["nickname"] == test_profile["nickname"]


class TestUpdateMyProfile:
    """プロフィール更新のテスト"""

    def test_update_my_profile_without_auth(self, client: TestClient) -> None:
        """認証なしでのアクセステスト"""
        response = client.put(
            "/api/users/me",
            json={"nickname": "新しいニックネーム"},
        )
        assert response.status_code == 401

    def test_update_my_profile_success(
        self,
        authenticated_client: TestClient,
        test_profile: dict[str, Any],
    ) -> None:
        """プロフィール更新成功のテスト"""
        response = authenticated_client.put(
            "/api/users/me",
            json={
                "nickname": "更新されたニックネーム",
            },
        )
        assert response.status_code == 200

        data = response.json()
        assert data["nickname"] == "更新されたニックネーム"
        assert data["email"] == test_profile["email"]  # 変更されていない

    def test_update_my_profile_partial(
        self,
        authenticated_client: TestClient,
        test_profile: dict[str, Any],
    ) -> None:
        """一部フィールドのみ更新のテスト"""
        response = authenticated_client.put(
            "/api/users/me",
            json={"nickname": "部分更新"},
        )
        assert response.status_code == 200

        data = response.json()
        assert data["nickname"] == "部分更新"


class TestGetMyReviews:
    """自分のレビュー一覧取得のテスト"""

    def test_get_my_reviews_without_auth(self, client: TestClient) -> None:
        """認証なしでのアクセステスト"""
        response = client.get("/api/users/me/reviews")
        assert response.status_code == 401

    def test_get_my_reviews_empty(
        self,
        authenticated_client: TestClient,
        test_profile: dict[str, Any],
    ) -> None:
        """レビューが0件の場合のテスト"""
        response = authenticated_client.get("/api/users/me/reviews")
        assert response.status_code == 200

        data = response.json()
        assert data["total"] == 0
        assert len(data["reviews"]) == 0

    def test_get_my_reviews_with_data(
        self,
        authenticated_client: TestClient,
        test_profile: dict[str, Any],
        test_bar: dict[str, Any],
        db: Session,
    ) -> None:
        """レビューが存在する場合のテスト"""
        # レビューを追加
        from app.models.review import Review

        review = Review(
            bar_id=test_bar["id"],
            user_id=test_profile["user_id"],
            rating=5,
            comment="素晴らしいバーでした",
        )
        db.add(review)
        db.commit()

        response = authenticated_client.get("/api/users/me/reviews")
        assert response.status_code == 200

        data = response.json()
        assert data["total"] == 1
        assert len(data["reviews"]) == 1
        assert data["reviews"][0]["rating"] == 5
        assert data["reviews"][0]["comment"] == "素晴らしいバーでした"
        assert data["reviews"][0]["bar_name"] == test_bar["name"]
        assert data["reviews"][0]["bar_address"] == f"{test_bar['prefecture']} {test_bar['address']}"
