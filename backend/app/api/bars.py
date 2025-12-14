"""バーAPIエンドポイント"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas import BarCreate, BarDetail, BarListResponse, BarUpdate
from app.services import BarService

router = APIRouter()


@router.get("", response_model=BarListResponse)
def get_bars(
    search: str | None = Query(None, description="検索キーワード（店名・住所・説明）"),
    prefecture: str | None = Query(None, description="都道府県で絞り込み"),
    city: str | None = Query(None, description="市区町村で絞り込み"),
    min_rating: float | None = Query(None, ge=0, le=5, description="最低評価"),
    max_rating: float | None = Query(None, ge=0, le=5, description="最高評価"),
    sort_by: str | None = Query(
        None, description="ソート順（rating_desc, rating_asc, created_desc, created_asc）"
    ),
    limit: int = Query(20, ge=1, le=100, description="取得件数"),
    offset: int = Query(0, ge=0, description="オフセット"),
    db: Session = Depends(get_db),
) -> BarListResponse:
    """
    バー一覧を取得（全文検索・フィルタリング対応）

    Args:
        search: 検索キーワード（店名・住所・説明を対象）
        prefecture: 都道府県フィルター（オプション）
        city: 市区町村フィルター（オプション）
        min_rating: 最低評価フィルター（オプション）
        max_rating: 最高評価フィルター（オプション）
        sort_by: ソート順（オプション）
        limit: 取得件数（デフォルト20、最大100）
        offset: オフセット（ページネーション用）
        db: データベースセッション

    Returns:
        BarListResponse: バー一覧レスポンス
    """
    service = BarService(db)
    return service.get_bars(
        search=search,
        prefecture=prefecture,
        city=city,
        min_rating=min_rating,
        max_rating=max_rating,
        sort_by=sort_by,
        limit=limit,
        offset=offset,
    )


@router.get("/{bar_id}", response_model=BarDetail)
def get_bar(
    bar_id: UUID,
    db: Session = Depends(get_db),
) -> BarDetail:
    """
    バー詳細を取得

    Args:
        bar_id: バーID
        db: データベースセッション

    Returns:
        BarDetail: バー詳細レスポンス

    Raises:
        HTTPException: バーが見つからない場合は404
    """
    service = BarService(db)
    bar = service.get_bar_by_id(bar_id=bar_id)

    if not bar:
        raise HTTPException(status_code=404, detail="Bar not found")

    return bar


@router.post("", response_model=BarDetail, status_code=201)
def create_bar(
    bar_data: BarCreate,
    db: Session = Depends(get_db),
) -> BarDetail:
    """
    バーを作成（管理者のみ）

    Args:
        bar_data: バー作成データ
        db: データベースセッション

    Returns:
        BarDetail: 作成されたバー詳細

    Note:
        現在は認証なしで作成可能。本番環境では管理者認証を実装する必要があります。
        TODO: 管理者認証を追加し、created_by を current_user.id に設定
    """
    service = BarService(db)
    # TODO: 管理者認証後、created_by に current_user.id を渡す
    return service.create_bar(bar_data=bar_data, created_by="admin")


@router.put("/{bar_id}", response_model=BarDetail)
def update_bar(
    bar_id: UUID,
    bar_data: BarUpdate,
    db: Session = Depends(get_db),
) -> BarDetail:
    """
    バーを更新（管理者のみ）

    Args:
        bar_id: バーID
        bar_data: バー更新データ
        db: データベースセッション

    Returns:
        BarDetail: 更新されたバー詳細

    Raises:
        HTTPException: バーが見つからない場合は404

    Note:
        現在は認証なしで更新可能。本番環境では管理者認証を実装する必要があります。
    """
    service = BarService(db)
    bar = service.update_bar(bar_id=bar_id, bar_data=bar_data)

    if not bar:
        raise HTTPException(status_code=404, detail="Bar not found")

    return bar


@router.delete("/{bar_id}", status_code=204)
def delete_bar(
    bar_id: UUID,
    db: Session = Depends(get_db),
) -> None:
    """
    バーを削除（管理者のみ）

    Args:
        bar_id: バーID
        db: データベースセッション

    Raises:
        HTTPException: バーが見つからない場合は404

    Note:
        現在は認証なしで削除可能。本番環境では管理者認証を実装する必要があります。
        カスケード削除により、関連するレビューとお気に入りも削除されます。
    """
    service = BarService(db)
    success = service.delete_bar(bar_id=bar_id)

    if not success:
        raise HTTPException(status_code=404, detail="Bar not found")
