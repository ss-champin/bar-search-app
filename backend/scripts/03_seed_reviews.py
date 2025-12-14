"""レビューのシードデータ"""

from uuid import UUID

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.review import Review


def seed_reviews(db: Session) -> None:
    """
    レビューのシードデータを作成

    Args:
        db: データベースセッション
    """

    # 既存のレビューをチェック
    existing_count = db.query(Review).count()
    if existing_count > 0:
        print(f"レビューは既に {existing_count} 件存在します。スキップします。")
        return

    # バーIDを取得（最初の3つのバーを使用）
    from app.models.bar import Bar

    bars = db.query(Bar).limit(3).all()
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

    db.commit()
    print(f"✅ {len(reviews_data)} 件のレビューを作成しました。")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_reviews(db)
    finally:
        db.close()

