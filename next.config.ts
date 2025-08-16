/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standard Next.js Build für Cloudflare Pages
  output: 'standalone',
  experimental: {
    // Für bessere Cloudflare Pages Kompatibilität
    serverComponentsExternalPackages: ['pg', 'bcryptjs']
  },
  // Cloudflare Pages benötigt diese Einstellung
  trailingSlash: false,
  // Wichtig: Kein Edge Runtime für PostgreSQL
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Server-seitige Module korrekt behandeln
      config.externals = config.externals || [];
      config.externals.push('pg-native');
    }
    return config;
  }
};

export default nextConfig;