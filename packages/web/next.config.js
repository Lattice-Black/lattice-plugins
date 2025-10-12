/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    instrumentationHook: true,
  },
  serverComponentsExternalPackages: ['@lattice.black/plugin-nextjs'],
}

module.exports = nextConfig
