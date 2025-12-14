"""お気に入りAPIエンドポイント"""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user_id
from app.schemas import FavoriteCreate, FavoriteListResponse, FavoriteResponse
from app.services import FavoriteService

router = APIRouter()


@router.get("", response_model=FavoriteListResponse)
def get_favorites(
    current_user_id: Annotated[str, Depends(get_current_user_id)],
    limit: int = Query(20, ge=1, le=100, description="取得件数"),
    offset: int = Query(0, ge=0, description="オフセット"),
    db: Session = Depends(get_db),
) -> FavoriteListResponse:
    """
    お気に入り一覧を取得

    Args:
        current_user_id: 認証されたユーザーID
        limit: 取得件数（デフォルト20、最大100）
        offset: オフセット（ページネーション用）
        db: データベースセッション

    Returns:
        FavoriteListResponse: お気に入り一覧レスポンス（favorites, total, limit, offset）
    """
    service = FavoriteService(db)
    print("⭐", service.get_favorites(user_id=current_user_id, limit=limit, offset=offset))
    return service.get_favorites(user_id=current_user_id, limit=limit, offset=offset)


@router.post("", response_model=FavoriteResponse, status_code=201)
def create_favorite(
    current_user_id: Annotated[str, Depends(get_current_user_id)],
    favorite_data: FavoriteCreate,
    db: Session = Depends(get_db),
) -> FavoriteResponse:
    """
    お気に入りを追加

    Args:
        current_user_id: 認証されたユーザーID
        favorite_data: お気に入り追加データ
        db: データベースセッション

    Returns:
        FavoriteResponse: 追加されたお気に入り

    Raises:
        HTTPException: バーが見つからない場合は404、既に登録済みの場合は409
    """
    service = FavoriteService(db)

    try:
        return service.create_favorite(user_id=current_user_id, favorite_data=favorite_data)
    except ValueError as e:
        error_message = str(e)
        # バーが見つからない場合
        if "Bar not found" in error_message:
            raise HTTPException(status_code=404, detail=error_message) from e
        # UUID形式が無効な場合
        if "Invalid" in error_message:
            raise HTTPException(status_code=400, detail=error_message) from e
        # その他のValueError
        raise HTTPException(status_code=400, detail=error_message) from e
    except IntegrityError:
        raise HTTPException(status_code=409, detail="Already added to favorites") from None


@router.delete("/{favorite_id}", status_code=204)
def delete_favorite(
    favorite_id: UUID,
    current_user_id: Annotated[str, Depends(get_current_user_id)],
    db: Session = Depends(get_db),
) -> None:
    """
    お気に入りを削除

    Args:
        favorite_id: お気に入りID
        current_user_id: 認証されたユーザーID
        db: データベースセッション

    Raises:
        HTTPException: お気に入りが見つからない場合は404、権限がない場合は403
    """
    service = FavoriteService(db)

    try:
        success = service.delete_favorite(favorite_id=favorite_id, user_id=current_user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Favorite not found")
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e)) from e
