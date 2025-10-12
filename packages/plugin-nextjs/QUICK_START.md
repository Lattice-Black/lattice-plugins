# Quick Start Guide

Get up and running with `@lattice.black/plugin-nextjs` in 5 minutes.

## 1. Install

```bash
yarn add @lattice.black/plugin-nextjs
```

## 2. Configure Next.js

Add to `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  serverComponentsExternalPackages: ['@lattice.black/plugin-nextjs'],
};

export default nextConfig;
```

## 3. Create Instrumentation File

Create `src/instrumentation.ts`:

```typescript
import { LatticeNextPlugin } from '@lattice.black/plugin-nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const lattice = new LatticeNextPlugin({
      serviceName: 'my-nextjs-app',
      environment: process.env.NODE_ENV,
      apiEndpoint: process.env.LATTICE_API_ENDPOINT,
      enabled: process.env.LATTICE_ENABLED === 'true',
    });

    await lattice.analyze();
  }
}
```

## 4. Add Environment Variables

Create `.env.local`:

```env
LATTICE_ENABLED=true
LATTICE_API_ENDPOINT=http://localhost:3000/api/v1
```

## 5. Start Your App

```bash
yarn dev
```

## That's It!

The plugin will now:
- Discover all your API routes in `app/api`
- Analyze your dependencies from `package.json`
- Submit metadata to your Lattice control plane

## Troubleshooting

### Webpack Errors?

Make sure `serverComponentsExternalPackages` is in your `next.config.js`.

### Not Discovering Routes?

Check that your routes follow the pattern: `app/api/**/route.{ts,js}`

### Need Help?

See [USER_GUIDE.md](./USER_GUIDE.md) for detailed documentation.
