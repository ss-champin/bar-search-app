# API設計書

## 概要

バー検索アプリのバックエンドAPIの詳細設計書です。

### 技術スタック
- **Framework**: FastAPI
- **Validation**: Pydantic v2
- **認証**: Supabase Auth JWT検証
- **CORS**: フロントエンド（Next.js）からのリクエストを許可

### ベースURL
- **開発環境**: `http://localhost:8000`
- **本番環境**: `https://api.bar-search-app.com`

---

## 認証フロー

### 1. フロントエンド側（Next.js）
```typescript
// Supabaseクライアントでログイン
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// アクセストークンを取得
const accessToken = data.session?.access_token

// APIリクエスト時にヘッダーに含める
fetch('http://localhost:8000/api/bars', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})
```

### 2. バックエンド側（FastAPI）
```python
from fastapi import Header, HTTPException
from supabase import create_client

async def verify_token(authorization: str = Header(...)):
    """トークン検証ミドルウェア"""
    try:
        token = authorization.replace('Bearer ', '')
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        user = supabase.auth.get_user(token)
        return user
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
```

---

## エンドポイント一覧

### 認証API

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| POST | /api/auth/verify | トークン検証 | 不要 |

### バーAPI

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | /api/bars | バー一覧取得 | 不要 |
| POST | /api/bars | バー登録 | 必要（管理者） |
| GET | /api/bars/{bar_id} | バー詳細取得 | 不要 |
| PUT | /api/bars/{bar_id} | バー更新 | 必要（管理者） |
| DELETE | /api/bars/{bar_id} | バー削除 | 必要（管理者） |

### レビューAPI

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | /api/bars/{bar_id}/reviews | レビュー一覧取得 | 不要 |
| POST | /api/bars/{bar_id}/reviews | レビュー投稿 | 必要 |
| PUT | /api/reviews/{review_id} | レビュー更新 | 必要 |
| DELETE | /api/reviews/{review_id} | レビュー削除 | 必要 |

### お気に入りAPI

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | /api/favorites | お気に入り一覧取得 | 必要 |
| POST | /api/favorites | お気に入り追加 | 必要 |
| DELETE | /api/favorites/{favorite_id} | お気に入り削除 | 必要 |

### ユーザーAPI

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | /api/users/me | プロフィール取得 | 必要 |
| PUT | /api/users/me | プロフィール更新 | 必要 |
| GET | /api/users/me/reviews | 自分のレビュー一覧 | 必要 |

---

## Pydanticモデル定義

### バー関連

```python
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class BarBase(BaseModel):
    """バー基本情報"""
    name: str = Field(..., max_length=100, description="店名")
    description: Optional[str] = Field(None, description="説明")
    prefecture: str = Field(..., max_length=10, description="都道府県")
    city: str = Field(..., max_length=50, description="市区町村")
    address: str = Field(..., description="住所詳細")
    image_urls: List[HttpUrl] = Field(default=[], max_length=10, description="店内写真URL配列")
    opening_hours: Optional[dict] = Field(None, description="営業時間")
    regular_holiday: Optional[str] = Field(None, max_length=100, description="定休日")
    menu_beer_price: Optional[str] = Field(None, max_length=50, description="ビール料金")
    menu_whiskey_price: Optional[str] = Field(None, max_length=50, description="ウィスキー料金")
    menu_cocktail_price: Optional[str] = Field(None, max_length=50, description="カクテル料金")
    phone: Optional[str] = Field(None, max_length=20, description="電話番号")
    website: Optional[HttpUrl] = Field(None, description="Webサイト")

class BarCreate(BarBase):
    """バー登録用モデル"""
    pass

class BarUpdate(BaseModel):
    """バー更新用モデル（全フィールドオプショナル）"""
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    prefecture: Optional[str] = Field(None, max_length=10)
    city: Optional[str] = Field(None, max_length=50)
    address: Optional[str] = None
    image_urls: Optional[List[HttpUrl]] = Field(None, max_length=10)
    opening_hours: Optional[dict] = None
    regular_holiday: Optional[str] = Field(None, max_length=100)
    menu_beer_price: Optional[str] = Field(None, max_length=50)
    menu_whiskey_price: Optional[str] = Field(None, max_length=50)
    menu_cocktail_price: Optional[str] = Field(None, max_length=50)
    phone: Optional[str] = Field(None, max_length=20)
    website: Optional[HttpUrl] = None

class BarSummary(BarBase):
    """バー一覧用モデル"""
    id: UUID
    average_rating: float = Field(0.0, description="平均評価")
    review_count: int = Field(0, description="レビュー数")

    class Config:
        from_attributes = True

class BarDetail(BarSummary):
    """バー詳細用モデル"""
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

### レビュー関連

```python
class ReviewBase(BaseModel):
    """レビュー基本情報"""
    rating: int = Field(..., ge=1, le=5, description="星評価（1-5）")
    comment: Optional[str] = Field(None, max_length=2000, description="レビューコメント")

class ReviewCreate(ReviewBase):
    """レビュー投稿用モデル"""
    pass

class ReviewUpdate(BaseModel):
    """レビュー更新用モデル"""
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=2000)

class Review(ReviewBase):
    """レビュー取得用モデル"""
    id: UUID
    bar_id: UUID
    user_id: UUID
    user_nickname: str
    user_avatar_url: Optional[HttpUrl]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ReviewWithBar(Review):
    """バー情報付きレビュー"""
    bar_name: str
    bar_address: str

    class Config:
        from_attributes = True
```

### お気に入り関連

```python
class FavoriteCreate(BaseModel):
    """お気に入り追加用モデル"""
    bar_id: UUID = Field(..., description="バーID")

class Favorite(BaseModel):
    """お気に入り取得用モデル"""
    id: UUID
    bar_id: UUID
    user_id: UUID
    bar: BarSummary
    created_at: datetime

    class Config:
        from_attributes = True
```

### ユーザー関連

```python
class UserProfileBase(BaseModel):
    """ユーザープロフィール基本情報"""
    email: str = Field(..., description="メールアドレス")
    nickname: str = Field(..., max_length=50, description="ニックネーム")
    age: int = Field(..., ge=1, le=150, description="年齢")
    avatar_url: Optional[HttpUrl] = Field(None, description="アイコン写真URL")

class UserProfileUpdate(BaseModel):
    """プロフィール更新用モデル"""
    email: Optional[str] = None
    nickname: Optional[str] = Field(None, max_length=50)
    age: Optional[int] = Field(None, ge=1, le=150)
    avatar_url: Optional[HttpUrl] = None

class UserProfile(UserProfileBase):
    """プロフィール取得用モデル"""
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

### 共通

```python
class ErrorResponse(BaseModel):
    """エラーレスポンス"""
    error: str = Field(..., description="エラーコード")
    message: str = Field(..., description="エラーメッセージ")
    details: Optional[dict] = Field(None, description="詳細情報")

class PaginatedResponse(BaseModel):
    """ページネーションレスポンス基底クラス"""
    total: int = Field(..., description="総件数")
    limit: int = Field(..., description="取得件数")
    offset: int = Field(..., description="オフセット")
```

---

## エラーハンドリング

### HTTPステータスコード

| コード | 説明 | 使用例 |
|-------|------|--------|
| 200 | OK | 取得・更新成功 |
| 201 | Created | 作成成功 |
| 204 | No Content | 削除成功 |
| 400 | Bad Request | リクエストパラメータ不正 |
| 401 | Unauthorized | 認証エラー |
| 403 | Forbidden | 権限不足 |
| 404 | Not Found | リソースが見つからない |
| 409 | Conflict | 重複エラー（お気に入り登録済みなど） |
| 500 | Internal Server Error | サーバーエラー |

### エラーレスポンス例

```json
{
  "error": "UNAUTHORIZED",
  "message": "Invalid or expired token",
  "details": {
    "token_expired_at": "2024-01-01T00:00:00Z"
  }
}
```

---

## CORS設定

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js開発環境
        "https://bar-search-app.vercel.app"  # 本番環境
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## レート制限

APIのレート制限を設定（検討中）:
- **一般ユーザー**: 100リクエスト/分
- **管理者**: 1000リクエスト/分

実装例:
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/bars")
@limiter.limit("100/minute")
async def get_bars():
    pass
```

---

## ロギング

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# リクエストログ
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"{request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Status: {response.status_code}")
    return response
```

---

## テスト戦略

### 単体テスト
- Pytestを使用
- 各エンドポイントのテストケースを作成
- モックを使用してSupabase接続をテスト

### 統合テスト
- TestClientを使用してエンドポイントをテスト
- 実際のデータベース（テスト用）を使用

### テスト例
```python
from fastapi.testclient import TestClient

def test_get_bars():
    client = TestClient(app)
    response = client.get("/api/bars?prefecture=東京都")
    assert response.status_code == 200
    assert "bars" in response.json()
```

---

## パフォーマンス最適化

### データベースクエリ最適化
- N+1問題の回避（JOINを使用）
- インデックスの活用
- ページネーションの実装

### キャッシング
- Redisを使用したキャッシング（検討中）
- バー一覧などの頻繁にアクセスされるデータをキャッシュ

```python
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.decorator import cache

@app.get("/api/bars")
@cache(expire=300)  # 5分間キャッシュ
async def get_bars():
    pass
```

---

## デプロイ

### 推奨環境
- **Render**: 無料プランあり、自動デプロイ対応
- **Railway**: PostgreSQL統合、簡単デプロイ
- **Google Cloud Run**: スケーラブル、従量課金

### 環境変数
```bash
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_KEY=[service-role-key]
SUPABASE_JWT_SECRET=[jwt-secret]
ENVIRONMENT=production
CORS_ORIGINS=https://bar-search-app.vercel.app
```

---

## OpenAPI仕様書

詳細なAPI仕様は `api_specification.yaml` を参照してください。

Swagger UIで閲覧:
```
http://localhost:8000/docs
```

ReDocで閲覧:
```
http://localhost:8000/redoc
```
