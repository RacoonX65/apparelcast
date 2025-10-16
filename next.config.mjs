/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async rewrites() {
    return [
      // Ensure browsers that auto-request /favicon.ico receive the custom .ico
      { source: '/favicon.ico', destination: '/apparelcast.ico' },
    ]
  },
}

export default nextConfig
