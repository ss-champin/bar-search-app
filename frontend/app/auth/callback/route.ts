/**
 * OAuth / メール確認のコールバック（サーバー側で code をセッションに交換）
 *
 * PKCE の code_verifier は Cookie に保存されるため、
 * クライアントの useEffect で exchangeCodeForSession すると verifier が欠落しやすい。
 * Next.js + Supabase 公式は Route Handler での交換を推奨。
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const redirectToRaw = searchParams.get('redirect') || '/';
  const redirectTo = redirectToRaw.startsWith('/') ? redirectToRaw : `/${redirectToRaw}`;

  const loginError = (message: string) =>
    NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(message)}`);

  let response = NextResponse.redirect(`${origin}${redirectTo}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return loginError(`認証に失敗しました: ${error.message}`);
    }
    return response;
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as
        | 'signup'
        | 'recovery'
        | 'invite'
        | 'email'
        | 'email_change'
        | 'magiclink',
    });
    if (error) {
      return loginError(`認証に失敗しました: ${error.message}`);
    }
    return response;
  }

  // パラメータなし（直接アクセスなど）
  return NextResponse.redirect(`${origin}/`);
}
