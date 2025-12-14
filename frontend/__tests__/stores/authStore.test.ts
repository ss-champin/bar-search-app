/**
 * authStoreのテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '@/lib/stores/authStore';
import type { User } from '@supabase/supabase-js';

// authモジュールをモック
vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(),
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
}));

describe('authStore', () => {
  beforeEach(() => {
    // 各テストの前にストアをリセット
    useAuthStore.setState({ user: null, loading: false, error: null });
    vi.clearAllMocks();
  });

  it('初期状態が正しい', () => {
    const { user, loading, error } = useAuthStore.getState();

    expect(user).toBeNull();
    expect(loading).toBe(false);
    expect(error).toBeNull();
  });

  it('initialize()でユーザー情報を取得する', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as User;

    const { getCurrentUser } = await import('@/lib/auth');
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);

    await useAuthStore.getState().initialize();

    const { user, loading } = useAuthStore.getState();
    expect(user).toEqual(mockUser);
    expect(loading).toBe(false);
  });

  it('login()成功時にユーザー情報をセットする', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
    } as User;

    const { signIn } = await import('@/lib/auth');
    vi.mocked(signIn).mockResolvedValue({ user: mockUser } as any);

    await useAuthStore.getState().login('test@example.com', 'password123');

    const { user, loading, error } = useAuthStore.getState();
    expect(user).toEqual(mockUser);
    expect(loading).toBe(false);
    expect(error).toBeNull();
  });

  it('login()失敗時にエラーをセットする', async () => {
    const mockError = new Error('Invalid credentials');

    const { signIn } = await import('@/lib/auth');
    vi.mocked(signIn).mockRejectedValue(mockError);

    await expect(
      useAuthStore.getState().login('test@example.com', 'wrong')
    ).rejects.toThrow('Invalid credentials');

    const { user, loading, error } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(loading).toBe(false);
    expect(error).toBe('Invalid credentials');
  });

  it('signup()成功時にユーザー情報をセットする', async () => {
    const mockUser = {
      id: '123',
      email: 'new@example.com',
    } as User;

    const { signUp } = await import('@/lib/auth');
    vi.mocked(signUp).mockResolvedValue({ user: mockUser } as any);

    await useAuthStore.getState().signup('new@example.com', 'password123', 'NewUser', 25);

    const { user, loading, error } = useAuthStore.getState();
    expect(user).toEqual(mockUser);
    expect(loading).toBe(false);
    expect(error).toBeNull();
  });

  it('logout()時にユーザー情報をクリアする', async () => {
    // まずログイン状態にする
    const mockUser = { id: '123', email: 'test@example.com' } as User;
    useAuthStore.setState({ user: mockUser, loading: false });

    const { signOut } = await import('@/lib/auth');
    vi.mocked(signOut).mockResolvedValue();

    await useAuthStore.getState().logout();

    const { user, loading, error } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(loading).toBe(false);
    expect(error).toBeNull();
  });

  it('clearError()でエラーをクリアする', () => {
    useAuthStore.setState({ error: 'Test error' });

    useAuthStore.getState().clearError();

    const { error } = useAuthStore.getState();
    expect(error).toBeNull();
  });
});
