"""Seedファイルを実行するスクリプト"""

import importlib.util
import sys
from pathlib import Path

# パスを設定（モジュールとして実行する場合）
scripts_dir = Path(__file__).parent
if str(scripts_dir.parent) not in sys.path:
    sys.path.insert(0, str(scripts_dir.parent))

from app.core.database import SessionLocal


def run_seed_file(seed_file: str, db) -> bool:
    """
    指定されたseedファイルを実行

    Args:
        seed_file: seedファイル名（例: "01_seed_profiles.py"）
        db: データベースセッション

    Returns:
        bool: 実行に成功した場合True
    """
    scripts_dir = Path(__file__).parent
    seed_path = scripts_dir / seed_file

    if not seed_path.exists():
        print(f"❌ Seedファイルが見つかりません: {seed_file}")
        return False

    try:
        # モジュールを動的にインポート
        spec = importlib.util.spec_from_file_location("seed_module", seed_path)
        if spec is None or spec.loader is None:
            print(f"❌ Seedファイルの読み込みに失敗しました: {seed_file}")
            return False

        module = importlib.util.module_from_spec(spec)
        sys.modules["seed_module"] = module
        spec.loader.exec_module(module)

        # seed関数を実行
        if hasattr(module, "seed_profiles"):
            module.seed_profiles(db)
        elif hasattr(module, "seed_bars"):
            module.seed_bars(db)
        elif hasattr(module, "seed_reviews"):
            module.seed_reviews(db)
        elif hasattr(module, "seed_favorites"):
            module.seed_favorites(db)
        else:
            print(f"⚠️  Seed関数が見つかりません: {seed_file}")
            return False

        return True
    except Exception as e:
        print(f"❌ Seedファイルの実行中にエラーが発生しました: {seed_file}")
        print(f"   エラー: {e}")
        db.rollback()
        return False


def main() -> None:
    """メイン関数"""
    from scripts.seed_config import SEED_ORDER

    if len(sys.argv) > 1:
        # 個別のseedファイルを実行
        seed_file = sys.argv[1]
        if not seed_file.endswith(".py"):
            seed_file += ".py"

        db = SessionLocal()
        try:
            print(f"🌱 Seedファイルを実行中: {seed_file}")
            success = run_seed_file(seed_file, db)
            if success:
                print(f"✅ Seedファイルの実行が完了しました: {seed_file}")
            else:
                sys.exit(1)
        finally:
            db.close()
    else:
        # 全てのseedファイルを順番に実行
        db = SessionLocal()
        try:
            print("🌱 全てのSeedファイルを実行中...")
            print("=" * 50)

            for seed_file in SEED_ORDER:
                print(f"\n📝 {seed_file} を実行中...")
                success = run_seed_file(seed_file, db)
                if not success:
                    print(f"❌ Seedファイルの実行に失敗しました: {seed_file}")
                    sys.exit(1)

            print("\n" + "=" * 50)
            print("✅ 全てのSeedファイルの実行が完了しました！")
        finally:
            db.close()


if __name__ == "__main__":
    main()

