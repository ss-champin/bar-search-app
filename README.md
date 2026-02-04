# バー検索アプリ

**一人の時間を、もっと豊かに。**

しっぽり飲めるバー・一人でも行きやすいバーを探すアプリ。ユーザーが条件に合ったバーを検索・評価・保存できるWebアプリケーション。一人でゆっくりと過ごせる落ち着いた雰囲気のバーを見つけるためのサービスです。

## 技術スタック

### フロントエンド
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Linter/Formatter**: Biome
- **State Management**: Zustand
- **認証**: Supabase Auth

### バックエンド
- **Framework**: FastAPI
- **Language**: Python 3.12
- **Package Manager**: uv
- **Linter**: Ruff
- **Type Checker**: mypy
- **Validation**: Pydantic v2

### データベース・認証
- **DBMS**: PostgreSQL 16
- **認証**: Supabase Auth
- **ローカル開発**: Docker PostgreSQL（DB） + Supabase（認証のみ）
- **検証環境**: Supabase（認証 + DB、専用プロジェクト）
- **本番環境**: Supabase（認証 + DB、専用プロジェクト、検証とは別）

> **ハイブリッド構成**: ローカル開発では認証のみSupabaseを使用し、データベースはDocker PostgreSQLを使用します。
> 詳細は [docs/environment_setup.md](docs/environment_setup.md) を参照

### インフラ
- **コンテナ**: Docker / Docker Compose
- **タスクランナー**: go-task/task

---

## セットアップ

### 前提条件

以下のツールをインストールしてください：

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [go-task](https://taskfile.dev/installation/)
- [uv](https://github.com/astral-sh/uv) (オプション: ローカル開発用)
- [Node.js 20+](https://nodejs.org/) (オプション: ローカル開発用)

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd バー検索アプリ
```

### 2. Supabase開発用プロジェクトの作成

**重要**: ローカル開発でも認証機能にSupabaseを使用します。

```bash
# 1. https://supabase.com でアカウント作成
# 2. 新規プロジェクトを作成
#    - プロジェクト名: bar-search-app-dev
#    - Region: Northeast Asia (Tokyo)
#    - Pricing Plan: Free
# 3. API KeysとJWT Secretを取得
#    - Settings → API から取得
```

詳細は [docs/environment_setup.md](docs/environment_setup.md) を参照してください。

### 3. 環境変数の設定

```bash
# .envファイルを作成
task setup:env

# .envファイルを編集（Supabase開発用プロジェクトの情報を設定）
# 以下の値を実際の値に置き換えてください:
#   SUPABASE_URL, SUPABASE_KEY, SUPABASE_JWT_SECRET
#   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 4. 初回セットアップ

```bash
# 全ての依存関係をインストール
task setup

# Dockerコンテナをビルド・起動
task build
task up

# データベースマイグレーションを実行
task db:migrate
```

### 5. 開発サーバーを起動

```bash
# 全サービスを起動（ログ表示）
task dev

# または個別に起動
task dev:backend   # バックエンドのみ
task dev:frontend  # フロントエンドのみ
```

### 6. アクセス

- **フロントエンド**: http://localhost:3000
- **バックエンド API**: http://localhost:8000
- **API ドキュメント**: http://localhost:8000/docs
- **pgAdmin** (オプション): http://localhost:5050

---

## タスクランナー（go-task）

### よく使うタスク

```bash
# ヘルプ（利用可能なタスク一覧）
task help

# Docker操作
task up           # サービス起動
task down         # サービス停止
task restart      # サービス再起動
task build        # ビルド
task logs         # ログ表示

# データベース操作
task db:migrate   # マイグレーション実行
task db:reset     # データベースリセット
task db:shell     # PostgreSQLシェル

# リント・フォーマット
task lint         # 全体リント
task lint:fix     # リント自動修正
task format       # フォーマット
task type-check   # 型チェック

# テスト
task test         # テスト実行
task check        # リント+型チェック+テスト

# クリーンアップ
task clean        # 一時ファイル削除
task clean:all    # 全てクリーンアップ
```

### バックエンド専用タスク

```bash
task backend:lint         # リント
task backend:lint:fix     # リント自動修正
task backend:format       # フォーマット
task backend:type-check   # 型チェック
task backend:test         # テスト実行
task backend:test:cov     # カバレッジ付きテスト
task backend:shell        # コンテナシェル
```

### フロントエンド専用タスク

```bash
task frontend:lint         # リント
task frontend:lint:fix     # リント自動修正
task frontend:format       # フォーマット
task frontend:type-check   # 型チェック
task frontend:shell        # コンテナシェル
```

---

## ディレクトリ構造

```
.
├── backend/                # FastAPIバックエンド
│   ├── app/
│   │   ├── main.py         # アプリケーションエントリーポイント
│   │   ├── api/            # APIエンドポイント
│   │   ├── models/         # SQLAlchemyモデル
│   │   ├── schemas/        # Pydanticスキーマ
│   │   ├── services/       # ビジネスロジック
│   │   ├── dependencies/   # 依存性注入
│   │   └── core/           # 設定、認証など
│   ├── tests/              # テスト
│   ├── Dockerfile
│   ├── pyproject.toml      # uv設定、依存関係
│   └── .python-version
│
├── frontend/               # Next.jsフロントエンド
│   ├── app/                # App Router
│   ├── components/         # Reactコンポーネント
│   ├── lib/                # ユーティリティ、hooks
│   ├── public/             # 静的ファイル
│   ├── Dockerfile
│   ├── package.json
│   ├── biome.json          # Biome設定
│   └── tsconfig.json
│
├── docs/                   # ドキュメント
│   ├── requirements.md
│   ├── functional_requirements.md
│   ├── database_schema.md
│   ├── environment_setup.md          # 環境構成ガイド（重要）
│   ├── database_setup_guide.md       # Supabaseセットアップ
│   ├── supabase_migration.sql
│   ├── api_specification.yaml
│   └── api_design.md
│
├── docker-compose.yml      # Docker Compose設定
├── Taskfile.yml            # タスクランナー設定
├── .env.example            # 環境変数サンプル
└── README.md
```

---

## 開発ワークフロー

### 1. 機能開発

```bash
# 1. ブランチを作成
git checkout -b feature/new-feature

# 2. コードを編集

# 3. リント・フォーマット実行
task format
task lint:fix

# 4. 型チェック
task type-check

# 5. テスト実行
task test

# 6. コミット
git add .
git commit -m "Add new feature"

# 7. プッシュ
git push origin feature/new-feature
```

### 2. データベーススキーマ変更

```bash
# 1. docs/supabase_migration.sql を編集

# 2. データベースをリセット
task db:reset

# 3. 動作確認
task db:shell
```

### 3. APIエンドポイント追加

```bash
# 1. backend/app/api/ にエンドポイントを追加

# 2. backend/app/schemas/ にPydanticスキーマを追加

# 3. リント・型チェック
task backend:lint
task backend:type-check

# 4. テストを追加
# backend/tests/ にテストを追加

# 5. テスト実行
task backend:test

# 6. Swagger UIで確認
# http://localhost:8000/docs
```

---

## トラブルシューティング

### Dockerコンテナが起動しない

```bash
# ログを確認
task logs

# コンテナを再ビルド
task rebuild

# 全てクリーンアップして再起動
task clean:all
task build
task up
```

### データベース接続エラー

```bash
# データベースの状態を確認
docker compose ps db

# データベースをリセット
task db:reset
```

### ポートが既に使用されている

```bash
# 使用中のポートを確認（例: 3000番）
# Windows
netstat -ano | findstr :3000

# 該当のプロセスを終了してから再起動
task restart
```

---

## テスト

### バックエンドのテスト

```bash
# 全テスト実行
task backend:test

# カバレッジ付き
task backend:test:cov

# 特定のテストファイルのみ
cd backend
uv run pytest tests/test_bars.py
```

### フロントエンドのテスト

```bash
# （今後追加予定）
```

---

## デプロイ

### 環境構成

このプロジェクトは3つの環境を使用します：

| 環境 | 認証 | データベース | Supabaseプロジェクト |
|------|------|------------|-------------------|
| **ローカル開発** | Supabase Auth | Docker PostgreSQL | `bar-search-app-dev`（認証のみ） |
| **検証（Staging）** | Supabase Auth | Supabase DB | `bar-search-app-staging`（認証+DB） |
| **本番（Production）** | Supabase Auth | Supabase DB | `bar-search-app-production`（認証+DB） |

> **ハイブリッド構成**: ローカル開発では認証のみSupabaseを使用し、データベースはDockerで動作します。
>
> **重要**: 3つの環境は**完全に分離された別々のSupabaseプロジェクト**を使用してください。

詳細は [docs/environment_setup.md](docs/environment_setup.md) を参照してください。

---

### 検証環境へのデプロイ

1. **Supabase検証用プロジェクト作成**
   - `docs/database_setup_guide.md` を参照
   - プロジェクト名: `bar-search-app-staging`

2. **環境変数設定（.env.staging）**
   - Supabase URL、API Key を設定
   - `.env.example` を参考に作成

3. **フロントエンドデプロイ（Vercel推奨）**
   ```bash
   cd frontend
   npm run build
   # Vercelで環境変数を設定してデプロイ
   ```

4. **バックエンドデプロイ（Render/Railway/Cloud Run）**
   - Docker イメージをビルドしてデプロイ
   - 環境変数を設定

---

### 本番環境へのデプロイ

1. **Supabase本番用プロジェクト作成**
   - `docs/database_setup_guide.md` を参照
   - プロジェクト名: `bar-search-app-production`
   - **検証環境とは別のプロジェクトを作成**

2. **環境変数設定（.env.production）**
   - Supabase URL、API Key を設定（検証とは別の値）
   - `.env.example` を参考に作成

3. **検証環境で十分にテスト後、本番へデプロイ**
   - フロントエンド・バックエンドともに検証環境と同じ手順
   - 本番用の環境変数を使用

---

## ライセンス

MIT

---

## コントリビューション

プルリクエスト歓迎！

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

---

## サポート

質問や問題がある場合は、Issueを作成してください。
