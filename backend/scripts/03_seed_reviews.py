"""レビューのシードデータ"""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.models.review import Review


async def seed_reviews(db: AsyncSession) -> None:
    """
    レビューのシードデータを作成

    Args:
        db: データベースセッション
    """

    # 既存のレビューをチェック
    result = await db.execute(select(Review))
    existing_count = len(result.scalars().all())
    if existing_count > 0:
        print(f"レビューは既に {existing_count} 件存在します。スキップします。")
        return

    # バーIDを取得（最初の3つのバーを使用）
    from app.models.bar import Bar

    result = await db.execute(select(Bar).limit(3))
    bars = result.scalars().all()
    if not bars:
        print("⚠️  バーが見つかりません。先にバーのシードを実行してください。")
        return

    # テスト用レビューデータ
    reviews_data = [
        {
            "bar_id": bars[0].id,
            "user_id": UUID("00000000-0000-0000-0000-000000000001"),
            "rating": 5,
            "comment": "とても雰囲気が良く、カクテルも美味しかったです！また来たいと思います。",
        },
        {
            "bar_id": bars[0].id,
            "user_id": UUID("00000000-0000-0000-0000-000000000002"),
            "rating": 4,
            "comment": "良いお店でした。スタッフの対応も丁寧でした。",
        },
        {
            "bar_id": bars[1].id,
            "user_id": UUID("00000000-0000-0000-0000-000000000001"),
            "rating": 5,
            "comment": "ウィスキーの種類が豊富で、とても満足しました。",
        },
        {
            "bar_id": bars[2].id,
            "user_id": UUID("00000000-0000-0000-0000-000000000002"),
            "rating": 4,
            "comment": "地元の食材を使った料理が美味しかったです。",
        },
    ]

    for review_data in reviews_data:
        review = Review(**review_data)
        db.add(review)

    await db.commit()
    print(f"✅ {len(reviews_data)} 件のレビューを作成しました。")


if __name__ == "__main__":
    import asyncio

    from app.core.database import AsyncSessionLocal

    async def main():
        async with AsyncSessionLocal() as db:
            try:
                await seed_reviews(db)
            finally:
                await db.close()

    asyncio.run(main())
