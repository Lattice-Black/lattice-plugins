/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    instrumentationHook: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark server-only packages as externals to prevent bundling
      config.externals = config.externals || [];
      config.externals.push({
        '@lattice.black/plugin-nextjs': 'commonjs @lattice.black/plugin-nextjs',
        '@lattice.black/core': 'commonjs @lattice.black/core',
        'glob': 'commonjs glob',
      });
    }
    return config;
  },
}

module.exports = nextConfig
