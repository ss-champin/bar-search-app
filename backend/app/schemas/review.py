"""レビュースキーマ"""

from uuid import UUID

from pydantic import Field

from app.schemas.base import BaseSchema, TimestampMixin


class ReviewBase(BaseSchema):
    """レビュー基底スキーマ"""

    rating: int = Field(..., ge=1, le=5)
    comment: str | None = Field(None, max_length=2000)


class ReviewCreate(ReviewBase):
    """レビュー作成"""

    pass


class ReviewUpdate(BaseSchema):
    """レビュー更新"""

    rating: int | None = Field(None, ge=1, le=5)
    comment: str | None = Field(None, max_length=2000)


class ReviewResponse(ReviewBase, TimestampMixin):
    """レビューレスポンス"""

    id: UUID
    bar_id: UUID
    user_id: UUID
    user_nickname: str | None = None
    user_avatar_url: str | None = None


class ReviewWithBar(ReviewResponse):
    """バー情報付きレビュー"""

    bar_name: str
    bar_address: str


class ReviewListResponse(BaseSchema):
    """レビュー一覧レスポンス"""

    reviews: list[ReviewResponse] = Field(..., description="レビュー一覧")
    total: int = Field(..., description="総件数")
    limit: int = Field(..., description="取得件数")
    offset: int = Field(..., description="オフセット")


class ReviewWithBarListResponse(BaseSchema):
    """バー情報付きレビュー一覧レスポンス"""

    reviews: list[ReviewWithBar] = Field(..., description="レビュー一覧")
    total: int = Field(..., description="総件数")
    limit: int = Field(..., description="取得件数")
    offset: int = Field(..., description="オフセット")
