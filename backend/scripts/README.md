# Seedスクリプト

開発環境に必要なデータを投入するためのseedスクリプトです。

**非同期対応**: すべてのseedスクリプトは非同期処理で実行され、高速化とユーザー体験の向上を実現しています。

## 使用方法

### 全てのseedファイルを実行（推奨）

```bash
task seed-all
```

または、Dockerコンテナ内で直接実行：

```bash
docker compose exec backend uv run python -m scripts.run_seed
```

### 個別のseedファイルを実行

```bash
# プロフィールのみ
task seed-profiles

# バーのみ
task seed-bars

# レビューのみ
task seed-reviews

# お気に入りのみ
task seed-favorites
```

または、Dockerコンテナ内で直接実行：

```bash
docker compose exec backend uv run python -m scripts.run_seed 01_seed_profiles.py
docker compose exec backend uv run python -m scripts.run_seed 02_seed_bars.py
docker compose exec backend uv run python -m scripts.run_seed 03_seed_reviews.py
docker compose exec backend uv run python -m scripts.run_seed 04_seed_favorites.py
```

## 注意事項

- **Dockerコンテナが起動している必要があります**
  ```bash
  task up
  ```

- seedスクリプトはDockerコンテナ内で実行されます（データベース接続のため）

## 実行順序

seedファイルは以下の順序で実行されます（依存関係順）：

1. `01_seed_profiles.py` - プロフィール（ユーザー）
2. `02_seed_bars.py` - バー情報（プロフィールに依存）
3. `03_seed_reviews.py` - レビュー（プロフィールとバーに依存）
4. `04_seed_favorites.py` - お気に入り（プロフィールとバーに依存）

## 新しいseedファイルを追加する場合

1. `backend/scripts/`ディレクトリに新しいseedファイルを作成
2. ファイル名は実行順序を表す番号を先頭に付ける（例: `05_seed_new_data.py`）
3. `seed_config.py`の`SEED_ORDER`リストに追加
4. seed関数を実装（例: `async def seed_new_data(db: AsyncSession) -> None`）

## 注意事項

- 既存のデータがある場合は、seedファイルはスキップされます
- データベース接続が必要です（Dockerコンテナが起動している必要があります）
- seedファイルは冪等性を保つように実装されています（何度実行しても同じ結果になります）
- **非同期処理**: すべてのseed関数は`async def`で定義され、非同期セッション（`AsyncSession`）を使用します
- **進捗表示**: 各seedファイルの実行時間と総実行時間が表示されます
- **エラーハンドリング**: エラー発生時は詳細なトレースバックが表示され、ロールバックが自動実行されます

