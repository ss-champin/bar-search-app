'use client';

/**
 * OAuth認証・メール確認コールバックページ
 * useSearchParams は Next.js の要件で Suspense 内で使用する必要がある
 */

import { createProfile } from '@/lib/api';
import { useAuthStore } from '@/lib/stores';
import { createClient } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function AuthCallbackLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="relative mx-auto mb-4">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full border-4 border-primary-400 opacity-20" />
        </div>
        <div className="mb-2 text-xl font-semibold text-slate-900">認証処理中...</div>
        <div className="text-slate-600">しばらくお待ちください</div>
      </div>
    </div>
  );
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { initialize, fetchProfile } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setLoading(true);
        setError(null);

        const supabase = createClient();
        const code = searchParams.get('code');
        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type') as 'signup' | 'recovery' | 'email' | null;

        if (code) {
          // PKCEフロー: codeをセッションに交換（メール確認・OAuthどちらでも使われる）
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            throw new Error(`認証に失敗しました: ${exchangeError.message}`);
          }
        } else if (tokenHash && type) {
          // トークンハッシュフロー（Supabaseの古いメール確認形式）
          const { error: verifyError } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
          if (verifyError) {
            throw new Error(`認証に失敗しました: ${verifyError.message}`);
          }
        }

        // セッション確立後に authStore を初期化（user と profile の両方をセット）
        await initialize();

        // プロフィールが存在しない場合はユーザーメタデータから作成
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          try {
            await fetchProfile();
          } catch (_profileError) {
            const userMetadata = user.user_metadata;
            if (userMetadata?.nickname && userMetadata?.age) {
              try {
                await createProfile({
                  nickname: userMetadata.nickname,
                  age: Number(userMetadata.age),
                });
                await fetchProfile();
              } catch (createErr) {
                console.error('Failed to create profile:', createErr);
              }
            }
          }
        }

        // リダイレクト先へ遷移（ログイン済み状態で）
        const redirectTo = searchParams.get('redirect') || '/';
        router.push(redirectTo);
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
          <div className="mb-4 text-xl font-semibold text-red-600">認証エラー</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            type="button"
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
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full border-4 border-primary-400 opacity-20" />
        </div>
        <div className="mb-2 text-xl font-semibold text-slate-900">認証処理中...</div>
        <div className="text-slate-600">しばらくお待ちください</div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackLoading />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
