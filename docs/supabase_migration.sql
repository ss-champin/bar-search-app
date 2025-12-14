-- ============================================
-- バー検索アプリ - Supabase マイグレーションSQL
-- ============================================

-- UUID拡張を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. 管理者ユーザーテーブル
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE admin_users IS '管理者ユーザーを管理するテーブル';

-- ============================================
-- 2. プロフィールテーブル
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  nickname VARCHAR(50) NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 1 AND age <= 150),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'ユーザーのプロフィール情報';
COMMENT ON COLUMN profiles.user_id IS 'auth.usersテーブルのユーザーID';
COMMENT ON COLUMN profiles.email IS 'メールアドレス（auth.usersから同期）';
COMMENT ON COLUMN profiles.nickname IS 'ニックネーム（必須）';
COMMENT ON COLUMN profiles.age IS '年齢（1-150）';
COMMENT ON COLUMN profiles.avatar_url IS 'アイコン写真のURL';

-- インデックス
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ============================================
-- 3. バーテーブル
-- ============================================
CREATE TABLE IF NOT EXISTS bars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  prefecture VARCHAR(10) NOT NULL,
  city VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  image_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  opening_hours JSONB,
  regular_holiday VARCHAR(100),
  menu_beer_price VARCHAR(50),
  menu_whiskey_price VARCHAR(50),
  menu_cocktail_price VARCHAR(50),
  phone VARCHAR(20),
  website TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE bars IS 'バー情報を管理するテーブル';
COMMENT ON COLUMN bars.name IS '店名';
COMMENT ON COLUMN bars.description IS '説明';
COMMENT ON COLUMN bars.prefecture IS '都道府県';
COMMENT ON COLUMN bars.city IS '市区町村';
COMMENT ON COLUMN bars.address IS '住所詳細';
COMMENT ON COLUMN bars.image_urls IS '店内写真のURL配列';
COMMENT ON COLUMN bars.opening_hours IS '営業時間（JSON形式）';
COMMENT ON COLUMN bars.regular_holiday IS '定休日';
COMMENT ON COLUMN bars.menu_beer_price IS 'ビール料金';
COMMENT ON COLUMN bars.menu_whiskey_price IS 'ウィスキー料金';
COMMENT ON COLUMN bars.menu_cocktail_price IS 'カクテル料金';
COMMENT ON COLUMN bars.created_by IS '作成者（管理者）';

-- インデックス
CREATE INDEX IF NOT EXISTS idx_bars_prefecture ON bars(prefecture);
CREATE INDEX IF NOT EXISTS idx_bars_city ON bars(city);
CREATE INDEX IF NOT EXISTS idx_bars_prefecture_city ON bars(prefecture, city);
CREATE INDEX IF NOT EXISTS idx_bars_created_by ON bars(created_by);

-- 全文検索用インデックス（日本語対応）
-- 店名と住所を結合した検索用カラムにGINインデックスを作成
CREATE INDEX IF NOT EXISTS idx_bars_search ON bars USING GIN(
  to_tsvector('simple', COALESCE(name, '') || ' ' || COALESCE(address, '') || ' ' || COALESCE(description, ''))
);

-- ============================================
-- 4. レビューテーブル
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bar_id UUID NOT NULL REFERENCES bars(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT CHECK (LENGTH(comment) <= 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE reviews IS 'バーのレビュー情報を管理するテーブル';
COMMENT ON COLUMN reviews.bar_id IS 'バーID';
COMMENT ON COLUMN reviews.user_id IS 'ユーザーID';
COMMENT ON COLUMN reviews.rating IS '星評価（1-5）';
COMMENT ON COLUMN reviews.comment IS 'レビューコメント（最大2000文字）';

-- インデックス
CREATE INDEX IF NOT EXISTS idx_reviews_bar_id ON reviews(bar_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- ============================================
-- 5. お気に入りテーブル
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bar_id UUID NOT NULL REFERENCES bars(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(bar_id, user_id)
);

COMMENT ON TABLE favorites IS 'ユーザーのお気に入りバーを管理するテーブル';
COMMENT ON COLUMN favorites.bar_id IS 'バーID';
COMMENT ON COLUMN favorites.user_id IS 'ユーザーID';

-- インデックス
CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_unique ON favorites(bar_id, user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);

-- ============================================
-- 6. 関数: 管理者判定
-- ============================================
CREATE OR REPLACE FUNCTION is_admin(uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = uid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_admin IS 'ユーザーが管理者かどうかを判定する関数';

-- ============================================
-- 7. トリガー関数: updated_at自動更新
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column IS 'updated_atカラムを自動更新するトリガー関数';

-- profilesテーブルのトリガー
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- barsテーブルのトリガー
DROP TRIGGER IF EXISTS update_bars_updated_at ON bars;
CREATE TRIGGER update_bars_updated_at
BEFORE UPDATE ON bars
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- reviewsテーブルのトリガー
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. トリガー関数: 新規ユーザー登録時にプロフィール作成
-- ============================================
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, nickname, age)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nickname', 'ユーザー'),
    COALESCE((NEW.raw_user_meta_data->>'age')::INTEGER, 20)
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_profile_for_new_user IS '新規ユーザー登録時に自動的にprofilesレコードを作成';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION create_profile_for_new_user();

-- ============================================
-- 9. RLS (Row Level Security) の有効化
-- ============================================
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bars ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 10. RLSポリシー: admin_users
-- ============================================
DROP POLICY IF EXISTS "admin_users_select_policy" ON admin_users;
CREATE POLICY "admin_users_select_policy" ON admin_users
FOR SELECT USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- ============================================
-- 11. RLSポリシー: profiles
-- ============================================
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
CREATE POLICY "profiles_select_policy" ON profiles
FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
CREATE POLICY "profiles_insert_policy" ON profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
CREATE POLICY "profiles_update_policy" ON profiles
FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;
CREATE POLICY "profiles_delete_policy" ON profiles
FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 12. RLSポリシー: bars
-- ============================================
DROP POLICY IF EXISTS "bars_select_policy" ON bars;
CREATE POLICY "bars_select_policy" ON bars
FOR SELECT USING (true);

DROP POLICY IF EXISTS "bars_insert_policy" ON bars;
CREATE POLICY "bars_insert_policy" ON bars
FOR INSERT WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "bars_update_policy" ON bars;
CREATE POLICY "bars_update_policy" ON bars
FOR UPDATE USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "bars_delete_policy" ON bars;
CREATE POLICY "bars_delete_policy" ON bars
FOR DELETE USING (is_admin(auth.uid()));

-- ============================================
-- 13. RLSポリシー: reviews
-- ============================================
DROP POLICY IF EXISTS "reviews_select_policy" ON reviews;
CREATE POLICY "reviews_select_policy" ON reviews
FOR SELECT USING (true);

DROP POLICY IF EXISTS "reviews_insert_policy" ON reviews;
CREATE POLICY "reviews_insert_policy" ON reviews
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_update_policy" ON reviews;
CREATE POLICY "reviews_update_policy" ON reviews
FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_delete_policy" ON reviews;
CREATE POLICY "reviews_delete_policy" ON reviews
FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 14. RLSポリシー: favorites
-- ============================================
DROP POLICY IF EXISTS "favorites_select_policy" ON favorites;
CREATE POLICY "favorites_select_policy" ON favorites
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorites_insert_policy" ON favorites;
CREATE POLICY "favorites_insert_policy" ON favorites
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorites_delete_policy" ON favorites;
CREATE POLICY "favorites_delete_policy" ON favorites
FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 15. ビュー: bar_with_ratings
-- ============================================
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
  b.created_by,
  b.created_at,
  b.updated_at,
  COALESCE(ROUND(AVG(r.rating)::NUMERIC, 1), 0) AS average_rating,
  COUNT(r.id) AS review_count
FROM bars b
LEFT JOIN reviews r ON b.id = r.bar_id
GROUP BY b.id;

COMMENT ON VIEW bar_with_ratings IS 'バー情報と平均評価を結合したビュー';

-- ============================================
-- 完了メッセージ
-- ============================================
-- マイグレーション完了
-- 次のステップ:
-- 1. Supabase Storageでバケット作成（avatars, bar-images）
-- 2. 初期管理者ユーザーをadmin_usersテーブルに追加
-- 3. Google OAuth, X OAuth の設定
