# デプロイガイド

Backend を Render、Frontend を Vercel にデプロイする手順です。

## アーキテクチャ

- **Backend**: Render（Docker）
- **Frontend**: Vercel（Next.js）
- **CD**: main ブランチへの push で自動デプロイ
  - `backend/` 変更時 → Render にデプロイ
  - `frontend/` 変更時 → Vercel にデプロイ

---

## 1. Backend（Render）のデプロイ

### 1.1 Render で Web サービスを作成

1. [Render ダッシュボード](https://dashboard.render.com/) にログイン
2. 「New +」→「Web Service」を選択
3. GitHub リポジトリを接続
4. 以下を設定:
   - **Name**: `bar-search-backend`（任意）
   - **Region**: Singapore または Oregon（日本に近い）
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Docker`
   - **Instance Type**: Free（または有料プラン）

### 1.2 環境変数の設定

Render の「Environment」で以下を設定:

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `DATABASE_URL` | Supabase の接続文字列 | `postgresql://postgres:xxx@xxx.supabase.co:5432/postgres` |
| `SUPABASE_URL` | Supabase プロジェクト URL | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | Supabase anon key | |
| `SUPABASE_JWT_SECRET` | Supabase JWT Secret | |
| `CORS_ORIGINS` | 許可するオリジン（カンマ区切り） | `https://your-app.vercel.app,http://localhost:3000` |
| `ENVIRONMENT` | 環境 | `production` |
| `DEBUG` | デバッグモード | `false` |

### 1.3 Deploy Hook の取得

1. Render のサービス → 「Settings」→「Deploy Hook」
2. 「Create Deploy Hook」をクリック
3. 表示された URL をコピー（例: `https://api.render.com/deploy/srv-xxx?key=xxx`）

### 1.4 GitHub Secrets の設定

1. GitHub リポジトリ → 「Settings」→「Secrets and variables」→「Actions」
2. 「New repository secret」をクリック
3. 以下を追加:
   - **Name**: `RENDER_DEPLOY_HOOK_URL`
   - **Value**: 1.3 でコピーした Deploy Hook の URL

### 1.5 動作確認

- `backend/` 配下を変更して main に push
- GitHub Actions が実行され、Render の Deploy Hook が呼ばれる
- Render で自動デプロイが開始される

---

## 2. Frontend（Vercel）のデプロイ

### 2.1 Vercel でプロジェクトを作成

1. [Vercel ダッシュボード](https://vercel.com/dashboard) にログイン
2. 「Add New」→「Project」を選択
3. GitHub リポジトリをインポート
4. 以下を設定:
   - **Root Directory**: `frontend` を選択（「Edit」で変更）
   - **Framework Preset**: Next.js（自動検出）
   - **Build Command**: `npm run build`（デフォルト）
   - **Output Directory**: `.next`（デフォルト）

### 2.2 環境変数の設定

Vercel の「Settings」→「Environment Variables」で以下を設定:

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | |
| `NEXT_PUBLIC_API_URL` | Backend API の URL | `https://bar-search-backend.onrender.com` |

### 2.3 Ignored Build Step の設定（frontend/ 変更時のみデプロイ）

1. Vercel プロジェクト → 「Settings」→「Git」
2. 「Ignored Build Step」の「Override」を ON
3. 以下のコマンドを入力:

```bash
# 初回デプロイまたは frontend/ に変更がある場合のみビルド
[ -z "$VERCEL_GIT_PREVIOUS_SHA" ] && exit 1
git diff --name-only $VERCEL_GIT_PREVIOUS_SHA $VERCEL_GIT_COMMIT_SHA 2>/dev/null | grep -q '^frontend/' && exit 1
exit 0
```

- **Exit 0** = ビルドをスキップ（backend のみ変更時）
- **Exit 1** = ビルドを実行（frontend 変更時または初回）

### 2.4 動作確認

- `frontend/` 配下を変更して main に push
- Vercel が自動でビルド・デプロイを実行
- `backend/` のみ変更した場合はビルドがスキップされる

---

## 3. デプロイ後の確認

### Backend

- `https://[your-service].onrender.com/health` にアクセス
- `{"status":"ok"}` が返れば OK

### Frontend

- Vercel のデプロイ URL にアクセス
- バー一覧が表示され、API と通信できれば OK

### CORS

- Backend の `CORS_ORIGINS` に Frontend の Vercel URL を必ず追加すること

---

## 4. トラブルシューティング

### Render がデプロイされない

- GitHub Secrets に `RENDER_DEPLOY_HOOK_URL` が正しく設定されているか確認
- GitHub Actions のログで「Trigger Render Deploy」が実行されているか確認

### Vercel が毎回ビルドする

- Ignored Build Step のコマンドが正しく設定されているか確認
- `frontend/` 以外の変更（例: README）でもビルドされる場合がある

### CORS エラー

- Backend の `CORS_ORIGINS` に Frontend の URL が含まれているか確認
- プロトコル（`https://`）と末尾のスラッシュの有無に注意
