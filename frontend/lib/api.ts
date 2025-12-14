/**
 * バックエンドAPIクライアント
 */

import type { BarDetail, BarListResponse, Review, Favorite, Profile } from './types';
import { getAccessToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * 認証ヘッダーを取得
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/**
 * リトライ機能付きfetch
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3,
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // 成功した場合はそのまま返す
      if (response.ok) {
        return response;
      }

      // 4xxエラーはリトライしない
      if (response.status >= 400 && response.status < 500) {
        return response;
      }

      // 5xxエラーはリトライ
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // 最後の試行でない場合は待機してリトライ
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
    }
  }

  throw lastError || new Error('Failed to fetch');
}

/**
 * APIエラー
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * お気に入り一覧を取得
 */
export async function getFavorites(params?: {
  limit?: number;
  offset?: number;
}): Promise<{ favorites: Favorite[]; total: number; limit: number; offset: number }> {
  const searchParams = new URLSearchParams();

  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());

  const url = `${API_BASE_URL}/api/favorites${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const response = await fetchWithRetry(url, {
    method: 'GET',
    headers: await getAuthHeaders(),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch favorites: ${response.statusText}`,
      response.status,
      await response.json().catch(() => null),
    );
  }

  return response.json();
}

/**
 * お気に入りを追加
 */
export async function addFavorite(barId: string): Promise<Favorite> {
  const url = `${API_BASE_URL}/api/favorites`;

  // bar_idの形式を確認
  if (!barId || typeof barId !== 'string') {
    throw new ApiError('Invalid bar_id: bar_id is required and must be a string', 400);
  }

  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ bar_id: barId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    const errorMessage = errorData.detail || errorData.message || `Failed to add favorite: ${response.statusText}`;
    throw new ApiError(errorMessage, response.status, errorData);
  }

  return response.json();
}

/**
 * お気に入りを削除
 */
export async function removeFavorite(favoriteId: string): Promise<void> {
  // favoriteIdの形式を確認
  if (!favoriteId || typeof favoriteId !== 'string') {
    throw new ApiError('Invalid favorite_id: favorite_id is required and must be a string', 400);
  }

  const url = `${API_BASE_URL}/api/favorites/${favoriteId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    const errorMessage = errorData.detail || errorData.message || `Failed to remove favorite: ${response.statusText}`;
    throw new ApiError(errorMessage, response.status, errorData);
  }
}

/**
 * バー一覧を取得（全文検索・フィルタリング対応）
 */
export async function getBars(params?: {
  search?: string;
  prefecture?: string;
  city?: string;
  minRating?: number;
  maxRating?: number;
  sortBy?: 'rating_desc' | 'rating_asc' | 'created_desc' | 'created_asc';
  limit?: number;
  offset?: number;
}): Promise<BarListResponse> {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.set('search', params.search);
  if (params?.prefecture) searchParams.set('prefecture', params.prefecture);
  if (params?.city) searchParams.set('city', params.city);
  if (params?.minRating !== undefined)
    searchParams.set('min_rating', params.minRating.toString());
  if (params?.maxRating !== undefined)
    searchParams.set('max_rating', params.maxRating.toString());
  if (params?.sortBy) searchParams.set('sort_by', params.sortBy);
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());

  const url = `${API_BASE_URL}/api/bars${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const response = await fetchWithRetry(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store', // 常に最新データを取得
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch bars: ${response.statusText}`,
      response.status,
      await response.json().catch(() => null),
    );
  }

  return response.json();
}

/**
 * バー詳細を取得
 */
export async function getBar(barId: string): Promise<BarDetail> {
  const url = `${API_BASE_URL}/api/bars/${barId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch bar: ${response.statusText}`,
      response.status,
      await response.json().catch(() => null),
    );
  }

  return response.json();
}

/**
 * バーのレビュー一覧を取得
 */
export async function getBarReviews(
  barId: string,
  params?: {
    limit?: number;
    offset?: number;
  },
): Promise<{ reviews: Review[]; total: number; limit: number; offset: number }> {
  const searchParams = new URLSearchParams();

  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());

  const url = `${API_BASE_URL}/api/bars/${barId}/reviews${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch reviews: ${response.statusText}`,
      response.status,
      await response.json().catch(() => null),
    );
  }

  return response.json();
}

/**
 * レビューを投稿
 */
export async function createReview(
  barId: string,
  data: {
    rating: number;
    comment: string;
  },
): Promise<Review> {
  // barIdの形式を確認
  if (!barId || typeof barId !== 'string') {
    throw new ApiError('Invalid bar_id: bar_id is required and must be a string', 400);
  }

  const url = `${API_BASE_URL}/api/bars/${barId}/reviews`;

  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    const errorMessage = errorData.detail || errorData.message || `Failed to create review: ${response.statusText}`;
    throw new ApiError(errorMessage, response.status, errorData);
  }

  return response.json();
}

/**
 * レビューを更新
 */
export async function updateReview(
  reviewId: string,
  data: {
    rating?: number;
    comment?: string;
  },
): Promise<Review> {
  const url = `${API_BASE_URL}/api/reviews/${reviewId}`;

  const response = await fetchWithRetry(url, {
    method: 'PUT',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to update review: ${response.statusText}`,
      response.status,
      await response.json().catch(() => null),
    );
  }

  return response.json();
}

/**
 * レビューを削除
 */
export async function deleteReview(reviewId: string): Promise<void> {
  const url = `${API_BASE_URL}/api/reviews/${reviewId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to delete review: ${response.statusText}`,
      response.status,
      await response.json().catch(() => null),
    );
  }
}

/**
 * 画像アップロードレスポンス
 */
export interface ImageUploadResponse {
  url: string;
  path: string;
}

/**
 * バーの画像をアップロード
 */
export async function uploadBarImage(barId: string, file: File): Promise<ImageUploadResponse> {
  const url = `${API_BASE_URL}/api/images/upload/bar/${barId}`;

  const formData = new FormData();
  formData.append('file', file);

  const token = await getAccessToken();
  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to upload image: ${response.statusText}`,
      response.status,
      await response.json().catch(() => null),
    );
  }

  return response.json();
}

/**
 * レビューの画像をアップロード
 */
export async function uploadReviewImage(reviewId: string, file: File): Promise<ImageUploadResponse> {
  const url = `${API_BASE_URL}/api/images/upload/review/${reviewId}`;

  const formData = new FormData();
  formData.append('file', file);

  const token = await getAccessToken();
  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to upload image: ${response.statusText}`,
      response.status,
      await response.json().catch(() => null),
    );
  }

  return response.json();
}

/**
 * アバター画像をアップロード
 */
export async function uploadAvatar(file: File): Promise<ImageUploadResponse> {
  const url = `${API_BASE_URL}/api/images/upload/avatar`;

  const formData = new FormData();
  formData.append('file', file);

  const token = await getAccessToken();
  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to upload avatar: ${response.statusText}`,
      response.status,
      await response.json().catch(() => null),
    );
  }

  return response.json();
}

/**
 * 画像を削除
 */
export async function deleteImage(path: string): Promise<void> {
  const url = `${API_BASE_URL}/api/images/delete`;

  const response = await fetchWithRetry(url, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ path }),
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to delete image: ${response.statusText}`,
      response.status,
      await response.json().catch(() => null),
    );
  }
}

/**
 * 自分のプロフィールを取得
 */
export async function getMyProfile(): Promise<Profile> {
  const url = `${API_BASE_URL}/api/users/me`;

  const response = await fetchWithRetry(url, {
    method: 'GET',
    headers: await getAuthHeaders(),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    const errorMessage = errorData.detail || errorData.message || `Failed to fetch profile: ${response.statusText}`;
    const apiError = new ApiError(errorMessage, response.status, errorData);
    // 404エラーの場合、特別なプロパティを追加して呼び出し元で識別できるようにする
    if (response.status === 404) {
      apiError.isNotFound = true;
    }
    throw apiError;
  }

  return response.json();
}

/**
 * プロフィールを作成
 */
export async function createProfile(data: {
  nickname: string;
  age: number;
  avatar_url?: string;
}): Promise<Profile> {
  const url = `${API_BASE_URL}/api/users/me`;

  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to create profile: ${response.statusText}`,
      response.status,
      await response.json().catch(() => null),
    );
  }

  return response.json();
}

/**
 * プロフィールを更新
 */
export async function updateProfile(data: {
  nickname?: string;
  age?: number;
  avatar_url?: string;
  email?: string;
}): Promise<Profile> {
  const url = `${API_BASE_URL}/api/users/me`;

  const response = await fetchWithRetry(url, {
    method: 'PUT',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to update profile: ${response.statusText}`,
      response.status,
      await response.json().catch(() => null),
    );
  }

  return response.json();
}
