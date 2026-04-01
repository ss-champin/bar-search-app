import AgeGate from '@/components/AgeGate';
import Header from '@/components/Header';
import { GoogleAnalytics } from '@next/third-parties/google';
import type { Metadata } from 'next';
import Clarity from './clarity';
import './globals.css';

/** 正規URL（OG・構造化データ・metadataBase用）。本番は Vercel で NEXT_PUBLIC_SITE_URL 推奨 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

const siteName = '一人飲みに最適なバー検索サイトBarSearch';

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();

/** GA4 測定 ID（例: G-XXXXXXXXXX）。未設定ならタグは出さない */
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

/** Microsoft Clarity プロジェクト ID。未設定ならタグは出さない */
const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteName, template: '%s | バー検索サイトBarSearch' },
  description:
    '都道府県・住所・キーワードからバーを検索。しっぽり飲める店・落ち着いた店・雰囲気が良い店・一人でも入りやすい店を見つけられます。',
  keywords: ['バー 検索', '一人飲み', '隠れ家バー', 'オーセンティックバー'],
  applicationName: siteName,
  openGraph: {
    siteName,
    type: 'website',
    locale: 'ja_JP',
    url: siteUrl,
  },
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteName,
  alternateName: 'Bar Search',
  url: siteUrl,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <meta name="google-site-verification" content="rw4VJImdwmizN5dF6AHtb2HmSGS449wOQ-MRrVlO66s" />
      </head>
      <body>
        {clarityProjectId ? <Clarity projectId={clarityProjectId} /> : null}
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD はサーバー固定オブジェクトのみでユーザ入力を含まない
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <AgeGate />
        <Header />
        {children}
        {gaMeasurementId ? <GoogleAnalytics gaId={gaMeasurementId} /> : null}
      </body>
    </html>
  );
}
