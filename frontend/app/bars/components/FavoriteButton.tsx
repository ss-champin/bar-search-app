'use client';

/**
 * お気に入りボタンコンポーネント
 */

import { useBarStore } from '@/lib/stores';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface FavoriteButtonProps {
  barId: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function FavoriteButton({ barId, size = 'md' }: FavoriteButtonProps) {
  const router = useRouter();
  const { favoriteMap, toggleFavorite: toggleFavoriteStore, fetchFavorites } = useBarStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Supabaseセッションを直接チェック
  useEffect(() => {
    const supabase = createClient();

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const loggedIn = !!session;
      setIsLoggedIn(loggedIn);

      // ログイン済みでお気に入りが未取得の場合は取得
      if (loggedIn && favoriteMap.size === 0) {
        fetchFavorites();
      }
    };

    checkSession();

    // セッション変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const loggedIn = !!session;
      setIsLoggedIn(loggedIn);

      // ログイン時にお気に入りを取得
      if (loggedIn) {
        fetchFavorites();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // お気に入り状態を判定
  const isFavorite = favoriteMap.has(barId);

  // お気に入りの切り替え
  const handleToggle = async () => {
    // Supabaseセッションを再度確認
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // ログインしていない場合はログインページにリダイレクト
    if (!session) {
      const currentPath = window.location.pathname;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    setIsLoading(true);

    try {
      await toggleFavoriteStore(barId);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      // エラーメッセージを表示
      const errorMessage = err instanceof Error ? err.message : 'お気に入りの追加に失敗しました';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ログアウト時はお気に入りボタンを表示しない
  if (!isLoggedIn) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      className={`relative transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 ${sizeClasses[size]}`}
      title={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
    >
      {isFavorite ? (
        <span className="relative">
          <span className="absolute inset-0 animate-ping text-red-400 opacity-75">❤️</span>
          <span className="relative text-red-500">❤️</span>
        </span>
      ) : (
        <span className="text-slate-400 hover:text-red-400 transition-colors">🤍</span>
      )}
    </button>
  );
}
