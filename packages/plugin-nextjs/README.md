# @lattice/plugin-nextjs

Lattice plugin for Next.js applications. Automatically discovers API routes and dependencies, then submits to the Lattice collector for visualization.

## Installation

```bash
yarn add @lattice/plugin-nextjs
```

## Quick Start

### App Router (Next.js 13+)

Create a file in your Next.js project (e.g., `lib/lattice.ts`):

```typescript
import { LatticePlugin } from '@lattice/plugin-nextjs';

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
