# Solution Summary: Fixing Next.js Webpack Bundling Errors

## Problem Statement

Users installing `@lattice.black/plugin-nextjs` were experiencing webpack bundling errors when using the package in their Next.js applications:

```
Module not found: Can't resolve 'node:fs'
Module not found: Can't resolve 'node:path'
```

This happened even though:
- The plugin had `import 'server-only'` at the top
- Users added it to `serverComponentsExternalPackages` in next.config.js
- The code checked for `NEXT_RUNTIME === 'nodejs'`

## Root Cause

The package was compiled to **CommonJS format**, which Next.js webpack sometimes attempts to bundle for client-side code. The bundler would encounter Node.js-specific APIs (fs, path, glob) and fail because these don't exist in browser environments.

## The Complete Solution

### 1. Changed Package Format from CommonJS to ESM

**Before (CommonJS):**
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node"
  }
}
```

**After (ESM):**
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

### 2. Updated package.json Configuration

**Before:**
```json
{
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  }
}
```

**After:**
```json
{
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "node": "./dist/index.js",
      "default": "./dist/index.js"
    }
  }
}
```

**Key Changes:**
- Added `"type": "module"` to declare the package as ESM
- Added `"node"` export condition to signal this is Node.js-only code
- Modern bundlers respect these signals and won't attempt browser bundling

### 3. Updated Import Syntax

**Before (CommonJS-style):**
```typescript
import * as path from 'node:path';
import * as fs from 'node:fs';
```

**After (ESM-style):**
```typescript
import path from 'node:path';
import fs from 'node:fs';
```

### 4. User Configuration Requirements

Users MUST add to their `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  serverComponentsExternalPackages: ['@lattice.black/plugin-nextjs'],
};

export default nextConfig;
```

## Why This Works

### 1. ESM is More Explicit About Module Type
- ESM packages declare their module type clearly with `"type": "module"`
- Bundlers treat ESM packages differently from CommonJS
- Less ambiguity means better tree-shaking and external handling

### 2. Export Conditions Signal Intent
- The `"node"` export condition tells bundlers: "This code is Node.js-only"
- Combined with `serverComponentsExternalPackages`, Next.js knows to NEVER bundle this code
- Modern bundlers (webpack 5+, Turbopack) respect these conditions

### 3. `server-only` Package Works Better with ESM
- The `server-only` package uses export conditions to throw errors on client import
- Works more reliably with ESM than CommonJS

### 4. Multiple Layers of Protection

The solution creates multiple defensive layers:

```
Layer 1: "type": "module" in package.json
         ↓ (Declares ESM format)

Layer 2: "node" export condition
         ↓ (Signals Node.js-only)

Layer 3: import 'server-only'
         ↓ (Runtime check)

Layer 4: serverComponentsExternalPackages
         ↓ (Next.js config)

Layer 5: NEXT_RUNTIME === 'nodejs' check
         ↓ (User code guard)

Result: Package never gets bundled for browser
```

## Technical Details

### Module Resolution in Modern Bundlers

When a bundler encounters an import:

```typescript
import { LatticeNextPlugin } from '@lattice.black/plugin-nextjs';
```

It checks package.json in this order:

1. `"exports"` field → finds `"node"` condition → uses Node.js-only path
2. Sees `"type": "module"` → treats as ESM, not CommonJS
3. Checks `serverComponentsExternalPackages` in Next.js config
4. Decision: Don't bundle, treat as external dependency

### Output Comparison

**CommonJS Output (Old):**
```javascript
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("node:path");
const fs = require("node:fs");
class LatticeNextPlugin { ... }
exports.LatticeNextPlugin = LatticeNextPlugin;
```

**ESM Output (New):**
```javascript
import 'server-only';
import { glob } from 'glob';
import path from 'node:path';
import fs from 'node:fs';
export class LatticeNextPlugin { ... }
```

### Why CommonJS Failed

With CommonJS, Next.js webpack would:
1. See a `require('node:fs')` statement
2. Try to resolve it for the browser bundle
3. Fail because `node:fs` doesn't exist in browser
4. Throw "Module not found" error

With ESM, Next.js webpack:
1. Sees ESM `import` statements
2. Checks export conditions → finds `"node"`
3. Checks `serverComponentsExternalPackages` config
4. Marks package as external, doesn't bundle it

## Best Practices for Server-Only Next.js Packages

Based on this solution, here are best practices:

### 1. Use ESM Format
```json
{
  "type": "module"
}
```

### 2. Add Export Conditions
```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "node": "./dist/index.js",
      "default": "./dist/index.js"
    }
  }
}
```

### 3. Import 'server-only'
```typescript
import 'server-only';
```

### 4. Document Required Config
Clearly tell users to add:
```javascript
serverComponentsExternalPackages: ['your-package-name']
```

### 5. Use Runtime Checks
```typescript
if (process.env.NEXT_RUNTIME === 'nodejs') {
  // Your server-only code
}
```

## Testing the Fix

To verify the fix works:

1. Publish the package (or use `yarn link`)
2. Create a fresh Next.js 14 app
3. Install the package
4. Add to `serverComponentsExternalPackages`
5. Create `instrumentation.ts` with the plugin
6. Run `next build`
7. Verify: No "Module not found" errors

## Version History

- **v0.1.x**: CommonJS format, bundling issues
- **v0.2.0**: ESM format, proper export conditions, bundling fixed

## References

- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Node.js Package Exports](https://nodejs.org/api/packages.html#package-entry-points)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [webpack externals](https://webpack.js.org/configuration/externals/)
