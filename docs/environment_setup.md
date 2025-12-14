# 環境構成ガイド

このプロジェクトは、3つの異なる環境を使用しています。

## 環境の種類

### 1. ローカル開発環境（Local Development）

**ハイブリッド構成**:
- **認証**: Supabase Auth（開発用プロジェクト）
- **データベース**: Docker PostgreSQL 16（ローカル）

開発者の手元で動作する環境です。

**認証にSupabaseを使う理由**:
- OAuth認証（Google、Twitterなど）の実装が簡単
- メール認証・パスワードリセットなどの機能がすぐ使える
- 本番環境に近い認証フローでテストできる
- ローカルで認証機能を実装するのは困難

**データベースにDockerを使う理由**:
- インターネット接続なしで開発可能
- データのリセット・再作成が簡単
- 開発環境の構築が高速

**用途**:
- 日常の開発作業
- ユニットテスト・統合テスト
- 機能開発・バグ修正

**接続先**:
- Auth: Supabase（開発用プロジェクト）
- Database: `postgresql://postgres:postgres@localhost:5432/bar_search_dev`
- Backend API: `http://localhost:8000`
- Frontend: `http://localhost:3000`

---

### 2. 検証環境（Staging）

**データベース**: Supabase（検証用プロジェクト）

- 本番環境と同じ構成
- 本番デプロイ前のテスト・検証用
- 独立したSupabaseプロジェクト
- 本番データとは完全に分離

**用途**:
- 本番デプロイ前の最終確認
- QA・受け入れテスト
- パフォーマンステスト
- クライアントデモ

**接続先**:
- Supabase Project: `https://[staging-project-id].supabase.co`
- Backend API: デプロイ先URL（例: Vercel, Cloud Run）
- Frontend: デプロイ先URL

---

### 3. 本番環境（Production）

**データベース**: Supabase（本番用プロジェクト）

- エンドユーザーが使用する本番環境
- 検証環境とは別のSupabaseプロジェクト
- 本番データを保存

**用途**:
- 実際のサービス提供
- 本番運用

**接続先**:
- Supabase Project: `https://[production-project-id].supabase.co`
- Backend API: 本番デプロイ先URL
- Frontend: 本番デプロイ先URL

---

## 環境変数の設定

### ローカル開発環境（`.env`）

```bash
# プロジェクト名
COMPOSE_PROJECT_NAME=bar-search-app

# 環境設定
ENVIRONMENT=development
DEBUG=true

# データベース設定（Docker PostgreSQL - ローカル）
DATABASE_URL=postgresql://postgres:postgres@db:5432/bar_search_dev

# Supabase設定（開発用プロジェクト - 認証のみ使用）
# 注意: これは開発用のSupabaseプロジェクトの値を設定してください
SUPABASE_URL=https://[dev-project-id].supabase.co
SUPABASE_KEY=[dev-service-role-key]
SUPABASE_JWT_SECRET=[dev-jwt-secret]

# フロントエンド用Supabase設定（開発用プロジェクト）
NEXT_PUBLIC_SUPABASE_URL=https://[dev-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[dev-anon-key]

# API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# CORS設定
CORS_ORIGINS=http://localhost:3000,http://frontend:3000
```

**重要**:
- Supabaseの値は**開発用プロジェクト**（`bar-search-app-dev`）の情報を使用
- データベースは**ローカルのDocker PostgreSQL**を使用（Supabaseのデータベースは使わない）
- 認証機能のみSupabaseを使用

### 検証環境（`.env.staging`）

```bash
# 環境設定
ENVIRONMENT=staging
DEBUG=false

# データベース設定（Supabase - 検証用プロジェクト）
DATABASE_URL=postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres

# Supabase設定（検証用プロジェクト）
SUPABASE_URL=https://[staging-project-id].supabase.co
SUPABASE_KEY=[staging-service-role-key]
SUPABASE_JWT_SECRET=[staging-jwt-secret]
NEXT_PUBLIC_SUPABASE_URL=https://[staging-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[staging-anon-key]

# API URL（デプロイ先に応じて変更）
NEXT_PUBLIC_API_URL=https://your-staging-api.example.com

# CORS設定
CORS_ORIGINS=https://your-staging-frontend.example.com
```

### 本番環境（`.env.production`）

```bash
# 環境設定
ENVIRONMENT=production
DEBUG=false

# データベース設定（Supabase - 本番用プロジェクト）
DATABASE_URL=postgresql://postgres.yyyyy:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres

# Supabase設定（本番用プロジェクト）
SUPABASE_URL=https://[production-project-id].supabase.co
SUPABASE_KEY=[production-service-role-key]
SUPABASE_JWT_SECRET=[production-jwt-secret]
NEXT_PUBLIC_SUPABASE_URL=https://[production-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[production-anon-key]

# API URL（本番デプロイ先）
NEXT_PUBLIC_API_URL=https://your-production-api.example.com

# CORS設定
CORS_ORIGINS=https://your-production-frontend.example.com
```

---

## Supabaseプロジェクトのセットアップ

このプロジェクトでは**3つのSupabaseプロジェクト**を作成します：
1. **開発用**（`bar-search-app-dev`）- ローカル開発での認証用
2. **検証用**（`bar-search-app-staging`）- 検証環境
3. **本番用**（`bar-search-app-production`）- 本番環境

---

### 開発用Supabaseプロジェクト作成（ローカル環境用）

ローカル開発環境で**認証機能のみ**使用します。データベースは使いません。

1. **Supabaseにログイン**
   - https://supabase.com にアクセス
   - アカウント作成またはログイン

2. **新規プロジェクト作成**
   - Organization選択
   - "New Project"をクリック
   - プロジェクト名: `bar-search-app-dev`
   - Database Password: 任意のパスワード（**データベースは使わないが必須**）
   - Region: `Northeast Asia (Tokyo)` または最寄りのリージョン
   - Pricing Plan: **Free**（無料プラン）

3. **認証設定のみ実施**
   - Dashboard → Authentication → Providers
   - Email認証を有効化
   - 必要に応じてGoogle/Twitter OAuthを設定（後述）
   - **データベースのマイグレーションは不要**（ローカルPostgreSQLを使うため）

4. **API Keysの取得**
   - Settings → API
   - `Project URL`: ローカルの `.env` の `SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_URL` に設定
   - `anon public`: `NEXT_PUBLIC_SUPABASE_ANON_KEY` に設定
   - `service_role`: `SUPABASE_KEY` に設定（**秘密鍵 - 公開しない**）

5. **JWT Secretの取得**
   - Settings → API → JWT Settings
   - `JWT Secret`: ローカルの `.env` の `SUPABASE_JWT_SECRET` に設定

6. **Database URLは無視**
   - ローカル開発ではDocker PostgreSQLを使うため、Supabaseのデータベース接続情報は不要

---

### 検証環境用Supabaseプロジェクト作成

検証環境では**認証とデータベースの両方**を使用します。

1. **Supabaseにログイン**
   - https://supabase.com にアクセス

2. **新規プロジェクト作成**
   - Organization選択
   - "New Project"をクリック
   - プロジェクト名: `bar-search-app-staging`
   - Database Password: 強力なパスワードを設定（**保存しておく**）
   - Region: `Northeast Asia (Tokyo)` または最寄りのリージョン
   - Pricing Plan: 開発中は無料プランでOK

3. **データベースのマイグレーション実行**
   - Supabase Dashboard → SQL Editor
   - `docs/supabase_migration.sql` の内容をコピー＆実行
   - テーブル、制約、RLSポリシーが作成される

4. **API Keysの取得**
   - Settings → API
   - `Project URL`: `.env.staging` の `SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_URL` に設定
   - `anon public`: `NEXT_PUBLIC_SUPABASE_ANON_KEY` に設定
   - `service_role`: `SUPABASE_KEY` に設定（**秘密鍵 - 公開しない**）

5. **JWT Secretの取得**
   - Settings → API → JWT Settings
   - `JWT Secret`: `.env.staging` の `SUPABASE_JWT_SECRET` に設定

6. **Database URLの取得**
   - Settings → Database → Connection string → URI
   - `postgres://...` の形式の接続文字列をコピー
   - `.env.staging` の `DATABASE_URL` に設定

---

### 本番環境用Supabaseプロジェクト作成

**検証環境と同じ手順を実行**しますが、以下の点を変更:
- プロジェクト名: `bar-search-app-production`
- **別のプロジェクトとして作成**（検証環境と完全分離）
- 取得したAPI KeysとSecretsは `.env.production` に保存

---

## 環境の切り替え方法

### ローカル環境で開発

```bash
# .envファイルが存在することを確認
cp .env.example .env

# Docker Composeで起動
task up
# または
docker compose up -d
```

### 検証環境へのデプロイ

```bash
# 検証環境用の環境変数をデプロイツールに設定
# 例: Vercel
vercel env add SUPABASE_URL production
# （検証環境の値を入力）

# デプロイ
vercel --prod
```

### 本番環境へのデプロイ

```bash
# 本番環境用の環境変数をデプロイツールに設定
# .env.production の値を使用

# デプロイ前に必ず検証環境でテスト完了していることを確認
```

---

## データベーススキーマの同期

### ローカル → 検証環境

1. ローカルでスキーマ変更を開発
2. `docs/supabase_migration.sql` を更新
3. Supabase（検証環境）のSQL Editorで実行
4. フロントエンド・バックエンドのコードをデプロイ

### 検証環境 → 本番環境

1. 検証環境で十分にテスト
2. `docs/supabase_migration.sql` が最新であることを確認
3. Supabase（本番環境）のSQL Editorで実行
4. **本番デプロイ前にバックアップ取得を推奨**
5. フロントエンド・バックエンドを本番環境にデプロイ

---

## トラブルシューティング

### ローカルでSupabase接続エラーが出る

**原因**: ローカル環境ではDockerのPostgreSQLを使うべき

**解決方法**:
- `.env` の `DATABASE_URL` が `postgresql://postgres:postgres@db:5432/bar_search_dev` になっているか確認
- Supabaseの設定はモック値でOK

### 検証/本番環境でDB接続エラー

**確認事項**:
1. Supabase Dashboardでプロジェクトが起動しているか
2. `DATABASE_URL` が正しいか（PasswordとProject IDを確認）
3. SupabaseのIPアクセス制限設定を確認
4. RLSポリシーが正しく設定されているか

### マイグレーションSQLでエラー

**ローカル環境の場合**:
- `docs/supabase_migration.sql` は `auth.users` スキーマを使用（Supabase専用）
- ローカルPostgreSQLでは `auth` スキーマが存在しないためエラーになる
- ローカル環境では別途初期化SQLを使用（現在は手動テーブル作成）

**Supabase環境の場合**:
- SQLを分割して実行
- エラーメッセージを確認してスキーマの依存関係を解決

---

## セキュリティ上の注意

### 環境変数の管理

- **`.env`**: gitignore対象（リポジトリにコミットしない）
- **`.env.example`**: コミットOK（実際の値は含めない）
- **`.env.staging` / `.env.production`**: **絶対にコミットしない**

### Supabase Service Role Key

- `SUPABASE_KEY`（service_role）は**超重要な秘密鍵**
- RLSポリシーをバイパスできる
- **絶対に公開しない**
- フロントエンドには**絶対に含めない**
- バックエンドでのみ使用

### Anon Key

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` は公開されるキー
- フロントエンドで使用
- RLSポリシーで保護されているので公開してもOK

---

## 推奨フロー

```
開発者ローカル
├─ 認証: Supabase (bar-search-app-dev)
└─ DB: Docker PostgreSQL
    ↓
    コード変更・機能開発・テスト
    ↓
検証環境
└─ 認証+DB: Supabase (bar-search-app-staging)
    ↓
    QA・テスト・デモ・受け入れテスト
    ↓
本番環境
└─ 認証+DB: Supabase (bar-search-app-production)
    ↓
    エンドユーザーに提供
```

**各環境の独立性**:
- 3つの環境は完全に独立しており、相互に影響を与えません
- 各環境は別々のSupabaseプロジェクトを使用
- ローカル環境のデータベースはDockerで完結（Supabaseのデータベースは使わない）
- 認証機能は全環境でSupabaseを使用
