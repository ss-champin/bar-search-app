"""レビューAPIエンドポイントのテスト"""

from typing import Any

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


class TestGetBarReviews:
    """バーのレビュー一覧取得のテスト"""

    def test_get_bar_reviews_empty(self, client: TestClient, test_bar: dict[str, Any]) -> None:
        """レビューが0件の場合のテスト"""
        response = client.get(f"/api/bars/{test_bar['id']}/reviews")
        assert response.status_code == 200

        data = response.json()
        assert data["total"] == 0
        assert len(data["reviews"]) == 0

    def test_get_bar_reviews_with_data(
        self,
        client: TestClient,
        test_bar: dict[str, Any],
        test_profile: dict[str, Any],
        db: Session,
    ) -> None:
        """レビューが存在する場合のテスト"""
        # レビューを追加
        from app.models.review import Review

        review = Review(
            bar_id=test_bar["id"],
            user_id=test_profile["user_id"],
            rating=5,
            comment="とても良いバーでした！",
        )
        db.add(review)
        db.commit()

        response = client.get(f"/api/bars/{test_bar['id']}/reviews")
        assert response.status_code == 200

        data = response.json()
        assert data["total"] == 1
        assert len(data["reviews"]) == 1
        assert data["reviews"][0]["rating"] == 5
        assert data["reviews"][0]["comment"] == "とても良いバーでした！"
        assert data["reviews"][0]["user_nickname"] == test_profile["nickname"]

    def test_get_bar_reviews_not_found(self, client: TestClient) -> None:
        """存在しないバーIDでのテスト"""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = client.get(f"/api/bars/{fake_id}/reviews")
        assert response.status_code == 404


class TestCreateReview:
    """レビュー投稿のテスト"""

    def test_create_review_without_auth(self, client: TestClient, test_bar: dict[str, Any]) -> None:
        """認証なしでのアクセステスト"""
        response = client.post(
            f"/api/bars/{test_bar['id']}/reviews",
            json={"rating": 5, "comment": "素晴らしい"},
        )
        assert response.status_code == 401

    def test_create_review_success(
        self,
        authenticated_client: TestClient,
        test_bar: dict[str, Any],
        test_profile: dict[str, Any],
    ) -> None:
        """レビュー投稿成功のテスト"""
        response = authenticated_client.post(
            f"/api/bars/{test_bar['id']}/reviews",
            json={"rating": 5, "comment": "素晴らしいバーでした！"},
        )
        assert response.status_code == 201

        data = response.json()
        assert data["bar_id"] == test_bar["id"]
        assert data["user_id"] == test_profile["user_id"]
        assert data["rating"] == 5
        assert data["comment"] == "素晴らしいバーでした！"
        assert "id" in data
        assert "created_at" in data

    def test_create_review_invalid_rating(
        self,
        authenticated_client: TestClient,
        test_bar: dict[str, Any],
    ) -> None:
        """不正な評価値でのテスト"""
        # 0未満
        response = authenticated_client.post(
            f"/api/bars/{test_bar['id']}/reviews",
            json={"rating": 0, "comment": "テスト"},
        )
        assert response.status_code == 422

        # 5より大きい
        response = authenticated_client.post(
            f"/api/bars/{test_bar['id']}/reviews",
            json={"rating": 6, "comment": "テスト"},
        )
        assert response.status_code == 422

    def test_create_review_bar_not_found(self, authenticated_client: TestClient) -> None:
        """存在しないバーへのレビュー投稿テスト"""
        fake_bar_id = "00000000-0000-0000-0000-000000000000"
        response = authenticated_client.post(
            f"/api/bars/{fake_bar_id}/reviews",
            json={"rating": 5, "comment": "テスト"},
        )
        assert response.status_code == 404


class TestUpdateReview:
    """レビュー更新のテスト"""

    def test_update_review_without_auth(self, client: TestClient) -> None:
        """認証なしでのアクセステスト"""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = client.put(
            f"/api/reviews/{fake_id}",
            json={"rating": 4, "comment": "更新"},
        )
        assert response.status_code == 401

    def test_update_review_success(
        self,
        authenticated_client: TestClient,
        test_bar: dict[str, Any],
        test_profile: dict[str, Any],
        db: Session,
    ) -> None:
        """レビュー更新成功のテスト"""
        # レビューを作成
        from app.models.review import Review

        review = Review(
            bar_id=test_bar["id"],
            user_id=test_profile["user_id"],
            rating=3,
            comment="普通でした",
        )
        db.add(review)
        db.commit()
        db.refresh(review)

        # レビューを更新
        response = authenticated_client.put(
            f"/api/reviews/{review.id}",
            json={"rating": 5, "comment": "再訪して印象が変わりました！"},
        )
        assert response.status_code == 200

        data = response.json()
        assert data["id"] == str(review.id)
        assert data["rating"] == 5
        assert data["comment"] == "再訪して印象が変わりました！"

    def test_update_review_not_found(self, authenticated_client: TestClient) -> None:
        """存在しないレビューの更新テスト"""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = authenticated_client.put(
            f"/api/reviews/{fake_id}",
            json={"rating": 4},
        )
        assert response.status_code == 404


class TestDeleteReview:
    """レビュー削除のテスト"""

    def test_delete_review_without_auth(self, client: TestClient) -> None:
        """認証なしでのアクセステスト"""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = client.delete(f"/api/reviews/{fake_id}")
        assert response.status_code == 401

    def test_delete_review_success(
        self,
        authenticated_client: TestClient,
        test_bar: dict[str, Any],
        test_profile: dict[str, Any],
        db: Session,
    ) -> None:
        """レビュー削除成功のテスト"""
        # レビューを作成
        from app.models.review import Review

        review = Review(
            bar_id=test_bar["id"],
            user_id=test_profile["user_id"],
            rating=4,
            comment="削除予定のレビュー",
        )
        db.add(review)
        db.commit()
        db.refresh(review)

        # 削除
        response = authenticated_client.delete(f"/api/reviews/{review.id}")
        assert response.status_code == 204

        # 削除されたことを確認
        response = authenticated_client.get(f"/api/bars/{test_bar['id']}/reviews")
        data = response.json()
        assert data["total"] == 0

    def test_delete_review_not_found(self, authenticated_client: TestClient) -> None:
        """存在しないレビューの削除テスト"""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = authenticated_client.delete(f"/api/reviews/{fake_id}")
        assert response.status_code == 404
