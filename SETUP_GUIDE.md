# セットアップガイド（Windows）

## 自動セットアップ

### PowerShellで実行

```powershell
# プロジェクトディレクトリに移動
cd "C:\Users\ai135\バー検索アプリ"

# セットアップスクリプトを実行
.\setup.ps1
```

実行できない場合は、実行ポリシーを変更してください：

```powershell
# PowerShellの実行ポリシーを変更
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 再度実行
.\setup.ps1
```

---

## セットアップスクリプトが行うこと

1. ✅ **Scoopのインストール**（管理者権限不要）
2. ✅ **go-taskのインストール**
3. ✅ **環境変数PATHの自動設定**
4. ✅ **Dockerのインストール確認**
5. ✅ **.envファイルの作成**

---

## セットアップ後の手順

### 1. PowerShellを再起動

環境変数を反映させるため、PowerShellを一度閉じて再度開いてください。

### 2. インストール確認

```powershell
# go-taskのバージョン確認
task --version

# Dockerのバージョン確認
docker --version
```

### 3. 開発環境を起動

```powershell
# Dockerコンテナをビルド
task build

# サービスを起動
task up

# データベースマイグレーション
task db:migrate
```

### 4. アクセス確認

- **フロントエンド**: http://localhost:3000
- **バックエンド**: http://localhost:8000/docs
- **API**: http://localhost:8000

---

## トラブルシューティング

### 「実行ポリシー」エラーが出る場合

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

### taskコマンドが認識されない場合

1. PowerShellを再起動
2. 以下のコマンドで環境変数を確認：

```powershell
$env:Path
```

Scoopのパス（`C:\Users\ai135\scoop\shims`）が含まれていることを確認

含まれていない場合は、手動で追加：

```powershell
# ユーザー環境変数PATHに追加
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
$scoopPath = "$env:USERPROFILE\scoop\shims"
[Environment]::SetEnvironmentVariable("Path", "$currentPath;$scoopPath", "User")

# 現在のセッションにも反映
$env:Path += ";$scoopPath"
```

### Dockerがインストールされていない場合

Docker Desktopを手動でインストール：

1. https://www.docker.com/products/docker-desktop にアクセス
2. Docker Desktop for Windows をダウンロード
3. インストーラーを実行
4. PCを再起動
5. Docker Desktopを起動

---

## 手動セットアップ（スクリプトが使えない場合）

### 1. Scoopのインストール

```powershell
# PowerShellで実行
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
irm get.scoop.sh | iex
```

### 2. go-taskのインストール

```powershell
scoop install task
```

### 3. 環境変数の確認

```powershell
# 自動で設定されるはずですが、確認
task --version
```

---

## 次のステップ

セットアップが完了したら、以下のドキュメントを参照：

- **開発ガイド**: `docs/setup_guide.md`
- **タスク一覧**: `task help` または `task --list`
- **プロジェクト構造**: `docs/project_structure.md`

開発を開始しましょう！🚀
