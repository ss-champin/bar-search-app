"""お気に入りドメインのサービス層"""

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.models.bar import Bar
from app.models.favorite import Favorite
from app.models.review import Review
from app.schemas.bar import BarSummary
from app.schemas.favorite import FavoriteCreate, FavoriteListResponse, FavoriteResponse


class FavoriteService:
    """お気に入りに関するビジネスロジックを提供するサービスクラス"""

    def __init__(self, db: Session) -> None:
        """
        サービスの初期化

        Args:
            db: データベースセッション
        """
        self.db = db

    def get_favorites(
        self,
        user_id: str,
        limit: int = 20,
        offset: int = 0,
    ) -> FavoriteListResponse:
        """
        ユーザーのお気に入り一覧を取得

        Args:
            user_id: ユーザーID
            limit: 取得件数
            offset: オフセット

        Returns:
            FavoriteListResponse: お気に入り一覧レスポンス
        """
        # 総件数を取得
        count_query = select(func.count()).select_from(Favorite).where(Favorite.user_id == user_id)
        total = self.db.execute(count_query).scalar_one()

        # お気に入り一覧を取得（バー情報も含む）
        favorites_query = (
            select(Favorite)
            .options(joinedload(Favorite.bar))
            .where(Favorite.user_id == user_id)
            .order_by(Favorite.created_at.desc())
            .offset(offset)
            .limit(limit)
        )

        favorites = self.db.execute(favorites_query).scalars().all()

        # FavoriteResponseオブジェクトに変換
        favorite_responses = []
        for favorite in favorites:
            # バー情報を取得（レビュー情報も含む）
            # joinedloadで既に取得されている可能性があるが、念のため再取得
            bar = favorite.bar if hasattr(favorite, "bar") and favorite.bar else None
            if not bar:
                bar_query = select(Bar).where(Bar.id == favorite.bar_id)
                bar = self.db.execute(bar_query).scalar_one_or_none()

            if bar:
                # 平均評価とレビュー数を取得
                rating_query = select(
                    func.coalesce(func.round(func.avg(Review.rating), 1), 0).label(
                        "average_rating"
                    ),
                    func.count(Review.id).label("review_count"),
                ).where(Review.bar_id == bar.id)

                result = self.db.execute(rating_query).first()
                average_rating, review_count = result if result else (0.0, 0)

                bar_summary = BarSummary(
                    id=bar.id,
                    name=bar.name,
                    prefecture=bar.prefecture,
                    city=bar.city,
                    address=bar.address,
                    image_urls=bar.image_urls or [],
                    average_rating=float(average_rating),
                    review_count=int(review_count),
                )

                favorite_responses.append(
                    FavoriteResponse(
                        id=favorite.id,
                        bar_id=favorite.bar_id,
                        user_id=favorite.user_id,
                        bar=bar_summary,
                        created_at=favorite.created_at,
                    )
                )
            else:
                # バーが見つからない場合でもお気に入りは返す（バーが削除された場合など）
                favorite_responses.append(
                    FavoriteResponse(
                        id=favorite.id,
                        bar_id=favorite.bar_id,
                        user_id=favorite.user_id,
                        bar=None,
                        created_at=favorite.created_at,
                    )
                )

        return FavoriteListResponse(
            favorites=favorite_responses,
            total=total,
            limit=limit,
            offset=offset,
        )

    def create_favorite(
        self,
        user_id: str,
        favorite_data: FavoriteCreate,
    ) -> FavoriteResponse:
        """
        お気に入りを追加

        Args:
            user_id: ユーザーID
            favorite_data: お気に入り追加データ

        Returns:
            FavoriteResponse: 追加されたお気に入り

        Raises:
            ValueError: バーが見つからない場合
            IntegrityError: 既に登録済みの場合
        """
        # bar_idはPydanticによって既にUUID型に変換されている
        bar_id = favorite_data.bar_id

        # バーの存在確認
        bar = self.db.execute(select(Bar).where(Bar.id == bar_id)).scalar_one_or_none()
        if not bar:
            raise ValueError(f"Bar not found: {bar_id}")

        # user_idをUUID型に変換（文字列の場合）
        try:
            user_uuid = UUID(user_id) if isinstance(user_id, str) else user_id
        except (ValueError, AttributeError, TypeError) as e:
            raise ValueError(f"Invalid user_id format: {user_id}") from e

        # 新しいお気に入りを作成
        new_favorite = Favorite(
            bar_id=bar_id,
            user_id=user_uuid,
        )

        try:
            self.db.add(new_favorite)
            self.db.commit()
            self.db.refresh(new_favorite)
        except IntegrityError as e:
            self.db.rollback()
            # 重複エラーの場合はValueErrorとして再raiseして、APIレイヤーで適切に処理
            raise ValueError("Already added to favorites") from e

        # バー情報を取得（レビュー情報も含む）
        rating_query = select(
            func.coalesce(func.round(func.avg(Review.rating), 1), 0).label("average_rating"),
            func.count(Review.id).label("review_count"),
        ).where(Review.bar_id == bar.id)

        result = self.db.execute(rating_query).first()
        average_rating, review_count = result if result else (0.0, 0)

        bar_summary = BarSummary(
            id=bar.id,
            name=bar.name,
            prefecture=bar.prefecture,
            city=bar.city,
            address=bar.address,
            image_urls=bar.image_urls or [],
            average_rating=float(average_rating),
            review_count=int(review_count),
        )

        return FavoriteResponse(
            id=new_favorite.id,
            bar_id=new_favorite.bar_id,
            user_id=new_favorite.user_id,
            bar=bar_summary,
            created_at=new_favorite.created_at,
        )

    def delete_favorite(self, favorite_id: UUID, user_id: str) -> bool:
        """
        お気に入りを削除

        Args:
            favorite_id: お気に入りID
            user_id: ユーザーID（権限チェック用）

        Returns:
            bool: 削除に成功した場合True、存在しない場合False

        Raises:
            PermissionError: ユーザーに権限がない場合
        """
        # user_idをUUID型に変換（文字列の場合）
        try:
            user_uuid = UUID(user_id) if isinstance(user_id, str) else user_id
        except (ValueError, AttributeError, TypeError) as e:
            raise ValueError(f"Invalid user_id format: {user_id}") from e

        # お気に入りを取得
        favorite = self.db.execute(
            select(Favorite).where(Favorite.id == favorite_id)
        ).scalar_one_or_none()

        if not favorite:
            return False

        # 権限チェック：自分のお気に入りのみ削除可能
        if favorite.user_id != user_uuid:
            raise PermissionError("Not authorized to delete this favorite")

        self.db.delete(favorite)
        self.db.commit()

        return True
