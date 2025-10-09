# Feature Specification: Service Discovery and Visualization Platform

**Feature Branch**: `001-service-discovery-and`
**Created**: 2025-10-09
**Status**: Draft
**Input**: User description: "Service discovery and visualization platform with Express.js plugin for route and dependency analysis"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Single Service Analysis (Priority: P1)

A developer integrates Lattice into their Express.js application and views a visual representation of all routes and package dependencies within minutes, without needing to manually document anything.

**Why this priority**: This is the foundational use case. Without the ability to analyze a single service, none of the multi-service features can work. This delivers immediate value by auto-generating service documentation.

**Independent Test**: Can be fully tested by installing the Express plugin in a sample app, running it, and verifying that the visualization dashboard shows all routes and dependencies. Delivers standalone value as a service documentation tool.

**Acceptance Scenarios**:

1. **Given** a Node.js Express application with 10+ routes, **When** developer installs and configures the Lattice Express plugin, **Then** the plugin automatically discovers all routes with their HTTP methods, paths, and middleware
2. **Given** the plugin is active, **When** developer accesses the Lattice dashboard, **Then** they see a visual card representing their service with expandable details showing all discovered routes
3. **Given** a service with npm dependencies, **When** the analysis runs, **Then** the dashboard displays all package dependencies with their sizes and versions
4. **Given** route information is collected, **When** developer clicks on a route in the visualization, **Then** detailed information appears including parameters, middleware chain, and handler location in code

---

### User Story 2 - Service-to-Service Connection Mapping (Priority: P2)

A development team has both a web client and an API service instrumented with Lattice. When the client makes HTTP requests to the API, the dashboard automatically shows the two services connected with visual links indicating the communication.

**Why this priority**: This is the core value proposition - understanding how services interact. However, it requires P1 (single service analysis) to work first.

**Independent Test**: Deploy two instrumented services (e.g., web app and API). Make HTTP calls between them. Verify the dashboard shows both services linked together with connection metadata.

**Acceptance Scenarios**:

1. **Given** two services both configured with Lattice SDKs, **When** Service A makes an HTTP request to Service B, **Then** the dashboard shows a visual connection between the two service cards
2. **Given** multiple services are interconnected, **When** developer views the company-wide dashboard, **Then** they see a graph visualization with all services as nodes and HTTP connections as edges
3. **Given** connection data exists, **When** developer clicks a connection line, **Then** they see details about the API contract (endpoints called, request/response patterns, frequency)
4. **Given** a service is removed or goes offline, **When** the dashboard refreshes, **Then** the service card is marked as inactive but historical connections remain visible

---

### User Story 3 - Cross-Language Service Discovery (Priority: P3)

A company has microservices in both Node.js and Python. Both are instrumented with language-specific Lattice plugins, and the dashboard shows all services in a unified view regardless of implementation language.

**Why this priority**: This differentiates Lattice from language-specific tools, but requires foundational features working first. Can be deferred to post-MVP.

**Independent Test**: Create one Node.js service and one Python service (with hypothetical Python plugin). Both report to the same Lattice API. Verify unified dashboard view.

**Acceptance Scenarios**:

1. **Given** a Node.js service and Python service both configured with Lattice, **When** both services report metadata, **Then** the dashboard shows both using the same visual card format
2. **Given** cross-language services communicate, **When** Node.js service calls Python API, **Then** the connection is visualized identically to Node.js ↔ Node.js connections
3. **Given** language-specific route patterns (Express.js routes vs FastAPI routes), **When** plugins extract metadata, **Then** all routes are normalized to the same schema format

---

### User Story 4 - Package Dependency Visualization (Priority: P2)

A developer wants to understand which services depend on which npm packages and identify potential security vulnerabilities or duplicated dependencies across the architecture.

**Why this priority**: Provides immediate operational value for security and dependency management. Works independently alongside route discovery.

**Independent Test**: Analyze a service's package.json. Verify the dashboard shows all dependencies with sizes, versions, and visual indication of shared dependencies across services.

**Acceptance Scenarios**:

1. **Given** a service with package.json dependencies, **When** Lattice analyzes the service, **Then** the dashboard shows all direct and transitive dependencies
2. **Given** multiple services using the same package, **When** viewing the full architecture, **Then** shared dependencies are visually highlighted
3. **Given** a package with known vulnerabilities, **When** dashboard loads, **Then** affected packages are flagged with security warnings
4. **Given** large bundle sizes, **When** viewing dependencies, **Then** packages are sized proportionally in the visualization to identify bloat

---

### Edge Cases

- What happens when a service is behind a firewall and cannot reach the central Lattice API?
- How does the system handle dynamically generated routes (e.g., routes added at runtime)?
- What happens when two services report conflicting metadata about the same endpoint?
- How does the dashboard behave with 100+ microservices in the visualization?
- What happens if a service goes offline while being analyzed?
- How are circular dependencies represented in the visualization?
- What happens when route handlers are defined in dynamically imported modules?

## Requirements *(mandatory)*

### Functional Requirements

#### Plugin & Discovery

- **FR-001**: The Express.js plugin MUST automatically discover all routes defined in an Express application without requiring manual route registration
- **FR-002**: The plugin MUST extract route metadata including HTTP method, path pattern, middleware stack, and handler file location
- **FR-003**: The plugin MUST analyze package.json to discover all installed dependencies with their versions and sizes
- **FR-004**: The plugin MUST serialize discovered metadata into a standardized JSON schema that is language-agnostic
- **FR-005**: The SDK MUST provide a simple configuration API with zero-config defaults (automatic service name detection, default reporting endpoint)

#### Data Collection & Storage

- **FR-006**: The central API MUST accept service metadata via HTTP POST endpoint
- **FR-007**: The system MUST store service metadata including service name, version, routes, dependencies, and last-seen timestamp
- **FR-008**: The system MUST detect when services communicate by correlating HTTP requests across instrumented services
- **FR-009**: The system MUST support both snapshot (periodic reporting) and real-time (event-based) data collection modes
- **FR-010**: The API MUST provide authentication to prevent unauthorized services from submitting metadata

#### Visualization Dashboard

- **FR-011**: The dashboard MUST display each service as a visual card with name, status, and summary statistics
- **FR-012**: Service cards MUST be expandable to show detailed route listings and dependency graphs
- **FR-013**: The dashboard MUST render service-to-service connections as visual links between cards
- **FR-014**: Users MUST be able to filter the visualization by service name, technology stack, or connection pattern
- **FR-015**: Clicking on a route MUST display detailed information including parameters, middleware, response types, and source code location
- **FR-016**: The dashboard MUST support graph layouts (force-directed, hierarchical, circular) for different visualization needs
- **FR-017**: The dashboard MUST display package dependencies with size visualization (e.g., tree map or bubble chart)

#### Sidecar Collector (Company-Wide View)

- **FR-018**: A sidecar collector service MUST aggregate metadata from multiple services within a company's infrastructure
- **FR-019**: The collector MUST be deployable as a Docker container or standalone service
- **FR-020**: The collector MUST provide a unified view of all services reporting to it, regardless of deployment environment (dev, staging, prod)

#### Data Model & Schema

- **FR-021**: The core schema MUST define entities for Service, Route, Dependency, and Connection
- **FR-022**: All plugins MUST translate framework-specific concepts to the unified schema
- **FR-023**: The schema MUST version itself using semantic versioning to support backward compatibility

### Key Entities

- **Service**: Represents a deployed application or microservice. Attributes include unique identifier, name, version, programming language/framework, routes, dependencies, status (active/inactive), last-seen timestamp, deployment environment
- **Route**: Represents an HTTP endpoint within a service. Attributes include HTTP method, path pattern, parameters, middleware chain, handler location, request/response schemas (if available)
- **Dependency**: Represents an external package/library used by a service. Attributes include package name, version, size, license, security vulnerability status
- **Connection**: Represents communication between two services. Attributes include source service, target service, endpoint path, request frequency, first-seen/last-seen timestamps, request/response patterns
- **Plugin**: Represents a framework-specific analyzer. Attributes include name, supported framework, version, schema version compatibility

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developer can install the Express plugin and see their service visualized on the dashboard within 5 minutes from start
- **SC-002**: The dashboard accurately displays 100% of routes defined in a test Express application with 50+ endpoints
- **SC-003**: The visualization dashboard remains responsive and renders in under 3 seconds for architectures with up to 50 microservices
- **SC-004**: The unified schema successfully represents routes from both Express.js (Node.js) and FastAPI (Python) without information loss
- **SC-005**: 90% of developers can identify which services communicate with each other by viewing the dashboard for 30 seconds
- **SC-006**: Package dependency analysis identifies all direct and transitive dependencies with 100% accuracy compared to package.json
- **SC-007**: The system detects service-to-service connections within 10 seconds of the first HTTP request in real-time mode
- **SC-008**: New framework plugins can be developed and integrated following the plugin SDK documentation in under 8 hours for experienced developers
