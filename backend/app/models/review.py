"""レビューモデル"""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import CheckConstraint, ForeignKey, Index, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.bar import Bar
    from app.models.profile import Profile


class Review(Base):
    """レビューテーブル"""

    __tablename__ = "reviews"

    # カラム
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    bar_id: Mapped[UUID] = mapped_column(
        ForeignKey("bars.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("profiles.user_id", ondelete="CASCADE"), nullable=False
    )
    rating: Mapped[int] = mapped_column(nullable=False)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # リレーションシップ
    bar: Mapped[Bar] = relationship("Bar", back_populates="reviews")
    user: Mapped[Profile] = relationship("Profile", back_populates="reviews")

    # 制約
    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="check_rating_range"),
        CheckConstraint("LENGTH(comment) <= 2000", name="check_comment_length"),
        Index("idx_reviews_bar_id", "bar_id"),
        Index("idx_reviews_user_id", "user_id"),
        Index("idx_reviews_created_at", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<Review(id={self.id}, bar_id={self.bar_id}, rating={self.rating})>"
