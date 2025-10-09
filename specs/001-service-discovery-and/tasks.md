---
description: "Implementation tasks for Lattice service discovery MVP"
---

# Tasks: Service Discovery and Visualization

**Input**: Design documents from `/specs/001-service-discovery-and/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Comprehensive testing strategy included (unit, integration, and contract tests)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- **Monorepo structure**: packages/[package-name]/src/, packages/[package-name]/tests/
- Paths follow Yarn workspaces convention from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Monorepo initialization and basic project structure

- [ ] T001 Initialize Yarn workspaces monorepo with root package.json and workspaces config
- [ ] T002 [P] Setup Turborepo in turbo.json with build/test/lint pipelines
- [ ] T003 [P] Configure TypeScript root tsconfig.json with strict mode and project references
- [ ] T004 [P] Setup ESLint and Prettier with shared configs in root
- [ ] T005 [P] Create .gitignore with node_modules, dist, .env, .turbo
- [ ] T006 [P] Setup Vitest configuration in root vitest.config.ts
- [ ] T007 Create packages/ directory structure (core, sdk, plugin-express, api, web)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Shared Core Package (packages/core)

- [ ] T008 [P] Create packages/core/package.json with name @lattice/core
- [ ] T009 [P] Create packages/core/tsconfig.json extending root config
- [ ] T010 [P] Create packages/core/src/types/service.ts with Service interface from data-model.md
- [ ] T011 [P] Create packages/core/src/types/route.ts with Route interface from data-model.md
- [ ] T012 [P] Create packages/core/src/types/dependency.ts with Dependency interface from data-model.md
- [ ] T013 [P] Create packages/core/src/types/connection.ts with Connection interface from data-model.md
- [ ] T014 [P] Create packages/core/src/types/plugin.ts with Plugin interface from data-model.md
- [ ] T015 [P] Create packages/core/src/types/index.ts barrel export
- [ ] T016 [P] Create packages/core/src/validators/schema-validator.ts using contracts/schema-v1.json
- [ ] T017 [P] Create packages/core/src/constants/index.ts for API endpoints, schema version
- [ ] T018 [P] Create packages/core/src/utils/id-generator.ts for CUID generation
- [ ] T019 [P] Create packages/core/src/index.ts barrel export

### Database Setup (packages/api)

- [ ] T020 Setup PostgreSQL database schema with Prisma
- [ ] T021 Create packages/api/prisma/schema.prisma with all 5 entities from data-model.md
- [ ] T022 Create packages/api/prisma/migrations/ initial migration for all tables
- [ ] T023 Setup Redis connection module in packages/api/src/lib/redis.ts
- [ ] T024 Create packages/api/src/lib/prisma.ts for database client singleton

### API Infrastructure (packages/api)

- [ ] T025 Create packages/api/package.json with express, prisma, redis dependencies
- [ ] T026 Create packages/api/tsconfig.json extending root config
- [ ] T027 Create packages/api/src/index.ts with Express app initialization
- [ ] T028 Create packages/api/src/middleware/auth.ts for X-Lattice-API-Key validation
- [ ] T029 Create packages/api/src/middleware/error-handler.ts for global error handling
- [ ] T030 Create packages/api/src/middleware/request-logger.ts
- [ ] T031 Create packages/api/src/routes/index.ts for route registration
- [ ] T032 Create packages/api/src/lib/env.ts for environment variable validation

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Single Service Analysis (Priority: P1) 🎯 MVP

**Goal**: A developer integrates Lattice into their Express.js application and views a visual representation of all routes and package dependencies within minutes

**Independent Test**: Start demo Express app with Lattice plugin → View service card with routes and dependencies on dashboard

### Tests for User Story 1

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T033 [P] [US1] Contract test for POST /ingest/metadata in packages/plugin-express/tests/contract/ingest.test.ts
- [ ] T034 [P] [US1] Integration test for route discovery in packages/plugin-express/tests/integration/route-discovery.test.ts
- [ ] T035 [P] [US1] Integration test for dependency analysis in packages/plugin-express/tests/integration/dependency-analysis.test.ts
- [ ] T036 [P] [US1] E2E test for quickstart guide in packages/plugin-express/tests/e2e/quickstart.test.ts
- [ ] T037 [P] [US1] Contract test for GET /services/:id in packages/api/tests/contract/services.test.ts

### Implementation: Express Plugin (packages/plugin-express)

- [ ] T038 [P] [US1] Create packages/plugin-express/package.json with @lattice/core dependency
- [ ] T039 [P] [US1] Create packages/plugin-express/tsconfig.json extending root config
- [ ] T040 [US1] Create packages/plugin-express/src/config/types.ts with LatticeConfig interface from quickstart.md
- [ ] T041 [US1] Create packages/plugin-express/src/discovery/route-analyzer.ts using express-list-endpoints
- [ ] T042 [US1] Create packages/plugin-express/src/discovery/dependency-analyzer.ts with package.json parsing
- [ ] T043 [US1] Create packages/plugin-express/src/discovery/service-name-detector.ts with 9-tier fallback from research.md
- [ ] T044 [US1] Create packages/plugin-express/src/client/api-client.ts for HTTP POST to /ingest/metadata
- [ ] T045 [US1] Create packages/plugin-express/src/index.ts with LatticePlugin class from quickstart.md
- [ ] T046 [US1] Implement LatticePlugin.analyze() method aggregating all discovery
- [ ] T047 [US1] Implement LatticePlugin.submit() method with API client
- [ ] T048 [US1] Add auto-submit interval timer in LatticePlugin class
- [ ] T049 [US1] Add error handling and callbacks (onAnalyzed, onSubmitted, onError)
- [ ] T050 [US1] Create packages/plugin-express/README.md with quickstart instructions

### Implementation: Collector API Ingestion (packages/api)

- [ ] T051 [P] [US1] Create packages/api/src/services/metadata-service.ts for storing service metadata
- [ ] T052 [P] [US1] Create packages/api/src/services/route-service.ts for storing routes
- [ ] T053 [P] [US1] Create packages/api/src/services/dependency-service.ts for storing dependencies
- [ ] T054 [US1] Create packages/api/src/routes/ingest.ts with POST /ingest/metadata handler per plugin-api.json
- [ ] T055 [US1] Implement schema validation using @lattice/core validators in ingest route
- [ ] T056 [US1] Implement upsert logic (update if exists, insert if new) in metadata-service
- [ ] T057 [US1] Add lastSeen timestamp updates on every submission
- [ ] T058 [US1] Register /ingest/metadata route in packages/api/src/routes/index.ts

### Implementation: Dashboard Query API (packages/api)

- [ ] T059 [P] [US1] Create packages/api/src/routes/services.ts with GET /services handler per dashboard-api.json
- [ ] T060 [P] [US1] Create packages/api/src/routes/services.ts with GET /services/:id handler per dashboard-api.json
- [ ] T061 [US1] Implement service query with include filters (routes, dependencies) in services route
- [ ] T062 [US1] Register /services routes in packages/api/src/routes/index.ts

### Implementation: Dashboard UI (packages/web)

- [ ] T063 [P] [US1] Create packages/web/package.json as Next.js 14 app with React Flow
- [ ] T064 [P] [US1] Create packages/web/tsconfig.json extending root config
- [ ] T065 [P] [US1] Setup Tailwind CSS in packages/web/tailwind.config.ts
- [ ] T066 [US1] Create packages/web/app/layout.tsx with root layout
- [ ] T067 [US1] Create packages/web/app/page.tsx for services list view
- [ ] T068 [US1] Create packages/web/app/services/[id]/page.tsx for service detail view
- [ ] T069 [P] [US1] Create packages/web/components/ServiceCard.tsx component
- [ ] T070 [P] [US1] Create packages/web/components/RouteList.tsx component
- [ ] T071 [P] [US1] Create packages/web/components/DependencyList.tsx component
- [ ] T072 [US1] Create packages/web/lib/api-client.ts for fetching from collector API
- [ ] T073 [US1] Implement service detail page with route and dependency display
- [ ] T074 [US1] Add loading states and error handling in all pages

**Checkpoint**: At this point, User Story 1 should be fully functional - a single service can be analyzed and visualized

---

## Phase 4: User Story 2 - Service Connection Tracking (Priority: P1) 🎯 MVP

**Goal**: When Service A calls Service B (both instrumented), the dashboard automatically shows the connection with call frequency and error rates

**Independent Test**: Start two demo services with Lattice plugins → Have Service A call Service B → View connection graph showing A → B edge

### Tests for User Story 2

- [ ] T075 [P] [US2] Integration test for HTTP header injection in packages/plugin-express/tests/integration/tracing.test.ts
- [ ] T076 [P] [US2] Integration test for connection correlation in packages/api/tests/integration/connection-tracking.test.ts
- [ ] T077 [P] [US2] Contract test for POST /ingest/connections in packages/api/tests/contract/connections.test.ts
- [ ] T078 [P] [US2] E2E test for two-service connection in tests/e2e/service-connection.test.ts

### Implementation: Express Plugin Tracing (packages/plugin-express)

- [ ] T079 [US2] Create packages/plugin-express/src/middleware/tracing.ts for header injection
- [ ] T080 [US2] Add X-Trace-ID and X-Origin-Service headers to outgoing requests in tracing middleware
- [ ] T081 [US2] Create packages/plugin-express/src/middleware/correlation.ts for receiving traced requests
- [ ] T082 [US2] Extract correlation data and log to Redis in correlation middleware
- [ ] T083 [US2] Auto-register tracing/correlation middleware in LatticePlugin.analyze()
- [ ] T084 [US2] Create packages/plugin-express/src/client/lattice-fetch.ts wrapper for fetch with auto-tracing

### Implementation: Connection Tracking (packages/api)

- [ ] T085 [P] [US2] Create packages/api/src/services/connection-service.ts for storing connections
- [ ] T086 [US2] Create packages/api/src/jobs/connection-aggregator.ts for Redis → PostgreSQL batch job
- [ ] T087 [US2] Implement connection correlation logic matching trace IDs in connection-aggregator
- [ ] T088 [US2] Implement callCount, errorRate, avgResponseTime calculations
- [ ] T089 [US2] Create packages/api/src/routes/graph.ts with GET /graph handler per dashboard-api.json
- [ ] T090 [US2] Implement graph query with nodes-edges format using Prisma
- [ ] T091 [US2] Register /graph route in packages/api/src/routes/index.ts

### Implementation: Dashboard Graph View (packages/web)

- [ ] T092 [US2] Create packages/web/app/graph/page.tsx for graph visualization
- [ ] T093 [US2] Create packages/web/components/ServiceGraph.tsx using React Flow
- [ ] T094 [US2] Implement dagre layout algorithm for graph positioning
- [ ] T095 [US2] Add edge labels showing callCount and errorRate
- [ ] T096 [US2] Add node click handlers to navigate to service detail
- [ ] T097 [US2] Implement graph zoom and pan controls

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - services with connections visualized

---

## Phase 5: User Story 3 - Multi-Service Dashboard (Priority: P2)

**Goal**: An operations engineer views a dashboard showing all instrumented services across their architecture with search and filtering capabilities

**Independent Test**: Start 5+ demo services with Lattice → View services list with filtering → See complete architecture graph

### Tests for User Story 3

- [ ] T098 [P] [US3] Contract test for GET /services with filters in packages/api/tests/contract/services-list.test.ts
- [ ] T099 [P] [US3] Integration test for service filtering in packages/api/tests/integration/service-filtering.test.ts
- [ ] T100 [P] [US3] E2E test for multi-service dashboard in tests/e2e/multi-service.test.ts

### Implementation: Advanced API Queries (packages/api)

- [ ] T101 [P] [US3] Add status, environment, framework filters to GET /services in packages/api/src/routes/services.ts
- [ ] T102 [P] [US3] Add pagination (limit, offset) to GET /services
- [ ] T103 [P] [US3] Create packages/api/src/routes/routes.ts with GET /routes search endpoint per dashboard-api.json
- [ ] T104 [P] [US3] Create packages/api/src/routes/dependencies.ts with GET /dependencies endpoint per dashboard-api.json
- [ ] T105 [US3] Implement service search with Prisma queries and filters
- [ ] T106 [US3] Register routes and dependencies endpoints in packages/api/src/routes/index.ts

### Implementation: Dashboard Search & Filtering (packages/web)

- [ ] T107 [P] [US3] Create packages/web/components/ServiceFilter.tsx with filter controls
- [ ] T108 [P] [US3] Create packages/web/components/SearchBar.tsx for service search
- [ ] T109 [P] [US3] Create packages/web/components/ServiceTable.tsx for tabular view
- [ ] T110 [US3] Update packages/web/app/page.tsx with search and filtering UI
- [ ] T111 [US3] Implement client-side filter state management
- [ ] T112 [US3] Add route search page in packages/web/app/routes/page.tsx
- [ ] T113 [US3] Add dependency search page in packages/web/app/dependencies/page.tsx

### Implementation: Real-time Updates (SSE)

- [ ] T114 [US3] Create packages/api/src/routes/metrics.ts with GET /metrics/stream SSE endpoint
- [ ] T115 [US3] Implement SSE event emission on service metadata updates
- [ ] T116 [US3] Create packages/web/hooks/useServiceUpdates.ts for SSE consumption
- [ ] T117 [US3] Add real-time service status updates in dashboard components
- [ ] T118 [US3] Register /metrics/stream route in packages/api/src/routes/index.ts

**Checkpoint**: All three priority user stories should now be independently functional

---

## Phase 6: User Story 4 - Cross-Language Discovery (Priority: P3)

**Goal**: Plugin architecture allows community to add support for Python, Go, Ruby, etc.

**Independent Test**: Create a minimal Python FastAPI plugin → Verify it submits to the same API → See Python service in dashboard

### Implementation: SDK Package (packages/sdk)

- [ ] T119 [P] [US4] Create packages/sdk/package.json with @lattice/core dependency
- [ ] T120 [P] [US4] Create packages/sdk/tsconfig.json extending root config
- [ ] T121 [US4] Create packages/sdk/src/base-plugin.ts with abstract Plugin class
- [ ] T122 [US4] Define abstract methods: discoverRoutes(), discoverDependencies(), submit()
- [ ] T123 [US4] Create packages/sdk/src/service-detector.ts with language-agnostic detection
- [ ] T124 [US4] Create packages/sdk/src/api-client.ts for shared HTTP client
- [ ] T125 [US4] Create packages/sdk/README.md with plugin development guide
- [ ] T126 [US4] Refactor packages/plugin-express to extend base-plugin.ts

### Implementation: Plugin Registry (packages/api)

- [ ] T127 [P] [US4] Create packages/api/src/services/plugin-service.ts for plugin metadata
- [ ] T128 [P] [US4] Create packages/api/src/routes/plugins.ts with GET /plugins endpoint
- [ ] T129 [US4] Implement plugin registration on first service submission
- [ ] T130 [US4] Add plugin statistics (servicesUsing, lastUsed) tracking
- [ ] T131 [US4] Register /plugins route in packages/api/src/routes/index.ts

### Documentation & Examples

- [ ] T132 [P] [US4] Create packages/sdk/examples/minimal-plugin.ts template
- [ ] T133 [P] [US4] Create docs/plugin-development.md guide
- [ ] T134 [P] [US4] Create docs/contributing.md for community plugins
- [ ] T135 [US4] Update quickstart.md with plugin architecture explanation

**Checkpoint**: Plugin architecture complete - ready for community contributions

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Documentation

- [ ] T136 [P] Create README.md in root with project overview and quickstart link
- [ ] T137 [P] Create docs/architecture.md explaining monorepo structure
- [ ] T138 [P] Create docs/api-reference.md from OpenAPI specs
- [ ] T139 [P] Create CONTRIBUTING.md with development setup
- [ ] T140 [P] Create LICENSE file (MIT)

### Developer Experience

- [ ] T141 [P] Add Turborepo dev script to run all packages in watch mode
- [ ] T142 [P] Create docker-compose.yml for PostgreSQL + Redis local development
- [ ] T143 [P] Create scripts/setup-dev.sh for one-command local setup
- [ ] T144 [P] Add example .env.example files to all packages

### Testing & Quality

- [ ] T145 [P] Add unit tests for all validators in packages/core/tests/unit/
- [ ] T146 [P] Add unit tests for all services in packages/api/tests/unit/
- [ ] T147 [P] Setup test coverage reporting with Vitest
- [ ] T148 [P] Add pre-commit hooks with Husky for linting and tests
- [ ] T149 Run full quickstart.md validation end-to-end

### Performance & Monitoring

- [ ] T150 [P] Add API request logging with structured logs
- [ ] T151 [P] Add database query performance monitoring
- [ ] T152 [P] Implement Redis caching for GET /services queries
- [ ] T153 [P] Add health check endpoint GET /health per plugin-api.json
- [ ] T154 [P] Optimize Prisma queries with indexes per data-model.md

### Security

- [ ] T155 [P] Add rate limiting middleware to API routes
- [ ] T156 [P] Implement API key generation and management endpoints
- [ ] T157 [P] Add CORS configuration for dashboard
- [ ] T158 [P] Security audit of all dependencies with npm audit

### Deployment

- [ ] T159 [P] Create Dockerfile for packages/api
- [ ] T160 [P] Create Dockerfile for packages/web
- [ ] T161 [P] Create kubernetes/ manifests for production deployment
- [ ] T162 [P] Create .github/workflows/ci.yml for automated testing
- [ ] T163 [P] Create .github/workflows/release.yml for package publishing

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (Phase 3): Can start after Foundational - No dependencies on other stories
  - US2 (Phase 4): Can start after Foundational - Extends US1 plugin but independently testable
  - US3 (Phase 5): Can start after Foundational - Enhances US1+US2 dashboard
  - US4 (Phase 6): Can start after Foundational - Creates SDK from US1 plugin extraction
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Single service analysis - Foundation only
- **User Story 2 (P1)**: Connection tracking - Extends US1 plugin with middleware
- **User Story 3 (P2)**: Multi-service dashboard - Adds filtering/search to US1+US2 dashboard
- **User Story 4 (P3)**: Cross-language - Extracts SDK from US1 plugin implementation

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Core types and models before services
- Services before API routes
- API routes before dashboard UI
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (Phase 1) can run in parallel
- All Foundational core package tasks (T010-T019) can run in parallel
- All Foundational API infrastructure tasks (T028-T032) can run in parallel
- Within US1: Plugin, API, and Dashboard packages can be worked on in parallel after tests
- Tests for each story marked [P] can be written in parallel
- Documentation tasks (T136-T140) can run in parallel
- Deployment tasks (T159-T163) can run in parallel

---

## Parallel Example: User Story 1 Implementation

```bash
# After tests are written and failing, launch in parallel:

# Plugin development:
Task: T040 "Create LatticeConfig interface"
Task: T041 "Create route-analyzer.ts"
Task: T042 "Create dependency-analyzer.ts"
Task: T043 "Create service-name-detector.ts"

# API development:
Task: T051 "Create metadata-service.ts"
Task: T052 "Create route-service.ts"
Task: T053 "Create dependency-service.ts"

# Dashboard development:
Task: T069 "Create ServiceCard.tsx"
Task: T070 "Create RouteList.tsx"
Task: T071 "Create DependencyList.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: Foundational (T008-T032) - CRITICAL BLOCKING PHASE
3. Complete Phase 3: User Story 1 (T033-T074)
4. **STOP and VALIDATE**: Test US1 independently with single service
5. Complete Phase 4: User Story 2 (T075-T097)
6. **STOP and VALIDATE**: Test US2 independently with two connected services
7. Deploy/demo MVP (P1 complete)

### Incremental Delivery

1. Foundation (Phases 1-2) → Ready for development
2. Add User Story 1 (Phase 3) → Test independently → Deploy/Demo (Service cards working!)
3. Add User Story 2 (Phase 4) → Test independently → Deploy/Demo (Connections working!)
4. Add User Story 3 (Phase 5) → Test independently → Deploy/Demo (Multi-service dashboard!)
5. Add User Story 4 (Phase 6) → Test independently → Deploy/Demo (Plugin ecosystem!)
6. Polish (Phase 7) → Production-ready

### Parallel Team Strategy

With 3+ developers after Foundational phase:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Plugin + API ingestion)
   - Developer B: User Story 1 (Dashboard UI)
   - Developer C: User Story 2 (Connection tracking)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files/packages, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Use Turborepo to run tasks across packages efficiently
- Follow TypeScript strict mode from constitution.md
- Use Yarn workspaces, NOT npm (per user instructions)
