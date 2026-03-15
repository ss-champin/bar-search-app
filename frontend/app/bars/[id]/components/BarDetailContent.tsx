'use client';

/**
 * バー詳細コンテンツコンポーネント（クライアントコンポーネント）
 * インタラクティブな機能を担当
 */

import FavoriteButton from '@/app/bars/components/FavoriteButton';
import ReviewCard from '@/app/bars/components/ReviewCard';
import ReviewForm from '@/app/bars/components/ReviewForm';
import { createReview, deleteReview, getBar, updateReview } from '@/lib/api';
import type { BarDetail, Review } from '@/lib/api';
import { useAuthStore } from '@/lib/stores';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface BarDetailContentProps {
  bar: BarDetail;
  initialReviews: Review[];
  initialReviewsTotal: number;
}

export default function BarDetailContent({
  bar: initialBar,
  initialReviews,
  initialReviewsTotal,
}: BarDetailContentProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile } = useAuthStore();
  const [bar, setBar] = useState<BarDetail>(initialBar);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [reviewsTotal, setReviewsTotal] = useState(initialReviewsTotal);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

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
    if (editingReview) {
      // レビューを更新
      const updatedReview = await updateReview(editingReview.id, data);

      // レビュー一覧を更新
      setReviews(reviews.map((r) => (r.id === editingReview.id ? updatedReview : r)));

      // 編集状態をリセット
      setEditingReview(null);
    } else {
      // 新しいレビューを投稿
      const newReview = await createReview(bar.id, data);

      // レビュー一覧に追加
      setReviews([newReview, ...reviews]);
      setReviewsTotal(reviewsTotal + 1);
    }

    // バー情報を再取得して平均評価を更新
    const updatedBar = await getBar(bar.id);
    setBar(updatedBar);

    // フォームを閉じる
    setShowReviewForm(false);
  };

  // レビュー編集を開始
  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  // レビュー編集をキャンセル
  const handleCancelEdit = () => {
    setEditingReview(null);
    setShowReviewForm(false);
  };

  // レビューを削除
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('このレビューを削除してもよろしいですか？')) {
      return;
    }

    try {
      await deleteReview(reviewId);

      // レビュー一覧から削除
      setReviews(reviews.filter((r) => r.id !== reviewId));
      setReviewsTotal(reviewsTotal - 1);

      // バー情報を再取得して平均評価を更新
      const updatedBar = await getBar(bar.id);
      setBar(updatedBar);
    } catch (error) {
      console.error('Failed to delete review:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'レビューの削除に失敗しました。もう一度お試しください。',
      );
    }
  };

  // 自分のレビューかどうかを判定
  const isOwnReview = (review: Review): boolean => {
    if (!profile || !user) return false;
    return review.user_id === profile.user_id;
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

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* 戻るボタン */}
        <Link
          href="/"
          className="mb-6 flex items-center gap-2 text-slate-600 hover:text-primary-600 transition-colors font-medium"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            role="img"
            aria-label="戻る"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          一覧に戻る
        </Link>

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
            <FavoriteButton barId={bar.id} size="lg" />
          </div>

          {/* 画像ギャラリー */}
          {bar.image_urls.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-bold text-slate-900">店内写真</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {bar.image_urls.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 border border-slate-200"
                  >
                    <img
                      src={url}
                      alt={`${bar.name}の写真 ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 説明 */}
          {bar.description && (
            <div className="mb-8 p-6 rounded-xl bg-gradient-to-br from-slate-50 to-primary-50 border border-slate-200">
              <h2 className="mb-3 text-lg font-bold text-slate-900">説明</h2>
              <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                {bar.description}
              </p>
            </div>
          )}

          {/* 基本情報 */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            {/* 住所 */}
            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="住所"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div className="flex-1">
                  <h3 className="mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    住所
                  </h3>
                  <p className="text-slate-900 font-medium">
                    {bar.prefecture} {bar.city}
                  </p>
                  <p className="text-slate-700 text-sm">{bar.address}</p>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${bar.prefecture}${bar.city}${bar.address}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      role="img"
                      aria-label="経路"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                    現在地から経路を表示
                  </a>
                </div>
              </div>
            </div>

            {/* 電話番号 */}
            {bar.phone && (
              <div className="p-4 rounded-xl bg-white border border-slate-200">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    role="img"
                    aria-label="電話"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <div>
                    <h3 className="mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      電話番号
                    </h3>
                    <a
                      href={`tel:${bar.phone}`}
                      className="text-slate-900 font-medium hover:text-primary-600 transition-colors"
                    >
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
                  <svg
                    className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    role="img"
                    aria-label="定休日"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <h3 className="mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      定休日
                    </h3>
                    <p className="text-slate-900 font-medium">{bar.regular_holiday}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 店舗URL */}
            {bar.website && (
              <div className="p-4 rounded-xl bg-white border border-slate-200">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    role="img"
                    aria-label="ウェブサイト"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <div>
                    <h3 className="mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      店舗URL
                    </h3>
                    <a
                      href={bar.website.startsWith('http') ? bar.website : `https://${bar.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 font-medium transition-colors break-all"
                    >
                      サイトを見る
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        role="img"
                        aria-label="新しいタブで開く"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
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
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">
                      ビール
                    </p>
                    <p className="text-lg font-bold text-slate-900">{bar.menu_beer_price}</p>
                  </div>
                )}
                {bar.menu_whiskey_price && (
                  <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-4 shadow-soft">
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">
                      ウィスキー
                    </p>
                    <p className="text-lg font-bold text-slate-900">{bar.menu_whiskey_price}</p>
                  </div>
                )}
                {bar.menu_cocktail_price && (
                  <div className="rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 p-4 shadow-soft">
                    <p className="text-xs font-semibold text-pink-700 uppercase tracking-wide mb-1">
                      カクテル
                    </p>
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
                {(() => {
                  // 曜日の日本語マッピング（月曜日から順）
                  const dayNames: Record<string, string> = {
                    monday: '月曜日',
                    tuesday: '火曜日',
                    wednesday: '水曜日',
                    thursday: '木曜日',
                    friday: '金曜日',
                    saturday: '土曜日',
                    sunday: '日曜日',
                  };

                  // 曜日の順序（月曜日から）
                  const dayOrder = [
                    'monday',
                    'tuesday',
                    'wednesday',
                    'thursday',
                    'friday',
                    'saturday',
                    'sunday',
                  ];

                  return dayOrder.map((dayKey) => {
                    const hours = bar.opening_hours?.[dayKey];
                    const dayName = dayNames[dayKey] || dayKey;

                    return (
                      <div
                        key={dayKey}
                        className="flex justify-between items-center rounded-xl bg-white border border-slate-200 p-4 hover:border-primary-300 transition-colors"
                      >
                        <span className="font-semibold text-slate-900">{dayName}</span>
                        <span className="text-slate-700 font-medium">
                          {hours?.open && hours.close ? (
                            `${hours.open} - ${hours.close}`
                          ) : (
                            <span className="text-red-500">定休日</span>
                          )}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </div>

        {/* レビュー */}
        <div className="animate-fade-in">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-slate-900">
              レビュー <span className="text-primary-600">({reviewsTotal}件)</span>
            </h2>
            {!showReviewForm && user && !reviews.some((r) => isOwnReview(r)) && (
              <button
                type="button"
                onClick={handleReviewButtonClick}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold shadow-md hover:shadow-lg hover:from-primary-700 hover:to-accent-700 transition-all duration-200"
              >
                レビューを投稿
              </button>
            )}
            {!showReviewForm && !user && (
              <button
                type="button"
                onClick={handleReviewButtonClick}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold shadow-md hover:shadow-lg hover:from-primary-700 hover:to-accent-700 transition-all duration-200"
              >
                レビューを投稿
              </button>
            )}
          </div>

          {/* レビュー投稿/編集フォーム */}
          {showReviewForm && (
            <div className="mb-6">
              <ReviewForm
                onSubmit={handleSubmitReview}
                onCancel={handleCancelEdit}
                initialData={
                  editingReview
                    ? {
                        rating: editingReview.rating,
                        comment: editingReview.comment || '',
                      }
                    : undefined
                }
                isEdit={!!editingReview}
              />
            </div>
          )}

          {/* レビュー一覧 */}
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review, index) => {
                const ownReview = isOwnReview(review);
                return (
                  <div
                    key={review.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ReviewCard
                      review={review}
                      isOwnReview={ownReview}
                      onEdit={ownReview ? () => handleEditReview(review) : undefined}
                      onDelete={ownReview ? () => handleDeleteReview(review.id) : undefined}
                    />
                  </div>
                );
              })}
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
