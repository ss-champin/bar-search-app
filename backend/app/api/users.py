"""ユーザープロフィールAPIエンドポイント"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user_email, get_current_user_id
from app.schemas import ProfileCreate, ProfileResponse, ProfileUpdate, ReviewWithBarListResponse
from app.services import UserService

router = APIRouter()


@router.post("/me", response_model=ProfileResponse, status_code=201)
def create_my_profile(
    current_user_id: Annotated[str, Depends(get_current_user_id)],
    current_user_email: Annotated[str, Depends(get_current_user_email)],
    profile_data: ProfileCreate,
    db: Session = Depends(get_db),
) -> ProfileResponse:
    """
    自分のプロフィールを作成（新規ユーザー用）

    Args:
        current_user_id: 認証されたユーザーID
        current_user_email: 認証されたユーザーのメールアドレス
        profile_data: プロフィール作成データ
        db: データベースセッション

    Returns:
        ProfileResponse: 作成されたプロフィール情報

    Raises:
        HTTPException: プロフィールが既に存在する場合は409
    """
    service = UserService(db)

    # 既存のプロフィールをチェック
    existing_profile = service.get_profile(user_id=current_user_id)
    if existing_profile:
        raise HTTPException(
            status_code=409,
            detail="Profile already exists. Use PUT /api/users/me to update.",
        )

    # プロフィールを作成
    return service.create_profile(
        user_id=current_user_id,
        email=current_user_email,
        profile_data=profile_data,
    )


@router.get("/me", response_model=ProfileResponse)
def get_my_profile(
    current_user_id: Annotated[str, Depends(get_current_user_id)],
    db: Session = Depends(get_db),
) -> ProfileResponse:
    """
    自分のプロフィールを取得

    Args:
        current_user_id: 認証されたユーザーID
        db: データベースセッション

    Returns:
        ProfileResponse: プロフィール情報

    Raises:
        HTTPException: プロフィールが見つからない場合は404
    """
    service = UserService(db)
    profile = service.get_profile(user_id=current_user_id)

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found. Please create a profile first.",
        )

    return profile


@router.put("/me", response_model=ProfileResponse)
def update_my_profile(
    current_user_id: Annotated[str, Depends(get_current_user_id)],
    profile_data: ProfileUpdate,
    db: Session = Depends(get_db),
) -> ProfileResponse:
    """
    自分のプロフィールを更新

    Args:
        current_user_id: 認証されたユーザーID
        profile_data: プロフィール更新データ
        db: データベースセッション

    Returns:
        ProfileResponse: 更新されたプロフィール情報

    Raises:
        HTTPException: プロフィールが見つからない場合は404
    """
    service = UserService(db)
    profile = service.update_profile(user_id=current_user_id, profile_data=profile_data)

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found. Please create a profile first.",
        )

    return profile


@router.get("/me/reviews", response_model=ReviewWithBarListResponse)
def get_my_reviews(
    current_user_id: Annotated[str, Depends(get_current_user_id)],
    limit: int = Query(20, ge=1, le=100, description="取得件数"),
    offset: int = Query(0, ge=0, description="オフセット"),
    db: Session = Depends(get_db),
) -> ReviewWithBarListResponse:
    """
    自分が投稿したレビュー一覧を取得

    Args:
        current_user_id: 認証されたユーザーID
        limit: 取得件数（デフォルト20、最大100）
        offset: オフセット（ページネーション用）
        db: データベースセッション

    Returns:
        ReviewWithBarListResponse: レビュー一覧レスポンス（reviews, total, limit, offset）
    """
    service = UserService(db)
    return service.get_user_reviews(user_id=current_user_id, limit=limit, offset=offset)
