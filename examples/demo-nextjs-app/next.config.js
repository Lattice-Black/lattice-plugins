/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    instrumentationHook: true,
  },
  webpack: (config, { isServer }) => {
    // For server-side builds, externalize server-only packages
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        '@caryyon/plugin-nextjs': 'commonjs @caryyon/plugin-nextjs',
        '@caryyon/core': 'commonjs @caryyon/core',
        'glob': 'commonjs glob',
      })
    }
    return config
  },
}

module.exports = nextConfig
