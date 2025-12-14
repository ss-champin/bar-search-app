"""お気に入りモデル"""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.bar import Bar
    from app.models.profile import Profile


class Favorite(Base):
    """お気に入りテーブル"""

    __tablename__ = "favorites"

    # カラム
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    bar_id: Mapped[UUID] = mapped_column(
        ForeignKey("bars.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("profiles.user_id", ondelete="CASCADE"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=datetime.utcnow)

    # リレーションシップ
    bar: Mapped[Bar] = relationship("Bar", back_populates="favorites")
    user: Mapped[Profile] = relationship("Profile", back_populates="favorites")

    # 制約
    __table_args__ = (
        UniqueConstraint("bar_id", "user_id", name="uq_favorites_bar_user"),
        Index("idx_favorites_unique", "bar_id", "user_id", unique=True),
        Index("idx_favorites_user_id", "user_id"),
    )

    def __repr__(self) -> str:
        return f"<Favorite(id={self.id}, bar_id={self.bar_id}, user_id={self.user_id})>"
