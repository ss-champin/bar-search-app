"""レビュードメインのサービス層"""

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.models.bar import Bar
from app.models.profile import Profile
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewListResponse, ReviewResponse, ReviewUpdate


class ReviewService:
    """レビューに関するビジネスロジックを提供するサービスクラス"""

    def __init__(self, db: Session) -> None:
        """
        サービスの初期化

        Args:
            db: データベースセッション
        """
        self.db = db

    def get_bar_reviews(
        self,
        bar_id: UUID,
        limit: int = 20,
        offset: int = 0,
    ) -> ReviewListResponse:
        """
        特定のバーのレビュー一覧を取得

        Args:
            bar_id: バーID
            limit: 取得件数
            offset: オフセット

        Returns:
            ReviewListResponse: レビュー一覧レスポンス

        Raises:
            ValueError: バーが見つからない場合
        """
        # バーの存在確認
        bar = self.db.execute(select(Bar).where(Bar.id == bar_id)).scalar_one_or_none()
        if not bar:
            raise ValueError(f"Bar not found: {bar_id}")

        # 総件数を取得
        count_query = select(func.count()).select_from(Review).where(Review.bar_id == bar_id)
        total = self.db.execute(count_query).scalar_one()

        # レビュー一覧を取得（ユーザー情報も含む）
        reviews_query = (
            select(Review)
            .options(joinedload(Review.user))
            .where(Review.bar_id == bar_id)
            .order_by(Review.created_at.desc())
            .offset(offset)
            .limit(limit)
        )

        reviews = self.db.execute(reviews_query).scalars().all()

        # ReviewResponseオブジェクトに変換
        review_responses = [
            ReviewResponse(
                id=review.id,
                bar_id=review.bar_id,
                user_id=review.user_id,
                user_nickname=review.user.nickname if review.user else "Unknown",
                user_avatar_url=review.user.avatar_url if review.user else None,
                rating=review.rating,
                comment=review.comment,
                created_at=review.created_at,
                updated_at=review.updated_at,
            )
            for review in reviews
        ]

        return ReviewListResponse(
            reviews=review_responses,
            total=total,
            limit=limit,
            offset=offset,
        )

    def create_review(
        self,
        bar_id: UUID,
        user_id: str,
        review_data: ReviewCreate,
    ) -> ReviewResponse:
        """
        レビューを投稿

        Args:
            bar_id: バーID
            user_id: ユーザーID
            review_data: レビュー投稿データ

        Returns:
            ReviewResponse: 投稿されたレビュー

        Raises:
            ValueError: バーが見つからない場合
        """
        # バーの存在確認
        bar = self.db.execute(select(Bar).where(Bar.id == bar_id)).scalar_one_or_none()
        if not bar:
            raise ValueError(f"Bar not found: {bar_id}")

        # user_idをUUID型に変換（文字列の場合）
        try:
            user_uuid = UUID(user_id) if isinstance(user_id, str) else user_id
        except (ValueError, AttributeError, TypeError) as e:
            raise ValueError(f"Invalid user_id format: {user_id}") from e

        # 新しいレビューを作成
        new_review = Review(
            bar_id=bar_id,
            user_id=user_uuid,
            rating=review_data.rating,
            comment=review_data.comment,
        )

        self.db.add(new_review)
        self.db.commit()
        self.db.refresh(new_review)

        # ユーザー情報を取得
        user = self.db.execute(
            select(Profile).where(Profile.user_id == new_review.user_id)
        ).scalar_one_or_none()

        return ReviewResponse(
            id=new_review.id,
            bar_id=new_review.bar_id,
            user_id=new_review.user_id,
            user_nickname=user.nickname if user else "Unknown",
            user_avatar_url=user.avatar_url if user else None,
            rating=new_review.rating,
            comment=new_review.comment,
            created_at=new_review.created_at,
            updated_at=new_review.updated_at,
        )

    def update_review(
        self,
        review_id: UUID,
        user_id: str,
        review_data: ReviewUpdate,
    ) -> ReviewResponse | None:
        """
        レビューを更新

        Args:
            review_id: レビューID
            user_id: ユーザーID（権限チェック用）
            review_data: レビュー更新データ

        Returns:
            ReviewResponse | None: 更新されたレビュー、存在しない場合はNone

        Raises:
            PermissionError: ユーザーに権限がない場合
        """
        # レビューを取得
        review = self.db.execute(select(Review).where(Review.id == review_id)).scalar_one_or_none()

        if not review:
            return None

        # user_idをUUID型に変換（文字列の場合）
        try:
            user_uuid = UUID(user_id) if isinstance(user_id, str) else user_id
        except (ValueError, AttributeError, TypeError) as e:
            raise ValueError(f"Invalid user_id format: {user_id}") from e

        # 権限チェック：自分のレビューのみ更新可能
        if review.user_id != user_uuid:
            raise PermissionError("Not authorized to update this review")

        # フィールドを更新（Noneでないもののみ）
        update_data = review_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(review, field, value)

        self.db.commit()
        self.db.refresh(review)

        # ユーザー情報を取得
        user = self.db.execute(
            select(Profile).where(Profile.user_id == review.user_id)
        ).scalar_one_or_none()

        return ReviewResponse(
            id=review.id,
            bar_id=review.bar_id,
            user_id=review.user_id,
            user_nickname=user.nickname if user else "Unknown",
            user_avatar_url=user.avatar_url if user else None,
            rating=review.rating,
            comment=review.comment,
            created_at=review.created_at,
            updated_at=review.updated_at,
        )

    def delete_review(self, review_id: UUID, user_id: str) -> bool:
        """
        レビューを削除

        Args:
            review_id: レビューID
            user_id: ユーザーID（権限チェック用）

        Returns:
            bool: 削除に成功した場合True、存在しない場合False

        Raises:
            PermissionError: ユーザーに権限がない場合
        """
        # レビューを取得
        review = self.db.execute(select(Review).where(Review.id == review_id)).scalar_one_or_none()

        if not review:
            return False

        # user_idをUUID型に変換（文字列の場合）
        try:
            user_uuid = UUID(user_id) if isinstance(user_id, str) else user_id
        except (ValueError, AttributeError, TypeError) as e:
            raise ValueError(f"Invalid user_id format: {user_id}") from e

        # 権限チェック：自分のレビューのみ削除可能
        if review.user_id != user_uuid:
            raise PermissionError("Not authorized to delete this review")

        self.db.delete(review)
        self.db.commit()

        return True
