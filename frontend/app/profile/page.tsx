'use client';

/**
 * プロフィールページ
 * プロフィールの表示と編集
 */

import { useAuthStore } from '@/lib/stores';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ProfileEditForm from './components/ProfileEditForm';

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login?redirect=/profile');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <main className="min-h-screen p-8">
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-col items-center justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            <p className="mt-4 text-slate-600">読み込み中...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen p-6 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          ホームに戻る
        </Link>

        <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-soft border border-slate-200">
          <h1 className="mb-2 text-2xl font-bold text-slate-900">プロフィール</h1>
          <p className="mb-6 text-slate-600">ニックネームやプロフィール画像を編集できます</p>

          {profile ? (
            <ProfileEditForm profile={profile} />
          ) : (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-amber-800">
              <p className="font-medium">プロフィールがまだ作成されていません</p>
              <p className="mt-1 text-sm">
                アカウント作成時にプロフィールは自動で作成されます。メール確認が完了していない場合は、確認メール内のリンクをクリックしてください。
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
