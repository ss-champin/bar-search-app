/**
 * レビューカードコンポーネント
 */

import type { Review } from '@/lib/api';

interface ReviewCardProps {
  review: Review;
  isOwnReview?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ReviewCard({
  review,
  isOwnReview = false,
  onEdit,
  onDelete,
}: ReviewCardProps) {
  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 星を表示
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, index) => (
          <span
            key={index}
            className={`text-lg ${index < rating ? 'text-yellow-400' : 'text-slate-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`rounded-xl bg-white border p-6 shadow-soft hover:shadow-medium transition-all duration-200 animate-fade-in ${
        isOwnReview
          ? 'border-primary-400 bg-gradient-to-br from-primary-50 to-white ring-2 ring-primary-200'
          : 'border-slate-200'
      }`}
    >
      {/* ヘッダー */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* アバター */}
          {review.user_avatar_url ? (
            <div
              className={`relative h-12 w-12 rounded-full overflow-hidden ${
                isOwnReview ? 'ring-2 ring-primary-400' : 'ring-2 ring-primary-100'
              }`}
            >
              <img
                src={review.user_avatar_url}
                alt={review.user_nickname}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-accent-400 text-white font-semibold ${
                isOwnReview ? 'ring-2 ring-primary-400' : 'ring-2 ring-primary-100'
              }`}
            >
              {review.user_nickname.charAt(0)}
            </div>
          )}

          {/* ユーザー情報 */}
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900">{review.user_nickname}</p>
              {isOwnReview && (
                <span className="px-2 py-0.5 text-xs font-semibold text-primary-700 bg-primary-100 rounded-full">
                  あなたのレビュー
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">{formatDate(review.created_at)}</p>
          </div>
        </div>

        {/* 評価と編集・削除ボタン */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
          {isOwnReview && (
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="px-3 py-1.5 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                >
                  編集
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  削除
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* コメント */}
      {review.comment && (
        <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{review.comment}</p>
      )}
    </div>
  );
}
