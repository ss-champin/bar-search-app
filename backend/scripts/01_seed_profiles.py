"""プロフィール（ユーザー）のシードデータ"""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.models.profile import Profile


async def seed_profiles(db: AsyncSession) -> None:
    """
    プロフィールのシードデータを作成

    Args:
        db: データベースセッション
    """
    # 既存のプロフィールをチェック
    result = await db.execute(select(Profile))
    existing_count = len(result.scalars().all())
    if existing_count > 0:
        print(f"プロフィールは既に {existing_count} 件存在します。スキップします。")
        return

    # テスト用プロフィールデータ
    profiles_data = [
        {
            "user_id": UUID("00000000-0000-0000-0000-000000000001"),
            "email": "test1@example.com",
            "nickname": "テストユーザー1",
        },
        {
            "user_id": UUID("00000000-0000-0000-0000-000000000002"),
            "email": "test2@example.com",
            "nickname": "テストユーザー2",
        },
        {
            "user_id": UUID("00000000-0000-0000-0000-000000000003"),
            "email": "admin@example.com",
            "nickname": "管理者",
        },
    ]

    for profile_data in profiles_data:
        profile = Profile(**profile_data)
        db.add(profile)

    await db.commit()
    print(f"✅ {len(profiles_data)} 件のプロフィールを作成しました。")


if __name__ == "__main__":
    import asyncio

    from app.core.database import AsyncSessionLocal

    async def main():
        async with AsyncSessionLocal() as db:
            try:
                await seed_profiles(db)
            finally:
                await db.close()

    asyncio.run(main())
