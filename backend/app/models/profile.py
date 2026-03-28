"""プロフィールモデル"""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.bar import Bar
    from app.models.favorite import Favorite
    from app.models.review import Review


class Profile(Base):
    """ユーザープロフィールテーブル"""

    __tablename__ = "profiles"

    # カラム
    user_id: Mapped[UUID] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    nickname: Mapped[str] = mapped_column(String(50), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # リレーションシップ
    bars: Mapped[list[Bar]] = relationship(
        "Bar", back_populates="creator", foreign_keys="Bar.created_by"
    )
    reviews: Mapped[list[Review]] = relationship("Review", back_populates="user")
    favorites: Mapped[list[Favorite]] = relationship("Favorite", back_populates="user")

    __table_args__ = (Index("idx_profiles_email", "email"),)

    def __repr__(self) -> str:
        return f"<Profile(user_id={self.user_id}, nickname={self.nickname})>"
