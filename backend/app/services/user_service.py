"""ユーザードメインのサービス層"""

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.models.profile import Profile
from app.models.review import Review
from app.schemas.profile import ProfileCreate, ProfileResponse, ProfileUpdate
from app.schemas.review import ReviewWithBar, ReviewWithBarListResponse


class UserService:
    """ユーザーに関するビジネスロジックを提供するサービスクラス"""

    def __init__(self, db: Session) -> None:
        """
        サービスの初期化

        Args:
            db: データベースセッション
        """
        self.db = db

    def create_profile(
        self,
        user_id: str,
        email: str,
        profile_data: ProfileCreate,
    ) -> ProfileResponse:
        """
        新しいユーザープロフィールを作成

        Args:
            user_id: ユーザーID（auth.users.idから取得）
            email: メールアドレス（auth.users.emailから取得）
            profile_data: プロフィール作成データ

        Returns:
            ProfileResponse: 作成されたプロフィール情報
        """
        new_profile = Profile(
            user_id=user_id,
            email=email,
            nickname=profile_data.nickname,
            avatar_url=profile_data.avatar_url,
        )

        self.db.add(new_profile)
        self.db.commit()
        self.db.refresh(new_profile)

        return ProfileResponse(
            user_id=new_profile.user_id,
            email=new_profile.email,
            nickname=new_profile.nickname,
            avatar_url=new_profile.avatar_url,
            created_at=new_profile.created_at,
            updated_at=new_profile.updated_at,
        )

    def get_profile(self, user_id: str) -> ProfileResponse | None:
        """
        ユーザープロフィールを取得

        Args:
            user_id: ユーザーID

        Returns:
            ProfileResponse | None: プロフィール情報、存在しない場合はNone
        """
        profile = self.db.execute(
            select(Profile).where(Profile.user_id == user_id)
        ).scalar_one_or_none()

        if not profile:
            return None

        return ProfileResponse(
            user_id=profile.user_id,
            email=profile.email,
            nickname=profile.nickname,
            avatar_url=profile.avatar_url,
            created_at=profile.created_at,
            updated_at=profile.updated_at,
        )

    def update_profile(
        self,
        user_id: str,
        profile_data: ProfileUpdate,
    ) -> ProfileResponse | None:
        """
        ユーザープロフィールを更新

        Args:
            user_id: ユーザーID
            profile_data: プロフィール更新データ

        Returns:
            ProfileResponse | None: 更新されたプロフィール情報、存在しない場合はNone
        """
        profile = self.db.execute(
            select(Profile).where(Profile.user_id == user_id)
        ).scalar_one_or_none()

        if not profile:
            return None

        # フィールドを更新（Noneでないもののみ）
        update_data = profile_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(profile, field, value)

        self.db.commit()
        self.db.refresh(profile)

        return ProfileResponse(
            user_id=profile.user_id,
            email=profile.email,
            nickname=profile.nickname,
            avatar_url=profile.avatar_url,
            created_at=profile.created_at,
            updated_at=profile.updated_at,
        )

    def get_user_reviews(
        self,
        user_id: str,
        limit: int = 20,
        offset: int = 0,
    ) -> ReviewWithBarListResponse:
        """
        ユーザーが投稿したレビュー一覧を取得

        Args:
            user_id: ユーザーID
            limit: 取得件数
            offset: オフセット

        Returns:
            ReviewWithBarListResponse: レビュー一覧レスポンス
        """
        # 総件数を取得
        count_query = select(func.count()).select_from(Review).where(Review.user_id == user_id)
        total = self.db.execute(count_query).scalar_one()

        # レビュー一覧を取得（バー情報も含む）
        reviews_query = (
            select(Review)
            .options(joinedload(Review.bar), joinedload(Review.user))
            .where(Review.user_id == user_id)
            .order_by(Review.created_at.desc())
            .offset(offset)
            .limit(limit)
        )

        reviews = self.db.execute(reviews_query).scalars().all()

        # ReviewWithBarオブジェクトに変換
        review_responses = [
            ReviewWithBar(
                id=review.id,
                bar_id=review.bar_id,
                user_id=review.user_id,
                user_nickname=review.user.nickname if review.user else "Unknown",
                user_avatar_url=review.user.avatar_url if review.user else None,
                rating=review.rating,
                comment=review.comment,
                created_at=review.created_at,
                updated_at=review.updated_at,
                bar_name=review.bar.name if review.bar else "Unknown",
                bar_address=(
                    f"{review.bar.prefecture} {review.bar.address}".strip()
                    if review.bar
                    else "Unknown"
                ),
            )
            for review in reviews
        ]

        return ReviewWithBarListResponse(
            reviews=review_responses,
            total=total,
            limit=limit,
            offset=offset,
        )
