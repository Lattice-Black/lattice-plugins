/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@lattice/plugin-nextjs', '@lattice/core'],
  experimental: {
    instrumentationHook: true,
  },
}

module.exports = nextConfig
