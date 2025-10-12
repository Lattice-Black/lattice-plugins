# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-10-11

### Changed

- **BREAKING**: Package now uses ESM format instead of CommonJS
- Converted TypeScript compilation from CommonJS to ESM (`module: "ESNext"`)
- Updated `moduleResolution` to "bundler" for better compatibility with modern bundlers
- Changed import statements from namespace imports (`import * as path`) to default imports (`import path`)

### Added

- Added `"type": "module"` to package.json to declare ESM package
- Added `"node"` export condition to package.json exports for better bundler support
- Created USER_GUIDE.md with comprehensive setup instructions
- Created MIGRATION.md with upgrade guide from v0.1.x to v0.2.0
- Created CHANGELOG.md to track version history

### Fixed

- **Fixed webpack bundling errors** ("Module not found: Can't resolve 'node:fs'")
  - The package now properly declares itself as Node.js-only via export conditions
  - ESM format prevents Next.js from attempting to bundle for browser
  - When combined with `serverComponentsExternalPackages` config, webpack no longer tries to resolve Node.js modules

### Documentation

- Updated README.md with critical webpack configuration requirements
- Added emphasis on `serverComponentsExternalPackages` configuration requirement
- Improved code examples with proper ESM syntax
- Added troubleshooting section for common issues

## [0.1.1] - 2025-10-10

### Fixed

- Minor bug fixes and improvements

## [0.1.0] - 2025-10-09

### Added

- Initial release
- Automatic discovery of Next.js API routes
- Dependency analysis from package.json
- Integration with Lattice control plane
- Support for Next.js 13+ App Router
- Instrumentation hook support
- Server-only execution with runtime checks
