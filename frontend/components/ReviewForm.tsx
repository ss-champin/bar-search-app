'use client';

/**
 * レビュー投稿フォームコンポーネント
 */

import { useState } from 'react';

interface ReviewFormProps {
  onSubmit: (data: { rating: number; comment: string }) => Promise<void>;
  onCancel?: () => void;
  initialData?: {
    rating: number;
    comment: string;
  };
  isEdit?: boolean;
}

export default function ReviewForm({
  onSubmit,
  onCancel,
  initialData,
  isEdit = false,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [comment, setComment] = useState(initialData?.comment || '');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // バリデーション
    if (rating === 0) {
      setError('評価を選択してください');
      return;
    }

    if (comment.trim().length === 0) {
      setError('コメントを入力してください');
      return;
    }

    if (comment.length > 2000) {
      setError('コメントは2000文字以内で入力してください');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({ rating, comment: comment.trim() });
      // 成功したらフォームをリセット
      if (!isEdit) {
        setRating(0);
        setComment('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        {isEdit ? 'レビューを編集' : 'レビューを投稿'}
      </h3>

      {/* 星評価 */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          評価 <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="text-3xl transition-colors focus:outline-none"
            >
              <span
                className={
                  star <= (hoveredRating || rating) ? 'text-yellow-500' : 'text-gray-300'
                }
              >
                ★
              </span>
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-gray-600">{rating}つ星</span>
          )}
        </div>
      </div>

      {/* コメント */}
      <div className="mb-4">
        <label htmlFor="comment" className="mb-2 block text-sm font-medium text-gray-700">
          コメント <span className="text-red-500">*</span>
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          maxLength={2000}
          placeholder="このバーについての感想を教えてください"
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-right text-sm text-gray-500">
          {comment.length} / 2000文字
        </p>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ボタン */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? '送信中...' : isEdit ? '更新する' : '投稿する'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:bg-gray-100"
          >
            キャンセル
          </button>
        )}
      </div>
    </form>
  );
}
