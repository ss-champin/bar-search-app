"""レビューAPIエンドポイント"""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user_id
from app.schemas import ReviewCreate, ReviewListResponse, ReviewResponse, ReviewUpdate
from app.services import ReviewService

# バー関連のレビューエンドポイント用ルーター (/api/bars/{bar_id}/reviews)
bar_reviews_router = APIRouter()

# 個別レビュー操作用ルーター (/api/reviews/{review_id})
reviews_router = APIRouter()


@bar_reviews_router.get("/{bar_id}/reviews", response_model=ReviewListResponse)
def get_bar_reviews(
    bar_id: UUID,
    limit: int = Query(20, ge=1, le=100, description="取得件数"),
    offset: int = Query(0, ge=0, description="オフセット"),
    db: Session = Depends(get_db),
) -> ReviewListResponse:
    """
    特定のバーのレビュー一覧を取得

    Args:
        bar_id: バーID
        limit: 取得件数（デフォルト20、最大100）
        offset: オフセット（ページネーション用）
        db: データベースセッション

    Returns:
        dict: レビュー一覧レスポンス（reviews, total, limit, offset）

    Raises:
        HTTPException: バーが見つからない場合は404
    """
    service = ReviewService(db)

    try:
        return service.get_bar_reviews(bar_id=bar_id, limit=limit, offset=offset)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@bar_reviews_router.post("/{bar_id}/reviews", response_model=ReviewResponse, status_code=201)
def create_review(
    bar_id: UUID,
    current_user_id: Annotated[str, Depends(get_current_user_id)],
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
) -> ReviewResponse:
    """
    レビューを投稿

    Args:
        bar_id: バーID
        current_user_id: 認証されたユーザーID
        review_data: レビュー投稿データ
        db: データベースセッション

    Returns:
        ReviewResponse: 投稿されたレビュー

    Raises:
        HTTPException: バーが見つからない場合は404
    """
    service = ReviewService(db)

    try:
        return service.create_review(bar_id=bar_id, user_id=current_user_id, review_data=review_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@reviews_router.put("/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: UUID,
    current_user_id: Annotated[str, Depends(get_current_user_id)],
    review_data: ReviewUpdate,
    db: Session = Depends(get_db),
) -> ReviewResponse:
    """
    レビューを更新

    Args:
        review_id: レビューID
        current_user_id: 認証されたユーザーID
        review_data: レビュー更新データ
        db: データベースセッション

    Returns:
        ReviewResponse: 更新されたレビュー

    Raises:
        HTTPException: レビューが見つからない場合は404、権限がない場合は403
    """
    service = ReviewService(db)

    try:
        result = service.update_review(review_id=review_id, user_id=current_user_id, review_data=review_data)
        if result is None:
            raise HTTPException(status_code=404, detail="Review not found")
        return result
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e)) from e


@reviews_router.delete("/{review_id}", status_code=204)
def delete_review(
    review_id: UUID,
    current_user_id: Annotated[str, Depends(get_current_user_id)],
    db: Session = Depends(get_db),
) -> None:
    """
    レビューを削除

    Args:
        review_id: レビューID
        current_user_id: 認証されたユーザーID
        db: データベースセッション

    Raises:
        HTTPException: レビューが見つからない場合は404、権限がない場合は403
    """
    service = ReviewService(db)

    try:
        success = service.delete_review(review_id=review_id, user_id=current_user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Review not found")
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e)) from e
