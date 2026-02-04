/**
 * 認証関連のユーティリティ関数（サーバー用）
 */

import { createServerSupabaseClient } from '../supabase/client';

/**
 * サーバーサイドで現在のユーザーを取得
 */
export async function getServerUser() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * サーバーサイドでアクセストークンを取得
 */
export async function getServerAccessToken(): Promise<string | null> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token || null;
}
