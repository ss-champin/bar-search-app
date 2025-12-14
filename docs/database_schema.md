# データベース設計詳細

## 概要
- **DBMS**: PostgreSQL (Supabase)
- **認証**: Supabase Auth
- **ストレージ**: Supabase Storage (画像保存)

---

## ER図（テキスト形式）

```
auth.users (Supabase Auth自動生成)
    ↓ 1:1
profiles
    ↑
    |
    ├─ 1:N → reviews
    ├─ 1:N → favorites
    └─ 1:N → bars (created_by)

bars
    ├─ 1:N → reviews
    └─ 1:N → favorites
```

---

## テーブル定義

### 1. profiles テーブル
ユーザーのプロフィール情報を管理

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| user_id | UUID | PK, FK (auth.users.id) | ユーザーID |
| email | VARCHAR(255) | NOT NULL | メールアドレス（auth.usersから同期） |
| nickname | VARCHAR(50) | NOT NULL | ニックネーム |
| age | INTEGER | NOT NULL, CHECK (age >= 1 AND age <= 150) | 年齢 |
| avatar_url | TEXT | NULLABLE | アイコン写真のURL |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新日時 |

**インデックス:**
- PRIMARY KEY (user_id)
- INDEX idx_profiles_email ON profiles(email)

---

### 2. bars テーブル
バー情報を管理

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | バーID |
| name | VARCHAR(100) | NOT NULL | 店名 |
| description | TEXT | NULLABLE | 説明 |
| prefecture | VARCHAR(10) | NOT NULL | 都道府県 |
| city | VARCHAR(50) | NOT NULL | 市区町村 |
| address | TEXT | NOT NULL | 住所詳細 |
| image_urls | TEXT[] | DEFAULT ARRAY[]::TEXT[] | 店内写真のURL配列 |
| opening_hours | JSONB | NULLABLE | 営業時間（JSON形式） |
| regular_holiday | VARCHAR(100) | NULLABLE | 定休日 |
| menu_beer_price | VARCHAR(50) | NULLABLE | ビール料金（例: "¥500～"） |
| menu_whiskey_price | VARCHAR(50) | NULLABLE | ウィスキー料金（例: "¥800～"） |
| menu_cocktail_price | VARCHAR(50) | NULLABLE | カクテル料金（例: "¥700～"） |
| phone | VARCHAR(20) | NULLABLE | 電話番号 |
| website | TEXT | NULLABLE | Webサイト |
| created_by | UUID | FK (auth.users.id) | 作成者（管理者） |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新日時 |

**インデックス:**
- PRIMARY KEY (id)
- INDEX idx_bars_prefecture ON bars(prefecture)
- INDEX idx_bars_city ON bars(city)
- INDEX idx_bars_prefecture_city ON bars(prefecture, city)
- INDEX idx_bars_created_by ON bars(created_by)

**opening_hours JSON形式例:**
```json
{
  "monday": {"open": "18:00", "close": "02:00"},
  "tuesday": {"open": "18:00", "close": "02:00"},
  "wednesday": {"open": "18:00", "close": "02:00"},
  "thursday": {"open": "18:00", "close": "02:00"},
  "friday": {"open": "18:00", "close": "04:00"},
  "saturday": {"open": "18:00", "close": "04:00"},
  "sunday": null
}
```

---

### 3. reviews テーブル
バーのレビュー情報を管理

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | レビューID |
| bar_id | UUID | NOT NULL, FK (bars.id) ON DELETE CASCADE | バーID |
| user_id | UUID | NOT NULL, FK (auth.users.id) ON DELETE CASCADE | ユーザーID |
| rating | INTEGER | NOT NULL, CHECK (rating >= 1 AND rating <= 5) | 星評価（1-5） |
| comment | TEXT | NULLABLE, CHECK (LENGTH(comment) <= 2000) | レビューコメント |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新日時 |

**インデックス:**
- PRIMARY KEY (id)
- INDEX idx_reviews_bar_id ON reviews(bar_id)
- INDEX idx_reviews_user_id ON reviews(user_id)
- INDEX idx_reviews_created_at ON reviews(created_at DESC)

---

### 4. favorites テーブル
ユーザーのお気に入りバー情報を管理

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | お気に入りID |
| bar_id | UUID | NOT NULL, FK (bars.id) ON DELETE CASCADE | バーID |
| user_id | UUID | NOT NULL, FK (auth.users.id) ON DELETE CASCADE | ユーザーID |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 作成日時 |

**制約:**
- UNIQUE (bar_id, user_id) - 同じユーザーが同じバーを重複してお気に入り登録できない

**インデックス:**
- PRIMARY KEY (id)
- UNIQUE INDEX idx_favorites_unique ON favorites(bar_id, user_id)
- INDEX idx_favorites_user_id ON favorites(user_id)

---

## Row Level Security (RLS) ポリシー

### profiles テーブル
```sql
-- 読み取り: 全員が全てのプロフィールを閲覧可能
CREATE POLICY "profiles_select_policy" ON profiles
FOR SELECT USING (true);

-- 挿入: 自分のプロフィールのみ作成可能
CREATE POLICY "profiles_insert_policy" ON profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 更新: 自分のプロフィールのみ更新可能
CREATE POLICY "profiles_update_policy" ON profiles
FOR UPDATE USING (auth.uid() = user_id);

-- 削除: 自分のプロフィールのみ削除可能
CREATE POLICY "profiles_delete_policy" ON profiles
FOR DELETE USING (auth.uid() = user_id);
```

### bars テーブル
```sql
-- 読み取り: 全員が全てのバー情報を閲覧可能
CREATE POLICY "bars_select_policy" ON bars
FOR SELECT USING (true);

-- 挿入: 管理者のみ作成可能（is_admin関数を使用）
CREATE POLICY "bars_insert_policy" ON bars
FOR INSERT WITH CHECK (is_admin(auth.uid()));

-- 更新: 管理者のみ更新可能
CREATE POLICY "bars_update_policy" ON bars
FOR UPDATE USING (is_admin(auth.uid()));

-- 削除: 管理者のみ削除可能
CREATE POLICY "bars_delete_policy" ON bars
FOR DELETE USING (is_admin(auth.uid()));
```

### reviews テーブル
```sql
-- 読み取り: 全員が全てのレビューを閲覧可能
CREATE POLICY "reviews_select_policy" ON reviews
FOR SELECT USING (true);

-- 挿入: ログインユーザーのみ自分のレビューを作成可能
CREATE POLICY "reviews_insert_policy" ON reviews
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 更新: 自分のレビューのみ更新可能
CREATE POLICY "reviews_update_policy" ON reviews
FOR UPDATE USING (auth.uid() = user_id);

-- 削除: 自分のレビューのみ削除可能
CREATE POLICY "reviews_delete_policy" ON reviews
FOR DELETE USING (auth.uid() = user_id);
```

### favorites テーブル
```sql
-- 読み取り: 自分のお気に入りのみ閲覧可能
CREATE POLICY "favorites_select_policy" ON favorites
FOR SELECT USING (auth.uid() = user_id);

-- 挿入: ログインユーザーのみ自分のお気に入りを作成可能
CREATE POLICY "favorites_insert_policy" ON favorites
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 削除: 自分のお気に入りのみ削除可能
CREATE POLICY "favorites_delete_policy" ON favorites
FOR DELETE USING (auth.uid() = user_id);
```

---

## 管理者判定関数

```sql
-- 管理者判定用のテーブル
CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLSを有効化
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 管理者のみ閲覧可能
CREATE POLICY "admin_users_select_policy" ON admin_users
FOR SELECT USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- 管理者判定関数
CREATE OR REPLACE FUNCTION is_admin(uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = uid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## トリガー関数

### updated_at自動更新トリガー
```sql
-- updated_atを自動更新する関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- profilesテーブルにトリガーを設定
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- barsテーブルにトリガーを設定
CREATE TRIGGER update_bars_updated_at
BEFORE UPDATE ON bars
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- reviewsテーブルにトリガーを設定
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 新規ユーザー登録時にプロフィール作成
```sql
-- 新規ユーザー登録時に自動的にprofilesレコードを作成
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, email, nickname, age)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nickname', 'ユーザー'),
    COALESCE((NEW.raw_user_meta_data->>'age')::INTEGER, 20)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION create_profile_for_new_user();
```

---

## ビュー（View）

### bar_with_ratings ビュー
バー情報と平均評価を結合したビュー

```sql
CREATE OR REPLACE VIEW bar_with_ratings AS
SELECT
  b.id,
  b.name,
  b.description,
  b.prefecture,
  b.city,
  b.address,
  b.image_urls,
  b.opening_hours,
  b.regular_holiday,
  b.menu_beer_price,
  b.menu_whiskey_price,
  b.menu_cocktail_price,
  b.phone,
  b.website,
  b.created_at,
  b.updated_at,
  COALESCE(AVG(r.rating), 0) AS average_rating,
  COUNT(r.id) AS review_count
FROM bars b
LEFT JOIN reviews r ON b.id = r.bar_id
GROUP BY b.id;
```

---

## マイグレーション順序

1. UUID拡張の有効化
2. admin_usersテーブル作成
3. is_admin関数作成
4. profilesテーブル作成
5. barsテーブル作成
6. reviewsテーブル作成
7. favoritesテーブル作成
8. トリガー関数作成
9. RLSポリシー設定
10. ビュー作成

---

## ストレージバケット設定（Supabase Storage）

### avatars バケット
- ユーザーのアイコン写真を保存
- パス形式: `avatars/{user_id}/{filename}`
- 許可される形式: JPEG, PNG, WebP
- 最大ファイルサイズ: 2MB

### bar-images バケット
- バーの店内写真を保存
- パス形式: `bar-images/{bar_id}/{filename}`
- 許可される形式: JPEG, PNG, WebP
- 最大ファイルサイズ: 5MB
- 最大枚数: 10枚/バー

**ストレージポリシー例:**
```sql
-- avatarsバケットのポリシー
-- 読み取り: 全員が閲覧可能
CREATE POLICY "avatars_select_policy" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- アップロード: 自分のフォルダのみアップロード可能
CREATE POLICY "avatars_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::TEXT
);

-- 更新: 自分のファイルのみ更新可能
CREATE POLICY "avatars_update_policy" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::TEXT
);

-- 削除: 自分のファイルのみ削除可能
CREATE POLICY "avatars_delete_policy" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::TEXT
);
```
