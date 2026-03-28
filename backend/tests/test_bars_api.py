"""バーAPIエンドポイントのテスト"""

from typing import Any

from fastapi.testclient import TestClient


class TestGetBars:
    """バー一覧取得のテスト"""

    def test_get_bars_empty(self, client: TestClient) -> None:
        """バーが0件の場合のテスト"""
        response = client.get("/api/bars")
        assert response.status_code == 200

        data = response.json()
        assert data["total"] == 0
        assert len(data["bars"]) == 0
        assert data["limit"] == 20
        assert data["offset"] == 0

    def test_get_bars_with_data(self, client: TestClient, test_bar: dict[str, Any]) -> None:
        """バーが存在する場合のテスト"""
        response = client.get("/api/bars")
        assert response.status_code == 200

        data = response.json()
        assert data["total"] == 1
        assert len(data["bars"]) == 1
        assert data["bars"][0]["name"] == test_bar["name"]
        assert data["bars"][0]["prefecture"] == test_bar["prefecture"]

    def test_get_bars_with_prefecture_filter(
        self, client: TestClient, test_bar: dict[str, Any]
    ) -> None:
        """都道府県フィルタのテスト"""
        # 東京都でフィルタ
        response = client.get("/api/bars?prefecture=東京都")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1

        # 大阪府でフィルタ（該当なし）
        response = client.get("/api/bars?prefecture=大阪府")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0

    def test_get_bars_with_address_filter(self, client: TestClient, test_bar: dict[str, Any]) -> None:
        """住所（address 列）部分一致フィルタのテスト"""
        response = client.get("/api/bars?address=渋谷区")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1

        response = client.get("/api/bars?address=新宿区")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0

    def test_get_bars_with_pagination(self, client: TestClient, test_bar: dict[str, Any]) -> None:
        """ページネーションのテスト"""
        response = client.get("/api/bars?limit=10&offset=0")
        assert response.status_code == 200
        data = response.json()
        assert data["limit"] == 10
        assert data["offset"] == 0


class TestGetBar:
    """バー詳細取得のテスト"""

    def test_get_bar_success(self, client: TestClient, test_bar: dict[str, Any]) -> None:
        """バー詳細取得成功のテスト"""
        response = client.get(f"/api/bars/{test_bar['id']}")
        assert response.status_code == 200

        data = response.json()
        assert data["id"] == test_bar["id"]
        assert data["name"] == test_bar["name"]
        assert data["prefecture"] == test_bar["prefecture"]
        assert data["address"] == test_bar["address"]
        assert data["average_rating"] == 0.0
        assert data["review_count"] == 0

    def test_get_bar_not_found(self, client: TestClient) -> None:
        """存在しないバーIDでのテスト"""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = client.get(f"/api/bars/{fake_id}")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_get_bar_invalid_id(self, client: TestClient) -> None:
        """不正なUUID形式でのテスト"""
        response = client.get("/api/bars/invalid-id")
        assert response.status_code == 422  # Validation error
