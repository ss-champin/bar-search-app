/**
 * 認証関連のユーティリティ関数
 */

import { createProfile as createProfileAPI } from './api';
import { createClient } from './supabase';

/**
 * サインアップ
 */
export async function signUp(email: string, password: string, nickname: string, age: number) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nickname,
          age,
        },
      },
    });

    if (error) {
      // より詳細なエラーメッセージを提供
      if (error.message.includes('fetch')) {
        throw new Error(
          'Supabaseへの接続に失敗しました。環境変数が正しく設定されているか確認してください。',
        );
      }
      throw error;
    }

    // セッションが確立されるまで待つ（メール確認が必要な場合はセッションがnullになる）
    // セッションが確立されている場合のみプロフィールを作成
    if (data.user && data.session) {
      try {
        // セッションが確立されているので、プロフィールを作成
        await createProfileAPI({ nickname, age });
      } catch (err) {
        // プロフィールが既に存在する場合は無視
        // 401エラーの場合も無視（メール確認待ちの可能性）
        const apiError = err as { status?: number };
        if (apiError.status === 401 || apiError.status === 409) {
          console.log(
            'Profile creation skipped:',
            apiError.status === 401 ? 'Session not ready' : 'Profile already exists',
          );
        } else {
          console.error('Profile creation error:', err);
        }
      }
    } else if (data.user && !data.session) {
      // メール確認が必要な場合
      // プロフィール作成はログイン時（メール確認後）に行う
      console.log('Email confirmation required. Profile will be created after email verification.');
    }

    return data;
  } catch (error) {
    // エラーを再スローして、呼び出し元で処理できるようにする
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('サインアップに失敗しました。ネットワーク接続を確認してください。');
  }
}

/**
 * ログイン
 */
export async function signIn(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // ログイン成功後、プロフィールが存在しない場合は作成を試みる
  // （サインアップ時にメール確認が必要だった場合など）
  if (data.user && data.session) {
    try {
      // プロフィールを取得してみる
      const { getMyProfile } = await import('./api');
      await getMyProfile();
    } catch (_err) {
      // プロフィールが存在しない場合、ユーザーメタデータから情報を取得して作成
      const userMetadata = data.user.user_metadata;
      if (userMetadata?.nickname && userMetadata?.age) {
        try {
          const { createProfile } = await import('./api');
          await createProfile({
            nickname: userMetadata.nickname,
            age: userMetadata.age,
          });
        } catch (createErr) {
          // プロフィール作成に失敗してもログインは成功として扱う
          console.log('Failed to create profile on login (may already exist):', createErr);
        }
      }
    }
  }

  return data;
}

/**
 * ログアウト
 */
export async function signOut() {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * 現在のセッションを取得
 */
export async function getSession() {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * 現在のユーザーを取得
 */
export async function getCurrentUser() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * アクセストークンを取得
 */
export async function getAccessToken(): Promise<string | null> {
  const session = await getSession();
  return session?.access_token || null;
}

/**
 * パスワードリセットメールを送信
 */
export async function resetPassword(email: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) throw error;
}

/**
 * パスワードを更新
 */
export async function updatePassword(newPassword: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
}

/**
 * Googleでログイン
 */
export async function signInWithGoogle(redirectTo?: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
}

/**
 * X(Twitter)でログイン
 */
export async function signInWithTwitter(redirectTo?: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'twitter',
    options: {
      redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
}
