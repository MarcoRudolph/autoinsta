import type { NextConfig } from "next";
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const nextConfig: NextConfig = {
  // Optional: Wenn du externe Pakete nutzt, die auf dem Server laufen müssen
  // serverExternalPackages: ['pg'], // Behalte dies nur, wenn du es wirklich brauchst

  // Diese Einstellung ist nicht mehr für die Optimierung nötig
  // und kann oft entfernt werden, teste es ohne.
  // images: {
  //   unoptimized: true
  // },

  webpack: (config, { isServer, dev }) => {
    // Only run bundle analyzer in production builds
    if (!dev && !isServer) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: './bundle-analysis.html',
          generateStatsFile: true,
          statsFilename: './bundle-stats.json',
        })
      );
    }

    return config;
  },
};

export default nextConfig;