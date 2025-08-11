import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure for Cloudflare Pages
  serverExternalPackages: ['pg'],
  // Handle image optimization for Cloudflare
  images: {
    unoptimized: true
  },
  // Disable build cache
  generateBuildId: async () => {
    return 'build-' + Date.now();
  }
};

export default nextConfig;
