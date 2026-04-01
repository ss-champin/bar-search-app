/**
 * バーカードコンポーネント
 */

import type { BarSummary } from '@/lib/api';
import Link from 'next/link';

interface BarCardProps {
  bar: BarSummary;
}

export default function BarCard({ bar }: BarCardProps) {
  return (
    <Link
      href={`/bars/${bar.id}`}
      className="group block rounded-2xl bg-white shadow-soft hover:shadow-strong transition-all duration-300 overflow-hidden border border-slate-100 hover:border-primary-200 animate-fade-in"
      style={{ position: 'relative', zIndex: 1 }}
    >
      {/* 画像 */}
      {bar.image_urls.length > 0 ? (
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
          <img
            src={bar.image_urls[0]}
            alt={bar.name}
            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* 評価バッジ */}
          {bar.average_rating > 0 && (
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
              <span className="text-yellow-500 text-sm">★</span>
              <span className="font-bold text-slate-900 text-sm">
                {bar.average_rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-primary-100 via-accent-100 to-primary-50 flex items-center justify-center">
          <div className="text-6xl opacity-20">🍸</div>
          {bar.average_rating > 0 && (
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
              <span className="text-yellow-500 text-sm">★</span>
              <span className="font-bold text-slate-900 text-sm">
                {bar.average_rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* コンテンツ */}
      <div className="p-6">
        {/* バー名 */}
        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors duration-200 line-clamp-1">
          {bar.name}
        </h3>

        {/* 住所 */}
        <div className="flex items-start gap-2 mb-4">
          <svg
            className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            role="img"
            aria-label="住所"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <div className="text-sm text-slate-600 flex-1">
            <p className="font-medium">{bar.prefecture}</p>
            <p className="text-slate-500 line-clamp-1">{bar.address}</p>
          </div>
        </div>

        {/* 評価とレビュー数 */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {bar.average_rating > 0 ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={`star-${i}`}
                    className={`text-sm ${
                      i < Math.round(bar.average_rating) ? 'text-yellow-400' : 'text-slate-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-xs text-slate-500 font-medium">{bar.review_count}件</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">レビューなし</span>
          )}
          <div className="text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              role="img"
              aria-label="詳細を見る"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
