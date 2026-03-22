/** @type {import('next').NextConfig} */

const nextConfig = {
  // Generic Next.js configuration for Node runtime deployments.
  trailingSlash: false,

  webpack: (config, { dev }) => {
    if (!dev) {
      config.cache = false;
      
      if (config.plugins) {
        config.plugins = config.plugins.filter(
          plugin => plugin.constructor.name !== 'BundleAnalyzerPlugin'
        );
      }
    }
    
    return config;
  },
  
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog'],
    outputFileTracingRoot: process.cwd(),
    instrumentationHook: true,
  },
  
  compress: true,
  
  productionBrowserSourceMaps: false,
  
  // Keep standalone output for container-style Node deployments.
  output: 'standalone',
  
  swcMinify: true,
};

module.exports = nextConfig;
