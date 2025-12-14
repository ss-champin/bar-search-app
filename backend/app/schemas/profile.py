"""プロフィールスキーマ"""

from uuid import UUID

from pydantic import EmailStr, Field

from app.schemas.base import BaseSchema, TimestampMixin


class ProfileBase(BaseSchema):
    """プロフィール基底スキーマ"""

    email: EmailStr
    nickname: str = Field(..., min_length=1, max_length=50)
    age: int = Field(..., ge=1, le=150)
    avatar_url: str | None = None


class ProfileResponse(ProfileBase, TimestampMixin):
    """プロフィールレスポンス"""

    user_id: UUID


class ProfileCreate(BaseSchema):
    """プロフィール作成"""

    nickname: str = Field(..., min_length=1, max_length=50)
    age: int = Field(..., ge=1, le=150)
    avatar_url: str | None = None


class ProfileUpdate(BaseSchema):
    """プロフィール更新"""

    email: EmailStr | None = None
    nickname: str | None = Field(None, min_length=1, max_length=50)
    age: int | None = Field(None, ge=1, le=150)
    avatar_url: str | None = None
