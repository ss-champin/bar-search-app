'use client';

/**
 * バー検索・フィルタリングコンポーネント
 */

import { useState } from 'react';

// 日本の47都道府県リスト
const PREFECTURES = [
  '北海道',
  '青森県',
  '岩手県',
  '宮城県',
  '秋田県',
  '山形県',
  '福島県',
  '茨城県',
  '栃木県',
  '群馬県',
  '埼玉県',
  '千葉県',
  '東京都',
  '神奈川県',
  '新潟県',
  '富山県',
  '石川県',
  '福井県',
  '山梨県',
  '長野県',
  '岐阜県',
  '静岡県',
  '愛知県',
  '三重県',
  '滋賀県',
  '京都府',
  '大阪府',
  '兵庫県',
  '奈良県',
  '和歌山県',
  '鳥取県',
  '島根県',
  '岡山県',
  '広島県',
  '山口県',
  '徳島県',
  '香川県',
  '愛媛県',
  '高知県',
  '福岡県',
  '佐賀県',
  '長崎県',
  '熊本県',
  '大分県',
  '宮崎県',
  '鹿児島県',
  '沖縄県',
];

interface BarSearchFilterProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
}

export interface SearchFilters {
  search?: string;
  prefecture?: string;
  city?: string;
  minRating?: number;
  maxRating?: number;
  sortBy?: 'rating_desc' | 'rating_asc' | 'created_desc' | 'created_asc';
}

export default function BarSearchFilter({
  onSearch,
  initialFilters = {},
}: BarSearchFilterProps) {
  const [search, setSearch] = useState(initialFilters.search || '');
  const [prefecture, setPrefecture] = useState(initialFilters.prefecture || '');
  const [city, setCity] = useState(initialFilters.city || '');
  const [minRating, setMinRating] = useState<number | undefined>(initialFilters.minRating);
  const [sortBy, setSortBy] = useState<string>(initialFilters.sortBy || 'created_desc');
  const [showAdvanced, setShowAdvanced] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const filters: SearchFilters = {
      ...(search && { search }),
      ...(prefecture && { prefecture }),
      ...(city && { city }),
      ...(minRating !== undefined && { minRating }),
      sortBy: sortBy as SearchFilters['sortBy'],
    };

    onSearch(filters);
  };

  const handleReset = () => {
    setSearch('');
    setPrefecture('');
    setCity('');
    setMinRating(undefined);
    setSortBy('created_desc');
    onSearch({});
  };

  return (
    <div className="glass rounded-2xl shadow-medium p-6 border border-white/20 animate-slide-up">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 検索キーワード */}
        <div>
          <label htmlFor="search" className="block text-sm font-semibold text-slate-700 mb-2">
            キーワード検索
          </label>
          <div className="relative">
            <input
              id="search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="店名、住所、説明で検索..."
              className="w-full px-4 py-3 pl-12 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 text-slate-900 placeholder-slate-400"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* 基本フィルター */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="prefecture" className="block text-sm font-semibold text-slate-700 mb-2">
              都道府県
            </label>
            <select
              id="prefecture"
              value={prefecture}
              onChange={(e) => setPrefecture(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 text-slate-900"
            >
              <option value="">すべて</option>
              {PREFECTURES.map((pref) => (
                <option key={pref} value={pref}>
                  {pref}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-semibold text-slate-700 mb-2">
              市区町村
            </label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="渋谷区、心斎橋..."
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 text-slate-900 placeholder-slate-400"
            />
          </div>
        </div>

        {/* 詳細フィルター */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200"
          >
            <span>{showAdvanced ? '詳細フィルターを閉じる' : '詳細フィルターを開く'}</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-slate-200 animate-fade-in">
            {/* 評価フィルター */}
            <div>
              <label htmlFor="minRating" className="block text-sm font-semibold text-slate-700 mb-2">
                最低評価
              </label>
              <select
                id="minRating"
                value={minRating ?? ''}
                onChange={(e) => setMinRating(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 text-slate-900"
              >
                <option value="">指定なし</option>
                <option value="1">★ 1以上</option>
                <option value="2">★★ 2以上</option>
                <option value="3">★★★ 3以上</option>
                <option value="4">★★★★ 4以上</option>
                <option value="5">★★★★★ 5のみ</option>
              </select>
            </div>

            {/* ソート順 */}
            <div>
              <label htmlFor="sortBy" className="block text-sm font-semibold text-slate-700 mb-2">
                並び順
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 text-slate-900"
              >
                <option value="created_desc">新着順</option>
                <option value="created_asc">古い順</option>
                <option value="rating_desc">評価が高い順</option>
                <option value="rating_asc">評価が低い順</option>
              </select>
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-primary-600 to-accent-600 text-white py-3 px-6 rounded-xl font-semibold shadow-md hover:shadow-lg hover:from-primary-700 hover:to-accent-700 transition-all duration-200"
          >
            検索
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-300 shadow-soft hover:shadow-medium transition-all duration-200"
          >
            リセット
          </button>
        </div>
      </form>
    </div>
  );
}
