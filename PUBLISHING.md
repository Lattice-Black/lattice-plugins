# Publishing Lattice Plugins to npm

## Setup (One-time)

1. **Create an npm account** at https://www.npmjs.com/signup

2. **Login to npm from command line:**
   ```bash
   npm login
   ```

3. **Verify you're logged in:**
   ```bash
   npm whoami
   ```

## Publishing Packages

### Build and Publish All Packages

```bash
# From the root of the lattice project
cd /path/to/lattice

# Build all packages
yarn build

# Publish core (must be first - other packages depend on it)
cd packages/core
npm publish
cd ../..

# Publish Express plugin
cd packages/plugin-express
npm publish
cd ../..

# Publish Next.js plugin
cd packages/plugin-nextjs
npm publish
cd ../..
```

### Version Bumping

Before publishing updates, bump the version:

```bash
# In each package directory (packages/core, packages/plugin-express, etc.)
npm version patch  # 0.1.0 -> 0.1.1 (bug fixes)
npm version minor  # 0.1.0 -> 0.2.0 (new features)
npm version major  # 0.1.0 -> 1.0.0 (breaking changes)
```

## After Publishing

Users can now install packages **without any authentication**:

```bash
# Install Express plugin
npm install @caryyon/plugin-express
# or
yarn add @caryyon/plugin-express

# Install Next.js plugin
npm install @caryyon/plugin-nextjs
# or
yarn add @caryyon/plugin-nextjs
```

**No .npmrc configuration needed!** ✅

## Verifying Published Packages

Check if packages are published:
- https://www.npmjs.com/package/@caryyon/core
- https://www.npmjs.com/package/@caryyon/plugin-express
- https://www.npmjs.com/package/@caryyon/plugin-nextjs

## Troubleshooting

### "You do not have permission to publish"
Make sure you're logged in with the correct npm account:
```bash
npm logout
npm login
```

### "Package name already exists"
The @caryyon scope must be available. If not, you may need to:
1. Create an organization on npm: https://www.npmjs.com/org/create
2. Use a different scope name (update all package.json files)

### Publishing new versions
Always bump the version before publishing:
```bash
npm version patch
npm publish
```
