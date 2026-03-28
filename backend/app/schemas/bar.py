"""バースキーマ"""

from typing import Any
from uuid import UUID

from pydantic import Field

from app.schemas.base import BaseSchema, TimestampMixin


class BarBase(BaseSchema):
    """バー基底スキーマ"""

    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = None
    prefecture: str = Field(..., min_length=1, max_length=10)
    city: str = Field(..., min_length=1, max_length=50)
    address: str = Field(..., min_length=1)
    image_urls: list[str] = Field(default_factory=list, max_length=10)
    opening_hours: dict[str, Any] | None = None
    regular_holiday: str | None = Field(None, max_length=100)
    menu_beer_price: int | None = Field(None, ge=0, le=99_999_999)
    menu_whiskey_price: int | None = Field(None, ge=0, le=99_999_999)
    menu_cocktail_price: int | None = Field(None, ge=0, le=99_999_999)
    phone: str | None = Field(None, max_length=20)
    website: str | None = None


class BarCreate(BarBase):
    """バー作成"""

    pass


class BarUpdate(BaseSchema):
    """バー更新"""

    name: str | None = Field(None, min_length=1, max_length=100)
    description: str | None = None
    prefecture: str | None = Field(None, min_length=1, max_length=10)
    city: str | None = Field(None, min_length=1, max_length=50)
    address: str | None = Field(None, min_length=1)
    image_urls: list[str] | None = Field(None, max_length=10)
    opening_hours: dict[str, Any] | None = None
    regular_holiday: str | None = Field(None, max_length=100)
    menu_beer_price: int | None = Field(None, ge=0, le=99_999_999)
    menu_whiskey_price: int | None = Field(None, ge=0, le=99_999_999)
    menu_cocktail_price: int | None = Field(None, ge=0, le=99_999_999)
    phone: str | None = Field(None, max_length=20)
    website: str | None = None


class BarSummary(BaseSchema):
    """バー一覧用サマリー"""

    id: UUID
    name: str
    prefecture: str
    city: str
    address: str
    image_urls: list[str] = Field(default_factory=list)
    average_rating: float = 0.0
    review_count: int = 0


class BarDetail(BarBase, TimestampMixin):
    """バー詳細"""

    id: UUID
    created_by: UUID | None = None
    average_rating: float = 0.0
    review_count: int = 0


class BarListResponse(BaseSchema):
    """バー一覧レスポンス"""

    bars: list[BarSummary]
    total: int
    limit: int
    offset: int
