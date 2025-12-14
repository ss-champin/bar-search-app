'use client';

/**
 * バー検索・フィルタリングコンポーネント
 */

import { useEffect, useRef, useState } from 'react';

// 日本の47都道府県リスト（地域別にグループ化）
const PREFECTURES_BY_REGION = {
  北海道・東北: ['北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
  関東: ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'],
  中部: ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'],
  近畿: ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
  中国・四国: [
    '鳥取県',
    '島根県',
    '岡山県',
    '広島県',
    '山口県',
    '徳島県',
    '香川県',
    '愛媛県',
    '高知県',
  ],
  九州・沖縄: ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'],
};

const ALL_PREFECTURES = Object.values(PREFECTURES_BY_REGION).flat();

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

export default function BarSearchFilter({ onSearch, initialFilters = {} }: BarSearchFilterProps) {
  const [search, setSearch] = useState(initialFilters.search || '');
  const [prefecture, setPrefecture] = useState(initialFilters.prefecture || '');
  const [city, setCity] = useState(initialFilters.city || '');
  const [minRating, setMinRating] = useState<number | undefined>(initialFilters.minRating);
  const [sortBy, setSortBy] = useState<string>(initialFilters.sortBy || 'created_desc');
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [showPrefectureDropdown, setShowPrefectureDropdown] = useState(false);
  const [prefectureSearch, setPrefectureSearch] = useState('');
  const prefectureDropdownRef = useRef<HTMLDivElement>(null);
  const [showRatingDropdown, setShowRatingDropdown] = useState(false);
  const ratingDropdownRef = useRef<HTMLDivElement>(null);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

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
    setPrefectureSearch('');
    onSearch({});
  };

  // 評価オプション
  const ratingOptions = [
    { value: undefined, label: '指定なし', icon: '⭐' },
    { value: 1, label: '★ 1以上', icon: '⭐' },
    { value: 2, label: '★★ 2以上', icon: '⭐⭐' },
    { value: 3, label: '★★★ 3以上', icon: '⭐⭐⭐' },
    { value: 4, label: '★★★★ 4以上', icon: '⭐⭐⭐⭐' },
    { value: 5, label: '★★★★★ 5のみ', icon: '⭐⭐⭐⭐⭐' },
  ];

  // 並び順オプション
  const sortOptions = [
    { value: 'created_desc', label: '新着順', icon: '🆕' },
    { value: 'created_asc', label: '古い順', icon: '📅' },
    { value: 'rating_desc', label: '評価が高い順', icon: '⬆️' },
    { value: 'rating_asc', label: '評価が低い順', icon: '⬇️' },
  ];

  // ドロップダウンの外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        prefectureDropdownRef.current &&
        !prefectureDropdownRef.current.contains(event.target as Node)
      ) {
        setShowPrefectureDropdown(false);
        setPrefectureSearch('');
      }
      if (ratingDropdownRef.current && !ratingDropdownRef.current.contains(event.target as Node)) {
        setShowRatingDropdown(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    };

    if (showPrefectureDropdown || showRatingDropdown || showSortDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPrefectureDropdown, showRatingDropdown, showSortDropdown]);

  // フィルタリングされた都道府県リスト
  const filteredPrefectures = prefectureSearch
    ? ALL_PREFECTURES.filter((pref) => pref.toLowerCase().includes(prefectureSearch.toLowerCase()))
    : ALL_PREFECTURES;

  // 選択された都道府県の地域を取得
  const _getSelectedRegion = () => {
    if (!prefecture) return null;
    for (const [region, prefs] of Object.entries(PREFECTURES_BY_REGION)) {
      if (prefs.includes(prefecture)) {
        return region;
      }
    }
    return null;
  };

  return (
    <div
      className="glass rounded-2xl shadow-medium p-6 border border-white/20 animate-slide-up"
      style={{ position: 'relative', zIndex: 1 }}
    >
      <form onSubmit={handleSubmit} className="space-y-5" style={{ position: 'relative' }}>
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
              role="img"
              aria-label="検索"
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
          <div
            className="relative"
            ref={prefectureDropdownRef}
            data-dropdown={showPrefectureDropdown ? 'open' : undefined}
            style={{ zIndex: showPrefectureDropdown ? 10000 : 100 }}
          >
            <label htmlFor="prefecture" className="block text-sm font-semibold text-slate-700 mb-2">
              都道府県
            </label>
            <button
              type="button"
              id="prefecture"
              onClick={() => {
                setShowPrefectureDropdown(!showPrefectureDropdown);
                setPrefectureSearch('');
              }}
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 text-slate-900 text-left flex items-center justify-between hover:border-primary-300 group"
            >
              <span className={prefecture ? 'text-slate-900' : 'text-slate-400'}>
                {prefecture || '都道府県を選択'}
              </span>
              <svg
                className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                  showPrefectureDropdown ? 'rotate-180' : ''
                } group-hover:text-primary-500`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                role="img"
                aria-label="ドロップダウン"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* カスタムドロップダウンメニュー */}
            {showPrefectureDropdown && (
              <div
                className="absolute w-full mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-2xl max-h-96 overflow-hidden animate-fade-in"
                style={{
                  zIndex: 10000,
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  isolation: 'isolate',
                }}
              >
                {/* 検索ボックス */}
                <div className="p-3 border-b border-slate-200 bg-gradient-to-r from-primary-50 to-accent-50">
                  <div className="relative">
                    <input
                      type="text"
                      value={prefectureSearch}
                      onChange={(e) => setPrefectureSearch(e.target.value)}
                      placeholder="都道府県を検索..."
                      className="w-full px-4 py-2 pl-10 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 text-slate-900 placeholder-slate-400 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <svg
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      role="img"
                      aria-label="検索"
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

                {/* 都道府県リスト */}
                <div className="max-h-80 overflow-y-auto">
                  {/* 「すべて」オプション */}
                  <button
                    type="button"
                    onClick={() => {
                      setPrefecture('');
                      setShowPrefectureDropdown(false);
                      setPrefectureSearch('');
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors duration-150 flex items-center gap-2 ${
                      !prefecture
                        ? 'bg-primary-100 text-primary-700 font-semibold'
                        : 'text-slate-700'
                    }`}
                  >
                    <span className="text-lg">📍</span>
                    <span>すべての都道府県</span>
                  </button>

                  {/* 地域別にグループ化 */}
                  {Object.entries(PREFECTURES_BY_REGION).map(([region, prefs]) => {
                    const regionPrefectures = prefs.filter((pref) =>
                      filteredPrefectures.includes(pref),
                    );
                    if (regionPrefectures.length === 0) return null;

                    return (
                      <div key={region} className="border-t border-slate-100">
                        <div className="px-4 py-2 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider sticky top-0">
                          {region}
                        </div>
                        {regionPrefectures.map((pref) => (
                          <button
                            key={pref}
                            type="button"
                            onClick={() => {
                              setPrefecture(pref);
                              setShowPrefectureDropdown(false);
                              setPrefectureSearch('');
                            }}
                            className={`w-full px-4 py-2.5 text-left hover:bg-primary-50 transition-colors duration-150 flex items-center gap-2 ${
                              prefecture === pref
                                ? 'bg-primary-100 text-primary-700 font-semibold'
                                : 'text-slate-700'
                            }`}
                          >
                            <span className="text-sm">🏛️</span>
                            <span>{pref}</span>
                            {prefecture === pref && (
                              <svg
                                className="ml-auto w-5 h-5 text-primary-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                role="img"
                                aria-label="選択済み"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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
              role="img"
              aria-label={showAdvanced ? '詳細フィルターを閉じる' : '詳細フィルターを開く'}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-slate-200 animate-fade-in">
            {/* 評価フィルター */}
            <div
              className="relative"
              ref={ratingDropdownRef}
              data-dropdown={showRatingDropdown ? 'open' : undefined}
              style={{ zIndex: showRatingDropdown ? 10000 : 100 }}
            >
              <label
                htmlFor="minRating"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                最低評価
              </label>
              <button
                type="button"
                id="minRating"
                onClick={() => setShowRatingDropdown(!showRatingDropdown)}
                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 text-slate-900 text-left flex items-center justify-between hover:border-primary-300 group"
              >
                <span className="flex items-center gap-2">
                  {minRating !== undefined ? (
                    <>
                      <span className="text-lg">
                        {ratingOptions.find((opt) => opt.value === minRating)?.icon}
                      </span>
                      <span className="text-slate-900">
                        {ratingOptions.find((opt) => opt.value === minRating)?.label}
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-400">評価を選択</span>
                  )}
                </span>
                <svg
                  className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                    showRatingDropdown ? 'rotate-180' : ''
                  } group-hover:text-primary-500`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="ドロップダウン"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* 評価ドロップダウンメニュー */}
              {showRatingDropdown && (
                <div
                  className="absolute w-full mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-2xl animate-fade-in"
                  style={{
                    zIndex: 10000,
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    isolation: 'isolate',
                  }}
                >
                  <div className="max-h-64 overflow-y-auto">
                    {ratingOptions.map((option) => (
                      <button
                        key={option.value ?? 'none'}
                        type="button"
                        onClick={() => {
                          setMinRating(option.value);
                          setShowRatingDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors duration-150 flex items-center gap-3 ${
                          minRating === option.value
                            ? 'bg-primary-100 text-primary-700 font-semibold'
                            : 'text-slate-700'
                        }`}
                      >
                        <span className="text-xl">{option.icon}</span>
                        <span className="flex-1">{option.label}</span>
                        {minRating === option.value && (
                          <svg
                            className="w-5 h-5 text-primary-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            role="img"
                            aria-label="選択済み"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ソート順 */}
            <div
              className="relative"
              ref={sortDropdownRef}
              data-dropdown={showSortDropdown ? 'open' : undefined}
              style={{ zIndex: showSortDropdown ? 10000 : 100 }}
            >
              <label htmlFor="sortBy" className="block text-sm font-semibold text-slate-700 mb-2">
                並び順
              </label>
              <button
                type="button"
                id="sortBy"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 text-slate-900 text-left flex items-center justify-between hover:border-primary-300 group"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">
                    {sortOptions.find((opt) => opt.value === sortBy)?.icon}
                  </span>
                  <span className="text-slate-900">
                    {sortOptions.find((opt) => opt.value === sortBy)?.label}
                  </span>
                </span>
                <svg
                  className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                    showSortDropdown ? 'rotate-180' : ''
                  } group-hover:text-primary-500`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="ドロップダウン"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* 並び順ドロップダウンメニュー */}
              {showSortDropdown && (
                <div
                  className="absolute w-full mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-2xl animate-fade-in"
                  style={{
                    zIndex: 10000,
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    isolation: 'isolate',
                  }}
                >
                  <div className="max-h-64 overflow-y-auto">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSortBy(option.value);
                          setShowSortDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors duration-150 flex items-center gap-3 ${
                          sortBy === option.value
                            ? 'bg-primary-100 text-primary-700 font-semibold'
                            : 'text-slate-700'
                        }`}
                      >
                        <span className="text-xl">{option.icon}</span>
                        <span className="flex-1">{option.label}</span>
                        {sortBy === option.value && (
                          <svg
                            className="w-5 h-5 text-primary-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            role="img"
                            aria-label="選択済み"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
