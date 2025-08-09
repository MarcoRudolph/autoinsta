import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure for Cloudflare Pages
  serverExternalPackages: ['pg'],
  // Handle image optimization for Cloudflare
  images: {
    unoptimized: true
  },
  // Disable caching to prevent large files in deployment
  experimental: {
    webpackBuildWorker: false,
  },
  webpack: (config, { isServer }) => {
    // Completely disable webpack cache in production
    if (process.env.NODE_ENV === 'production') {
      config.cache = false;
    }
    // Disable filesystem caching
    config.infrastructureLogging = {
      level: 'error',
    };
    return config;
  },
  // Disable build cache
  generateBuildId: async () => {
    return 'build-' + Date.now();
  }
};

export default nextConfig;
