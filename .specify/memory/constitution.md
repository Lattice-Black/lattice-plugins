<!--
Sync Impact Report:
- Version: [template] → 1.0.0 (Initial constitution)
- Modified principles: All (initial creation)
- Added sections: All core principles, technology stack, development workflow, governance
- Removed sections: None
- Templates requiring updates: None (initial setup)
- Follow-up TODOs: None
-->

# Lattice Constitution

## Core Principles

### I. TypeScript-First Development
All code MUST be written in TypeScript to ensure type safety and prevent runtime errors.
- Strict TypeScript configuration enabled across all packages
- String literal types converted to enums for shared use across components
- Unused variables MUST be removed immediately
- Type definitions MUST be exported from core package for reuse
- No `any` types except when interfacing with truly dynamic third-party code

**Rationale**: Type safety prevents entire classes of bugs and improves developer experience through better IDE support and refactoring capabilities.

### II. Monorepo Architecture
The project MUST be organized as a monorepo with clear package boundaries and shared dependencies.
- Yarn workspaces for dependency management (never npm)
- Turborepo or similar for build orchestration and caching
- Core package contains shared types, schemas, and utilities
- Plugins are independent packages that extend core functionality
- Each package has clear ownership and purpose
- Circular dependencies are strictly forbidden

**Rationale**: Monorepo architecture enables atomic commits across packages, simplifies version management, and facilitates code sharing while maintaining modularity.

### III. Plugin-Based Extensibility (NON-NEGOTIABLE)
The platform MUST support a plugin architecture enabling community contributions.
- Base SDK defines plugin interface and lifecycle hooks
- Plugins discover and report framework-specific metadata (routes, dependencies, etc.)
- Plugins MUST be framework/language agnostic in data model
- Plugin registry allows discovery and version management
- Clear plugin development documentation and examples required
- First-class plugin: Express.js (for MVP validation)

**Rationale**: Open plugin architecture accelerates adoption, enables community contributions, and ensures Lattice can adapt to any technology stack.

### IV. Comprehensive Testing
All code MUST have comprehensive test coverage before merging.
- Unit tests for all business logic (minimum 80% coverage)
- Integration tests for plugin interactions with real frameworks
- End-to-end tests for critical user workflows (visualization, discovery)
- Test data MUST include realistic microservice architectures
- Performance benchmarks for large-scale service graphs (>100 services)

**Rationale**: Service discovery is mission-critical infrastructure. Bugs can lead to incorrect architecture documentation and failed integrations.

### V. Developer Experience (DX)
Every API and tool MUST prioritize ease of use and clarity.
- Simple configuration with sensible defaults (zero-config preferred)
- Clear error messages with actionable remediation steps
- Comprehensive documentation with real-world examples
- TypeScript types serve as inline documentation
- CLI commands follow consistent patterns and conventions
- Progressive disclosure: simple use cases are simple, complex ones possible

**Rationale**: Developers will only adopt Lattice if integration is frictionless. DX is a competitive advantage.

### VI. Spec-Driven Development
All features MUST be specified before implementation using spec-kit methodology.
- Specifications written and approved before coding begins
- Technical plans reviewed for alignment with constitution
- Implementation validated against specifications
- Specifications serve as living documentation
- Breaking changes require spec amendments first

**Rationale**: Specifications prevent rework, ensure shared understanding, and create audit trails for architectural decisions.

### VII. Data Model Uniformity
Service metadata MUST use a unified schema regardless of source language/framework.
- Core schema defines Service, Route, Dependency, Package entities
- Schema versioning follows semantic versioning
- Plugins translate framework-specific data to core schema
- Cross-language compatibility tested (Node.js ↔ Python minimum for MVP+1)
- JSON Schema published for third-party integrations

**Rationale**: Uniform data enables heterogeneous architectures to be visualized in a single coherent graph.

## Technology Stack

### Required Technologies
- **Language**: TypeScript 5.0+ for all application code
- **Monorepo**: Yarn workspaces (NOT npm)
- **Build System**: Turborepo for caching and parallel execution
- **Testing**: Vitest for unit/integration tests
- **API Framework**: Next.js with API routes or tRPC for type-safe APIs
- **Database**: PostgreSQL for relational metadata, Redis for caching
- **Visualization**: React + D3.js or Cytoscape.js for graph rendering
- **Container Runtime**: Docker for sidecar collector deployment

### Allowed Variations
- Plugin authors may use any language for plugin runtime
- Plugins communicate via JSON over HTTP/stdin
- Documentation may use Markdown, MDX, or similar

### Prohibited
- npm for package management (use Yarn)
- JavaScript without TypeScript compilation
- Makefile commands executed by agents (user runs manually)

## Development Workflow

### Pre-Implementation
1. Create or update specification using `/speckit.specify`
2. Generate technical plan using `/speckit.plan`
3. Review plan for constitution compliance
4. Generate implementation tasks using `/speckit.tasks`

### Implementation
1. Write tests first (TDD when applicable)
2. Implement feature following specification
3. Validate all tests pass
4. Update documentation if APIs changed
5. Run linter and type checker
6. Request code review

### Code Review
- At least one approval required
- Constitution compliance verified
- Test coverage checked
- Breaking changes flagged and justified

### Deployment
- Automated CI/CD pipelines required
- Staging environment mirrors production
- Feature flags for gradual rollouts
- Rollback plan documented

## Governance

This constitution supersedes all other development practices. Any deviation MUST be explicitly justified and documented.

### Amendment Process
1. Propose amendment with rationale in specification
2. Review impact on existing code and APIs
3. Update constitution version (MAJOR for breaking changes, MINOR for additions, PATCH for clarifications)
4. Update dependent templates and documentation
5. Communicate changes to all contributors

### Compliance
- All pull requests MUST verify constitution compliance
- Complexity MUST be justified against simplicity principle
- Breaking changes require migration guides
- Use `.specify/memory/` for development guidance artifacts

### Version Management
- Constitution follows semantic versioning
- Breaking governance changes increment MAJOR version
- New principles or expanded guidance increment MINOR version
- Clarifications and wording improvements increment PATCH version

**Version**: 1.0.0 | **Ratified**: 2025-10-09 | **Last Amended**: 2025-10-09
