"""共通スキーマ"""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class BaseSchema(BaseModel):
    """全てのスキーマの基底クラス"""

    model_config = ConfigDict(from_attributes=True)


class ErrorResponse(BaseModel):
    """エラーレスポンス"""

    error: str
    message: str
    details: dict[str, Any] | None = None


class MessageResponse(BaseModel):
    """汎用メッセージレスポンス"""

    message: str


class StatusResponse(BaseModel):
    """汎用ステータスレスポンス"""

    status: str


class TimestampMixin(BaseModel):
    """タイムスタンプミックスイン"""

    created_at: datetime
    updated_at: datetime
