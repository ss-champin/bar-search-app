'use client';

/**
 * OAuth認証・メール確認コールバックページ
 */

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores';
import { createClient } from '@/lib/supabase';
import { createProfile } from '@/lib/api';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { initialize, fetchProfile } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setLoading(true);
        setError(null);

        const supabase = createClient();
        const code = searchParams.get('code');
        const type = searchParams.get('type'); // 'signup' or 'recovery'

        // メール確認リンクからのコールバックの場合
        if (code && type) {
          // コードをセッションに交換
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            throw new Error(`認証に失敗しました: ${exchangeError.message}`);
          }

          // セッションが確立されたら、プロフィールを作成（存在しない場合）
          if (data.user && data.session) {
            try {
              // プロフィールを取得してみる
              await fetchProfile();
            } catch (profileError) {
              // プロフィールが存在しない場合、ユーザーメタデータから作成
              const userMetadata = data.user.user_metadata;
              if (userMetadata?.nickname && userMetadata?.age) {
                try {
                  await createProfile({
                    nickname: userMetadata.nickname,
                    age: userMetadata.age,
                  });
                  // プロフィール作成後、再度取得
                  await fetchProfile();
                } catch (createErr) {
                  console.error('Failed to create profile:', createErr);
                  // プロフィール作成に失敗しても続行
                }
              }
            }
          }
        } else {
          // OAuthコールバックの場合（既存の処理）
          await initialize();
        }

        // リダイレクト先を取得（デフォルトはホームページ）
        const redirectTo = searchParams.get('redirect') || '/';
        router.push(redirectTo);
        router.refresh();
      } catch (err) {
        console.error('Callback error:', err);
        setError(err instanceof Error ? err.message : '認証処理に失敗しました');
        setLoading(false);
      }
    };

    handleCallback();
  }, [initialize, fetchProfile, router, searchParams]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-xl font-semibold text-red-600">
            認証エラー
          </div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            ログインページに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="relative mx-auto mb-4">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
          <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full border-4 border-primary-400 opacity-20"></div>
        </div>
        <div className="mb-2 text-xl font-semibold text-slate-900">
          認証処理中...
        </div>
        <div className="text-slate-600">
          しばらくお待ちください
        </div>
      </div>
    </div>
  );
}
