# Implementation Plan: Service Discovery and Visualization Platform

**Branch**: `001-service-discovery-and` | **Date**: 2025-10-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-service-discovery-and/spec.md`

## Summary

Build Lattice, a service discovery and visualization platform that automatically maps microservice architectures. The MVP focuses on Node.js/Express.js services with automatic route and dependency discovery, a visual dashboard for exploring service relationships, and an extensible plugin architecture for future framework support. The system uses a monorepo structure with separate packages for core SDK, plugins, API, and visualization dashboard.

## Technical Context

**Language/Version**: TypeScript 5.0+ (strict mode enabled across all packages)
**Primary Dependencies**:
- Monorepo: Yarn workspaces with Turborepo for build orchestration
- Core SDK: TypeScript type definitions, JSON schema validation
- Express Plugin: Express internals inspection (router layer iteration)
- API: Next.js 14+ with App Router, Prisma ORM, tRPC for type-safe APIs
- Dashboard: React 18+, Next.js, D3.js or Cytoscape.js for graph visualization
- Database: PostgreSQL 15+ for relational metadata storage
- Cache: Redis 7+ for real-time connection tracking
- Testing: Vitest for unit/integration tests
- Container: Docker for collector deployment

**Storage**: PostgreSQL for service metadata (services, routes, dependencies, connections), Redis for caching and real-time event correlation

**Testing**: Vitest with minimum 80% coverage requirement per constitution. Integration tests using real Express apps. E2E tests for dashboard workflows.

**Target Platform**:
- SDK/Plugins: Node.js 18+ (ESM modules)
- API: Linux/Docker containers
- Dashboard: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- Collector: Docker container or standalone Node.js process

**Project Type**: Monorepo (Yarn workspaces) with 6 core packages

**Performance Goals**:
- Express plugin discovery: Complete analysis in under 5 minutes for apps with 50+ routes
- Dashboard rendering: Initial load under 3 seconds for 50 services
- Real-time connection detection: Correlate requests within 10 seconds
- API response time: p95 under 200ms for metadata queries
- Graph layout: Render 100-node graph in under 2 seconds

**Constraints**:
- Zero-config defaults (auto-detect service name, use sensible defaults)
- Plugin SDK must support any HTTP framework (not Express-specific)
- Dashboard must remain responsive during live updates
- Data schema must be forward/backward compatible with versioning
- No vendor lock-in (PostgreSQL can be swapped for other SQL databases)

**Scale/Scope**:
- MVP supports 50 microservices in single company deployment
- Dashboard handles 500+ routes across all services
- Plugin discovers 1000+ package dependencies
- API handles 100 concurrent plugin submissions
- Post-MVP: 200+ services, multiple programming languages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. TypeScript-First Development
- All packages use TypeScript with strict mode
- Shared types exported from `@lattice/core`
- No `any` types except for Express router internals reflection

### ✅ II. Monorepo Architecture
- Yarn workspaces manages inter-package dependencies
- Turborepo provides build caching
- Clear package boundaries: core, sdk, plugin-express, api, web, collector
- No circular dependencies

### ✅ III. Plugin-Based Extensibility (NON-NEGOTIABLE)
- `@lattice/sdk` defines `Plugin` interface
- `@lattice/plugin-express` implements first plugin
- Data model is framework-agnostic (defined in core schema)
- Plugin documentation and examples included in quickstart

### ✅ IV. Comprehensive Testing
- Vitest configured in all packages with 80% coverage threshold
- Integration tests with real Express apps in `examples/`
- E2E tests for critical dashboard workflows
- Performance benchmarks for large service graphs

### ✅ V. Developer Experience (DX)
- Zero-config plugin installation: `new ExpressPlugin()` with auto-detection
- Clear TypeScript errors guide usage
- Comprehensive README and quickstart guide
- Examples directory with working demos

### ✅ VI. Spec-Driven Development
- This plan follows spec-kit methodology
- Implementation will follow tasks generated from this plan
- No code written before planning complete

### ✅ VII. Data Model Uniformity
- Core schema (`@lattice/core/schema`) defines Service, Route, Dependency, Connection
- Schema uses JSON Schema for validation
- Semantic versioning for schema changes
- Plugins transform framework data to core schema

### Technology Stack Alignment
- ✅ TypeScript 5.0+ for all code
- ✅ Yarn workspaces (not npm)
- ✅ Turborepo for build orchestration
- ✅ Vitest for testing
- ✅ Next.js for API and dashboard
- ✅ PostgreSQL + Redis for storage
- ✅ React + D3.js/Cytoscape for visualization

**Result**: All constitutional principles satisfied. No violations to justify.

## Project Structure

### Documentation (this feature)

```
specs/001-service-discovery-and/
├── plan.md              # This file
├── research.md          # Phase 0: Technology decisions and patterns research
├── data-model.md        # Phase 1: Entity definitions and relationships
├── quickstart.md        # Phase 1: Getting started guide for developers
├── contracts/           # Phase 1: API schemas
│   ├── plugin-api.json     # Plugin → API submission contract (OpenAPI)
│   ├── dashboard-api.json  # Dashboard → API query contract (OpenAPI)
│   └── schema-v1.json      # Core data schema (JSON Schema)
└── tasks.md             # Phase 2: Implementation tasks (from /speckit.tasks)
```

### Source Code (monorepo root)

```
lattice/
├── packages/
│   ├── core/                  # @lattice/core - Shared types and schemas
│   │   ├── src/
│   │   │   ├── schema/        # JSON Schema definitions for Service, Route, etc.
│   │   │   ├── types/         # TypeScript type definitions
│   │   │   └── validation/    # Schema validation utilities
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── sdk/                   # @lattice/sdk - Base SDK for plugins
│   │   ├── src/
│   │   │   ├── plugin.ts      # Plugin interface and base class
│   │   │   ├── reporter.ts    # HTTP client for sending data to API
│   │   │   ├── config.ts      # Configuration management
│   │   │   └── discovery/     # Common discovery utilities
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── plugin-express/        # @lattice/plugin-express - Express.js plugin
│   │   ├── src/
│   │   │   ├── index.ts       # Main plugin export
│   │   │   ├── route-discovery.ts    # Express router introspection
│   │   │   ├── dependency-analysis.ts # package.json parsing
│   │   │   └── middleware-tracker.ts  # Middleware chain extraction
│   │   ├── tests/
│   │   │   └── fixtures/      # Sample Express apps for testing
│   │   └── package.json
│   │
│   ├── api/                   # @lattice/api - Central SaaS API
│   │   ├── src/
│   │   │   ├── app/           # Next.js 14 App Router
│   │   │   │   ├── api/       # API routes
│   │   │   │   │   ├── ingest/      # Plugin submission endpoint
│   │   │   │   │   └── query/       # Dashboard query endpoints
│   │   │   ├── lib/
│   │   │   │   ├── db/        # Prisma client and queries
│   │   │   │   ├── redis/     # Redis connection tracking
│   │   │   │   └── auth/      # API key authentication
│   │   │   └── prisma/
│   │   │       └── schema.prisma    # Database schema
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── web/                   # @lattice/web - Visualization dashboard
│   │   ├── src/
│   │   │   ├── app/           # Next.js 14 App Router
│   │   │   │   ├── page.tsx          # Main dashboard view
│   │   │   │   ├── services/         # Service detail pages
│   │   │   │   └── layout.tsx
│   │   │   ├── components/
│   │   │   │   ├── ServiceCard.tsx   # Service visualization card
│   │   │   │   ├── ServiceGraph.tsx  # Graph visualization (D3/Cytoscape)
│   │   │   │   ├── RouteList.tsx     # Route detail view
│   │   │   │   └── DependencyTree.tsx # Dependency visualization
│   │   │   ├── lib/
│   │   │   │   ├── api-client.ts    # tRPC or fetch client
│   │   │   │   └── graph-layout.ts  # Graph algorithm utilities
│   │   │   └── hooks/
│   │   ├── tests/
│   │   └── package.json
│   │
│   └── collector/             # @lattice/collector - Sidecar aggregator
│       ├── src/
│       │   ├── index.ts       # Main collector service
│       │   ├── aggregator.ts  # Multi-service aggregation
│       │   └── forwarder.ts   # Forward to central API
│       ├── Dockerfile
│       ├── tests/
│       └── package.json
│
├── examples/
│   ├── express-demo/          # Sample Express app for testing
│   │   ├── src/
│   │   │   └── index.ts       # Express app with Lattice plugin
│   │   └── package.json
│   └── multi-service/         # Demo with 3 interconnected services
│       ├── api-service/
│       ├── web-service/
│       └── auth-service/
│
├── docs/
│   ├── README.md              # Main project README
│   ├── plugin-development.md  # Guide for creating new plugins
│   └── architecture.md        # System architecture overview
│
├── .github/
│   └── workflows/
│       ├── ci.yml             # Test and lint on PR
│       └── publish.yml        # Publish packages to npm
│
├── turbo.json                 # Turborepo configuration
├── package.json               # Root package.json with workspaces
├── tsconfig.json              # Root TypeScript config
└── .gitignore
```

**Structure Decision**: Selected monorepo structure to align with Constitution Principle II. The monorepo enables:
- Atomic commits across packages (e.g., update core schema + all plugins simultaneously)
- Shared TypeScript configurations and type safety across packages
- Turborepo build caching for fast CI/CD
- Clear separation of concerns (core, sdk, plugins, services)
- Easy local development with workspace linking

The structure separates concerns by responsibility:
- **Packages**: Published npm packages for reuse
- **Examples**: Demonstration apps for testing and documentation
- **Docs**: User-facing documentation

## Complexity Tracking

*No constitutional violations to justify - all requirements align with established principles.*

## Phase 0: Research & Technical Decisions

The following research tasks will resolve remaining technical unknowns and establish implementation patterns. Results will be documented in `research.md`.

### Research Tasks

1. **Express Router Introspection**
   - **Question**: How to programmatically extract all routes from an Express application instance?
   - **Research**: Investigate Express.js `app._router.stack` internals, middleware layer iteration patterns
   - **Deliverable**: Code sample showing route extraction with HTTP method, path, and middleware chain

2. **Graph Visualization Library Selection**
   - **Question**: D3.js vs Cytoscape.js vs React Flow for service graph visualization?
   - **Research**: Compare features, performance with 100+ nodes, React integration, layout algorithms
   - **Deliverable**: Recommendation with justification based on requirements (FR-016: multiple layouts, FR-003: <3s render)

3. **Service Connection Correlation**
   - **Question**: How to detect which services are calling which endpoints without deep instrumentation?
   - **Research**: HTTP header injection patterns (trace IDs), Redis pub/sub for correlation, service mesh patterns
   - **Deliverable**: Design for lightweight connection tracking aligned with zero-config principle

4. **JSON Schema Versioning Strategy**
   - **Question**: How to handle backward/forward compatibility as schema evolves?
   - **Research**: JSON Schema versioning best practices, migration strategies, schema registry patterns
   - **Deliverable**: Schema versioning policy and upgrade path design

5. **Package Dependency Size Calculation**
   - **Question**: How to accurately determine installed package sizes (not just package.json)?
   - **Research**: node_modules analysis tools, npm/yarn APIs, bundler analysis integration
   - **Deliverable**: Method for calculating package sizes including transitive dependencies

6. **Real-time Dashboard Updates**
   - **Question**: WebSocket vs Server-Sent Events vs polling for live service updates?
   - **Research**: Next.js real-time patterns, connection scaling, battery impact for mobile browsers
   - **Deliverable**: Real-time architecture recommendation with fallback strategy

7. **Database Schema for Graph Data**
   - **Question**: Best PostgreSQL schema design for service relationships and querying connections?
   - **Research**: Graph data in relational DBs, recursive CTEs, indexing strategies for path queries
   - **Deliverable**: Prisma schema with optimized queries for "find all services connected to X"

8. **Zero-Config Service Name Detection**
   - **Question**: How to auto-detect service name without requiring configuration?
   - **Research**: package.json name field, hostname detection, environment variable conventions (Kubernetes, Docker)
   - **Deliverable**: Fallback chain for service name detection with user override option

## Phase 1: Design & Contracts

**Prerequisites**: `research.md` complete with all unknowns resolved

### Artifacts to Generate

1. **data-model.md**: Complete entity definitions for Service, Route, Dependency, Connection, Plugin
   - Field specifications with TypeScript types
   - Relationships and foreign keys
   - Validation rules from functional requirements
   - State transitions (e.g., service active → inactive)

2. **contracts/plugin-api.json**: OpenAPI 3.1 specification for plugin → API submission
   - POST /api/ingest/metadata endpoint
   - Authentication via API key header
   - Request schema matching core data model
   - Response codes and error handling

3. **contracts/dashboard-api.json**: OpenAPI 3.1 specification for dashboard → API queries
   - GET /api/services - List all services
   - GET /api/services/:id - Service details with routes
   - GET /api/graph - Full service graph
   - POST /api/query - Complex graph queries (find paths, etc.)

4. **contracts/schema-v1.json**: JSON Schema for core data model
   - Service entity schema
   - Route entity schema
   - Dependency entity schema
   - Connection entity schema
   - Version: 1.0.0

5. **quickstart.md**: Developer guide for integrating Lattice
   - 5-minute quick start for Express.js
   - Configuration options
   - Dashboard access instructions
   - Troubleshooting common issues

### Agent Context Update

After generating design artifacts, run:
```bash
.specify/scripts/bash/update-agent-context.sh claude
```

This updates `.claude/CLAUDE.md` with technology choices from this plan, ensuring future development sessions have proper context.

## Next Steps

After completing Phase 1, proceed to:
- `/speckit.tasks` to generate implementation tasks from this plan
- `/speckit.implement` to begin development following the task list

All design artifacts must be reviewed and approved before implementation begins per Constitution Principle VI (Spec-Driven Development).
