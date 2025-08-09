import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure for Cloudflare Pages
  serverExternalPackages: ['pg'],
  // Handle image optimization for Cloudflare
  images: {
    unoptimized: true
  }
};

export default nextConfig;
