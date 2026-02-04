import type { Favorite } from '@/lib/api';
import { getServerAccessToken, getServerUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import FavoritesContent from './components/FavoritesContent';

function getServerApiBaseUrl(): string {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000';
}

async function getServerFavorites(): Promise<{
  favorites: Favorite[];
  total: number;
  limit: number;
  offset: number;
}> {
  const token = await getServerAccessToken();
  const url = `${getServerApiBaseUrl()}/api/favorites`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('認証が必要です');
    }
    throw new Error(`Failed to fetch favorites: ${response.statusText}`);
  }

  return response.json();
}

export default async function FavoritesPage() {
  const user = await getServerUser();

  // 未認証の場合はログインページにリダイレクト
  if (!user) {
    redirect('/auth/login?redirect=/favorites');
  }

  try {
    const data = await getServerFavorites();

    return <FavoritesContent favorites={data.favorites} />;
  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-lg bg-red-50 p-4 text-red-700">
            <p className="font-semibold">エラーが発生しました</p>
            <p className="text-sm">
              {error instanceof Error ? error.message : '予期しないエラーが発生しました'}
            </p>
          </div>
        </div>
      </div>
    );
  }
}
