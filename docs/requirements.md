# バー検索アプリ 要件定義書

## 1. プロジェクト概要

**コンセプト**: 一人の時間を、もっと豊かに。

しっぽり飲めるバー・一人でも行きやすいバーを探すアプリ。ユーザーが条件に合ったバーを検索・評価・保存できるWebアプリケーション。一人でゆっくりと過ごせる落ち着いた雰囲気のバーを見つけるためのサービスです。

## 2. 技術スタック

### フロントエンド
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **State Management**: React Context API / Zustand（検討）
- **UI Library**: Tailwind CSS / shadcn/ui（検討）
- **認証**: Supabase Auth (クライアント側)

### バックエンド
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **Validation**: Pydantic v2
- **認証**: Supabase Auth (サーバー側検証)
- **CORS**: 設定必要

### データベース
- **Platform**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
  - メールアドレス + パスワード
  - SSO (Google, Twitter/X)
- **Storage**: Supabase Storage（画像保存用）

## 3. 主要機能

### 3.1 認証・アカウント管理機能

#### アカウント作成
- メールアドレスで登録 OR Google/X SSOで登録
- **登録時の入力項目:**
  - メールアドレス（メール登録の場合は必須）
  - パスワード（メール登録の場合は必須）
  - ニックネーム（必須）
  - 年齢（必須）
  - アイコン写真（任意）

#### ログイン
- メールアドレス + パスワードでログイン
- Google SSOでログイン
- X (Twitter) SSOでログイン
- ログアウト

#### パスワード管理
- ログインパスワードのリセット機能

#### マイページ機能
- **ユーザー情報の閲覧:**
  - メールアドレス
  - ニックネーム
  - 年齢
  - アイコン写真
- **ユーザー情報の編集:**
  - メールアドレスの変更
  - ニックネームの変更
  - 年齢の変更
  - アイコン写真の変更

### 3.2 バー検索・表示機能

#### Bar検索・一覧表示
- **検索条件:**
  - 都道府県で絞り込み
  - 市区町村で絞り込み
- **Bar一覧表示:**
  - 検索結果をカード形式で一覧表示
  - 店名、写真、エリア、評価などの基本情報を表示

#### Bar詳細情報の閲覧
- **表示項目:**
  - 店名
  - 住所
  - 店内写真（複数枚）
  - 営業時間
  - 定休日
  - メニュー情報
    - ビール（料金: ¥〇〇〇～）
    - ウィスキー（料金: ¥〇〇〇～）
    - カクテル（料金: ¥〇〇〇～）
  - 投稿されたレビュー一覧（Bar詳細画面に表示）

### 3.3 レビュー・評価機能

#### レビューの閲覧
- Bar詳細画面でレビュー一覧を表示
- 各レビューには投稿者、評価、コメントを表示

#### レビューの投稿
- ログインユーザーのみ投稿可能
- 星評価とコメントを投稿

#### レビューの編集
- 自分で投稿したレビューのみ編集可能
- 評価とコメントを変更可能

### 3.4 お気に入り機能

#### お気に入り登録
- ハートマークをクリックしてBarをお気に入りに追加
- ログインユーザーのみ利用可能

#### お気に入り一覧の閲覧
- マイページからお気に入りのBar一覧を表示
- お気に入りから削除も可能

### 3.5 管理機能
- [x] バー情報の登録（管理者のみ）
- [x] バー情報の編集（管理者のみ）
- [x] バー情報の削除（管理者のみ）
- [x] 画像アップロード

## 4. データベース設計（概要）

### 4.1 テーブル構成

#### users テーブル
Supabase Authで自動生成されるauth.usersを利用
追加のプロフィール情報は別テーブル（profiles）で管理

#### profiles テーブル
- user_id (UUID, PK, FK to auth.users.id)
- email (VARCHAR, メールアドレス) ※auth.usersから取得
- nickname (VARCHAR, ニックネーム, NOT NULL)
- age (INTEGER, 年齢, NOT NULL)
- avatar_url (TEXT, アイコン写真URL, NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

#### bars テーブル
- id (UUID, PK)
- name (VARCHAR, 店名, NOT NULL)
- description (TEXT, 説明)
- prefecture (VARCHAR, 都道府県, NOT NULL)
- city (VARCHAR, 市区町村, NOT NULL)
- address (TEXT, 住所詳細, NOT NULL)
- image_urls (TEXT[], 店内写真URL配列)
- opening_hours (JSONB, 営業時間)
- regular_holiday (VARCHAR, 定休日)
- menu_beer_price (VARCHAR, ビール料金 例: "¥500～")
- menu_whiskey_price (VARCHAR, ウィスキー料金 例: "¥800～")
- menu_cocktail_price (VARCHAR, カクテル料金 例: "¥700～")
- phone (VARCHAR, 電話番号)
- website (TEXT, Webサイト)
- created_by (UUID, FK to auth.users.id)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

#### reviews テーブル
- id (UUID, PK)
- bar_id (UUID, FK to bars.id, NOT NULL)
- user_id (UUID, FK to auth.users.id, NOT NULL)
- rating (INTEGER, 1-5の星評価, NOT NULL)
- comment (TEXT, レビューコメント)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

#### favorites テーブル
- id (UUID, PK)
- bar_id (UUID, FK to bars.id, NOT NULL)
- user_id (UUID, FK to auth.users.id, NOT NULL)
- created_at (TIMESTAMP)
- UNIQUE制約: (bar_id, user_id) ※同じユーザーが同じBarを重複してお気に入り登録できない

### 4.2 Row Level Security (RLS)
- 各テーブルにRLSを設定
- ユーザーは自分のデータのみ編集可能
- 管理者のみバー情報を編集可能

## 5. API設計（概要）

### 5.1 認証API
- Supabase Authを使用するため、FastAPI側では認証トークンの検証のみ

### 5.2 バーAPI
- `GET /api/bars` - バー一覧取得
  - クエリパラメータ: `prefecture` (都道府県), `city` (市区町村)
  - レスポンス: Bar一覧（店名、写真、住所、評価など）
- `GET /api/bars/{bar_id}` - バー詳細取得
  - レスポンス: Bar詳細情報（住所、店内写真、営業時間、定休日、メニュー）
- `POST /api/bars` - バー登録（管理者のみ）
- `PUT /api/bars/{bar_id}` - バー更新（管理者のみ）
- `DELETE /api/bars/{bar_id}` - バー削除（管理者のみ）

### 5.3 レビューAPI
- `GET /api/bars/{bar_id}/reviews` - レビュー一覧取得
- `POST /api/bars/{bar_id}/reviews` - レビュー投稿
- `PUT /api/reviews/{review_id}` - レビュー更新
- `DELETE /api/reviews/{review_id}` - レビュー削除

### 5.4 お気に入りAPI
- `GET /api/favorites` - お気に入り一覧取得
- `POST /api/favorites` - お気に入り追加
- `DELETE /api/favorites/{favorite_id}` - お気に入り削除

### 5.5 ユーザーAPI
- `GET /api/users/me` - 自分のプロフィール取得
  - レスポンス: メールアドレス、ニックネーム、年齢、アイコン写真
- `PUT /api/users/me` - プロフィール更新
  - リクエストボディ: メールアドレス、ニックネーム、年齢、アイコン写真
- `GET /api/users/me/reviews` - 自分が投稿したレビュー一覧取得

## 6. 画面設計（概要）

### 6.1 ページ構成

#### 一般ユーザー向けページ
- `/` - トップページ（バー検索・一覧表示）
  - 都道府県・市区町村での検索フォーム
  - Bar一覧をカード形式で表示
- `/bars/[id]` - バー詳細ページ
  - Bar情報の詳細表示
  - レビュー一覧表示
  - お気に入り登録ボタン（ハートマーク）
  - レビュー投稿フォーム
- `/mypage` - マイページ
  - ユーザー情報の表示・編集
  - お気に入りBar一覧
  - 自分が投稿したレビュー一覧
- `/login` - ログインページ
  - メールアドレス + パスワード入力
  - Google/X SSOボタン
  - パスワードリセットリンク
- `/signup` - 新規登録ページ
  - メールアドレス + パスワード入力
  - ニックネーム、年齢入力
  - アイコン写真アップロード（任意）
  - Google/X SSO登録ボタン
- `/password-reset` - パスワードリセットページ

#### 管理者向けページ
- `/admin/bars` - バー管理ページ（管理者のみ）
- `/admin/bars/new` - バー登録ページ（管理者のみ）
- `/admin/bars/[id]/edit` - バー編集ページ（管理者のみ）

### 6.2 コンポーネント構成
- Header（ナビゲーション）
- Footer
- BarCard（バーカード）
- BarList（バーリスト）
- SearchFilter（検索フィルター）
- ReviewForm（レビューフォーム）
- ReviewList（レビューリスト）
- AuthForm（認証フォーム）

## 7. 非機能要件

### 7.1 セキュリティ
- HTTPS通信
- Supabase RLSによるデータ保護
- XSS対策
- CSRF対策
- SQLインジェクション対策（Pydantic + ORM使用）

### 7.2 パフォーマンス
- ページロード時間: 3秒以内
- API レスポンス時間: 500ms以内
- 画像の最適化（WebP形式、遅延読み込み）

### 7.3 ユーザビリティ
- レスポンシブデザイン（モバイル対応）
- 直感的なUI/UX
- エラーメッセージの分かりやすさ

## 8. 開発フェーズ

### Phase 1: 基盤構築
- [x] 要件定義
- [ ] Supabaseプロジェクト作成
- [ ] データベース設計・構築
- [ ] Next.jsプロジェクト初期化
- [ ] FastAPIプロジェクト初期化

### Phase 2: 認証機能
- [ ] Supabase Auth設定
- [ ] メール認証実装
- [ ] Google SSO実装
- [ ] Twitter/X SSO実装
- [ ] プロフィール管理

### Phase 3: コア機能
- [ ] バー一覧・詳細表示
- [ ] 検索・フィルタ機能
- [ ] レビュー機能
- [ ] お気に入り機能

### Phase 4: 管理機能
- [ ] バー登録・編集・削除
- [ ] 画像アップロード

### Phase 5: 仕上げ
- [ ] UI/UXの改善
- [ ] テスト
- [ ] デプロイ

## 9. デプロイ環境（検討）
- **Frontend**: Vercel
- **Backend**: Render / Railway / Google Cloud Run
- **Database**: Supabase (クラウド)

## 10. 今後の拡張機能（オプション）
- [ ] 地図表示機能
- [ ] 位置情報検索
- [ ] 予約機能
- [ ] チャット機能
- [ ] 通知機能
- [ ] 多言語対応
