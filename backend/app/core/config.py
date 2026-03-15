"""アプリケーション設定"""

from pydantic import field_validator
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

    # CORS設定（環境変数 CORS_ORIGINS で指定。カンマ区切り。例: https://bar-search-app.vercel.app,http://localhost:3000）
    CORS_ORIGINS: list[str] = []

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, raw_value: object) -> list[str]:
        """環境変数 CORS_ORIGINS をリストに変換する。カンマ区切り文字列またはリストを受け付ける。"""
        if raw_value is None or raw_value == "":
            return []

        if isinstance(raw_value, str):
            comma_separated_origins = raw_value.split(",")
            return [
                origin.strip()
                for origin in comma_separated_origins
                if origin.strip()
            ]

        if isinstance(raw_value, list):
            return list(raw_value)

        return []

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


# 設定のインスタンスを作成
settings = Settings()
