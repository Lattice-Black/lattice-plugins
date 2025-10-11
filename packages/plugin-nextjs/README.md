# @caryyon/plugin-nextjs

Lattice plugin for Next.js applications. Automatically discovers API routes and dependencies, then submits to the Lattice collector for visualization.

## Installation

```bash
# Configure npm to use GitHub Packages for @caryyon scope
echo "@caryyon:registry=https://npm.pkg.github.com" >> .npmrc

# Install the plugin
yarn add @caryyon/plugin-nextjs
```

## Configuration

### 1. Next.js Webpack Configuration

Add the following to your `next.config.js` to externalize server-only packages:

```javascript
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
```

### 2. Instrumentation Hook (Recommended)

Create `src/instrumentation.ts` in your Next.js project:

```typescript
import { LatticeNextPlugin } from '@caryyon/plugin-nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🔍 Initializing Lattice plugin for Next.js...');

    const lattice = new LatticeNextPlugin({
      serviceName: 'my-nextjs-app',
      environment: 'development',
      apiEndpoint: 'http://localhost:3000/api/v1',
      enabled: true,
      autoSubmit: true,
      onAnalyzed: (metadata) => {
        console.log('📊 Service metadata analyzed:', {
          service: metadata.service.name,
          routes: metadata.routes?.length,
          dependencies: metadata.dependencies?.length,
        });
      },
      onSubmitted: (response) => {
        console.log('✅ Metadata submitted to Lattice:', response.serviceId);
      },
      onError: (error) => {
        console.error('❌ Lattice error:', error.message);
      },
    });

    try {
      await lattice.analyze();
    } catch (error) {
      console.error('Failed to analyze service:', error);
    }
  }
}
```

## Quick Start (Alternative Methods)

### App Router with Manual Import

Create a file in your Next.js project (e.g., `lib/lattice.ts`):

```typescript
import { LatticeNextPlugin } from '@caryyon/plugin-nextjs';

const lattice = new LatticePlugin({
  serviceName: 'my-nextjs-app',
  apiKey: process.env.LATTICE_API_KEY,
});

export async function registerLattice() {
  await lattice.analyze();
  return lattice;
}
```

Then in your root layout or startup file:

```typescript
import { registerLattice } from '@/lib/lattice';

// In server component or API route
registerLattice().catch(console.error);
```

### Pages Router (Next.js 12 and below)

Add to `pages/_app.tsx`:

```typescript
import { LatticePlugin } from '@lattice/plugin-nextjs';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window === 'undefined') {
      const lattice = new LatticePlugin();
      lattice.analyze().catch(console.error);
    }
  }, []);

  return <Component {...pageProps} />;
}
```

## Configuration

```typescript
const lattice = new LatticePlugin({
  // Service identity
  serviceName: 'my-nextjs-app',       // Auto-detected if not provided
  environment: 'production',           // Defaults to NODE_ENV

  // API connection
  apiEndpoint: 'https://api.lattice.dev/v1',
  apiKey: process.env.LATTICE_API_KEY,

  // Behavior
  enabled: true,                       // Enable/disable plugin
  autoSubmit: true,                    // Auto-submit on analyze
  submitInterval: 300000,              // Re-submit every 5 minutes

  // Discovery options
  discoverRoutes: true,
  discoverDependencies: true,

  // Next.js specific
  appDir: 'app',                       // App Router directory
  pagesDir: 'pages',                   // Pages Router directory

  // Callbacks
  onAnalyzed: (metadata) => {
    console.log(`Discovered ${metadata.routes.length} routes`);
  },
  onSubmitted: (response) => {
    console.log(`Submitted: ${response.serviceId}`);
  },
  onError: (error) => {
    console.error('Lattice error:', error);
  },
});
```

## Environment Variables

```bash
LATTICE_SERVICE_NAME=my-nextjs-app
LATTICE_API_ENDPOINT=https://api.lattice.dev/v1
LATTICE_API_KEY=your-api-key
LATTICE_ENABLED=true
```

## API

### `analyze(): Promise<ServiceMetadataSubmission>`

Analyze Next.js app and discover API routes and dependencies.

### `submit(metadata?: ServiceMetadataSubmission): Promise<SubmissionResponse>`

Submit metadata to Lattice collector API.

### `getMetadata(): ServiceMetadataSubmission | null`

Get currently analyzed metadata.

### `start(): void`

Start auto-submit interval.

### `stop(): void`

Stop auto-submit interval.

## Supported Route Patterns

The plugin automatically discovers:

- **App Router**: `app/api/**/*.ts` route handlers
- **Pages Router**: `pages/api/**/*.ts` API routes
- Dynamic routes: `[param]`, `[...slug]`
- Route groups: `(group)`
- Catch-all routes

## License

MIT
