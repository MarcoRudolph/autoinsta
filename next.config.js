/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages kompatible Konfiguration
  // Der @cloudflare/next-on-pages Adapter kümmert sich um die Ausgabe
  trailingSlash: false
};

module.exports = nextConfig;
