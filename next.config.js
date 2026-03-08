/** @type {import('next').NextConfig} */
const publicSupabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  '';

const publicSupabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  '';

const nextConfig = {
  // Generic Next.js configuration for Node runtime deployments.
  trailingSlash: false,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: publicSupabaseUrl,
    NEXT_PUBLIC_SUPABASE_KEY: publicSupabaseKey,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: publicSupabaseKey,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: publicSupabaseKey,
  },
  
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
  },
  
  compress: true,
  
  productionBrowserSourceMaps: false,
  
  // Keep standalone output for container-style Node deployments.
  output: 'standalone',
  
  swcMinify: true,
};

module.exports = nextConfig;
