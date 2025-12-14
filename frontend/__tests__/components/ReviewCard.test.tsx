/**
 * ReviewCardコンポーネントのテスト
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReviewCard from '@/components/ReviewCard';
import type { Review } from '@/lib/types';

describe('ReviewCard', () => {
  const mockReview: Review = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    bar_id: 'bar123',
    user_id: 'user123',
    user_nickname: 'テストユーザー',
    user_avatar_url: 'https://example.com/avatar.jpg',
    rating: 4,
    comment: 'とても良いバーでした。\n雰囲気も素敵でした。',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  };

  it('レビュー情報を正しく表示する', () => {
    render(<ReviewCard review={mockReview} />);

    expect(screen.getByText('テストユーザー')).toBeInTheDocument();
    expect(screen.getByText(/2024年1月15日/)).toBeInTheDocument();
    expect(screen.getByText(/とても良いバーでした/)).toBeInTheDocument();
  });

  it('評価の星を正しく表示する', () => {
    render(<ReviewCard review={mockReview} />);

    const stars = screen.getAllByText('★');
    expect(stars).toHaveLength(5);
  });

  it('評価が5の場合は全ての星が黄色', () => {
    const reviewWith5Stars: Review = {
      ...mockReview,
      rating: 5,
    };

    const { container } = render(<ReviewCard review={reviewWith5Stars} />);
    const yellowStars = container.querySelectorAll('.text-yellow-500');
    expect(yellowStars).toHaveLength(5);
  });

  it('評価が1の場合は1つの星のみ黄色', () => {
    const reviewWith1Star: Review = {
      ...mockReview,
      rating: 1,
    };

    const { container } = render(<ReviewCard review={reviewWith1Star} />);
    const yellowStars = container.querySelectorAll('.text-yellow-500');
    expect(yellowStars).toHaveLength(1);
  });

  it('アバター画像がある場合は表示する', () => {
    render(<ReviewCard review={mockReview} />);

    const avatar = screen.getByAltText('テストユーザー');
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('アバター画像がない場合はイニシャルを表示する', () => {
    const reviewWithoutAvatar: Review = {
      ...mockReview,
      user_avatar_url: null,
    };

    render(<ReviewCard review={reviewWithoutAvatar} />);

    expect(screen.getByText('テ')).toBeInTheDocument();
  });

  it('コメントがない場合も正しく表示する', () => {
    const reviewWithoutComment: Review = {
      ...mockReview,
      comment: null,
    };

    render(<ReviewCard review={reviewWithoutComment} />);

    expect(screen.getByText('テストユーザー')).toBeInTheDocument();
    expect(screen.queryByText(/とても良いバー/)).not.toBeInTheDocument();
  });

  it('複数行のコメントを正しく表示する', () => {
    render(<ReviewCard review={mockReview} />);

    const comment = screen.getByText(/とても良いバーでした/);
    expect(comment).toHaveClass('whitespace-pre-wrap');
  });
});
