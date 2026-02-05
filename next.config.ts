import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/2048',
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
