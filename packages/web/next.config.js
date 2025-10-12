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
    if (isServer && config.name !== 'edge-server') {
      // Mark server-only packages as externals for Node.js runtime only
      // Don't apply to Edge Runtime (middleware) which can't use Node.js modules
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
