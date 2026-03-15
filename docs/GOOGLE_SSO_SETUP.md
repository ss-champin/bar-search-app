# Google SSO（Googleアカウントでログイン）設定ガイド

このアプリには既にGoogleログインのコードが実装されています。以下の設定を行うだけで有効になります。

---

## 1. Google Cloud Console での設定

### 1.1 プロジェクトの作成・選択

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを選択（または新規作成）
3. 左メニュー「APIとサービス」→「認証情報」を開く

### 1.2 OAuth同意画面の設定（初回のみ）

1. 「OAuth同意画面」をクリック
2. ユーザータイプ: **外部** を選択（テスト時は「テスト」でOK）
3. アプリ名: 例）「バー検索アプリ」
4. ユーザーサポートメール: 自分のメールアドレス
5. デベロッパーの連絡先: 自分のメールアドレス
6. 「保存して次へ」でスコープはデフォルトのまま進める
7. テストユーザー（開発時）: 自分のGoogleアカウントを追加

### 1.3 OAuth 2.0 クライアントIDの作成

1. 「認証情報」→「認証情報を作成」→「OAuth クライアント ID」
2. アプリケーションの種類: **ウェブアプリケーション**
3. 名前: 例）「バー検索アプリ Web」

4. **承認済みの JavaScript 生成元** に追加:
   ```
   http://localhost:3000          （ローカル開発用）
   https://your-domain.com       （本番環境のURL）
   ```

5. **承認済みのリダイレクト URI** に追加:
   ```
   https://[あなたのSupabaseプロジェクトID].supabase.co/auth/v1/callback
   ```
   ※ プロジェクトIDは Supabase ダッシュボードの URL で確認できます
   ※ 例: `https://abcdefghijk.supabase.co/auth/v1/callback`

6. 「作成」をクリック
7. **クライアントID** と **クライアントシークレット** をコピー（後で使います）

---

## 2. Supabase ダッシュボードでの設定

### 2.1 Google プロバイダーを有効化

1. [Supabase ダッシュボード](https://supabase.com/dashboard) にログイン
2. プロジェクトを選択
3. 左メニュー「Authentication」→「Providers」
4. **Google** をクリック
5. 「Enable Google Provider」を **ON** にする
6. 以下を入力:
   - **Client ID**: Google Cloud でコピーしたクライアントID
   - **Client Secret**: Google Cloud でコピーしたクライアントシークレット
7. 「Save」をクリック

### 2.2 リダイレクトURLの設定

1. 「Authentication」→「URL Configuration」を開く
2. **Site URL** を設定:
   - ローカル開発: `http://localhost:3000`
   - 本番環境: `https://your-domain.com`
3. **Redirect URLs** に以下を追加（複数可）:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/**
   https://your-domain.com/auth/callback
   https://your-domain.com/**
   ```

---

## 3. 動作確認

1. アプリのログインページ（`/auth/login`）を開く
2. 「Googleでログイン」ボタンをクリック
3. Googleアカウントを選択
4. 認証後、アプリにリダイレクトされれば成功

---

## よくあるエラーと対処

### 「redirect_uri_mismatch」エラー
- Google Cloud Console の「承認済みのリダイレクト URI」に  
  `https://[project-id].supabase.co/auth/v1/callback` が正しく登録されているか確認
- プロジェクトIDに誤りがないか確認

### 「Access blocked: This app's request is invalid」
- OAuth同意画面で「公開」にするか、テストユーザーに自分のアカウントを追加
- 必要なスコープ（email, profile, openid）が有効か確認

### ログイン後すぐログアウトされる
- Supabase の「Redirect URLs」に `/auth/callback` が含まれているか確認
- ブラウザのCookieが有効か確認

---

## 参考リンク

- [Supabase: Login with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Supabase: Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Google Cloud Console](https://console.cloud.google.com/)
