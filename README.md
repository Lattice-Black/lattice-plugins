# Lattice

**Service discovery and visualization platform for microservices**

Lattice automatically discovers routes, dependencies, and connections in your services, then visualizes them in a beautiful dashboard.

## Quick Start

### 1. Start Infrastructure

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Wait for services to be healthy
docker-compose ps
```

### 2. Setup Database

```bash
cd packages/api
yarn install
yarn db:push
```

### 3. Start Lattice API

```bash
cd packages/api
yarn dev
```

The API will be running at `http://localhost:3000`

### 4. Run Demo App

In a new terminal:

```bash
cd examples/demo-express-app
yarn install
yarn dev
```

The demo app will be running at `http://localhost:3001`

### 5. Query Discovered Services

```bash
# List all services
curl http://localhost:3000/api/v1/services

# Get service details
curl http://localhost:3000/api/v1/services/demo-express-app
```

## Project Structure

```
lattice/
├── packages/
│   ├── core/              # @lattice/core - Shared types and validators
│   ├── plugin-express/    # @lattice/plugin-express - Express.js plugin
│   ├── api/               # @lattice/api - Collector API
│   ├── sdk/               # @lattice/sdk - Base plugin SDK (planned)
│   └── web/               # @lattice/web - Dashboard UI (planned)
├── examples/
│   └── demo-express-app/  # Demo Express.js application
├── specs/                 # Feature specifications
└── docker-compose.yml     # PostgreSQL + Redis
```

## Features

### ✅ Phase 3 Complete (MVP)

- **@lattice/core**
  - TypeScript types for all entities
  - JSON Schema validation
  - ID generation utilities

- **@lattice/plugin-express**
  - Automatic route discovery
  - Dependency analysis from package.json
  - 9-tier service name auto-detection
  - Configurable metadata submission
  - Auto-submit with intervals

- **@lattice/api**
  - PostgreSQL database with Prisma
  - Redis for caching
  - POST /api/v1/ingest/metadata
  - GET /api/v1/services
  - GET /api/v1/services/:id
  - Schema validation

### 🚧 Coming Soon

- Service-to-service connection tracking (Phase 4)
- Multi-service dashboard with search/filtering (Phase 5)
- Real-time updates via SSE (Phase 5)
- Cross-language plugin SDK (Phase 6)
- Graph visualization (Phase 5)

## Documentation

- [Quickstart Guide](specs/001-service-discovery-and/quickstart.md)
- [Data Model](specs/001-service-discovery-and/data-model.md)
- [API Contracts](specs/001-service-discovery-and/contracts/)
- [Implementation Tasks](specs/001-service-discovery-and/tasks.md)

## Development

### Install Dependencies

```bash
yarn install
```

### Build All Packages

```bash
yarn build
```

### Run Tests

```bash
yarn test
```

### Lint Code

```bash
yarn lint
```

## Environment Variables

### API (.env in packages/api)

```bash
DATABASE_URL="postgresql://lattice:lattice@localhost:5432/lattice"
REDIS_URL="redis://localhost:6379"
PORT=3000
NODE_ENV="development"
LATTICE_API_KEY=""  # Optional in development
```

### Plugin (in your Express app)

```bash
LATTICE_SERVICE_NAME="my-service"
LATTICE_API_ENDPOINT="http://localhost:3000/api/v1"
LATTICE_ENABLED="true"
```

## Architecture

Lattice uses a plugin-based architecture:

1. **Plugins** (e.g., @lattice/plugin-express) discover metadata in your services
2. **Collector API** (@lattice/api) receives and stores metadata
3. **Dashboard** (@lattice/web - coming soon) visualizes the architecture

### Data Flow

```
┌─────────────────┐
│  Your Express   │
│      App        │
└────────┬────────┘
         │
         │ (plugin analyzes)
         │
┌────────▼────────┐
│ Lattice Plugin  │ Discovers:
│                 │ • Routes
│                 │ • Dependencies
│                 │ • Service info
└────────┬────────┘
         │
         │ (HTTP POST)
         │
┌────────▼────────┐
│ Collector API   │ Stores:
│                 │ • PostgreSQL
│                 │ • Redis cache
└────────┬────────┘
         │
         │ (HTTP GET)
         │
┌────────▼────────┐
│   Dashboard     │ Visualizes:
│   (Coming Soon) │ • Service graph
│                 │ • Routes
└─────────────────┘ • Dependencies
```

## License

MIT

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

---

Built with ❤️ using spec-driven development
