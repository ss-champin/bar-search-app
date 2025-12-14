# Supabase Storage セットアップガイド

このドキュメントでは、バー検索アプリで画像アップロード機能を利用するためのSupabase Storageの設定方法を説明します。

## 概要

Supabase Storageを使用して、以下の画像を管理します：
- バーの店舗画像（複数枚）
- レビューの画像（オプション）
- ユーザーのアバター画像

## ストレージバケットの作成

### 1. bar-images バケット

バーの店舗画像を保存するバケットです。

**Supabaseダッシュボードでの作成手順：**

1. Supabase ダッシュボードにログイン
2. プロジェクトを選択
3. 左サイドバーから「Storage」を選択
4. 「New bucket」をクリック
5. 以下の設定でバケットを作成：
   - **Name**: `bar-images`
   - **Public**: Yes（パブリックアクセスを許可）
   - **File size limit**: 10 MB
   - **Allowed MIME types**: `image/jpeg,image/png,image/webp`

### 2. review-images バケット

レビュー画像を保存するバケットです。

**設定：**
- **Name**: `review-images`
- **Public**: Yes
- **File size limit**: 5 MB
- **Allowed MIME types**: `image/jpeg,image/png,image/webp`

### 3. avatars バケット

ユーザーのアバター画像を保存するバケットです。

**設定：**
- **Name**: `avatars`
- **Public**: Yes
- **File size limit**: 2 MB
- **Allowed MIME types**: `image/jpeg,image/png,image/webp`

## Row Level Security (RLS) ポリシーの設定

### bar-images バケット

```sql
-- 誰でも画像を閲覧可能
CREATE POLICY "Anyone can view bar images"
ON storage.objects FOR SELECT
USING (bucket_id = 'bar-images');

-- 認証済みユーザーのみアップロード可能
CREATE POLICY "Authenticated users can upload bar images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'bar-images' AND
  auth.role() = 'authenticated'
);

-- 画像の所有者のみ削除可能（オプション：管理者のみに制限する場合は別途設定）
CREATE POLICY "Users can delete their own bar images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'bar-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### review-images バケット

```sql
-- 誰でも画像を閲覧可能
CREATE POLICY "Anyone can view review images"
ON storage.objects FOR SELECT
USING (bucket_id = 'review-images');

-- 認証済みユーザーのみアップロード可能
CREATE POLICY "Authenticated users can upload review images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'review-images' AND
  auth.role() = 'authenticated'
);

-- 自分のレビュー画像のみ削除可能
CREATE POLICY "Users can delete their own review images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'review-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### avatars バケット

```sql
-- 誰でも画像を閲覧可能
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 認証済みユーザーは自分のアバターをアップロード可能
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 自分のアバターのみ更新可能
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 自分のアバターのみ削除可能
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## ファイル命名規則

### bar-images
```
{bar_id}/{timestamp}_{random_string}.{ext}
例: 123e4567-e89b-12d3-a456-426614174000/1704067200_abc123.jpg
```

### review-images
```
{user_id}/{review_id}_{timestamp}.{ext}
例: user_abc/review_xyz_1704067200.jpg
```

### avatars
```
{user_id}/avatar.{ext}
例: user_abc/avatar.jpg
```

## 環境変数の設定

`.env`ファイルに以下の環境変数を追加してください：

```bash
# Supabase Storage
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-service-role-key  # サーバーサイドで使用
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key  # クライアントサイドで使用
```

**注意：** `SUPABASE_KEY`（service role key）はサーバーサイド（FastAPI）でのみ使用し、絶対にクライアントサイドに公開しないでください。

## Storage URLの取得

アップロードした画像のURLを取得する方法：

### パブリックURL（推奨）

```typescript
const { data } = supabase.storage
  .from('bar-images')
  .getPublicUrl('path/to/image.jpg');

console.log(data.publicUrl);
// https://xxxxx.supabase.co/storage/v1/object/public/bar-images/path/to/image.jpg
```

### 署名付きURL（プライベート画像の場合）

```typescript
const { data, error } = await supabase.storage
  .from('bar-images')
  .createSignedUrl('path/to/image.jpg', 60); // 60秒間有効

console.log(data.signedUrl);
```

## 画像の最適化

フロントエンドでアップロード前に画像を最適化することを推奨します：

- **最大サイズ**: 1920x1080px
- **品質**: JPEG 80-85%
- **フォーマット**: JPEG（写真）、PNG（透過が必要な場合）、WebP（最新ブラウザ）

## トラブルシューティング

### アップロードが失敗する場合

1. RLSポリシーが正しく設定されているか確認
2. ユーザーが認証済みか確認
3. ファイルサイズがバケットの制限内か確認
4. MIMEタイプが許可されているか確認

### 画像が表示されない場合

1. バケットがパブリックに設定されているか確認
2. URLが正しいか確認
3. CORSが正しく設定されているか確認（通常は自動設定）

## セキュリティのベストプラクティス

1. **ファイルサイズ制限**: 各バケットに適切なファイルサイズ制限を設定
2. **MIMEタイプ検証**: 許可されたMIMEタイプのみを受け入れる
3. **RLSポリシー**: 適切なRLSポリシーでアクセスを制限
4. **サーバーサイド検証**: アップロード時にサーバーサイドでも検証を実施
5. **ウイルススキャン**: 本番環境では追加のウイルススキャンを検討

## 参考リンク

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage RLS Policies](https://supabase.com/docs/guides/storage/security/access-control)
- [Image Optimization](https://supabase.com/docs/guides/storage/serving/image-transformations)
