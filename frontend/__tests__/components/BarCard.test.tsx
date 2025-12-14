/**
 * BarCardコンポーネントのテスト
 */

import BarCard from '@/components/BarCard';
import type { BarSummary } from '@/lib/types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('BarCard', () => {
  const mockBar: BarSummary = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'テストバー',
    prefecture: '東京都',
    city: '渋谷区',
    address: '渋谷1-1-1',
    image_urls: ['https://example.com/image.jpg'],
    average_rating: 4.5,
    review_count: 10,
  };

  it('バー情報を正しく表示する', () => {
    render(<BarCard bar={mockBar} />);

    expect(screen.getByText('テストバー')).toBeInTheDocument();
    expect(screen.getByText(/東京都/)).toBeInTheDocument();
    expect(screen.getByText(/渋谷区/)).toBeInTheDocument();
  });

  it('評価が0の場合は正しく表示する', () => {
    const barWithNoRating: BarSummary = {
      ...mockBar,
      average_rating: 0,
      review_count: 0,
    };

    render(<BarCard bar={barWithNoRating} />);

    expect(screen.getByText('テストバー')).toBeInTheDocument();
  });

  it('画像URLが設定されている場合は表示する', () => {
    render(<BarCard bar={mockBar} />);

    const images = screen.queryAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });

  it('画像がない場合も正しく表示する', () => {
    const barWithNoImage: BarSummary = {
      ...mockBar,
      image_urls: [],
    };

    render(<BarCard bar={barWithNoImage} />);

    expect(screen.getByText('テストバー')).toBeInTheDocument();
  });

  it('レビュー数を表示する', () => {
    render(<BarCard bar={mockBar} />);

    expect(screen.getByText(/10/)).toBeInTheDocument();
  });

  it('バーをクリックできる', () => {
    render(<BarCard bar={mockBar} />);

    const card = screen.getByText('テストバー').closest('a');
    expect(card).toHaveAttribute('href', `/bars/${mockBar.id}`);
  });
});
