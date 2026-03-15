# Python 3.12を使用
FROM python:3.12-slim

# 作業ディレクトリを設定
WORKDIR /app

# システムパッケージの更新とインストール
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# uvのインストール
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Pythonバージョンファイルをコピー
COPY .python-version .

# 依存関係ファイルをコピー
COPY pyproject.toml uv.lock* ./

# 依存関係のインストール
RUN uv sync --frozen --no-dev || uv sync --no-dev

# アプリケーションコードをコピー
COPY . .

# ポート8000を公開
EXPOSE 8000

# ヘルスチェック用エンドポイント
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# アプリケーションを起動
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
