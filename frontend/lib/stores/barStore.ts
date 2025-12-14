/**
 * バー・お気に入り状態管理用Zustandストア
 */

import { create } from 'zustand';
import type { BarSummary, BarDetail, Favorite } from '../types';
import { getBars, getBar, addFavorite, removeFavorite, getFavorites } from '../api';

interface BarState {
  // バー一覧
  bars: BarSummary[];
  barsTotal: number;
  barsLoading: boolean;
  barsError: string | null;

  // バー詳細
  currentBar: BarDetail | null;
  barLoading: boolean;
  barError: string | null;

  // お気に入り
  favorites: Favorite[];
  favoritesTotal: number;
  favoritesLoading: boolean;
  favoritesError: string | null;

  // お気に入り状態のキャッシュ（bar_id -> favorite_id）
  favoriteMap: Map<string, string>;

  // Actions
  fetchBars: (params?: { prefecture?: string; city?: string; limit?: number; offset?: number }) => Promise<void>;
  fetchBarDetail: (barId: string) => Promise<void>;
  fetchFavorites: (params?: { limit?: number; offset?: number }) => Promise<void>;
  toggleFavorite: (barId: string) => Promise<void>;
  clearBarDetail: () => void;
  clearErrors: () => void;
}

export const useBarStore = create<BarState>((set, get) => ({
  // 初期状態
  bars: [],
  barsTotal: 0,
  barsLoading: false,
  barsError: null,

  currentBar: null,
  barLoading: false,
  barError: null,

  favorites: [],
  favoritesTotal: 0,
  favoritesLoading: false,
  favoritesError: null,

  favoriteMap: new Map(),

  // バー一覧を取得
  fetchBars: async (params) => {
    try {
      set({ barsLoading: true, barsError: null });
      const data = await getBars(params);
      set({
        bars: data.bars,
        barsTotal: data.total,
        barsLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch bars';
      set({ barsLoading: false, barsError: message });
    }
  },

  // バー詳細を取得
  fetchBarDetail: async (barId: string) => {
    try {
      set({ barLoading: true, barError: null });
      const bar = await getBar(barId);
      set({ currentBar: bar, barLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch bar';
      set({ barLoading: false, barError: message });
    }
  },

  // お気に入り一覧を取得
  fetchFavorites: async (params) => {
    try {
      set({ favoritesLoading: true, favoritesError: null });
      const data = await getFavorites(params);

      // お気に入りマップを更新
      const favoriteMap = new Map<string, string>();
      for (const favorite of data.favorites) {
        favoriteMap.set(favorite.bar_id, favorite.id);
      }

      set({
        favorites: data.favorites,
        favoritesTotal: data.total,
        favoriteMap,
        favoritesLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch favorites';
      set({ favoritesLoading: false, favoritesError: message });
    }
  },

  // お気に入りの追加・削除を切り替え
  toggleFavorite: async (barId: string) => {
    const { favoriteMap } = get();
    const favoriteId = favoriteMap.get(barId);

    try {
      if (favoriteId) {
        // お気に入りから削除
        await removeFavorite(favoriteId);
        const newFavoriteMap = new Map(favoriteMap);
        newFavoriteMap.delete(barId);
        set({ favoriteMap: newFavoriteMap });

        // お気に入り一覧も更新
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== favoriteId),
          favoritesTotal: state.favoritesTotal - 1,
        }));
      } else {
        // お気に入りに追加
        const favorite = await addFavorite(barId);
        const newFavoriteMap = new Map(favoriteMap);
        newFavoriteMap.set(barId, favorite.id);
        set({ favoriteMap: newFavoriteMap });

        // お気に入り一覧も更新
        set((state) => ({
          favorites: [favorite, ...state.favorites],
          favoritesTotal: state.favoritesTotal + 1,
        }));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to toggle favorite';
      set({ favoritesError: message });
      throw error;
    }
  },

  // バー詳細をクリア
  clearBarDetail: () => set({ currentBar: null, barError: null }),

  // エラーをクリア
  clearErrors: () => set({ barsError: null, barError: null, favoritesError: null }),
}));
