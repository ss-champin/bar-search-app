/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  // Docker環境でのホットリロード設定（Windows対応）
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000, // 1秒ごとにファイル変更をチェック
        aggregateTimeout: 300, // 変更検知後300msで再ビルド
      };
    }
    return config;
  },
};

module.exports = nextConfig;
