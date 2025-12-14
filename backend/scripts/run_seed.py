"""Seedファイルを実行するスクリプト（非同期対応）"""

import asyncio
import importlib.util
import sys
from pathlib import Path

from app.core.database import AsyncSessionLocal

# パスを設定（モジュールとして実行する場合）
scripts_dir = Path(__file__).parent
if str(scripts_dir.parent) not in sys.path:
    sys.path.insert(0, str(scripts_dir.parent))


async def run_seed_file(seed_file: str, db) -> bool:
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

        # seed関数を実行（非同期）
        if hasattr(module, "seed_profiles"):
            await module.seed_profiles(db)
        elif hasattr(module, "seed_bars"):
            await module.seed_bars(db)
        elif hasattr(module, "seed_reviews"):
            await module.seed_reviews(db)
        elif hasattr(module, "seed_favorites"):
            await module.seed_favorites(db)
        else:
            print(f"⚠️  Seed関数が見つかりません: {seed_file}")
            return False

        return True
    except Exception as e:
        print(f"❌ Seedファイルの実行中にエラーが発生しました: {seed_file}")
        print(f"   エラー: {e}")
        import traceback

        traceback.print_exc()
        await db.rollback()
        return False


async def main() -> None:
    """メイン関数（非同期）"""
    import time

    from scripts.seed_config import SEED_ORDER

    if len(sys.argv) > 1:
        # 個別のseedファイルを実行
        seed_file = sys.argv[1]
        if not seed_file.endswith(".py"):
            seed_file += ".py"

        async with AsyncSessionLocal() as db:
            try:
                start_time = time.time()
                print(f"🌱 Seedファイルを実行中: {seed_file}")
                success = await run_seed_file(seed_file, db)
                elapsed_time = time.time() - start_time

                if success:
                    await db.commit()
                    print(
                        f"✅ Seedファイルの実行が完了しました: {seed_file} ({elapsed_time:.2f}秒)"
                    )
                else:
                    await db.rollback()
                    sys.exit(1)
            except Exception as e:
                await db.rollback()
                print(f"❌ エラーが発生しました: {e}")
                sys.exit(1)
    else:
        # 全てのseedファイルを順番に実行
        async with AsyncSessionLocal() as db:
            try:
                total_start_time = time.time()
                print("🌱 全てのSeedファイルを実行中...")
                print("=" * 50)

                for index, seed_file in enumerate(SEED_ORDER, 1):
                    start_time = time.time()
                    print(f"\n[{index}/{len(SEED_ORDER)}] 📝 {seed_file} を実行中...")

                    success = await run_seed_file(seed_file, db)
                    elapsed_time = time.time() - start_time

                    if not success:
                        await db.rollback()
                        print(f"❌ Seedファイルの実行に失敗しました: {seed_file}")
                        sys.exit(1)

                    print(f"   ⏱️  実行時間: {elapsed_time:.2f}秒")

                await db.commit()
                total_elapsed_time = time.time() - total_start_time

                print("\n" + "=" * 50)
                print("✅ 全てのSeedファイルの実行が完了しました！")
                print(f"⏱️  総実行時間: {total_elapsed_time:.2f}秒")
            except Exception as e:
                await db.rollback()
                print(f"\n❌ エラーが発生しました: {e}")
                import traceback

                traceback.print_exc()
                sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
