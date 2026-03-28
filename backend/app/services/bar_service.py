"""バードメインのサービス層"""

from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.bar import Bar
from app.models.review import Review
from app.schemas.bar import BarCreate, BarDetail, BarListResponse, BarSummary, BarUpdate


class BarService:
    """バーに関するビジネスロジックを提供するサービスクラス"""

    def __init__(self, db: Session) -> None:
        """
        サービスの初期化

        Args:
            db: データベースセッション
        """
        self.db = db

    def get_bars(
        self,
        search: str | None = None,
        prefecture: str | None = None,
        city: str | None = None,
        min_rating: float | None = None,
        max_rating: float | None = None,
        sort_by: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> BarListResponse:
        """
        バー一覧を取得（全文検索・フィルタリング対応）

        Args:
            search: 検索キーワード（店名・住所・説明を対象）
            prefecture: 都道府県でフィルタ（オプション）
            city: 市区町村でフィルタ（オプション）
            min_rating: 最低評価フィルター（オプション）
            max_rating: 最高評価フィルター（オプション）
            sort_by: ソート順（rating_desc, rating_asc, created_desc, created_asc）
            limit: 取得件数
            offset: オフセット

        Returns:
            BarListResponse: バー一覧レスポンス
        """
        # サブクエリ: 各バーの平均評価とレビュー数を計算
        rating_subquery = (
            select(
                Review.bar_id,
                func.coalesce(func.round(func.avg(Review.rating), 1), 0).label("avg_rating"),
                func.count(Review.id).label("review_count"),
            )
            .group_by(Review.bar_id)
            .subquery()
        )

        # メインクエリを構築
        query = select(Bar, rating_subquery.c.avg_rating, rating_subquery.c.review_count).outerjoin(
            rating_subquery, Bar.id == rating_subquery.c.bar_id
        )

        # キーワード検索: 全文検索（simple）＋ 店名・都道府県・市区町村・住所・説明の部分一致
        # 日本語は simple トークナイザでは語が切れないため、ILIKE を併用する
        if search:
            pattern = f"%{search}%"
            search_vector = func.to_tsvector(
                "simple",
                func.concat(
                    func.coalesce(Bar.name, ""),
                    " ",
                    func.coalesce(Bar.prefecture, ""),
                    " ",
                    func.coalesce(Bar.city, ""),
                    " ",
                    func.coalesce(Bar.address, ""),
                    " ",
                    func.coalesce(Bar.description, ""),
                ),
            )
            search_query = func.plainto_tsquery("simple", search)
            ts_match = search_vector.op("@@")(search_query)
            ilike_match = or_(
                Bar.name.ilike(pattern),
                Bar.prefecture.ilike(pattern),
                Bar.city.ilike(pattern),
                Bar.address.ilike(pattern),
                Bar.description.ilike(pattern),
            )
            query = query.where(or_(ts_match, ilike_match))

        # 地域フィルター
        if prefecture:
            query = query.where(Bar.prefecture == prefecture)
        if city:
            query = query.where(Bar.city == city)

        # 評価フィルター
        if min_rating is not None:
            query = query.where(func.coalesce(rating_subquery.c.avg_rating, 0) >= min_rating)
        if max_rating is not None:
            query = query.where(func.coalesce(rating_subquery.c.avg_rating, 0) <= max_rating)

        # 総件数を取得
        count_query = select(func.count()).select_from(query.subquery())
        total = self.db.execute(count_query).scalar_one()

        # ソート順を適用
        if sort_by == "rating_desc":
            query = query.order_by(func.coalesce(rating_subquery.c.avg_rating, 0).desc())
        elif sort_by == "rating_asc":
            query = query.order_by(func.coalesce(rating_subquery.c.avg_rating, 0).asc())
        elif sort_by == "created_asc":
            query = query.order_by(Bar.created_at.asc())
        else:  # デフォルト: created_desc
            query = query.order_by(Bar.created_at.desc())

        # バー一覧を取得
        bars_query = query.offset(offset).limit(limit)
        results = self.db.execute(bars_query).all()

        # BarSummaryに変換
        bar_summaries = []
        for bar, avg_rating, review_count in results:
            bar_summaries.append(
                BarSummary(
                    id=bar.id,
                    name=bar.name,
                    prefecture=bar.prefecture,
                    city=bar.city,
                    address=bar.address,
                    image_urls=bar.image_urls or [],
                    average_rating=float(avg_rating or 0),
                    review_count=int(review_count or 0),
                )
            )

        return BarListResponse(
            bars=bar_summaries,
            total=total,
            limit=limit,
            offset=offset,
        )

    def get_bar_by_id(self, bar_id: UUID) -> BarDetail | None:
        """
        バーIDでバー詳細を取得

        Args:
            bar_id: バーID

        Returns:
            BarDetail | None: バー詳細、存在しない場合はNone
        """
        bar = self.db.execute(select(Bar).where(Bar.id == bar_id)).scalar_one_or_none()

        if not bar:
            return None

        # 平均評価とレビュー数を取得
        rating_query = select(
            func.coalesce(func.round(func.avg(Review.rating), 1), 0).label("average_rating"),
            func.count(Review.id).label("review_count"),
        ).where(Review.bar_id == bar.id)

        result = self.db.execute(rating_query).first()
        average_rating, review_count = result if result else (0.0, 0)

        return BarDetail(
            id=bar.id,
            name=bar.name,
            prefecture=bar.prefecture,
            city=bar.city,
            address=bar.address,
            description=bar.description,
            opening_hours=bar.opening_hours,
            regular_holiday=bar.regular_holiday,
            menu_beer_price=bar.menu_beer_price,
            menu_whiskey_price=bar.menu_whiskey_price,
            menu_cocktail_price=bar.menu_cocktail_price,
            phone=bar.phone,
            website=bar.website,
            image_urls=bar.image_urls or [],
            average_rating=float(average_rating),
            review_count=int(review_count),
            created_by=bar.created_by,
            created_at=bar.created_at,
            updated_at=bar.updated_at,
        )

    def create_bar(self, bar_data: BarCreate, created_by: str) -> BarDetail:
        """
        新しいバーを作成

        Args:
            bar_data: バー作成データ
            created_by: 作成者のユーザーID

        Returns:
            BarDetail: 作成されたバーの詳細
        """
        new_bar = Bar(
            name=bar_data.name,
            prefecture=bar_data.prefecture,
            city=bar_data.city,
            address=bar_data.address,
            description=bar_data.description,
            opening_hours=bar_data.opening_hours,
            regular_holiday=bar_data.regular_holiday,
            menu_beer_price=bar_data.menu_beer_price,
            menu_whiskey_price=bar_data.menu_whiskey_price,
            menu_cocktail_price=bar_data.menu_cocktail_price,
            phone=bar_data.phone,
            website=bar_data.website,
            image_urls=bar_data.image_urls,
            created_by=created_by,
        )

        self.db.add(new_bar)
        self.db.commit()
        self.db.refresh(new_bar)

        return BarDetail(
            id=new_bar.id,
            name=new_bar.name,
            prefecture=new_bar.prefecture,
            city=new_bar.city,
            address=new_bar.address,
            description=new_bar.description,
            opening_hours=new_bar.opening_hours,
            regular_holiday=new_bar.regular_holiday,
            menu_beer_price=new_bar.menu_beer_price,
            menu_whiskey_price=new_bar.menu_whiskey_price,
            menu_cocktail_price=new_bar.menu_cocktail_price,
            phone=new_bar.phone,
            website=new_bar.website,
            image_urls=new_bar.image_urls or [],
            average_rating=0.0,
            review_count=0,
            created_by=new_bar.created_by,
            created_at=new_bar.created_at,
            updated_at=new_bar.updated_at,
        )

    def update_bar(self, bar_id: UUID, bar_data: BarUpdate) -> BarDetail | None:
        """
        バー情報を更新

        Args:
            bar_id: バーID
            bar_data: バー更新データ

        Returns:
            BarDetail | None: 更新されたバーの詳細、存在しない場合はNone
        """
        bar = self.db.execute(select(Bar).where(Bar.id == bar_id)).scalar_one_or_none()

        if not bar:
            return None

        # フィールドを更新（Noneでないもののみ）
        update_data = bar_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(bar, field, value)

        self.db.commit()
        self.db.refresh(bar)

        # 更新後のバー詳細を取得
        return self.get_bar_by_id(bar.id)

    def delete_bar(self, bar_id: UUID) -> bool:
        """
        バーを削除

        Args:
            bar_id: バーID

        Returns:
            bool: 削除に成功した場合True、存在しない場合False
        """
        bar = self.db.execute(select(Bar).where(Bar.id == bar_id)).scalar_one_or_none()

        if not bar:
            return False

        self.db.delete(bar)
        self.db.commit()

        return True
