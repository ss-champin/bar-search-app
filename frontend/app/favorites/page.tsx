'use client';

/**
 * お気に入り一覧ページ
 */

import BarCard from '@/components/BarCard';
import { getFavorites } from '@/lib/api';
import { useRequireAuth } from '@/lib/hooks';
import type { Favorite } from '@/lib/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function FavoritesPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 認証が完了してからお気に入りを取得
    if (!authLoading && user) {
      const fetchFavorites = async () => {
        setLoading(true);
        setError(null);

        try {
          const data = await getFavorites();
          setFavorites(data.favorites);
        } catch (err) {
          setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
        } finally {
          setLoading(false);
        }
      };

      fetchFavorites();
    }
  }, [authLoading, user]);

  // ローディング（認証チェック中 or データ取得中）
  if (authLoading || (user && loading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  // 認証されていない場合はリダイレクト中
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-600">ログインページにリダイレクト中...</div>
      </div>
    );
  }

  // エラー
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-lg bg-red-50 p-4 text-red-700">
            <p className="font-semibold">エラーが発生しました</p>
            <p className="text-sm">{error}</p>
          </div>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
            ← ホームに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link href="/" className="mb-4 inline-block text-blue-600 hover:underline">
            ← ホームに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">お気に入り</h1>
          <p className="mt-2 text-gray-600">
            {favorites.length}件のバーがお気に入りに登録されています
          </p>
        </div>

        {/* お気に入り一覧 */}
        {favorites.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites
              .filter((favorite) => favorite.bar) // barが存在するもののみ表示
              .map((favorite) => {
                if (!favorite.bar) return null;
                return <BarCard key={favorite.id} bar={favorite.bar} />;
              })}
          </div>
        ) : (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <p className="mb-4 text-gray-600">まだお気に入りがありません</p>
            <Link
              href="/"
              className="inline-block rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              バーを探す
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
