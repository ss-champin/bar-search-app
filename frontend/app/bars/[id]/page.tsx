'use client';

/**
 * バー詳細ページ
 */

import FavoriteButton from '@/components/FavoriteButton';
import ReviewCard from '@/components/ReviewCard';
import ReviewForm from '@/components/ReviewForm';
import { createReview, getBar, getBarReviews } from '@/lib/api';
import type { BarDetail, Review } from '@/lib/types';
import { useAuthStore } from '@/lib/stores';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const barId = params.id as string;
  const { user } = useAuthStore();

  const [bar, setBar] = useState<BarDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // バー詳細とレビューを取得
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // バー詳細とレビューを並行取得
        const [barData, reviewsData] = await Promise.all([
          getBar(barId),
          getBarReviews(barId, { limit: 10 }),
        ]);

        setBar(barData);
        setReviews(reviewsData.reviews);
        setReviewsTotal(reviewsData.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [barId]);

  // レビュー投稿ボタンのクリック処理
  const handleReviewButtonClick = () => {
    // ログインしていない場合はログインページにリダイレクト
    if (!user) {
      const currentPath = window.location.pathname;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    setShowReviewForm(true);
  };

  // レビューを投稿
  const handleSubmitReview = async (data: { rating: number; comment: string }) => {
    try {
      const newReview = await createReview(barId, data);

      // レビュー一覧に追加
      setReviews([newReview, ...reviews]);
      setReviewsTotal(reviewsTotal + 1);

      // バー情報を再取得して平均評価を更新
      const updatedBar = await getBar(barId);
      setBar(updatedBar);

      // フォームを閉じる
      setShowReviewForm(false);
    } catch (err) {
      throw err; // ReviewFormでエラー処理
    }
  };

  // 星を表示
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, index) => (
          <span
            key={index}
            className={`text-2xl ${index < Math.round(rating) ? 'text-yellow-400' : 'text-slate-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // ローディング
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-4">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
            <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full border-4 border-primary-400 opacity-20"></div>
          </div>
          <p className="text-slate-600 font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }

  // エラー
  if (error || !bar) {
    return (
      <div className="min-h-screen p-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 p-6 shadow-soft">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-red-900 mb-1">エラーが発生しました</p>
                <p className="text-sm text-red-700">{error || 'バーが見つかりませんでした'}</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="mt-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* 戻るボタン */}
        <button
          type="button"
          onClick={() => router.push('/')}
          className="mb-6 flex items-center gap-2 text-slate-600 hover:text-primary-600 transition-colors font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          一覧に戻る
        </button>

        {/* バー情報 */}
        <div className="mb-8 rounded-2xl glass p-8 shadow-medium border border-white/20 animate-fade-in">
          {/* タイトルとお気に入りボタン */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-slate-900 mb-2">{bar.name}</h1>
              <div className="flex items-center gap-3">
                {renderStars(bar.average_rating)}
                <span className="text-xl font-bold text-slate-900">
                  {bar.average_rating > 0 ? bar.average_rating.toFixed(1) : '未評価'}
                </span>
                <span className="text-slate-600">({bar.review_count}件のレビュー)</span>
              </div>
            </div>
            <FavoriteButton barId={barId} size="lg" />
          </div>

          {/* 説明 */}
          {bar.description && (
            <div className="mb-8 p-6 rounded-xl bg-gradient-to-br from-slate-50 to-primary-50 border border-slate-200">
              <h2 className="mb-3 text-lg font-bold text-slate-900">説明</h2>
              <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{bar.description}</p>
            </div>
          )}

          {/* 基本情報 */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            {/* 住所 */}
            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <h3 className="mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">住所</h3>
                  <p className="text-slate-900 font-medium">
                    {bar.prefecture} {bar.city}
                  </p>
                  <p className="text-slate-700 text-sm">{bar.address}</p>
                </div>
              </div>
            </div>

            {/* 電話番号 */}
            {bar.phone && (
              <div className="p-4 rounded-xl bg-white border border-slate-200">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <h3 className="mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">電話番号</h3>
                    <a href={`tel:${bar.phone}`} className="text-slate-900 font-medium hover:text-primary-600 transition-colors">
                      {bar.phone}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* 定休日 */}
            {bar.regular_holiday && (
              <div className="p-4 rounded-xl bg-white border border-slate-200">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <h3 className="mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">定休日</h3>
                    <p className="text-slate-900 font-medium">{bar.regular_holiday}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Webサイト */}
            {bar.website && (
              <div className="p-4 rounded-xl bg-white border border-slate-200">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <div>
                    <h3 className="mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">Webサイト</h3>
                    <a
                      href={bar.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 font-medium transition-colors break-all"
                    >
                      {bar.website}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* メニュー料金 */}
          {(bar.menu_beer_price || bar.menu_whiskey_price || bar.menu_cocktail_price) && (
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-bold text-slate-900">メニュー料金</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {bar.menu_beer_price && (
                  <div className="rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 p-4 shadow-soft">
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">ビール</p>
                    <p className="text-lg font-bold text-slate-900">{bar.menu_beer_price}</p>
                  </div>
                )}
                {bar.menu_whiskey_price && (
                  <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-4 shadow-soft">
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">ウィスキー</p>
                    <p className="text-lg font-bold text-slate-900">{bar.menu_whiskey_price}</p>
                  </div>
                )}
                {bar.menu_cocktail_price && (
                  <div className="rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 p-4 shadow-soft">
                    <p className="text-xs font-semibold text-pink-700 uppercase tracking-wide mb-1">カクテル</p>
                    <p className="text-lg font-bold text-slate-900">{bar.menu_cocktail_price}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 営業時間 */}
          {bar.opening_hours && (
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-bold text-slate-900">営業時間</h2>
              <div className="grid gap-2">
                {Object.entries(bar.opening_hours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between items-center rounded-xl bg-white border border-slate-200 p-4 hover:border-primary-300 transition-colors">
                    <span className="font-semibold text-slate-900">{day}</span>
                    <span className="text-slate-700 font-medium">
                      {hours.open} - {hours.close}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* レビュー */}
        <div className="animate-fade-in">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-slate-900">レビュー <span className="text-primary-600">({reviewsTotal}件)</span></h2>
            {!showReviewForm && (
              <button
                type="button"
                onClick={handleReviewButtonClick}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold shadow-md hover:shadow-lg hover:from-primary-700 hover:to-accent-700 transition-all duration-200"
              >
                レビューを投稿
              </button>
            )}
          </div>

          {/* レビュー投稿フォーム */}
          {showReviewForm && (
            <div className="mb-6">
              <ReviewForm
                onSubmit={handleSubmitReview}
                onCancel={() => setShowReviewForm(false)}
              />
            </div>
          )}

          {/* レビュー一覧 */}
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <div key={review.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-primary-50 border border-slate-200 p-16 text-center animate-scale-in">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-lg font-medium text-slate-700 mb-2">まだレビューがありません</p>
              <p className="text-sm text-slate-500 mb-6">最初のレビューを投稿してみませんか？</p>
              {!showReviewForm && (
                <button
                  type="button"
                  onClick={handleReviewButtonClick}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold shadow-md hover:shadow-lg hover:from-primary-700 hover:to-accent-700 transition-all duration-200"
                >
                  最初のレビューを投稿
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
