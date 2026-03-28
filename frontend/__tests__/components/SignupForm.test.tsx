/**
 * SignupFormコンポーネントのテスト
 */

import SignupForm from '@/app/auth/signup/components/SignupForm';
import { useAuthStore } from '@/lib/stores';
import type { User } from '@supabase/supabase-js';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as navigation from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('SignupForm', () => {
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
      signup: vi.fn(),
      clearError: vi.fn(),
    });
  });

  it('新規登録フォームを正しく表示する', () => {
    render(<SignupForm />);

    expect(screen.getByText('新規登録')).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('ニックネーム')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード（確認）')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登録' })).toBeInTheDocument();
  });

  it('ログインへのリンクを表示する', () => {
    render(<SignupForm />);

    const loginLink = screen.getByRole('link', { name: /ログイン/ });
    expect(loginLink).toHaveAttribute('href', '/auth/login');
  });

  it('入力値を正しく更新する', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
    await user.type(screen.getByLabelText('ニックネーム'), 'テストユーザー');
    await user.type(screen.getByLabelText('パスワード'), 'password123');
    await user.type(screen.getByLabelText('パスワード（確認）'), 'password123');

    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('テストユーザー')).toBeInTheDocument();
  });

  it('フォーム送信時に登録処理を実行する', async () => {
    const mockSignup = vi.fn().mockResolvedValue(undefined);
    useAuthStore.setState({ signup: mockSignup });

    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
    await user.type(screen.getByLabelText('ニックネーム'), 'テストユーザー');
    await user.type(screen.getByLabelText('パスワード'), 'password123');
    await user.type(screen.getByLabelText('パスワード（確認）'), 'password123');
    await user.click(screen.getByRole('button', { name: '登録' }));

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith('test@example.com', 'password123', 'テストユーザー');
    });
  });

  it('登録成功時にホームページへリダイレクトする', async () => {
    const loggedInUser = { id: 'signup-test-user', email: 'test@example.com' } as User;
    const mockSignup = vi.fn().mockImplementation(async () => {
      useAuthStore.setState({ user: loggedInUser });
    });
    useAuthStore.setState({ signup: mockSignup });

    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
    await user.type(screen.getByLabelText('ニックネーム'), 'テストユーザー');
    await user.type(screen.getByLabelText('パスワード'), 'password123');
    await user.type(screen.getByLabelText('パスワード（確認）'), 'password123');
    await user.click(screen.getByRole('button', { name: '登録' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('パスワードが一致しない場合はエラーを表示する', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
    await user.type(screen.getByLabelText('ニックネーム'), 'テストユーザー');
    await user.type(screen.getByLabelText('パスワード'), 'password123');
    await user.type(screen.getByLabelText('パスワード（確認）'), 'different');
    await user.click(screen.getByRole('button', { name: '登録' }));

    await waitFor(() => {
      expect(screen.getByText('パスワードが一致しません')).toBeInTheDocument();
    });
  });

  it('パスワードが6文字未満の場合はエラーを表示する', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
    await user.type(screen.getByLabelText('ニックネーム'), 'テストユーザー');
    await user.type(screen.getByLabelText('パスワード'), '12345');
    await user.type(screen.getByLabelText('パスワード（確認）'), '12345');
    await user.click(screen.getByRole('button', { name: '登録' }));

    await waitFor(() => {
      expect(screen.getByText('パスワードは6文字以上で入力してください')).toBeInTheDocument();
    });
  });

  it('登録失敗時にエラーを表示する', async () => {
    const mockSignup = vi.fn().mockRejectedValue(new Error('Email already exists'));
    useAuthStore.setState({ signup: mockSignup });

    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
    await user.type(screen.getByLabelText('ニックネーム'), 'テストユーザー');
    await user.type(screen.getByLabelText('パスワード'), 'password123');
    await user.type(screen.getByLabelText('パスワード（確認）'), 'password123');
    await user.click(screen.getByRole('button', { name: '登録' }));

    await waitFor(
      () => {
        const errorElement = screen.queryByText(/Email already exists|登録に失敗しました/);
        expect(errorElement).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('ローディング中はボタンが無効化される', () => {
    useAuthStore.setState({ loading: true });

    render(<SignupForm />);

    const submitButton = screen.getByRole('button', { name: /登録中/ });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('登録中...');
  });
});
