import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // App Router is now the default in Next.js 13+
  // No need for experimental.appDir configuration
  
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