/**
 * 認証状態管理用Zustandストア
 */

import type { User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { ApiError, type Profile, createProfile, getMyProfile } from '../api';
import { getCurrentUser, signIn, signOut, signUp } from '../auth';
import { createClient } from '../supabase';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, nickname: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, _get) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,

  // 初期化: アプリ起動時に現在のユーザーとプロフィールを取得
  initialize: async () => {
    try {
      set({ loading: true, error: null });
      const user = await getCurrentUser();

      if (user) {
        // プロフィールを取得
        try {
          const profile = await getMyProfile();
          set({ user, profile, loading: false });
        } catch (err) {
          // プロフィールが見つからない場合（404）は正常な状態として扱う
          const isNotFound = err instanceof ApiError && err.status === 404;
          if (isNotFound) {
            // メール確認直後など: user_metadata からプロフィールを作成を試みる
            const meta = user.user_metadata as { nickname?: string } | undefined;
            if (meta?.nickname) {
              try {
                await createProfile({
                  nickname: String(meta.nickname),
                });
                const profile = await getMyProfile();
                set({ user, profile, loading: false });
                return;
              } catch (createErr) {
                console.error('Failed to create profile on initialize:', createErr);
              }
            }
            set({ user, profile: null, loading: false });
          } else {
            // その他のエラーの場合のみログを出力
            console.error('Failed to fetch profile:', err);
            set({ user, profile: null, loading: false });
          }
        }
      } else {
        set({ user: null, profile: null, loading: false });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      set({ user: null, profile: null, loading: false, error: 'Failed to load user' });
    }
  },

  // プロフィールを取得
  fetchProfile: async () => {
    try {
      const profile = await getMyProfile();
      set({ profile });
    } catch (error) {
      // 404エラーの場合は正常な状態として扱う（プロフィール未作成）
      const isNotFound = error instanceof ApiError && error.status === 404;
      if (!isNotFound) {
        console.error('Failed to fetch profile:', error);
      }
      // プロフィールが見つからない場合はnullのまま
      set({ profile: null });
    }
  },

  // ログイン
  login: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const { user } = await signIn(email, password);

      // プロフィールを取得
      let profile: Profile | null = null;
      if (user) {
        try {
          profile = await getMyProfile();
        } catch (err) {
          // 404エラーの場合は正常な状態として扱う（プロフィール未作成）
          const isNotFound = err instanceof ApiError && err.status === 404;
          if (!isNotFound) {
            console.error('Failed to fetch profile after login:', err);
          }
        }
      }

      set({ user, profile, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      set({ loading: false, error: message });
      throw error;
    }
  },

  // サインアップ
  signup: async (email: string, password: string, nickname: string) => {
    try {
      set({ loading: true, error: null });
      const { user, session } = await signUp(email, password, nickname);

      // セッションが確立されている場合のみプロフィールを取得
      let profile: Profile | null = null;
      if (user && session) {
        try {
          // セッションが確立されているので、プロフィールを取得
          profile = await getMyProfile();
        } catch (err) {
          // プロフィールが存在しない場合はnullのまま（後で作成される）
          console.log('Profile not found after signup (will be created on first login):', err);
        }
      } else if (user && !session) {
        // メール確認が必要な場合
        // ユーザーは作成されているが、セッションは確立されていない
        // プロフィールはメール確認後のログイン時に作成される
        console.log('Email confirmation required. User created but session not established.');
      }

      // セッションが確立されている場合のみログイン状態として扱う
      // メール確認が必要な場合は、ユーザー情報を保存しない（確認メール送信のみ）
      if (session) {
        set({ user, profile, loading: false });
      } else {
        // メール確認待ちの場合は、ユーザー情報を保存せずに成功として扱う
        set({ user: null, profile: null, loading: false });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      set({ loading: false, error: message });
      throw error;
    }
  },

  // ログアウト
  logout: async () => {
    try {
      set({ loading: true, error: null });
      await signOut();
      set({ user: null, profile: null, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      set({ loading: false, error: message });
      throw error;
    }
  },

  // エラークリア
  clearError: () => set({ error: null }),
}));
