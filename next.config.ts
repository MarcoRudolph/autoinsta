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
  },
  
  // Simple webpack configuration to prevent large bundles
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Disable cache to prevent large .pack files
      config.cache = false;
      
      // Basic chunk splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
      
      // Disable source maps
      config.devtool = false;
    }
    
    return config;
  },
  
  // Remove console logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Enable compression
  compress: true,
};

export default nextConfig;
