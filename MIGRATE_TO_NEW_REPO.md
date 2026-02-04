# 新しいGitHubアカウントのリポジトリに移行する手順

## 前提条件
- 新しいGitHubアカウントでリポジトリを作成済みであること
- 新しいGitHubアカウントで認証設定が完了していること

## 手順

### 1. 新しいGitHubリポジトリを作成（まだの場合）
1. 新しいGitHubアカウントにログイン
2. 右上の「+」→「New repository」をクリック
3. リポジトリ名を入力（例：`bar-search-app`）
4. Public/Privateを選択
5. 「Create repository」をクリック
6. リポジトリのURLをコピー（例：`https://github.com/new-username/bar-search-app.git`）

### 2. 現在の変更をコミット（必要に応じて）
```powershell
cd "c:\Users\ai135\バー検索アプリ"
git add .
git commit -m "リファクタリング完了: コンポーネント構造の整理とSSR対応"
```

### 3. 現在のリモートを確認・削除
```powershell
# 現在のリモートを確認
git remote -v

# 現在のリモートを削除
git remote remove origin
```

### 4. 新しいリモートを追加
```powershell
# 新しいリポジトリのURLを設定（YOUR_NEW_REPO_URLを実際のURLに置き換える）
git remote add origin https://github.com/YOUR_NEW_USERNAME/YOUR_REPO_NAME.git

# 確認
git remote -v
```

### 5. 新しいアカウントで認証設定

#### 方法A: Personal Access Token (PAT) を使用（推奨）
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 「Generate new token (classic)」をクリック
3. スコープで`repo`にチェック
4. トークンを生成してコピー
5. リモートURLを更新：
```powershell
git remote set-url origin https://YOUR_TOKEN@github.com/YOUR_NEW_USERNAME/YOUR_REPO_NAME.git
```

#### 方法B: GitHub CLIを使用
```powershell
# GitHub CLIでログイン
gh auth login

# リモートURLを更新（HTTPSの場合）
git remote set-url origin https://github.com/YOUR_NEW_USERNAME/YOUR_REPO_NAME.git
```

#### 方法C: SSH鍵を使用
```powershell
# SSH鍵を生成（まだの場合）
ssh-keygen -t ed25519 -C "your_email@example.com"

# 公開鍵をGitHubに登録
# GitHub → Settings → SSH and GPG keys → New SSH key

# リモートURLをSSHに変更
git remote set-url origin git@github.com:YOUR_NEW_USERNAME/YOUR_REPO_NAME.git
```

### 6. すべてのブランチを新しいリポジトリにプッシュ
```powershell
# 現在のブランチを確認
git branch -a

# すべてのブランチをプッシュ
git push -u origin --all

# タグもプッシュする場合
git push -u origin --tags
```

### 7. 確認
```powershell
# リモートの状態を確認
git remote -v

# ブランチの状態を確認
git branch -a
```

## 注意事項
- 古いリポジトリへのアクセス権限がある場合、そちらは削除しないでください（バックアップとして保持）
- 新しいリポジトリにプッシュする前に、機密情報（APIキー、パスワードなど）が含まれていないか確認してください
- `.env`ファイルや`.env.local`ファイルは`.gitignore`に含まれていることを確認してください
