# @lattice.black/plugin-express

Lattice plugin for Express.js applications. Automatically discovers routes and dependencies, then submits to the Lattice collector for visualization.

## Installation

```bash
yarn add @lattice.black/plugin-express
# or
npm install @lattice.black/plugin-express
```

## Quick Start

```typescript
import express from 'express';
import { LatticePlugin } from '@lattice.black/plugin-express';

const app = express();

// Your routes
app.get('/users', (req, res) => res.json([]));
app.post('/users', (req, res) => res.json({ id: 1 }));

// Add Lattice (AFTER all routes are defined)
const lattice = new LatticePlugin();
await lattice.analyze(app);

app.listen(3000);
```

## Configuration

```typescript
const lattice = new LatticePlugin({
  // Service identity
  serviceName: 'my-service',          // Auto-detected if not provided
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
LATTICE_SERVICE_NAME=my-service
LATTICE_API_ENDPOINT=https://api.lattice.dev/v1
LATTICE_API_KEY=your-api-key
LATTICE_ENABLED=true
```

## API

### `analyze(app: Express): Promise<ServiceMetadataSubmission>`

Analyze Express app and discover routes and dependencies.

### `submit(metadata?: ServiceMetadataSubmission): Promise<SubmissionResponse>`

Submit metadata to Lattice collector API.

### `getMetadata(): ServiceMetadataSubmission | null`

Get currently analyzed metadata.

### `createMetricsMiddleware(): RequestHandler`

Create Express middleware to track runtime metrics (request counts, response times, error rates).

**Usage:**

```typescript
import express from 'express';
import { LatticePlugin } from '@lattice.black/plugin-express';

const app = express();
const lattice = new LatticePlugin({
  serviceName: 'my-service',
  apiEndpoint: 'https://api.lattice.dev/v1',
  apiKey: process.env.LATTICE_API_KEY,
});

// Add metrics tracking middleware
app.use(lattice.createMetricsMiddleware());

// Your routes
app.get('/users', (req, res) => res.json([]));
app.post('/users', (req, res) => res.json({ id: 1 }));

// Analyze service metadata
await lattice.analyze(app);

app.listen(3000);
```

**Features:**
- Tracks method, path, status code, and response time for every request
- Automatically submits metrics to Lattice API in batches
- Non-blocking - errors won't affect your application
- Works with or without calling `analyze()` first

### `start(): void`

Start auto-submit interval.

### `stop(): void`

Stop auto-submit interval.

## License

MIT
