/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages kompatible Konfiguration
  // Der @cloudflare/next-on-pages Adapter kümmert sich um die Ausgabe
  trailingSlash: false,
  
  // Webpack-Cache für Production deaktivieren (verhindert große Cache-Dateien)
  webpack: (config, { dev }) => {
    if (!dev) {
      // Memory-basierter Cache statt persistentem Cache
      config.cache = { 
        type: 'memory', 
        maxMemoryGenerations: 0 
      };
      
      // Webpack-Cache-Ordner explizit ausschließen
      if (config.cache) {
        config.cache.buildDependencies = {
          config: [__filename]
        };
      }
    }
    
    return config;
  },
  
  // Experimentelle Features für bessere Cloudflare-Kompatibilität
  experimental: {
    // Optimiert die Bundle-Größe
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog'],
  },
  
  // Komprimierung aktivieren
  compress: true,
  
  // Source Maps nur in Development
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
