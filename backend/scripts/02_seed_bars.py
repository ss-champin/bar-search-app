"""バー情報のシードデータ"""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.models.bar import Bar


async def seed_bars(db: AsyncSession) -> None:
    """
    バー情報のシードデータを作成

    Args:
        db: データベースセッション
    """
    # 既存のバーをチェック
    result = await db.execute(select(Bar))
    existing_count = len(result.scalars().all())
    if existing_count > 0:
        print(f"バーは既に {existing_count} 件存在します。スキップします。")
        return

    # テスト用バーデータ
    bars_data = [
        {
            "name": "Bar 渋谷",
            "description": "渋谷にあるおしゃれなカクテルバー。落ち着いた雰囲気でゆっくりとお酒を楽しめます。",
            "prefecture": "東京都",
            "city": "渋谷区",
            "address": "渋谷1-2-3 渋谷ビル3F",
            "image_urls": [],
            "opening_hours": {
                "monday": {"open": "18:00", "close": "02:00"},
                "tuesday": {"open": "18:00", "close": "02:00"},
                "wednesday": {"open": "18:00", "close": "02:00"},
                "thursday": {"open": "18:00", "close": "02:00"},
                "friday": {"open": "18:00", "close": "04:00"},
                "saturday": {"open": "18:00", "close": "04:00"},
                "sunday": None,
            },
            "regular_holiday": "日曜日",
            "menu_beer_price": 500,
            "menu_whiskey_price": 800,
            "menu_cocktail_price": 1000,
            "phone": "03-1234-5678",
            "website": "https://example.com/bar-shibuya",
            "created_by": UUID("00000000-0000-0000-0000-000000000003"),  # 管理者
        },
        {
            "name": "Bar 新宿",
            "description": "新宿にある本格的なウィスキーバー。世界中のウィスキーを取り揃えています。",
            "prefecture": "東京都",
            "city": "新宿区",
            "address": "新宿3-1-5 新宿タワー2F",
            "image_urls": [],
            "opening_hours": {
                "monday": {"open": "19:00", "close": "01:00"},
                "tuesday": {"open": "19:00", "close": "01:00"},
                "wednesday": {"open": "19:00", "close": "01:00"},
                "thursday": {"open": "19:00", "close": "01:00"},
                "friday": {"open": "19:00", "close": "03:00"},
                "saturday": {"open": "19:00", "close": "03:00"},
                "sunday": None,
            },
            "regular_holiday": "日曜日",
            "menu_beer_price": 600,
            "menu_whiskey_price": 1000,
            "menu_cocktail_price": 1200,
            "phone": "03-2345-6789",
            "website": "https://example.com/bar-shinjuku",
            "created_by": UUID("00000000-0000-0000-0000-000000000003"),  # 管理者
        },
        {
            "name": "Bar 福岡",
            "description": "福岡にある地元密着型のバー。地元の食材を使った料理も楽しめます。",
            "prefecture": "福岡県",
            "city": "福岡市",
            "address": "福岡市中央区天神1-2-3 天神ビル4F",
            "image_urls": [],
            "opening_hours": {
                "monday": {"open": "18:00", "close": "01:00"},
                "tuesday": {"open": "18:00", "close": "01:00"},
                "wednesday": {"open": "18:00", "close": "01:00"},
                "thursday": {"open": "18:00", "close": "01:00"},
                "friday": {"open": "18:00", "close": "02:00"},
                "saturday": {"open": "18:00", "close": "02:00"},
                "sunday": None,
            },
            "regular_holiday": "日曜日",
            "menu_beer_price": 400,
            "menu_whiskey_price": 700,
            "menu_cocktail_price": 900,
            "phone": "092-1234-5678",
            "website": None,
            "created_by": UUID("00000000-0000-0000-0000-000000000003"),  # 管理者
        },
    ]

    for bar_data in bars_data:
        bar = Bar(**bar_data)
        db.add(bar)

    await db.commit()
    print(f"✅ {len(bars_data)} 件のバーを作成しました。")


if __name__ == "__main__":
    import asyncio

    from app.core.database import AsyncSessionLocal

    async def main():
        async with AsyncSessionLocal() as db:
            try:
                await seed_bars(db)
            finally:
                await db.close()

    asyncio.run(main())
