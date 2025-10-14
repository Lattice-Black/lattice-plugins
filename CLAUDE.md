# Lattice Plugins Development Guidelines

## Active Technologies
- TypeScript 5.0+ (strict mode enabled across all packages)
- Yarn workspaces for monorepo management
- Turborepo for build orchestration
- Vitest for testing

## Project Structure
```
packages/
├── core/              - Core types and validators
├── plugin-express/    - Express.js plugin
└── plugin-nextjs/     - Next.js plugin
```

## Commands
- `yarn build` - Build all packages
- `yarn dev` - Watch mode for development
- `yarn test` - Run tests
- `yarn lint` - Lint all packages

## Code Style
- TypeScript 5.0+ (strict mode enabled)
- Follow standard TypeScript conventions
- Use explicit return types
- Avoid `any` types

## Publishing
Packages are published to npm under `@lattice.black` scope:
- @lattice.black/core
- @lattice.black/plugin-express
- @lattice.black/plugin-nextjs

All packages use `"access": "public"` in publishConfig.
