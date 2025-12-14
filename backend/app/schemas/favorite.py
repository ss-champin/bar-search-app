"""お気に入りスキーマ"""

from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.schemas.bar import BarSummary
from app.schemas.base import BaseSchema


class FavoriteCreate(BaseSchema):
    """お気に入り作成"""

    bar_id: UUID = Field(..., description="バーID")


class FavoriteResponse(BaseSchema):
    """お気に入りレスポンス"""

    id: UUID
    bar_id: UUID
    user_id: UUID
    bar: BarSummary | None = None
    created_at: datetime


class FavoriteListResponse(BaseSchema):
    """お気に入り一覧レスポンス"""

    favorites: list[FavoriteResponse] = Field(..., description="お気に入り一覧")
    total: int = Field(..., description="総件数")
    limit: int = Field(..., description="取得件数")
    offset: int = Field(..., description="オフセット")
