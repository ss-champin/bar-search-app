# X（Twitter）SSO（Xアカウントでログイン）設定ガイド

このアプリには既にXログインのコードが実装されています。以下の設定を行うだけで有効になります。

---

## 1. X Developer Portal での設定

### 1.1 開発者アカウントの取得

1. [X Developer Portal](https://developer.x.com/) にアクセス
2. Xアカウントでログイン
3. 開発者アカウントの申請（無料プランで利用可能）
   - 「Sign up for Free Account」または「Apply」をクリック
   - 利用目的を選択（例: Making a bot, Exploring the API）
   - 必要事項を入力して申請

### 1.2 プロジェクトとアプリの作成

1. [X Developer Portal](https://developer.x.com/) にログイン
2. 「Projects & Apps」→「Overview」を開く
3. 「+ Create Project」をクリック
4. プロジェクト名を入力（例: バー検索アプリ）→「Next」
5. アプリ名を入力（例: バー検索アプリ Web）→「Complete」

### 1.3 OAuth 2.0 の設定

1. 作成したアプリをクリック
2. 「Settings」タブを開く
3. **User authentication settings** の「Set up」をクリック
4. 以下を設定:
   - **App permissions**: Read and write（または Read only）
   - **Type of App**: Web App, Automated App or Bot
   - **Callback URI / Redirect URL** に追加:
     ```
     https://[あなたのSupabaseプロジェクトID].supabase.co/auth/v1/callback
     ```
     ※ プロジェクトIDは Supabase ダッシュボードの URL で確認
     ※ 例: `https://abcdefghijk.supabase.co/auth/v1/callback`
   - **Website URL**（任意）: `http://localhost:3000` または本番URL
5. 「Save」をクリック

### 1.4 認証情報の取得

1. アプリの「Keys and tokens」タブを開く
2. **OAuth 2.0** セクションで以下を確認:
   - **Client ID**（API Key と表示される場合あり）
   - **Client Secret**（API Key Secret と表示される場合あり）
3. Client Secret は「Generate」をクリックして初回生成
4. 両方をコピー（Client Secret は再表示できないため、必ず保存）

---

## 2. Supabase ダッシュボードでの設定

### 2.1 Twitter プロバイダーを有効化

1. [Supabase ダッシュボード](https://supabase.com/dashboard) にログイン
2. プロジェクトを選択
3. 左メニュー「Authentication」→「Providers」
4. **Twitter** をクリック
5. 「Enable Twitter Provider」を **ON** にする
6. 以下を入力:
   - **API Key**: X Developer で取得した Client ID
   - **API Key Secret**: X Developer で取得した Client Secret
7. 「Save」をクリック

### 2.2 リダイレクトURLの確認

Google と同様、以下が設定されているか確認:
- 「Authentication」→「URL Configuration」
- **Redirect URLs** に `http://localhost:3000/auth/callback` と `http://localhost:3000/**` が含まれていること

---

## 3. 動作確認

1. アプリのログインページ（`/auth/login`）を開く
2. 「Xでログイン」ボタンをクリック
3. Xの認証画面でアプリの許可
4. 認証後、アプリにリダイレクトされれば成功

---

## よくあるエラーと対処

### 「Callback URL not approved」
- X Developer Portal の Callback URI に  
  `https://[project-id].supabase.co/auth/v1/callback` が正確に登録されているか確認
- 余分なスペースやスラッシュがないか確認

### 「Invalid or expired token」
- Supabase に入力した API Key / API Key Secret が正しいか確認
- X Developer で Client Secret を再生成した場合、Supabase の設定も更新

### 「Application is suspended」
- X Developer のアプリが有効か確認
- 利用規約に違反していないか確認

---

## 参考リンク

- [Supabase: Login with Twitter](https://supabase.com/docs/guides/auth/social-login/auth-twitter)
- [X Developer Portal](https://developer.x.com/)
- [X API OAuth 2.0 ドキュメント](https://developer.x.com/en/docs/authentication/oauth-2-0)
