"""プロフィール（ユーザー）のシードデータ"""

from uuid import UUID

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.profile import Profile


def seed_profiles(db: Session) -> None:
    """
    プロフィールのシードデータを作成

    Args:
        db: データベースセッション
    """
    # 既存のプロフィールをチェック
    existing_count = db.query(Profile).count()
    if existing_count > 0:
        print(f"プロフィールは既に {existing_count} 件存在します。スキップします。")
        return

    # テスト用プロフィールデータ
    profiles_data = [
        {
            "user_id": UUID("00000000-0000-0000-0000-000000000001"),
            "email": "test1@example.com",
            "nickname": "テストユーザー1",
            "age": 25,
        },
        {
            "user_id": UUID("00000000-0000-0000-0000-000000000002"),
            "email": "test2@example.com",
            "nickname": "テストユーザー2",
            "age": 30,
        },
        {
            "user_id": UUID("00000000-0000-0000-0000-000000000003"),
            "email": "admin@example.com",
            "nickname": "管理者",
            "age": 35,
        },
    ]

    for profile_data in profiles_data:
        profile = Profile(**profile_data)
        db.add(profile)

    db.commit()
    print(f"✅ {len(profiles_data)} 件のプロフィールを作成しました。")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_profiles(db)
    finally:
        db.close()

