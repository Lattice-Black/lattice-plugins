/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    instrumentationHook: true,
  },
  serverExternalPackages: ['@lattice.black/plugin-nextjs', '@lattice.black/core', 'glob'],
}

module.exports = nextConfig
