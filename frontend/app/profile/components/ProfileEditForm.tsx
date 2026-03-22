'use client';

/**
 * プロフィール編集フォーム
 */

import { updateProfile } from '@/lib/api';
import type { Profile } from '@/lib/api';
import { useAuthStore } from '@/lib/stores';
import AvatarUpload from '@/components/AvatarUpload';
import { useState } from 'react';

interface ProfileEditFormProps {
  profile: Profile;
}

export default function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const { fetchProfile } = useAuthStore();
  const [nickname, setNickname] = useState(profile.nickname);
  const [age, setAge] = useState(String(profile.age));
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const ageNum = Number.parseInt(age, 10);
    if (Number.isNaN(ageNum) || ageNum < 20 || ageNum > 120) {
      setError('年齢は20歳以上120歳以下で入力してください');
      return;
    }

    if (!nickname.trim()) {
      setError('ニックネームを入力してください');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        nickname: nickname.trim(),
        age: ageNum,
        avatar_url: avatarUrl ?? profile.avatar_url ?? undefined,
      });
      await fetchProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ニックネーム表示・編集 */}
      <div>
        <label htmlFor="nickname" className="block text-sm font-semibold text-slate-700 mb-2">
          ニックネーム
        </label>
        <input
          id="nickname"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={50}
          className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 text-slate-900 placeholder-slate-400"
          placeholder="ニックネームを入力"
        />
      </div>

      {/* 年齢 */}
      <div>
        <label htmlFor="age" className="block text-sm font-semibold text-slate-700 mb-2">
          年齢
        </label>
        <input
          id="age"
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          min={20}
          max={120}
          className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 text-slate-900 placeholder-slate-400"
          placeholder="20"
        />
        <p className="mt-1 text-xs text-slate-500">※20歳以上120歳以下</p>
      </div>

      {/* メールアドレス（閲覧のみ） */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">メールアドレス</label>
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-slate-700 border border-slate-200">
          {profile.email}
        </p>
        <p className="mt-1 text-xs text-slate-500">メールアドレスは変更できません</p>
      </div>

      {/* アバター画像 */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">プロフィール画像</label>
        <AvatarUpload
          currentAvatarUrl={avatarUrl || profile.avatar_url || null}
          onUploadComplete={(url) => {
            setAvatarUrl(url);
          }}
        />
      </div>

      {/* エラー・成功メッセージ */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-green-700 text-sm">
          プロフィールを保存しました
        </div>
      )}

      {/* 保存ボタン */}
      <button
        type="submit"
        disabled={saving}
        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold shadow-md hover:shadow-lg hover:from-primary-700 hover:to-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {saving ? (
          <span className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            保存中...
          </span>
        ) : (
          '変更を保存'
        )}
      </button>
    </form>
  );
}
