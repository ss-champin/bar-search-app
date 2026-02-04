'use client';

/**
 * お気に入り一覧コンテンツコンポーネント（クライアントコンポーネント）
 */

import type { Favorite } from '@/lib/api';
import Link from 'next/link';
import BarCard from './BarCard';

interface FavoritesContentProps {
  favorites: Favorite[];
}

export default function FavoritesContent({ favorites }: FavoritesContentProps) {
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
