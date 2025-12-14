"""画像関連のスキーマ"""

from pydantic import BaseModel, Field


class ImageUploadResponse(BaseModel):
    """画像アップロードレスポンス"""

    url: str = Field(..., description="アップロードされた画像のURL")
    path: str = Field(..., description="ストレージ内のパス")


class ImageDeleteRequest(BaseModel):
    """画像削除リクエスト"""

    path: str = Field(..., description="削除する画像のパス")


class ImageDeleteResponse(BaseModel):
    """画像削除レスポンス"""

    message: str = Field(..., description="削除結果のメッセージ")
