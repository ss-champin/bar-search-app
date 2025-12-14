/**
 * FavoriteButtonコンポーネントのテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FavoriteButton from '@/components/FavoriteButton';
import { useAuthStore, useBarStore } from '@/lib/stores';
import * as navigation from 'next/navigation';

// next/navigation は vitest.setup.ts でモック済み
vi.mock('next/navigation');

describe('FavoriteButton', () => {
  const mockBarId = 'bar123';
  const mockUser = {
    id: 'user123',
    email: 'test@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // ストアの初期状態をリセット
    useAuthStore.setState({ user: null, loading: false, error: null });
    useBarStore.setState({
      favoriteMap: new Map(),
      fetchFavorites: vi.fn(),
      toggleFavorite: vi.fn().mockResolvedValue(undefined),
    });
  });

  it('未ログイン時は白いハートを表示する', () => {
    render(<FavoriteButton barId={mockBarId} />);

    expect(screen.getByText('🤍')).toBeInTheDocument();
    expect(screen.getByTitle('お気に入りに追加')).toBeInTheDocument();
  });

  it('お気に入り登録済みの場合は赤いハートを表示する', () => {
    const favoriteMap = new Map();
    favoriteMap.set(mockBarId, { id: 'fav123', bar_id: mockBarId });

    useAuthStore.setState({ user: mockUser as any });
    useBarStore.setState({ favoriteMap });

    render(<FavoriteButton barId={mockBarId} />);

    expect(screen.getByText('❤️')).toBeInTheDocument();
    expect(screen.getByTitle('お気に入りから削除')).toBeInTheDocument();
  });

  it('未ログイン時クリックするとログインページへ遷移する', async () => {
    const mockPush = vi.fn();
    vi.mocked(navigation.useRouter).mockReturnValue({ push: mockPush } as any);

    render(<FavoriteButton barId={mockBarId} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/login');
    });
  });

  it('ログイン済みの場合はお気に入りを切り替える', async () => {
    const mockToggleFavorite = vi.fn().mockResolvedValue(undefined);

    useAuthStore.setState({ user: mockUser as any });
    useBarStore.setState({
      favoriteMap: new Map(),
      toggleFavorite: mockToggleFavorite,
    });

    render(<FavoriteButton barId={mockBarId} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockToggleFavorite).toHaveBeenCalledWith(mockBarId);
    });
  });

  it('ローディング中はボタンが無効化される', async () => {
    const mockToggleFavorite = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

    useAuthStore.setState({ user: mockUser as any });
    useBarStore.setState({
      favoriteMap: new Map(),
      toggleFavorite: mockToggleFavorite,
    });

    render(<FavoriteButton barId={mockBarId} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(button).toBeDisabled();
  });

  it('サイズプロップが正しく適用される', () => {
    const { rerender } = render(<FavoriteButton barId={mockBarId} size="sm" />);
    expect(screen.getByRole('button')).toHaveClass('text-xl');

    rerender(<FavoriteButton barId={mockBarId} size="md" />);
    expect(screen.getByRole('button')).toHaveClass('text-2xl');

    rerender(<FavoriteButton barId={mockBarId} size="lg" />);
    expect(screen.getByRole('button')).toHaveClass('text-3xl');
  });

  it('ログイン後にお気に入り一覧を取得する', async () => {
    const mockFetchFavorites = vi.fn();

    useAuthStore.setState({ user: mockUser as any });
    useBarStore.setState({
      favoriteMap: new Map(),
      fetchFavorites: mockFetchFavorites,
    });

    render(<FavoriteButton barId={mockBarId} />);

    await waitFor(() => {
      expect(mockFetchFavorites).toHaveBeenCalled();
    });
  });
});
