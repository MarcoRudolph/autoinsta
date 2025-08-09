import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure for Cloudflare Pages
  serverExternalPackages: ['pg'],
  // Ensure static optimization for better Cloudflare compatibility
  output: 'standalone',
  // Handle image optimization for Cloudflare
  images: {
    unoptimized: true
  }
};

export default nextConfig;
