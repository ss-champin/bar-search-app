"""バーモデル"""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Any
from uuid import UUID, uuid4

from sqlalchemy import ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.favorite import Favorite
    from app.models.profile import Profile
    from app.models.review import Review


class Bar(Base):
    """バー情報テーブル"""

    __tablename__ = "bars"

    # カラム
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    prefecture: Mapped[str] = mapped_column(String(10), nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    image_urls: Mapped[list[str]] = mapped_column(
        ARRAY(Text).with_variant(JSON, "sqlite"), nullable=False, default=list
    )
    opening_hours: Mapped[dict[str, Any] | None] = mapped_column(
        JSON().with_variant(JSONB(), "postgresql"), nullable=True
    )
    regular_holiday: Mapped[str | None] = mapped_column(String(100), nullable=True)
    menu_beer_price: Mapped[int | None] = mapped_column(Integer, nullable=True)
    menu_whiskey_price: Mapped[int | None] = mapped_column(Integer, nullable=True)
    menu_cocktail_price: Mapped[int | None] = mapped_column(Integer, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    website: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[UUID | None] = mapped_column(
        ForeignKey("profiles.user_id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # リレーションシップ
    creator: Mapped[Profile] = relationship(
        "Profile", back_populates="bars", foreign_keys=[created_by]
    )
    reviews: Mapped[list[Review]] = relationship(
        "Review", back_populates="bar", cascade="all, delete-orphan"
    )
    favorites: Mapped[list[Favorite]] = relationship(
        "Favorite", back_populates="bar", cascade="all, delete-orphan"
    )

    # インデックス
    __table_args__ = (
        Index("idx_bars_prefecture", "prefecture"),
        Index("idx_bars_created_by", "created_by"),
    )

    def __repr__(self) -> str:
        return f"<Bar(id={self.id}, name={self.name}, prefecture={self.prefecture})>"
