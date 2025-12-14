'use client';

import { useAuthStore } from '@/lib/stores';
import { createClient } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Header() {
  const router = useRouter();
  const { user, profile, loading, initialize, logout } = useAuthStore();

  useEffect(() => {
    // 初期化
    initialize();

    // Supabaseのセッション変更を監視
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, _session) => {
      // セッションが変更されたら再初期化
      initialize();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialize]);

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <header className="sticky top-0 z-40 glass border-b border-white/20 shadow-soft backdrop-blur-xl">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16 items-center">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-gradient-to-r from-primary-600 to-accent-600 p-1.5 sm:p-2 rounded-lg">
                  <span className="text-white text-lg sm:text-xl font-bold">🍸</span>
                </div>
              </div>
              <span className="text-lg sm:text-xl font-bold gradient-text hidden sm:inline">
                BarSearch
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className="px-3 sm:px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-white/50 hover:text-primary-600 transition-all duration-200"
              >
                ホーム
              </Link>
              {user && (
                <Link
                  href="/favorites"
                  className="px-3 sm:px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-white/50 hover:text-primary-600 transition-all duration-200"
                >
                  お気に入り
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {loading ? (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                <div className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                <span className="hidden sm:inline">読み込み中...</span>
              </div>
            ) : user ? (
              <>
                <div className="hidden sm:flex items-center gap-3 px-3 py-2 rounded-lg bg-white/50 hover:bg-white transition-colors">
                  {/* アバター画像 */}
                  {profile?.avatar_url ? (
                    <div className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full overflow-hidden ring-2 ring-primary-200">
                      <Image
                        src={profile.avatar_url}
                        alt={profile.nickname || 'ユーザー'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-accent-400 text-xs sm:text-sm font-semibold text-white ring-2 ring-primary-200">
                      {profile?.nickname?.[0]?.toUpperCase() ||
                        user.email?.[0]?.toUpperCase() ||
                        '?'}
                    </div>
                  )}
                  {/* ニックネーム */}
                  <span className="text-xs sm:text-sm font-medium text-slate-700 hidden lg:inline">
                    {profile?.nickname || user.email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-md transition-all duration-200"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-700 hover:bg-white/50 transition-all duration-200"
                >
                  ログイン
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:from-primary-700 hover:to-accent-700 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  新規登録
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
