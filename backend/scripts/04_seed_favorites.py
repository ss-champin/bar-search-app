"""お気に入りのシードデータ"""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.models.favorite import Favorite


async def seed_favorites(db: AsyncSession) -> None:
    """
    お気に入りのシードデータを作成

    Args:
        db: データベースセッション
    """

    # 既存のお気に入りをチェック
    result = await db.execute(select(Favorite))
    existing_count = len(result.scalars().all())
    if existing_count > 0:
        print(f"お気に入りは既に {existing_count} 件存在します。スキップします。")
        return

    # バーIDを取得（最初の2つのバーを使用）
    from app.models.bar import Bar

    result = await db.execute(select(Bar).limit(2))
    bars = result.scalars().all()
    if not bars:
        print("⚠️  バーが見つかりません。先にバーのシードを実行してください。")
        return

    # テスト用お気に入りデータ
    favorites_data = [
        {
            "bar_id": bars[0].id,
            "user_id": UUID("00000000-0000-0000-0000-000000000001"),
        },
        {
            "bar_id": bars[1].id,
            "user_id": UUID("00000000-0000-0000-0000-000000000001"),
        },
        {
            "bar_id": bars[0].id,
            "user_id": UUID("00000000-0000-0000-0000-000000000002"),
        },
    ]

    for favorite_data in favorites_data:
        favorite = Favorite(**favorite_data)
        db.add(favorite)

    await db.commit()
    print(f"✅ {len(favorites_data)} 件のお気に入りを作成しました。")


if __name__ == "__main__":
    import asyncio

    from app.core.database import AsyncSessionLocal

    async def main():
        async with AsyncSessionLocal() as db:
            try:
                await seed_favorites(db)
            finally:
                await db.close()

    asyncio.run(main())
