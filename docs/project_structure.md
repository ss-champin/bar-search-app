# プロジェクト構成

## 全体構成

```
バー検索アプリ/
├── backend/                    # FastAPIバックエンド
├── frontend/                   # Next.jsフロントエンド
├── docs/                       # ドキュメント
├── docker-compose.yml          # Docker Compose設定
├── Taskfile.yml                # タスクランナー設定
├── .env.example                # 環境変数サンプル
├── .gitignore                  # Git除外設定
└── README.md                   # プロジェクト説明
```

---

## バックエンド構成

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPIアプリケーションエントリーポイント
│   │
│   ├── core/                   # コア設定
│   │   ├── __init__.py
│   │   ├── config.py           # アプリケーション設定
│   │   ├── database.py         # データベース接続
│   │   └── security.py         # 認証・セキュリティ
│   │
│   ├── api/                    # APIエンドポイント
│   │   ├── __init__.py
│   │   ├── bars.py             # バーAPI
│   │   ├── reviews.py          # レビューAPI
│   │   ├── favorites.py        # お気に入りAPI
│   │   └── users.py            # ユーザーAPI
│   │
│   ├── models/                 # SQLAlchemyモデル（DBテーブル定義）
│   │   ├── __init__.py
│   │   ├── bar.py              # Barモデル
│   │   ├── review.py           # Reviewモデル
│   │   ├── favorite.py         # Favoriteモデル
│   │   └── profile.py          # Profileモデル
│   │
│   ├── schemas/                # Pydanticスキーマ（バリデーション）
│   │   ├── __init__.py
│   │   ├── bar.py              # Barスキーマ
│   │   ├── review.py           # Reviewスキーマ
│   │   ├── favorite.py         # Favoriteスキーマ
│   │   └── user.py             # Userスキーマ
│   │
│   ├── services/               # ビジネスロジック
│   │   ├── __init__.py
│   │   ├── bar_service.py      # バー関連処理
│   │   ├── review_service.py   # レビュー関連処理
│   │   └── ...
│   │
│   └── dependencies/           # 依存性注入
│       ├── __init__.py
│       ├── auth.py             # 認証依存性
│       └── database.py         # DB依存性
│
├── tests/                      # テスト
│   ├── __init__.py
│   ├── conftest.py             # pytest設定
│   ├── test_bars.py            # バーAPIテスト
│   ├── test_reviews.py         # レビューAPIテスト
│   └── ...
│
├── Dockerfile                  # Dockerイメージ定義
├── pyproject.toml              # uv設定、依存関係
├── .python-version             # Pythonバージョン指定
└── .gitignore                  # Git除外設定
```

---

## フロントエンド構成

```
frontend/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # ルートレイアウト
│   ├── page.tsx                # トップページ（バー一覧）
│   ├── globals.css             # グローバルCSS
│   │
│   ├── bars/                   # バー関連ページ
│   │   └── [id]/
│   │       └── page.tsx        # バー詳細ページ
│   │
│   ├── login/                  # ログインページ
│   │   └── page.tsx
│   │
│   ├── signup/                 # 新規登録ページ
│   │   └── page.tsx
│   │
│   ├── mypage/                 # マイページ
│   │   └── page.tsx
│   │
│   ├── favorites/              # お気に入り一覧
│   │   └── page.tsx
│   │
│   └── admin/                  # 管理者ページ
│       └── bars/
│           ├── page.tsx        # バー管理一覧
│           ├── new/
│           │   └── page.tsx    # バー登録
│           └── [id]/
│               └── edit/
│                   └── page.tsx # バー編集
│
├── components/                 # Reactコンポーネント
│   ├── layout/
│   │   ├── Header.tsx          # ヘッダー
│   │   └── Footer.tsx          # フッター
│   │
│   ├── bars/
│   │   ├── BarCard.tsx         # バーカード
│   │   ├── BarList.tsx         # バー一覧
│   │   └── BarDetail.tsx       # バー詳細
│   │
│   ├── reviews/
│   │   ├── ReviewForm.tsx      # レビューフォーム
│   │   ├── ReviewList.tsx      # レビュー一覧
│   │   └── ReviewCard.tsx      # レビューカード
│   │
│   ├── search/
│   │   └── SearchFilter.tsx    # 検索フィルター
│   │
│   └── auth/
│       ├── LoginForm.tsx       # ログインフォーム
│       └── SignupForm.tsx      # 登録フォーム
│
├── lib/                        # ユーティリティ、hooks
│   ├── supabase.ts             # Supabaseクライアント
│   ├── api.ts                  # APIクライアント
│   ├── hooks/
│   │   ├── useAuth.ts          # 認証フック
│   │   ├── useBars.ts          # バーデータフック
│   │   └── ...
│   └── utils/
│       ├── format.ts           # フォーマット関数
│       └── validation.ts       # バリデーション
│
├── store/                      # 状態管理（Zustand）
│   ├── authStore.ts            # 認証状態
│   └── barStore.ts             # バーデータ状態
│
├── types/                      # TypeScript型定義
│   ├── bar.ts
│   ├── review.ts
│   └── user.ts
│
├── public/                     # 静的ファイル
│   ├── images/
│   └── icons/
│
├── Dockerfile                  # Dockerイメージ定義
├── package.json                # npm設定、依存関係
├── biome.json                  # Biome設定
├── tsconfig.json               # TypeScript設定
├── next.config.js              # Next.js設定
└── .gitignore                  # Git除外設定
```

---

## ドキュメント構成

```
docs/
├── requirements.md              # 要件定義書
├── functional_requirements.md   # 機能要件詳細
├── database_schema.md           # データベース設計書
├── supabase_migration.sql       # マイグレーションSQL
├── database_setup_guide.md      # DB セットアップガイド
├── api_specification.yaml       # OpenAPI仕様書
├── api_design.md                # API設計書
├── setup_guide.md               # 開発環境セットアップガイド
└── project_structure.md         # 本ファイル
```

---

## Docker構成

```
Docker環境:
├── db (PostgreSQL)              # データベース
│   ├── Port: 5432
│   └── Volume: postgres_data
│
├── backend (FastAPI)            # バックエンドAPI
│   ├── Port: 8000
│   ├── Volume: ./backend → /app
│   └── Depends: db
│
├── frontend (Next.js)           # フロントエンド
│   ├── Port: 3000
│   ├── Volume: ./frontend → /app
│   └── Depends: backend
│
└── pgadmin (オプション)         # DB管理ツール
    ├── Port: 5050
    ├── Profile: tools
    └── Depends: db
```

---

## 環境変数構成

### .env ファイル

```env
# データベース
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bar_search_dev

# Supabase（本番環境用）
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# フロントエンド用
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000

# アプリケーション設定
ENVIRONMENT=development
DEBUG=true
CORS_ORIGINS=http://localhost:3000
```

---

## 開発フロー

### 1. 機能追加の流れ

```
1. 要件確認
   └─> docs/requirements.md

2. データベース設計
   └─> docs/supabase_migration.sql

3. バックエンド実装
   ├─> backend/app/models/     (DBモデル)
   ├─> backend/app/schemas/    (Pydanticスキーマ)
   ├─> backend/app/services/   (ビジネスロジック)
   └─> backend/app/api/        (エンドポイント)

4. フロントエンド実装
   ├─> frontend/types/         (型定義)
   ├─> frontend/lib/           (API呼び出し)
   ├─> frontend/components/    (UIコンポーネント)
   └─> frontend/app/           (ページ)

5. テスト
   ├─> backend/tests/          (バックエンドテスト)
   └─> frontend/              (E2Eテスト - 今後追加)

6. デプロイ
   ├─> Vercel (フロントエンド)
   └─> Render/Railway (バックエンド)
```

### 2. タスク実行フロー

```bash
# 開発開始
task up

# コード編集
# ...

# リント・フォーマット
task format
task lint:fix

# 型チェック
task type-check

# テスト
task test

# 完了
task down
```

---

## 依存関係

### バックエンド主要パッケージ

- **FastAPI**: Web APIフレームワーク
- **Uvicorn**: ASGIサーバー
- **Pydantic**: データバリデーション
- **SQLAlchemy**: ORM
- **asyncpg**: 非同期PostgreSQLドライバ
- **supabase**: Supabase Python SDK
- **mypy**: 型チェッカー
- **ruff**: リンター/フォーマッター
- **pytest**: テストフレームワーク

### フロントエンド主要パッケージ

- **Next.js**: Reactフレームワーク
- **React**: UIライブラリ
- **TypeScript**: 型付きJavaScript
- **@supabase/supabase-js**: Supabase SDK
- **Zustand**: 状態管理
- **Biome**: リンター/フォーマッター

---

## 次のステップ

プロジェクト構成を理解したら、以下のドキュメントを参照して開発を進めてください：

1. **開発環境構築**: `docs/setup_guide.md`
2. **機能要件確認**: `docs/functional_requirements.md`
3. **API仕様確認**: `docs/api_specification.yaml`
4. **DB設計確認**: `docs/database_schema.md`
