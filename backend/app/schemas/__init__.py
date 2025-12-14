"""Pydanticスキーマ"""

from app.schemas.bar import (
    BarCreate,
    BarDetail,
    BarListResponse,
    BarSummary,
    BarUpdate,
)
from app.schemas.base import ErrorResponse, MessageResponse, StatusResponse
from app.schemas.favorite import FavoriteCreate, FavoriteListResponse, FavoriteResponse
from app.schemas.profile import ProfileCreate, ProfileResponse, ProfileUpdate
from app.schemas.review import (
    ReviewCreate,
    ReviewListResponse,
    ReviewResponse,
    ReviewUpdate,
    ReviewWithBar,
    ReviewWithBarListResponse,
)

__all__ = [
    # Base
    "ErrorResponse",
    "MessageResponse",
    "StatusResponse",
    # Profile
    "ProfileCreate",
    "ProfileResponse",
    "ProfileUpdate",
    # Bar
    "BarCreate",
    "BarUpdate",
    "BarSummary",
    "BarDetail",
    "BarListResponse",
    # Review
    "ReviewCreate",
    "ReviewUpdate",
    "ReviewResponse",
    "ReviewWithBar",
    "ReviewListResponse",
    "ReviewWithBarListResponse",
    # Favorite
    "FavoriteCreate",
    "FavoriteResponse",
    "FavoriteListResponse",
]
