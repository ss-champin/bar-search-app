/**
 * レビューカードコンポーネント
 */

import type { Review } from '@/lib/types';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
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
            className={`text-lg ${
              index < rating ? 'text-yellow-400' : 'text-slate-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-soft hover:shadow-medium transition-all duration-200 animate-fade-in">
      {/* ヘッダー */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* アバター */}
          {review.user_avatar_url ? (
            <div className="relative h-12 w-12 rounded-full overflow-hidden ring-2 ring-primary-100">
              <img
                src={review.user_avatar_url}
                alt={review.user_nickname}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-accent-400 text-white font-semibold ring-2 ring-primary-100">
              {review.user_nickname.charAt(0)}
            </div>
          )}

          {/* ユーザー情報 */}
          <div>
            <p className="font-semibold text-slate-900">{review.user_nickname}</p>
            <p className="text-xs text-slate-500">{formatDate(review.created_at)}</p>
          </div>
        </div>

        {/* 評価 */}
        <div className="flex items-center gap-1">
          {renderStars(review.rating)}
        </div>
      </div>

      {/* コメント */}
      {review.comment && (
        <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{review.comment}</p>
      )}
    </div>
  );
}
