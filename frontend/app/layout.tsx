import AgeGate from '@/components/AgeGate';
import Header from '@/components/Header';
import type { Metadata } from 'next';
import './globals.css';

/** 正規URL（OG・構造化データ・metadataBase用）。本番は Vercel で NEXT_PUBLIC_SITE_URL 推奨 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

const siteName = '一人飲みに最適なバー検索アプリ';

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteName, template: '%s | バー検索' },
  description:
    '都道府県・住所・キーワードからバーを検索。しっぽり飲める店・一人でも入りやすい店を見つけられます。',
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
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <AgeGate />
        <Header />
        {children}
      </body>
    </html>
  );
}
