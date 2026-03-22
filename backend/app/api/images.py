"""画像アップロードAPI"""

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.core.config import settings
from app.core.storage import StorageService
from app.dependencies.auth import get_current_user_id
from app.schemas.image import ImageDeleteRequest, ImageDeleteResponse, ImageUploadResponse

router = APIRouter()


# 許可する画像形式
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/upload/bar/{bar_id}", response_model=ImageUploadResponse)
async def upload_bar_image(
    bar_id: str,
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
) -> ImageUploadResponse:
    """
    バーの画像をアップロード

    - **bar_id**: バーのID
    - **file**: アップロードする画像ファイル
    """
    # Content-Typeのチェック
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file.content_type}. "
            f"Allowed types: {', '.join(ALLOWED_CONTENT_TYPES)}",
        )

    # ファイルサイズのチェック
    file_data = await file.read()
    if len(file_data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum allowed size of {MAX_FILE_SIZE} bytes",
        )

    # ファイル名の生成
    timestamp = int(datetime.now().timestamp())
    file_ext = file.filename.split(".")[-1] if file.filename else "jpg"
    random_str = str(uuid.uuid4())[:8]
    filename = f"{timestamp}_{random_str}.{file_ext}"
    file_path = f"{bar_id}/{filename}"

    # ストレージにアップロード
    storage = StorageService()
    try:
        url = await storage.upload_file(
            bucket="bar-images",
            path=file_path,
            file_data=file_data,
            content_type=file.content_type,
        )
        return ImageUploadResponse(url=url, path=file_path)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}",
        ) from e


@router.post("/upload/review/{review_id}", response_model=ImageUploadResponse)
async def upload_review_image(
    review_id: str,
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
) -> ImageUploadResponse:
    """
    レビューの画像をアップロード

    - **review_id**: レビューのID
    - **file**: アップロードする画像ファイル
    """
    # Content-Typeのチェック
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file.content_type}",
        )

    # ファイルサイズのチェック（レビュー画像は5MBまで）
    max_size = 5 * 1024 * 1024  # 5MB
    file_data = await file.read()
    if len(file_data) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum allowed size of {max_size} bytes",
        )

    # ファイル名の生成
    timestamp = int(datetime.now().timestamp())
    file_ext = file.filename.split(".")[-1] if file.filename else "jpg"
    filename = f"{review_id}_{timestamp}.{file_ext}"
    file_path = f"{user_id}/{filename}"

    # ストレージにアップロード
    storage = StorageService()
    try:
        url = await storage.upload_file(
            bucket="review-images",
            path=file_path,
            file_data=file_data,
            content_type=file.content_type,
        )
        return ImageUploadResponse(url=url, path=file_path)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}",
        ) from e


@router.post("/upload/avatar", response_model=ImageUploadResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
) -> ImageUploadResponse:
    """
    ユーザーのアバター画像をアップロード

    - **file**: アップロードする画像ファイル
    """
    # Supabase設定のチェック
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Storage is not configured. Set SUPABASE_URL and SUPABASE_KEY (service_role key).",
        )

    # Content-Typeのチェック
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file.content_type}",
        )

    # ファイルサイズのチェック（アバターは2MBまで）
    max_size = 2 * 1024 * 1024  # 2MB
    file_data = await file.read()
    if len(file_data) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum allowed size of {max_size} bytes",
        )

    # ファイル名の生成（アバターは上書き）
    file_ext = file.filename.split(".")[-1] if file.filename else "jpg"
    filename = f"avatar.{file_ext}"
    file_path = f"{user_id}/{filename}"

    # ストレージにアップロード（アバターは同じパスで上書きするため upsert=True）
    storage = StorageService()
    try:
        url = await storage.upload_file(
            bucket="avatars",
            path=file_path,
            file_data=file_data,
            content_type=file.content_type,
            upsert=True,
        )
        return ImageUploadResponse(url=url, path=file_path)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}",
        ) from e


@router.delete("/delete", response_model=ImageDeleteResponse)
async def delete_image(
    request: ImageDeleteRequest,
    user_id: str = Depends(get_current_user_id),
) -> ImageDeleteResponse:
    """
    画像を削除

    - **path**: 削除する画像のパス
    """
    # パスからバケット名を推測（実装例）
    # 本番環境では、より厳密な権限チェックが必要
    bucket = "bar-images"  # デフォルト
    if "review" in request.path:
        bucket = "review-images"
    elif "avatar" in request.path:
        bucket = "avatars"

    # ユーザーIDがパスに含まれているかチェック（セキュリティ）
    if user_id not in request.path and bucket != "bar-images":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this image",
        )

    storage = StorageService()
    try:
        await storage.delete_file(bucket=bucket, path=request.path)
        return ImageDeleteResponse(message="Image deleted successfully")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete image: {str(e)}",
        ) from e
