# Data Model: Lattice Core Entities

**Version**: 1.0.0
**Date**: 2025-10-09
**Status**: Draft

---

## Overview

The Lattice data model defines five core entities that represent the service architecture graph:
1. **Service** - A deployed application or microservice
2. **Route** - An HTTP endpoint within a service
3. **Dependency** - An external package/library used by a service
4. **Connection** - Communication link between two services
5. **Plugin** - Framework-specific analyzer that extracts metadata

All entities use a unified schema format that is language/framework-agnostic, enabling cross-platform service discovery.

---

## Entity: Service

### Description
Represents a deployed application or microservice in the architecture. Services are the nodes in the dependency graph.

### TypeScript Definition

```typescript
interface Service {
  // Identity
  id: string;                    // Unique identifier (CUID)
  name: string;                  // Service name (auto-detected or configured)
  version?: string;              // Semantic version (from package.json)

  // Runtime Environment
  environment?: 'development' | 'staging' | 'production' | string;
  deploymentType?: 'kubernetes' | 'docker' | 'serverless' | 'bare-metal';

  // Technology Stack
  language: string;              // e.g., "javascript", "typescript", "python"
  framework: string;             // e.g., "express", "fastapi", "django"
  runtime?: string;              // e.g., "node-18", "python-3.11"

  // Metadata
  description?: string;          // Human-readable description
  repository?: string;           // Git repository URL
  healthCheckUrl?: string;       // Health check endpoint

  // Relationships (populated by API, not submitted by plugins)
  routes?: Route[];              // HTTP endpoints exposed by this service
  dependencies?: Dependency[];   // External packages used
  outgoingConnections?: Connection[];  // Services this service calls
  incomingConnections?: Connection[];  // Services that call this service

  // Tracking
  status: 'active' | 'inactive' | 'unknown';
  firstSeen: Date;               // When first discovered
  lastSeen: Date;                // Last heartbeat/update

  // Plugin Information
  discoveredBy: {
    pluginName: string;          // e.g., "@lattice/plugin-express"
    pluginVersion: string;       // e.g., "1.0.0"
    schemaVersion: string;       // e.g., "1.0.0"
  };

  // Extensibility
  metadata?: Record<string, unknown>;  // Plugin-specific metadata
}
```

### Validation Rules (from Functional Requirements)

| Rule | Requirement | Constraint |
|------|-------------|------------|
| VR-001 | Service name is required | NOT NULL, 2-63 characters |
| VR-002 | Service name must be unique | UNIQUE constraint |
| VR-003 | Service name format | Lowercase, alphanumeric + hyphens only |
| VR-004 | Language is required | NOT NULL |
| VR-005 | Framework is required | NOT NULL |
| VR-006 | Status must be valid enum | One of: active, inactive, unknown |
| VR-007 | Discovered by is required | NOT NULL (plugin info) |

### Field Details

#### name
- **Type**: string (required)
- **Length**: 2-63 characters
- **Format**: DNS-compatible (lowercase, alphanumeric, hyphens)
- **Example**: `user-service`, `payment-api`, `auth-gateway`
- **Source**: Auto-detected via service name detection chain (see research.md)

#### version
- **Type**: string (optional)
- **Format**: Semantic versioning (MAJOR.MINOR.PATCH)
- **Example**: `1.2.3`, `0.1.0-alpha`
- **Source**: package.json `version` field

#### language
- **Type**: string (required)
- **Values**: `javascript`, `typescript`, `python`, `go`, `java`, `ruby`, etc.
- **Source**: Plugin detection or package.json/runtime

#### framework
- **Type**: string (required)
- **Values**: `express`, `fastapi`, `django`, `spring-boot`, `rails`, etc.
- **Source**: Plugin identification

#### status
- **Type**: enum (required)
- **Values**:
  - `active`: Service is responding to health checks
  - `inactive`: Service has not reported in >1 hour
  - `unknown`: Status cannot be determined
- **Source**: Computed by collector based on lastSeen timestamp

### State Transitions

```
┌──────────┐
│ unknown  │  Initial state when first discovered
└────┬─────┘
     │ First heartbeat received
     ▼
┌──────────┐
│  active  │  Service is healthy and reporting
└────┬─────┘
     │ No heartbeat for 1 hour
     ▼
┌──────────┐
│ inactive │  Service stopped or unreachable
└────┬─────┘
     │ Heartbeat resumes
     ▼
┌──────────┐
│  active  │  Service recovered
└──────────┘
```

---

## Entity: Route

### Description
Represents an HTTP endpoint within a service. Routes are the specific API contracts exposed by services.

### TypeScript Definition

```typescript
interface Route {
  // Identity
  id: string;                    // Unique identifier (CUID)
  serviceId: string;             // Foreign key to Service

  // HTTP Details
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'ALL';
  path: string;                  // Path pattern (e.g., "/users/:id")

  // Middleware & Handler
  middlewareChain?: string[];    // Ordered middleware names
  handlerLocation?: {
    file: string;                // Source file path
    line?: number;               // Line number in source
    function?: string;           // Handler function name
  };

  // Parameters
  pathParameters?: RouteParameter[];     // URL path params
  queryParameters?: RouteParameter[];    // Query string params

  // Request/Response (if available)
  requestSchema?: JSONSchema;    // Request body schema
  responseSchema?: JSONSchema;   // Response body schema

  // Documentation
  description?: string;          // Route purpose
  tags?: string[];               // Categorization tags

  // Metrics (computed from Connection data)
  avgResponseTimeMs?: number;    // Average response time
  callFrequency?: number;        // Calls per hour
  errorRate?: number;            // Error percentage

  // Tracking
  firstSeen: Date;
  lastSeen: Date;

  // Extensibility
  metadata?: Record<string, unknown>;
}

interface RouteParameter {
  name: string;                  // Parameter name
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description?: string;
  example?: unknown;
}

// Simplified JSON Schema type
type JSONSchema = {
  type: string;
  properties?: Record<string, JSONSchema>;
  required?: string[];
  [key: string]: unknown;
};
```

### Validation Rules

| Rule | Requirement | Constraint |
|------|-------------|------------|
| VR-101 | Service ID is required | NOT NULL, foreign key |
| VR-102 | HTTP method is required | NOT NULL, valid enum |
| VR-103 | Path is required | NOT NULL, starts with "/" |
| VR-104 | Unique route per service | UNIQUE (serviceId, method, path) |
| VR-105 | Path format | Valid Express/HTTP path pattern |

### Field Details

#### path
- **Type**: string (required)
- **Format**: HTTP path with optional parameters
- **Examples**:
  - `/users` - Static path
  - `/users/:id` - Path parameter
  - `/users/:id?` - Optional parameter
  - `/files/*` - Wildcard
  - `/posts/:year(\\d+)/:month(\\d+)` - Constrained parameters
- **Source**: Extracted by plugin via route introspection

#### method
- **Type**: enum (required)
- **Values**: Standard HTTP methods + ALL
- **Note**: `ALL` represents routes registered with `app.all()`

#### middlewareChain
- **Type**: string[] (optional)
- **Order**: Sequential from first to last middleware
- **Example**: `["express.json", "authenticate", "authorize", "validateInput"]`
- **Source**: Extracted from Express `layer.route.stack`

---

## Entity: Dependency

### Description
Represents an external package or library used by a service. Dependencies help identify shared libraries and potential security vulnerabilities.

### TypeScript Definition

```typescript
interface Dependency {
  // Identity
  id: string;                    // Unique identifier (CUID)
  serviceId: string;             // Foreign key to Service

  // Package Information
  packageName: string;           // npm/pip/gem package name
  version: string;               // Installed version
  versionRange?: string;         // Declared version range (e.g., "^1.2.0")

  // Classification
  dependencyType: 'direct' | 'transitive' | 'peer' | 'dev';
  scope?: string;                // npm scope (e.g., "@lattice")

  // Size & Impact
  installedSize?: number;        // Bytes on disk
  publishSize?: number;          // Tarball size
  fileCount?: number;            // Number of files

  // Security
  hasVulnerabilities?: boolean;
  vulnerabilityCount?: number;
  highestSeverity?: 'critical' | 'high' | 'medium' | 'low';

  // Metadata
  description?: string;          // Package description
  license?: string;              // License type (MIT, Apache-2.0, etc.)
  repository?: string;           // Package repository URL
  homepage?: string;             // Package homepage

  // Tracking
  firstSeen: Date;
  lastSeen: Date;

  // Extensibility
  metadata?: Record<string, unknown>;
}
```

### Validation Rules

| Rule | Requirement | Constraint |
|------|-------------|------------|
| VR-201 | Service ID is required | NOT NULL, foreign key |
| VR-202 | Package name is required | NOT NULL |
| VR-203 | Version is required | NOT NULL, semver format |
| VR-204 | Dependency type is required | NOT NULL, valid enum |
| VR-205 | Unique per service | UNIQUE (serviceId, packageName) |

### Field Details

#### dependencyType
- **Type**: enum (required)
- **Values**:
  - `direct`: Declared in package.json dependencies
  - `transitive`: Dependency of a dependency
  - `peer`: Peer dependency
  - `dev`: Development dependency (devDependencies)
- **Source**: Parsed from package.json and node_modules

#### installedSize
- **Type**: number (optional, bytes)
- **Source**: Calculated via fast-glob or PackagePhobia API
- **Note**: Includes the package and its dependencies

---

## Entity: Connection

### Description
Represents a detected communication link between two services. Connections form the edges in the service dependency graph.

### TypeScript Definition

```typescript
interface Connection {
  // Identity
  id: string;                    // Unique identifier (CUID)

  // Service Relationship
  sourceServiceId: string;       // Service making the call
  targetServiceId: string;       // Service being called

  // Route Details
  targetRouteId?: string;        // Specific route being called (if known)
  method: string;                // HTTP method
  path: string;                  // Endpoint path

  // Traffic Metrics
  callCount: number;             // Total calls observed
  avgResponseTimeMs?: number;    // Average response time
  p95ResponseTimeMs?: number;    // 95th percentile response time
  p99ResponseTimeMs?: number;    // 99th percentile response time

  // Reliability
  successCount: number;          // 2xx/3xx responses
  errorCount: number;            // 4xx/5xx responses
  errorRate: number;             // Percentage (0-100)

  // Pattern Analysis
  requestFrequency?: number;     // Calls per hour
  peakTime?: string;             // Hour with most traffic (ISO hour)

  // Tracking
  firstSeen: Date;               // First observed call
  lastSeen: Date;                // Most recent call

  // Tracing
  sampleTraceIds?: string[];     // Sample trace IDs for debugging

  // Extensibility
  metadata?: Record<string, unknown>;
}
```

### Validation Rules

| Rule | Requirement | Constraint |
|------|-------------|------------|
| VR-301 | Source service ID is required | NOT NULL, foreign key |
| VR-302 | Target service ID is required | NOT NULL, foreign key |
| VR-303 | Method is required | NOT NULL |
| VR-304 | Path is required | NOT NULL |
| VR-305 | Call count minimum | >= 0 |
| VR-306 | Error rate range | 0-100 |
| VR-307 | Unique connection | UNIQUE (sourceServiceId, targetServiceId, method, path) |
| VR-308 | No self-loops (optional) | sourceServiceId != targetServiceId |

### Field Details

#### errorRate
- **Type**: number (required, percentage)
- **Range**: 0-100
- **Calculation**: `(errorCount / callCount) * 100`
- **Source**: Computed from connection tracking data

#### requestFrequency
- **Type**: number (optional, calls/hour)
- **Calculation**: `callCount / hoursObserved`
- **Source**: Computed from firstSeen and lastSeen

### Connection Detection

Connections are detected via HTTP header correlation (see research.md):
1. Service A injects `X-Trace-ID` and `X-Origin-Service` headers
2. Service B receives request, logs correlation
3. Collector matches requests by trace ID
4. Connection record created/updated

---

## Entity: Plugin

### Description
Represents a framework-specific analyzer that extracts service metadata. Plugins translate framework-specific concepts to the Lattice unified schema.

### TypeScript Definition

```typescript
interface Plugin {
  // Identity
  id: string;                    // Unique identifier (CUID)
  name: string;                  // npm package name (e.g., "@lattice/plugin-express")
  version: string;               // Plugin version (semver)

  // Compatibility
  supportedFrameworks: string[]; // e.g., ["express@4.x", "express@5.x"]
  supportedSchemaVersions: string[];  // e.g., ["1.0.0", "1.1.0"]
  preferredSchemaVersion: string;     // e.g., "1.1.0"

  // Capabilities
  canDiscoverRoutes: boolean;
  canDiscoverDependencies: boolean;
  canTrackConnections: boolean;

  // Metadata
  description?: string;
  author?: string;
  repository?: string;
  documentation?: string;

  // Statistics (from collector)
  servicesUsing?: number;        // Count of services using this plugin

  // Tracking
  registeredAt: Date;
  lastUsed?: Date;

  // Extensibility
  metadata?: Record<string, unknown>;
}
```

### Validation Rules

| Rule | Requirement | Constraint |
|------|-------------|------------|
| VR-401 | Name is required | NOT NULL, unique |
| VR-402 | Version is required | NOT NULL, semver format |
| VR-403 | Schema versions required | Array with >= 1 version |
| VR-404 | Preferred schema in supported | Must be in supportedSchemaVersions |

---

## Relationships

### Entity Relationship Diagram (Text)

```
┌─────────────┐
│   Service   │
└──────┬──────┘
       │
       │ 1:N
       │
       ├─────────────┐
       │             │
       ▼             ▼
 ┌──────────┐  ┌──────────────┐
 │  Route   │  │  Dependency  │
 └──────────┘  └──────────────┘
       │
       │ 1:1 (optional)
       │
       ▼
┌────────────────┐
│  Connection    │  ───── sourceServiceId ────▶ Service
│                │  ───── targetServiceId ────▶ Service
│                │  ───── targetRouteId ──────▶ Route (optional)
└────────────────┘

┌─────────────┐
│   Plugin    │  Referenced by Service.discoveredBy
└─────────────┘
```

### Cardinality

- **Service → Routes**: One-to-Many (one service has many routes)
- **Service → Dependencies**: One-to-Many (one service has many dependencies)
- **Service → Outgoing Connections**: One-to-Many (source service)
- **Service → Incoming Connections**: One-to-Many (target service)
- **Connection → Route**: Many-to-One (optional, multiple connections to same route)

---

## Prisma Schema (PostgreSQL)

```prisma
// Service entity
model Service {
  id               String   @id @default(cuid())
  name             String   @unique
  version          String?
  environment      String?
  deploymentType   String?
  language         String
  framework        String
  runtime          String?
  description      String?
  repository       String?
  healthCheckUrl   String?
  status           String   @default("unknown") // active, inactive, unknown
  firstSeen        DateTime @default(now())
  lastSeen         DateTime @updatedAt

  // Plugin info (stored as JSON)
  discoveredBy     Json
  metadata         Json?

  // Relationships
  routes           Route[]
  dependencies     Dependency[]
  outgoingConnections Connection[] @relation("SourceService")
  incomingConnections Connection[] @relation("TargetService")

  @@index([name])
  @@index([status])
  @@index([lastSeen])
}

// Route entity
model Route {
  id                String   @id @default(cuid())
  serviceId         String
  method            String
  path              String
  middlewareChain   String[] // Array of middleware names
  handlerLocation   Json?
  pathParameters    Json?
  queryParameters   Json?
  requestSchema     Json?
  responseSchema    Json?
  description       String?
  tags              String[]
  avgResponseTimeMs Float?
  callFrequency     Float?
  errorRate         Float?
  firstSeen         DateTime @default(now())
  lastSeen          DateTime @updatedAt
  metadata          Json?

  service           Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  connections       Connection[] @relation("TargetRoute")

  @@unique([serviceId, method, path])
  @@index([serviceId])
  @@index([method])
}

// Dependency entity
model Dependency {
  id                  String   @id @default(cuid())
  serviceId           String
  packageName         String
  version             String
  versionRange        String?
  dependencyType      String   // direct, transitive, peer, dev
  scope               String?
  installedSize       Int?
  publishSize         Int?
  fileCount           Int?
  hasVulnerabilities  Boolean?
  vulnerabilityCount  Int?
  highestSeverity     String?
  description         String?
  license             String?
  repository          String?
  homepage            String?
  firstSeen           DateTime @default(now())
  lastSeen            DateTime @updatedAt
  metadata            Json?

  service             Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  @@unique([serviceId, packageName])
  @@index([serviceId])
  @@index([packageName])
  @@index([hasVulnerabilities])
}

// Connection entity (graph edges)
model Connection {
  id                  String   @id @default(cuid())
  sourceServiceId     String
  targetServiceId     String
  targetRouteId       String?
  method              String
  path                String
  callCount           Int      @default(0)
  avgResponseTimeMs   Float?
  p95ResponseTimeMs   Float?
  p99ResponseTimeMs   Float?
  successCount        Int      @default(0)
  errorCount          Int      @default(0)
  errorRate           Float    @default(0)
  requestFrequency    Float?
  peakTime            String?
  firstSeen           DateTime @default(now())
  lastSeen            DateTime @updatedAt
  sampleTraceIds      String[]
  metadata            Json?

  sourceService       Service  @relation("SourceService", fields: [sourceServiceId], references: [id], onDelete: Cascade)
  targetService       Service  @relation("TargetService", fields: [targetServiceId], references: [id], onDelete: Cascade)
  targetRoute         Route?   @relation("TargetRoute", fields: [targetRouteId], references: [id], onDelete: SetNull)

  @@unique([sourceServiceId, targetServiceId, method, path])
  @@index([sourceServiceId])
  @@index([targetServiceId])
  @@index([sourceServiceId, targetServiceId])
  @@index([lastSeen])
}

// Plugin registry
model Plugin {
  id                      String   @id @default(cuid())
  name                    String   @unique
  version                 String
  supportedFrameworks     String[]
  supportedSchemaVersions String[]
  preferredSchemaVersion  String
  canDiscoverRoutes       Boolean  @default(false)
  canDiscoverDependencies Boolean  @default(false)
  canTrackConnections     Boolean  @default(false)
  description             String?
  author                  String?
  repository              String?
  documentation           String?
  servicesUsing           Int      @default(0)
  registeredAt            DateTime @default(now())
  lastUsed                DateTime?
  metadata                Json?

  @@index([name])
}
```

---

## Data Flow

### Plugin → Collector → Storage

```
1. Plugin analyzes service
   ├─ Discovers routes via framework introspection
   ├─ Parses package.json for dependencies
   ├─ Detects service name via fallback chain
   └─ Serializes to unified schema

2. Plugin submits metadata to Collector API
   POST /api/ingest/metadata
   {
     service: { ... },
     routes: [ ... ],
     dependencies: [ ... ]
   }

3. Collector validates and stores
   ├─ Validates against JSON Schema v1.0.0
   ├─ Checks schema version compatibility
   ├─ Upserts Service record
   ├─ Upserts Routes (by unique constraint)
   └─ Upserts Dependencies (by unique constraint)

4. Connection tracking (separate flow)
   ├─ Services send HTTP requests with trace headers
   ├─ Middleware logs to Redis (real-time)
   ├─ Background worker correlates requests
   └─ Creates/updates Connection records
```

---

## Indexing Strategy

### Critical Indexes (Already in Prisma schema)

1. **Service.name** - Fast service lookup by name
2. **Service.status** - Filter active/inactive services
3. **Route (serviceId, method, path)** - Unique constraint + fast route lookup
4. **Dependency (serviceId, packageName)** - Unique constraint + dependency queries
5. **Connection (sourceServiceId, targetServiceId)** - Graph traversal
6. **Connection.lastSeen** - Identify stale connections

### Query Patterns Optimized

- Find all routes for a service: `Service.routes` (foreign key index)
- Find all dependencies for a service: `Service.dependencies` (foreign key index)
- Find services calling Service X: `Connection WHERE targetServiceId = X`
- Find services called by Service X: `Connection WHERE sourceServiceId = X`
- Find vulnerable dependencies: `Dependency WHERE hasVulnerabilities = true`

---

## Schema Evolution

When adding new fields:
1. **MINOR version** (v1.1.0): Add optional field
2. **MAJOR version** (v2.0.0): Remove field or make optional→required

Example:
```typescript
// v1.0.0
interface Service {
  name: string;
}

// v1.1.0 - MINOR (backward compatible)
interface Service {
  name: string;
  displayName?: string; // NEW optional field
}

// v2.0.0 - MAJOR (breaking)
interface Service {
  serviceName: string;  // RENAMED from "name"
  displayName?: string;
}
```

---

## Summary

The Lattice data model provides:
- ✅ **Unified schema** across all languages/frameworks
- ✅ **Rich metadata** for service discovery and visualization
- ✅ **Graph structure** with services (nodes) and connections (edges)
- ✅ **Extensibility** via metadata fields
- ✅ **Validation** rules aligned with functional requirements
- ✅ **Scalability** via proper indexing and foreign keys

Next: Generate JSON Schema v1.0.0 and OpenAPI contracts.
