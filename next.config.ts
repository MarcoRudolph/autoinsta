import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure we're using the App Router
  experimental: {
    appDir: true,
  },
  
  // Disable webpack bundle analyzer for now to avoid conflicts
  // webpack: (config, { isServer, dev }) => {
  //   if (!dev && !isServer) {
  //     config.plugins.push(
  //       new BundleAnalyzerPlugin({
  //         analyzerMode: 'static',
  //         openAnalyzer: false,
  //         reportFilename: './bundle-analysis.html',
  //         generateStatsFile: true,
  //         statsFilename: './bundle-stats.json',
  //       })
  //     );
  //   }
  //   return config;
  // },
};

export default nextConfig;