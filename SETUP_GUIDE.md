# セットアップガイド

このガイドでは、WindowsとMacの両方で環境構築を行う方法を説明します。

---

## Windows向けセットアップ

### 自動セットアップ

#### PowerShellで実行

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

### セットアップスクリプトが行うこと

1. ✅ **Scoopのインストール**（管理者権限不要）
2. ✅ **go-taskのインストール**
3. ✅ **環境変数PATHの自動設定**
4. ✅ **Dockerのインストール確認**
5. ✅ **.envファイルの作成**

### セットアップ後の手順

#### 1. PowerShellを再起動

環境変数を反映させるため、PowerShellを一度閉じて再度開いてください。

#### 2. インストール確認

```powershell
# go-taskのバージョン確認
task --version

# Dockerのバージョン確認
docker --version
```

#### 3. 開発環境を起動

```powershell
# Dockerコンテナをビルド
task build

# サービスを起動
task up

# データベースマイグレーション
task db:migrate
```

### トラブルシューティング（Windows）

#### 「実行ポリシー」エラーが出る場合

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

#### taskコマンドが認識されない場合

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

#### Dockerがインストールされていない場合

Docker Desktopを手動でインストール：

1. https://www.docker.com/products/docker-desktop にアクセス
2. Docker Desktop for Windows をダウンロード
3. インストーラーを実行
4. PCを再起動
5. Docker Desktopを起動

### 手動セットアップ（Windows、スクリプトが使えない場合）

#### 1. Scoopのインストール

```powershell
# PowerShellで実行
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
irm get.scoop.sh | iex
```

#### 2. go-taskのインストール

```powershell
scoop install task
```

#### 3. 環境変数の確認

```powershell
# 自動で設定されるはずですが、確認
task --version
```

---

## Mac向けセットアップ

### 自動セットアップ

#### ターミナルで実行

```bash
# プロジェクトディレクトリに移動
cd ~/バー検索アプリ

# セットアップスクリプトを実行
bash setup.sh
```

### セットアップスクリプトが行うこと

1. ✅ **Homebrewのインストール確認**
2. ✅ **go-taskのインストール**
3. ✅ **Dockerのインストール確認**
4. ✅ **.envファイルの作成**

### セットアップ後の手順

#### 1. ターミナルを再起動（必要に応じて）

環境変数を反映させるため、ターミナルを一度閉じて再度開いてください。

#### 2. インストール確認

```bash
# go-taskのバージョン確認
task --version

# Dockerのバージョン確認
docker --version
```

#### 3. 開発環境を起動

```bash
# Dockerコンテナをビルド
task build

# サービスを起動
task up

# データベースマイグレーション
task db:migrate
```

### トラブルシューティング（Mac）

#### taskコマンドが認識されない場合

1. ターミナルを再起動
2. 以下のコマンドでPATHを確認：

```bash
echo $PATH
```

Homebrewのパス（`/opt/homebrew/bin` または `/usr/local/bin`）が含まれていることを確認

含まれていない場合は、`~/.zshrc`（Zshの場合）または`~/.bash_profile`（Bashの場合）に追加：

```bash
# Zshの場合
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Bashの場合
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.bash_profile
source ~/.bash_profile
```

#### Dockerがインストールされていない場合

Docker Desktopを手動でインストール：

1. https://www.docker.com/products/docker-desktop にアクセス
2. Docker Desktop for Mac をダウンロード
3. `.dmg`ファイルを開いてインストール
4. アプリケーションからDocker Desktopを起動
5. Docker Desktopが起動するまで待つ

#### Homebrewがインストールされていない場合

```bash
# Homebrewのインストール
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

インストール後、ターミナルに表示される指示に従ってPATHを設定してください。

### 手動セットアップ（Mac、スクリプトが使えない場合）

#### 1. Homebrewのインストール

```bash
# ターミナルで実行
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

インストール後、表示される指示に従ってPATHを設定してください。

#### 2. go-taskのインストール

```bash
brew install go-task/tap/go-task
```

#### 3. Dockerのインストール

```bash
# Homebrew経由でインストール（推奨）
brew install --cask docker

# または、公式サイトからダウンロード
# https://www.docker.com/products/docker-desktop
```

#### 4. 環境変数の確認

```bash
# 自動で設定されるはずですが、確認
task --version
docker --version
```

---

## 共通手順（Windows/Mac共通）

### アクセス確認

セットアップが完了したら、以下のURLにアクセスして動作確認：

- **フロントエンド**: http://localhost:3000
- **バックエンド**: http://localhost:8000/docs
- **API**: http://localhost:8000

### データベースのシードデータ投入

開発に必要なデータを投入する場合：

```bash
# すべてのシードファイルを実行
task seed-all

# 個別に実行する場合
task seed-profiles
task seed-bars
task seed-reviews
task seed-favorites
```

---

## 次のステップ

セットアップが完了したら、以下のドキュメントを参照：

- **開発ガイド**: `docs/setup_guide.md`
- **タスク一覧**: `task help` または `task --list`
- **プロジェクト構造**: `docs/project_structure.md`

開発を開始しましょう！🚀
