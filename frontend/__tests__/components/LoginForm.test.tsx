/**
 * LoginFormコンポーネントのテスト
 */

import LoginForm from '@/app/auth/login/components/LoginForm';
import { useAuthStore } from '@/lib/stores';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as navigation from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation');

describe('LoginForm', () => {
  const mockPush = vi.fn();
  const mockRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(navigation.useRouter).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    } as any);

    useAuthStore.setState({
      user: null,
      loading: false,
      error: null,
      login: vi.fn(),
      clearError: vi.fn(),
    });
  });

  it('ログインフォームを正しく表示する', () => {
    render(<LoginForm />);

    expect(screen.getByRole('heading', { name: 'ログイン' })).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ログイン/ })).toBeInTheDocument();
  });

  it('新規登録へのリンクを表示する', () => {
    render(<LoginForm />);

    const signupLink = screen.getByRole('link', { name: /新規登録/ });
    expect(signupLink).toHaveAttribute('href', '/auth/signup');
  });

  it('入力値を正しく更新する', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText('メールアドレス') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('パスワード') as HTMLInputElement;

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('フォーム送信時にログイン処理を実行する', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);
    useAuthStore.setState({ login: mockLogin });

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
    await user.type(screen.getByLabelText('パスワード'), 'password123');
    await user.click(screen.getByRole('button', { name: /ログイン/ }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('ログイン成功時にホームページへリダイレクトする', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);
    useAuthStore.setState({ login: mockLogin });

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
    await user.type(screen.getByLabelText('パスワード'), 'password123');
    await user.click(screen.getByRole('button', { name: /ログイン/ }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('ログイン失敗時にエラーを表示する', async () => {
    const mockLogin = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
    useAuthStore.setState({ login: mockLogin });

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
    await user.type(screen.getByLabelText('パスワード'), 'wrong');
    await user.click(screen.getByRole('button', { name: /ログイン/ }));

    await waitFor(
      () => {
        const errorElement = screen.queryByText(/Invalid credentials|ログインに失敗しました/);
        expect(errorElement).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('ローディング中はボタンが無効化される', () => {
    useAuthStore.setState({ loading: true });

    render(<LoginForm />);

    const submitButton = screen.getByRole('button');
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('ログイン中...');
  });

  it('authStoreのエラーを表示する', () => {
    useAuthStore.setState({ error: 'Authentication failed' });

    render(<LoginForm />);

    expect(screen.getByText('Authentication failed')).toBeInTheDocument();
  });

  it('エラー表示時にclearErrorを呼ぶ', async () => {
    const mockClearError = vi.fn();
    const mockLogin = vi.fn().mockResolvedValue(undefined);

    useAuthStore.setState({
      error: 'Previous error',
      login: mockLogin,
      clearError: mockClearError,
    });

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
    await user.type(screen.getByLabelText('パスワード'), 'password123');
    await user.click(screen.getByRole('button', { name: /ログイン/ }));

    expect(mockClearError).toHaveBeenCalled();
  });
});
