"""Seedファイルの実行順序を定義"""

# Seedファイルの実行順序（依存関係順）
SEED_ORDER = [
    "01_seed_profiles.py",  # プロフィール（ユーザー）を最初に作成
    "02_seed_bars.py",  # バー情報（プロフィールに依存）
    "03_seed_reviews.py",  # レビュー（プロフィールとバーに依存）
    "04_seed_favorites.py",  # お気に入り（プロフィールとバーに依存）
]

# Seedファイルのディレクトリ
SEED_DIR = "scripts"
