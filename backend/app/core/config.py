"""アプリケーション設定"""

from pydantic import Field, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


def _parse_cors_origins_from_str(value: str) -> list[str]:
    """カンマ区切り文字列を CORS 許可オリジンのリストに変換する。"""
    if not value or not value.strip():
        return []
    return [
        origin.strip()
        for origin in value.split(",")
        if origin.strip()
    ]


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

    # CORS設定（環境変数 CORS_ORIGINS をカンマ区切りで指定。例: https://bar-search-app.vercel.app,http://localhost:3000）
    # 環境変数は文字列で読み、CORS_ORIGINS プロパティで list[str] として取得する
    CORS_ORIGINS_STR: str = Field(default="", validation_alias="CORS_ORIGINS")

    @computed_field
    @property
    def CORS_ORIGINS(self) -> list[str]:
        """CORS で許可するオリジンのリスト。環境変数 CORS_ORIGINS_STR（env: CORS_ORIGINS）からパースする。"""
        return _parse_cors_origins_from_str(self.CORS_ORIGINS_STR)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


# 設定のインスタンスを作成
settings = Settings()
