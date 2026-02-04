'use client';

/**
 * バー一覧コンポーネント（クライアントコンポーネント）
 */

import BarCard from '@/app/favorites/components/BarCard';
import { getBars } from '@/lib/api';
import type { BarListResponse, BarSummary } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import BarSearchFilter, { type SearchFilters } from '../components/BarSearchFilter';

interface BarListProps {
  initialData?: BarListResponse;
}

export default function BarList({ initialData }: BarListProps) {
  const [bars, setBars] = useState<BarSummary[]>(initialData?.bars || []);
  const [total, setTotal] = useState(initialData?.total || 0);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  // フィルター状態
  const [filters, setFilters] = useState<SearchFilters>({});

  // ページネーション
  const [page, setPage] = useState(1);
  const limit = 20;

  // バー一覧を取得
  useEffect(() => {
    // 初期データがある場合、フィルターやページが変更された時のみ再取得
    if (initialData && Object.keys(filters).length === 0 && page === 1) {
      return;
    }

    const fetchBars = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getBars({
          search: filters.search,
          prefecture: filters.prefecture,
          city: filters.city,
          minRating: filters.minRating,
          sortBy: filters.sortBy,
          limit,
          offset: (page - 1) * limit,
        });

        setBars(response.bars);
        setTotal(response.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchBars();
  }, [filters, page, initialData]);

  // フィルター変更ハンドラー
  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1); // フィルター変更時はページをリセット
  };

  // ページング
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* ヒーローセクション */}
      <div className="mb-12 text-center animate-fade-in">
        <div className="inline-block mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl blur-xl opacity-50" />
            <div className="relative bg-gradient-to-r from-primary-600 to-accent-600 px-8 py-4 rounded-2xl">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">BarSearch</h1>
            </div>
          </div>
        </div>
        <p className="text-3xl md:text-4xl font-bold text-slate-800 mt-6 mb-3 leading-tight">
          一人の時間を、もっと豊かに。
        </p>
        <p className="text-xl md:text-2xl text-slate-600 font-medium mb-2">
          しっぽり飲めるバーを見つけよう
        </p>
        <p className="text-base text-slate-500 mt-2">一人でも安心して行ける、あなたの居場所を</p>
      </div>

      {/* フィルター */}
      <div className="mb-8 animate-slide-up">
        <BarSearchFilter onSearch={handleSearch} initialFilters={filters} />
      </div>

      {/* ローディング */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
            <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full border-4 border-primary-400 opacity-20" />
          </div>
          <p className="mt-4 text-slate-600 font-medium">読み込み中...</p>
        </div>
      )}

      {/* エラー */}
      {error && (
        <div className="mb-8 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 p-6 shadow-soft animate-scale-in">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                role="img"
                aria-label="エラー"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-red-900 mb-1">エラーが発生しました</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* バー一覧 */}
      {!loading && !error && (
        <>
          {/* 件数表示 */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary-500" />
              <span className="text-sm font-medium text-slate-600">
                <span className="text-primary-600 font-bold">{total}</span>件のバーが見つかりました
              </span>
            </div>
            <Link
              href="/favorites"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-medium shadow-md hover:shadow-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-200"
            >
              <span>❤️</span>
              <span>お気に入り</span>
            </Link>
          </div>

          {/* バーカード */}
          {bars.length > 0 ? (
            <div
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              style={{ position: 'relative', zIndex: 0 }}
            >
              {bars.map((bar, index) => (
                <div
                  key={bar.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms`, position: 'relative', zIndex: 0 }}
                >
                  <BarCard bar={bar} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-16 text-center animate-scale-in">
              <div className="text-6xl mb-4">🍸</div>
              <p className="text-lg font-medium text-slate-700 mb-2">バーが見つかりませんでした</p>
              <p className="text-sm text-slate-500">検索条件を変更してお試しください</p>
            </div>
          )}

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-sm font-medium text-slate-700 shadow-soft hover:shadow-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-soft transition-all duration-200 border border-slate-200"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="前へ"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                前へ
              </button>

              <div className="flex items-center gap-2">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                        pageNum === page
                          ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-md'
                          : 'bg-white text-slate-700 hover:bg-slate-50 shadow-soft hover:shadow-medium'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-sm font-medium text-slate-700 shadow-soft hover:shadow-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-soft transition-all duration-200 border border-slate-200"
              >
                次へ
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="次へ"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
