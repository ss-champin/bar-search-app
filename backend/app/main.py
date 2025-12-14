"""FastAPI アプリケーションのエントリーポイント"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import bars, favorites, images, reviews, users
from app.core.config import settings
from app.core.database import create_tables
from app.schemas import MessageResponse, StatusResponse

# FastAPIアプリケーションの初期化
app = FastAPI(
    title="バー検索アプリ API",
    description="バー検索・レビュー・お気に入り機能を提供するAPI",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


# 起動時イベント: データベーステーブル作成
@app.on_event("startup")
def on_startup() -> None:
    """アプリケーション起動時の処理"""
    create_tables()

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ヘルスチェックエンドポイント
@app.get("/health", response_model=StatusResponse)
async def health_check() -> StatusResponse:
    """ヘルスチェック"""
    return StatusResponse(status="ok")


@app.get("/", response_model=MessageResponse)
async def root() -> MessageResponse:
    """ルートエンドポイント"""
    return MessageResponse(message="バー検索アプリ API")


# APIルーターの登録
app.include_router(bars.router, prefix="/api/bars", tags=["bars"])
app.include_router(reviews.bar_reviews_router, prefix="/api/bars", tags=["reviews"])
app.include_router(reviews.reviews_router, prefix="/api/reviews", tags=["reviews"])
app.include_router(favorites.router, prefix="/api/favorites", tags=["favorites"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(images.router, prefix="/api/images", tags=["images"])
