/**
 * APIレスポンスの型定義
 */

// バーサマリー（一覧表示用）
export interface BarSummary {
  id: string;
  name: string;
  prefecture: string;
  city: string;
  address: string;
  image_urls: string[];
  average_rating: number;
  review_count: number;
}

// バー詳細
export interface BarDetail extends BarSummary {
  description?: string;
  opening_hours?: Record<string, { open: string; close: string }>;
  regular_holiday?: string;
  menu_beer_price?: number | null;
  menu_whiskey_price?: number | null;
  menu_cocktail_price?: number | null;
  phone?: string;
  website?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// バー一覧レスポンス
export interface BarListResponse {
  bars: BarSummary[];
  total: number;
  limit: number;
  offset: number;
}

// レビュー
export interface Review {
  id: string;
  bar_id: string;
  user_id: string;
  user_nickname: string;
  user_avatar_url?: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

// バー付きレビュー
export interface ReviewWithBar extends Review {
  bar_name: string;
  bar_address: string;
}

// お気に入り
export interface Favorite {
  id: string;
  bar_id: string;
  user_id: string;
  bar: BarSummary;
  created_at: string;
}

// プロフィール
export interface Profile {
  user_id: string;
  email: string;
  nickname: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// エラーレスポンス
export interface ErrorResponse {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}

// 画像アップロードレスポンス
export interface ImageUploadResponse {
  url: string;
  path: string;
}
