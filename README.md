# Lattice Plugins

Open-source service discovery and monitoring plugins for Express.js and Next.js applications.

## Overview

Lattice provides automatic service discovery, route detection, and distributed tracing for Node.js microservices. This monorepo contains the public plugins that integrate with your applications.

## Packages

### [@lattice.black/core](./packages/core)

Core types, validators, and utilities shared across all Lattice plugins.

```bash
yarn add @lattice.black/core
```

### [@lattice.black/plugin-express](./packages/plugin-express)

Service discovery plugin for Express.js applications.

```bash
yarn add @lattice.black/plugin-express
```

**Features:**
- Automatic route discovery
- Dependency analysis
- Request metrics tracking
- Distributed tracing with HTTP headers
- Service-to-service connection tracking

**Quick Start:**

```typescript
import express from 'express';
import { LatticePlugin } from '@lattice.black/plugin-express';

const app = express();

const lattice = new LatticePlugin({
  apiUrl: 'https://api.lattice.black',
  apiKey: process.env.LATTICE_API_KEY,
  serviceName: 'my-service',
  environment: 'production'
});

// Use metrics middleware
app.use(lattice.createMetricsMiddleware());

// Analyze and submit service metadata
lattice.start();

// Use HTTP client for outgoing requests with distributed tracing
const httpClient = lattice.getHttpClient();
const response = await httpClient.fetch('https://api.example.com/data');
```

### [@lattice.black/plugin-nextjs](./packages/plugin-nextjs)

Service discovery plugin for Next.js applications (App Router & Pages Router).

```bash
yarn add @lattice.black/plugin-nextjs
```

**Features:**
- Next.js 13+ App Router support
- Pages Router support
- API route discovery
- Server component tracking
- Distributed tracing
- CLI for analysis

**Quick Start:**

```typescript
// instrumentation.ts (Next.js 13+)
import { LatticePlugin } from '@lattice.black/plugin-nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const lattice = new LatticePlugin({
      apiUrl: process.env.LATTICE_API_URL,
      apiKey: process.env.LATTICE_API_KEY,
      serviceName: 'my-nextjs-app',
      environment: process.env.NODE_ENV
    });

    await lattice.start();
  }
}
```

See the [Next.js User Guide](./packages/plugin-nextjs/USER_GUIDE.md) for detailed setup instructions.

## Getting Started

### 1. Sign up for Lattice

Visit [lattice.black](https://www.lattice.black) to create a free account and get your API key.

### 2. Install the plugin for your framework

Choose Express or Next.js based on your application.

### 3. Configure the plugin

Add your API key and service configuration:

```typescript
const lattice = new LatticePlugin({
  apiUrl: 'https://api.lattice.black',
  apiKey: process.env.LATTICE_API_KEY, // Get this from lattice.black
  serviceName: 'my-service',
  environment: 'production',
  autoSubmit: true, // Automatically send metadata every 5 minutes
  autoSubmitInterval: 300000 // 5 minutes
});
```

### 4. Start tracking

Call `lattice.start()` to begin automatic service discovery and monitoring.

## Distributed Tracing

Both plugins support distributed tracing using HTTP headers to track service-to-service communication:

```typescript
// Express
const httpClient = lattice.getHttpClient();
await httpClient.fetch('https://api.example.com'); // Injects X-Origin-Service header

// Or wrap axios
const axios = require('axios');
const tracedAxios = httpClient.wrapAxios(axios);
await tracedAxios.get('https://api.example.com');
```

The plugins automatically capture the `X-Origin-Service` header from incoming requests to track which services are calling your API.

## Documentation

- [Express Plugin README](./packages/plugin-express/README.md)
- [Next.js Plugin README](./packages/plugin-nextjs/README.md)
- [Next.js User Guide](./packages/plugin-nextjs/USER_GUIDE.md)
- [Next.js Migration Guide](./packages/plugin-nextjs/MIGRATION.md)

## Development

This is a monorepo managed with Yarn workspaces and Turborepo.

### Setup

```bash
git clone https://github.com/Lattice-Black/lattice-plugins.git
cd lattice-plugins
yarn install
```

### Build all packages

```bash
yarn build
```

### Run tests

```bash
yarn test
```

### Development mode

```bash
yarn dev
```

## Publishing

Packages are published to npm under the `@lattice.black` scope. See [PUBLISHING.md](./PUBLISHING.md) for details.

## Contributing

We welcome contributions! Please see our contributing guidelines (coming soon) for details on:

- Code of conduct
- Development workflow
- Pull request process
- Coding standards

## License

MIT License - see LICENSE file for details.

## Support

- Documentation: [lattice.black/docs](https://www.lattice.black/docs)
- Issues: [GitHub Issues](https://github.com/Lattice-Black/lattice-plugins/issues)
- Discord: (coming soon)
- Email: support@lattice.black

## Related Projects

- [Lattice Platform](https://www.lattice.black) - The hosted service discovery and monitoring platform
- Private monorepo contains the SaaS dashboard and API server (not open-source)
