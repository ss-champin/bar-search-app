# データベースセットアップガイド

このガイドでは、Supabaseプロジェクトのセットアップ手順を説明します。

## 重要：環境の分離

このプロジェクトでは、**3つの独立した環境**を使用します：

1. **ローカル開発環境**：Docker PostgreSQL（DB） + Supabase（認証のみ）
   - Supabaseプロジェクト: `bar-search-app-dev`（認証のみ使用、DBは使わない）
2. **検証環境（Staging）**：Supabase専用プロジェクト（認証+DB）
   - Supabaseプロジェクト: `bar-search-app-staging`
3. **本番環境（Production）**：Supabase専用プロジェクト（認証+DB、検証とは別）
   - Supabaseプロジェクト: `bar-search-app-production`

**3つの環境は完全に分離してください**。同じSupabaseプロジェクトを共有しないでください。

詳細は `docs/environment_setup.md` を参照してください。

---

## 前提条件
- Supabaseアカウントを作成済み
- 3つの環境それぞれに別々のプロジェクトを作成する準備ができている
  - 開発用（`bar-search-app-dev`）: ローカル開発での認証用
  - 検証用（`bar-search-app-staging`）: 検証環境
  - 本番用（`bar-search-app-production`）: 本番環境

---

## 1. Supabaseプロジェクトの作成

**注意**：検証環境と本番環境で、それぞれ以下の手順を実行してください。

### 1.1 新規プロジェクト作成

#### 検証環境用プロジェクト

1. [Supabase Dashboard](https://app.supabase.com/) にアクセス
2. "New Project" をクリック
3. プロジェクト情報を入力:
   - **Name**: `bar-search-app-staging`
   - **Database Password**: 強力なパスワードを設定（**保存しておく**）
   - **Region**: `Northeast Asia (Tokyo)` を選択
   - **Pricing Plan**: Free（開発用）
4. "Create new project" をクリック

#### 本番環境用プロジェクト

1. [Supabase Dashboard](https://app.supabase.com/) にアクセス
2. "New Project" をクリック
3. プロジェクト情報を入力:
   - **Name**: `bar-search-app-production`
   - **Database Password**: 強力なパスワードを設定（**検証とは別のパスワード**）
   - **Region**: `Northeast Asia (Tokyo)` を選択
   - **Pricing Plan**: 本番運用に応じたプラン
4. "Create new project" をクリック

### 1.2 プロジェクト情報の確認
プロジェクト作成後、以下の情報をメモしておく:
- **Project URL**: `https://[your-project-id].supabase.co`
- **API Keys**:
  - `anon` (public) key
  - `service_role` key

---

## 2. データベースマイグレーション

### 2.1 SQLエディタでマイグレーション実行

1. Supabase Dashboard で **SQL Editor** を開く
2. `docs/supabase_migration.sql` の内容をコピー
3. SQL Editorに貼り付け
4. "RUN" ボタンをクリックして実行

### 2.2 マイグレーション確認

以下のテーブルが作成されていることを確認:
- `admin_users`
- `profiles`
- `bars`
- `reviews`
- `favorites`

**確認方法:**
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

---

## 3. Supabase Authの設定

### 3.1 メール認証の設定

1. Dashboard > **Authentication** > **Settings** を開く
2. **Email Auth** セクションで以下を確認:
   - "Enable Email Signup" がONになっていることを確認
   - "Confirm Email" をONにする（推奨）
   - "Secure Email Change" をONにする（推奨）

### 3.2 Google OAuth設定

1. **Google Cloud Console** で OAuth クライアントを作成:
   - https://console.cloud.google.com/
   - プロジェクトを作成（または既存プロジェクトを選択）
   - 「APIとサービス」 > 「認証情報」
   - 「認証情報を作成」 > 「OAuth クライアント ID」
   - アプリケーションの種類: **ウェブアプリケーション**
   - 承認済みのリダイレクト URI:
     ```
     https://[your-project-id].supabase.co/auth/v1/callback
     ```
   - クライアントIDとクライアントシークレットをコピー

2. **Supabase Dashboard** で設定:
   - Dashboard > **Authentication** > **Providers**
   - **Google** を選択
   - "Enable Google Provider" をONにする
   - Google Client IDを入力
   - Google Client Secretを入力
   - "Save" をクリック

### 3.3 X (Twitter) OAuth設定

1. **X Developers Portal** でアプリを作成:
   - https://developer.twitter.com/
   - プロジェクトとアプリを作成
   - App settingsで "User authentication settings" を設定
   - Type of App: **Web App, Automated App or Bot**
   - Callback URI:
     ```
     https://[your-project-id].supabase.co/auth/v1/callback
     ```
   - API KeyとAPI Key Secretをコピー

2. **Supabase Dashboard** で設定:
   - Dashboard > **Authentication** > **Providers**
   - **Twitter** を選択
   - "Enable Twitter Provider" をONにする
   - Twitter API Keyを入力
   - Twitter API Key Secretを入力
   - "Save" をクリック

---

## 4. Supabase Storageの設定

### 4.1 avatarsバケットの作成

1. Dashboard > **Storage** を開く
2. "Create bucket" をクリック
3. バケット情報を入力:
   - **Name**: `avatars`
   - **Public bucket**: ONにする
4. "Create bucket" をクリック

### 4.2 bar-imagesバケットの作成

1. "Create bucket" をクリック
2. バケット情報を入力:
   - **Name**: `bar-images`
   - **Public bucket**: ONにする
3. "Create bucket" をクリック

### 4.3 ストレージポリシーの設定

**avatarsバケット:**
```sql
-- 読み取り: 全員が閲覧可能
CREATE POLICY "avatars_public_read" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- アップロード: 認証済みユーザーのみ自分のフォルダにアップロード可能
CREATE POLICY "avatars_authenticated_upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::TEXT
);

-- 更新: 自分のファイルのみ更新可能
CREATE POLICY "avatars_user_update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND
  auth.uid()::TEXT = (storage.foldername(name))[1]
);

-- 削除: 自分のファイルのみ削除可能
CREATE POLICY "avatars_user_delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND
  auth.uid()::TEXT = (storage.foldername(name))[1]
);
```

**bar-imagesバケット:**
```sql
-- 読み取り: 全員が閲覧可能
CREATE POLICY "bar_images_public_read" ON storage.objects
FOR SELECT USING (bucket_id = 'bar-images');

-- アップロード: 管理者のみアップロード可能
CREATE POLICY "bar_images_admin_upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'bar-images' AND
  is_admin(auth.uid())
);

-- 更新: 管理者のみ更新可能
CREATE POLICY "bar_images_admin_update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'bar-images' AND
  is_admin(auth.uid())
);

-- 削除: 管理者のみ削除可能
CREATE POLICY "bar_images_admin_delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'bar-images' AND
  is_admin(auth.uid())
);
```

**実行方法:**
- Dashboard > **Storage** > 各バケット > **Policies** タブで "New policy" をクリックして追加

---

## 5. 初期管理者ユーザーの設定

### 5.1 管理者アカウントの作成

1. まず通常のユーザー登録を行う（メールアドレス認証）
2. 登録したユーザーのUIDを確認:
   ```sql
   SELECT id, email FROM auth.users;
   ```

### 5.2 管理者権限の付与

```sql
-- ユーザーIDを管理者テーブルに追加
INSERT INTO admin_users (user_id)
VALUES ('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');  -- 実際のユーザーIDに置き換える
```

### 5.3 管理者権限の確認

```sql
-- 管理者かどうかを確認
SELECT is_admin('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');  -- trueが返ればOK
```

---

## 6. 環境変数の設定

アプリケーションで使用する環境変数を設定します。

### 6.1 フロントエンド (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

### 6.2 バックエンド (.env)

```env
# Supabase
SUPABASE_URL=https://[your-project-id].supabase.co
SUPABASE_KEY=[your-service-role-key]
SUPABASE_JWT_SECRET=[your-jwt-secret]

# Database (直接接続する場合)
DATABASE_URL=postgresql://postgres:[password]@db.[your-project-id].supabase.co:5432/postgres
```

**JWT Secretの取得方法:**
- Dashboard > **Settings** > **API** > **JWT Settings** > "JWT Secret"

---

## 7. データベースの動作確認

### 7.1 テストデータの投入

```sql
-- テスト用バーデータの作成（管理者権限が必要）
INSERT INTO bars (
  name,
  description,
  prefecture,
  city,
  address,
  opening_hours,
  regular_holiday,
  menu_beer_price,
  menu_whiskey_price,
  menu_cocktail_price,
  created_by
) VALUES (
  'テストバー',
  '渋谷にあるおしゃれなカクテルバー',
  '東京都',
  '渋谷区',
  '渋谷1-2-3 渋谷ビル3F',
  '{
    "monday": {"open": "18:00", "close": "02:00"},
    "tuesday": {"open": "18:00", "close": "02:00"},
    "wednesday": {"open": "18:00", "close": "02:00"},
    "thursday": {"open": "18:00", "close": "02:00"},
    "friday": {"open": "18:00", "close": "04:00"},
    "saturday": {"open": "18:00", "close": "04:00"},
    "sunday": null
  }'::jsonb,
  '日曜日',
  '¥500～',
  '¥800～',
  '¥1000～',
  'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'  -- 管理者のユーザーID
);
```

### 7.2 ビューの確認

```sql
-- バー情報と評価を確認
SELECT * FROM bar_with_ratings;
```

---

## 8. トラブルシューティング

### RLSポリシーが機能しない場合
```sql
-- RLSが有効になっているか確認
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- rowsecurity が false の場合は有効化
ALTER TABLE [テーブル名] ENABLE ROW LEVEL SECURITY;
```

### トリガーが動作しない場合
```sql
-- トリガーの確認
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

### ストレージアップロードができない場合
- バケットが public になっているか確認
- ストレージポリシーが正しく設定されているか確認
- ファイルサイズ制限を確認

---

## 完了チェックリスト

- [ ] Supabaseプロジェクト作成完了
- [ ] データベースマイグレーション完了
- [ ] メール認証設定完了
- [ ] Google OAuth設定完了
- [ ] X OAuth設定完了
- [ ] Storageバケット作成完了（avatars, bar-images）
- [ ] ストレージポリシー設定完了
- [ ] 初期管理者ユーザー設定完了
- [ ] 環境変数設定完了
- [ ] テストデータ投入・動作確認完了

これでデータベースのセットアップは完了です！
