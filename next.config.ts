import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  // Allow large file uploads (up to 10MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Don't fail build on ESLint warnings
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Don't fail build on TS errors (we fix them separately)
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
