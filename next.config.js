/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages kompatible Konfiguration
  // Der @cloudflare/next-on-pages Adapter kümmert sich um die Ausgabe
  trailingSlash: false,
  
  // Webpack-Optimierungen für Cloudflare Pages
  webpack: (config, { dev }) => {
    if (!dev) {
      // Cache komplett deaktivieren für Production Builds
      config.cache = false;
      
      // Bundle-Analyse vermeiden
      if (config.plugins) {
        config.plugins = config.plugins.filter(
          plugin => plugin.constructor.name !== 'BundleAnalyzerPlugin'
        );
      }
    }
    
    return config;
  },
  
  // Experimentelle Features für bessere Cloudflare-Kompatibilität
  experimental: {
    // Optimiert die Bundle-Größe
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog'],
    // Reduziert die Build-Größe
    outputFileTracingRoot: process.cwd(),
  },
  
  // Komprimierung aktivieren
  compress: true,
  
  // Source Maps nur in Development
  productionBrowserSourceMaps: false,
  
  // Output-Optimierungen
  output: 'standalone',
  
  // Reduziert die Build-Größe
  swcMinify: true,
};

module.exports = nextConfig;
