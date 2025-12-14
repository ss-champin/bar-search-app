# 開発環境セットアップガイド

このガイドでは、バー検索アプリの開発環境をDocker Composeで構築する手順を説明します。

---

## 🚀 クイックスタート（Windows推奨）

### 自動セットアップスクリプトを使用

**最も簡単な方法です！**

```powershell
# 1. プロジェクトディレクトリに移動
cd "C:\Users\ai135\バー検索アプリ"

# 2. セットアップスクリプトを実行
.\setup.ps1
```

実行できない場合は、実行ポリシーを変更：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup.ps1
```

スクリプトが自動で以下を行います：
- ✅ Scoopのインストール（管理者権限不要）
- ✅ go-taskのインストール
- ✅ 環境変数PATHの設定
- ✅ Dockerのインストール確認
- ✅ .envファイルの作成

**セットアップ完了後:**
1. PowerShellを再起動（重要！）
2. `task --version` で確認
3. Docker Desktopをインストール（未インストールの場合）
4. [手順3](#3-dockerコンテナのビルド)へ進む

---

## 📋 手動セットアップ（すべてのOS対応）

### 前提条件

以下のツールをインストールしてください：

#### 必須ツール

**1. Docker Desktop**
- **ダウンロード**: https://www.docker.com/products/docker-desktop
- **Windows**: WSL2が必要
- **macOS/Linux**: そのままインストール

**2. go-task（タスクランナー）**

**Windows（推奨: Scoop使用）:**
```powershell
# Scoopのインストール
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
irm get.scoop.sh | iex

# go-taskのインストール
scoop install task

# 確認
task --version
```

**macOS:**
```bash
brew install go-task
```

**Linux:**
```bash
sh -c "$(curl --location https://taskfile.dev/install.sh)" -- -d -b /usr/local/bin
```

#### オプション（ローカル開発用）

**uv（Pythonパッケージマネージャー）:**
```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

**Node.js 20+:**
- ダウンロード: https://nodejs.org/

---

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd バー検索アプリ
```

### 2. 環境変数の設定

**taskコマンドを使う場合:**
```bash
task setup:env
```

**手動で設定する場合:**
```bash
# Windows PowerShell
Copy-Item .env.example .env

# macOS/Linux
cp .env.example .env
```

`.env`ファイルを編集（必要に応じて）:
```env
# データベース設定（デフォルトでOK）
DATABASE_URL=postgresql://postgres:postgres@db:5432/bar_search_dev

# Supabase設定（本番環境用、開発時は不要）
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# その他の設定はデフォルトでOK
```

### 3. Dockerコンテナのビルド

```bash
# 全サービスをビルド
task build
```

初回ビルドには5-10分程度かかります。

**Docker Desktopが起動していることを確認してください！**

### 4. サービスの起動

```bash
# 全サービスを起動（バックグラウンド）
task up

# またはログを表示しながら起動（推奨：初回）
task dev
```

起動したサービス:
- **PostgreSQL**: localhost:5432
- **FastAPI**: localhost:8000
- **Next.js**: localhost:3000

### 5. データベースマイグレーション

```bash
# マイグレーションを実行
task db:migrate
```

### 6. 動作確認

以下のURLにアクセスして動作確認:

- **フロントエンド**: http://localhost:3000
- **バックエンド API**: http://localhost:8000
- **API ドキュメント（Swagger）**: http://localhost:8000/docs
- **API ドキュメント（ReDoc）**: http://localhost:8000/redoc

**ヘルスチェック:**
```bash
# Windows PowerShell
Invoke-WebRequest http://localhost:8000/health

# macOS/Linux
curl http://localhost:8000/health
# => {"status":"ok"}
```

---

## 開発ワークフロー

### 日常的な開発

```bash
# 朝、開発を開始
task up

# コードを編集（自動リロードが有効）
# - backend/app/ 以下のPythonファイルを編集 → FastAPIが自動リロード
# - frontend/app/ 以下のTypeScriptファイルを編集 → Next.jsが自動リロード

# リント・フォーマット
task format
task lint

# 型チェック
task type-check

# テスト実行
task test

# 夕方、作業終了
task down
```

### ログの確認

```bash
# 全サービスのログ
task logs

# バックエンドのみ
task logs:backend

# フロントエンドのみ
task logs:frontend

# データベースのみ
task logs:db
```

### データベース操作

```bash
# PostgreSQLシェルに接続
task db:shell

# データベースをリセット（全データ削除）
task db:reset

# データベースをダンプ
task db:dump
```

### コンテナシェルに入る

```bash
# バックエンドコンテナ
task backend:shell

# フロントエンドコンテナ
task frontend:shell
```

---

## バックエンド開発

### ディレクトリ構造

```
backend/
├── app/
│   ├── main.py              # FastAPIアプリエントリーポイント
│   ├── core/
│   │   └── config.py        # 設定
│   ├── api/                 # APIエンドポイント
│   │   ├── bars.py
│   │   ├── reviews.py
│   │   ├── favorites.py
│   │   └── users.py
│   ├── models/              # SQLAlchemyモデル
│   │   ├── bar.py
│   │   ├── review.py
│   │   └── ...
│   ├── schemas/             # Pydanticスキーマ
│   │   ├── bar.py
│   │   ├── review.py
│   │   └── ...
│   ├── services/            # ビジネスロジック
│   └── dependencies/        # 依存性注入
├── tests/                   # テスト
├── pyproject.toml           # uv設定
└── Dockerfile
```

### コマンド

```bash
# リント実行
task backend:lint

# リント自動修正
task backend:lint:fix

# フォーマット
task backend:format

# 型チェック
task backend:type-check

# テスト実行
task backend:test

# カバレッジ付きテスト
task backend:test:cov
```

### ローカルでの開発（Dockerを使わない場合）

```bash
cd backend

# 依存関係インストール
uv sync

# 開発サーバー起動
uv run uvicorn app.main:app --reload
```

---

## フロントエンド開発

### ディレクトリ構造

```
frontend/
├── app/                     # Next.js App Router
│   ├── layout.tsx           # ルートレイアウト
│   ├── page.tsx             # トップページ
│   ├── bars/
│   │   └── [id]/
│   │       └── page.tsx     # バー詳細ページ
│   ├── login/
│   │   └── page.tsx         # ログインページ
│   └── ...
├── components/              # Reactコンポーネント
│   ├── BarCard.tsx
│   ├── ReviewForm.tsx
│   └── ...
├── lib/                     # ユーティリティ
│   ├── supabase.ts          # Supabaseクライアント
│   └── api.ts               # API呼び出し
├── public/                  # 静的ファイル
├── biome.json               # Biome設定
└── package.json
```

### コマンド

```bash
# リント実行
task frontend:lint

# リント自動修正
task frontend:lint:fix

# フォーマット
task frontend:format

# 型チェック
task frontend:type-check
```

### ローカルでの開発（Dockerを使わない場合）

```bash
cd frontend

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

---

## トラブルシューティング

### 0. taskコマンドが認識されない（Windows）

**症状:**
```
task : 用語 'task' は、コマンドレット、関数、スクリプト ファイル、または操作可能なプログラムの名前として認識されません。
```

**解決方法:**

**A. 自動セットアップスクリプトを使う（推奨）:**
```powershell
.\setup.ps1
```

スクリプト実行後、**必ずPowerShellを再起動**してください。

**B. 手動でインストール:**
```powershell
# Scoopのインストール
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
irm get.scoop.sh | iex

# go-taskのインストール
scoop install task

# PowerShellを再起動後、確認
task --version
```

**C. 環境変数PATHの確認:**
```powershell
# 現在のPATHを確認
$env:Path

# Scoopのパスが含まれているか確認
# C:\Users\ai135\scoop\shims が含まれているはず
```

含まれていない場合、手動で追加：
```powershell
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
$scoopPath = "$env:USERPROFILE\scoop\shims"
[Environment]::SetEnvironmentVariable("Path", "$currentPath;$scoopPath", "User")

# PowerShellを再起動
```

### 1. Dockerコンテナが起動しない

**症状:**
- `docker compose up` でエラーが発生
- コンテナが起動しない

**解決方法:**

```bash
# コンテナの状態を確認
docker compose ps

# ログを確認
task logs

# Docker Desktopが起動しているか確認
# Windowsの場合、タスクトレイにDockerアイコンが表示されているはず

# コンテナを停止して再起動
task restart

# キャッシュをクリアして再ビルド
task rebuild
```

**Docker Desktopが未インストールの場合:**
1. https://www.docker.com/products/docker-desktop からダウンロード
2. インストーラーを実行
3. PCを再起動
4. Docker Desktopを起動

### 2. ポートが既に使用されている

**エラー例:**
```
Error: bind: address already in use
```

**解決方法:**

```bash
# Windows
netstat -ano | findstr :3000
# または
netstat -ano | findstr :8000

# プロセスIDを確認して終了
taskkill /PID <プロセスID> /F

# macOS/Linux
lsof -i :3000
# または
lsof -i :8000

# プロセスを終了
kill -9 <PID>
```

### 3. データベース接続エラー

```bash
# データベースコンテナの状態を確認
docker compose ps db

# データベースログを確認
task logs:db

# データベースをリセット
task db:reset
```

### 4. npm install / uv sync でエラー

```bash
# Node.jsのバージョンを確認（20以上が必要）
node -v

# uvのバージョンを確認
uv --version

# キャッシュをクリア
task clean
task setup
```

### 5. 全てクリーンアップして再構築

**開発環境をゼロから作り直す場合:**

```bash
# 全てクリーンアップ（Dockerボリューム含む）
task clean:all

# 再セットアップ
task build
task up
task db:migrate
```

**完全にやり直す場合（Windows）:**
```powershell
# 1. すべてのコンテナとボリュームを削除
docker compose down -v

# 2. セットアップスクリプトを再実行
.\setup.ps1

# 3. PowerShellを再起動

# 4. 環境を構築
task build
task up
task db:migrate
```

---

## pgAdmin の使用（オプション）

pgAdminはPostgreSQLのGUI管理ツールです。

### 起動

```bash
task pgadmin
```

ブラウザで http://localhost:5050 にアクセス

### ログイン情報
- **Email**: admin@example.com
- **Password**: admin

### サーバー接続設定
1. "Add New Server" をクリック
2. General タブ:
   - Name: `bar-search-dev`
3. Connection タブ:
   - Host: `db`
   - Port: `5432`
   - Maintenance database: `bar_search_dev`
   - Username: `postgres`
   - Password: `postgres`

---

## 📚 よく使うコマンド一覧

### 基本操作
```bash
task help          # 全タスク一覧
task up            # サービス起動
task down          # サービス停止
task restart       # サービス再起動
task logs          # ログ表示
task build         # ビルド
```

### 開発
```bash
task dev           # ログ表示しながら起動
task format        # フォーマット実行
task lint          # リント実行
task lint:fix      # リント自動修正
task type-check    # 型チェック
task test          # テスト実行
```

### データベース
```bash
task db:migrate    # マイグレーション実行
task db:reset      # データベースリセット
task db:shell      # PostgreSQLシェル
task db:dump       # データベースダンプ
```

### バックエンド
```bash
task backend:lint
task backend:format
task backend:type-check
task backend:test
task backend:shell
```

### フロントエンド
```bash
task frontend:lint
task frontend:format
task frontend:type-check
task frontend:shell
```

### クリーンアップ
```bash
task clean         # 一時ファイル削除
task clean:all     # 完全クリーンアップ
```

---

## 次のステップ

環境構築が完了したら、以下のドキュメントを参照して開発を進めてください：

1. **機能要件の確認**
   - `docs/functional_requirements.md` - 実装する機能の詳細
   - `docs/requirements.md` - 全体要件

2. **API設計の確認**
   - `docs/api_specification.yaml` - OpenAPI仕様書
   - `docs/api_design.md` - API設計詳細

3. **データベース設計の確認**
   - `docs/database_schema.md` - テーブル設計
   - `docs/database_setup_guide.md` - Supabase連携手順

4. **プロジェクト構造の理解**
   - `docs/project_structure.md` - ディレクトリ構成

5. **開発開始**
   - バックエンドAPIエンドポイントの実装
   - フロントエンドコンポーネントの実装

---

## 参考リンク

### フレームワーク・ライブラリ
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)

### 開発ツール
- [go-task Documentation](https://taskfile.dev/)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

### Python関連
- [uv Documentation](https://github.com/astral-sh/uv)
- [Ruff Documentation](https://docs.astral.sh/ruff/)
- [mypy Documentation](https://mypy.readthedocs.io/)
- [Pydantic Documentation](https://docs.pydantic.dev/)

### TypeScript/JavaScript関連
- [Biome Documentation](https://biomejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

## 🎉 セットアップ完了チェックリスト

セットアップが正しく完了しているか確認：

- [ ] `task --version` が実行できる
- [ ] `docker --version` が実行できる
- [ ] `.env` ファイルが存在する
- [ ] `task build` が成功する
- [ ] `task up` でサービスが起動する
- [ ] http://localhost:3000 にアクセスできる
- [ ] http://localhost:8000/docs にアクセスできる
- [ ] `task db:migrate` が成功する

すべてチェックできたら、開発開始の準備完了です！🚀
