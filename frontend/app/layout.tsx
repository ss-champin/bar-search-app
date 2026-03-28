import AgeGate from '@/components/AgeGate';
import Header from '@/components/Header';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'バー検索アプリ',
  description: '一人の時間を、もっと豊かに。しっぽり飲めるバー・一人でも行きやすいバーを探すアプリ',
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
        <AgeGate />
        <Header />
        {children}
      </body>
    </html>
  );
}
