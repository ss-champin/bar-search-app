"""アプリケーション設定"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """アプリケーション設定"""

    # アプリケーション設定
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # データベース設定
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/bar_search_dev"

    # Supabase設定
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""

    # CORS設定
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://frontend:3000"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


# 設定のインスタンスを作成
settings = Settings()
