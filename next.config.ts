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
    // Disable webpack cache in production to reduce file sizes
    if (!isServer && process.env.NODE_ENV === 'production') {
      config.cache = false;
    }
    return config;
  }
};

export default nextConfig;
