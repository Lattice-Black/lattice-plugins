# Publishing Plugins to GitHub Packages

This guide explains how to publish the Lattice plugins (`@lattice/plugin-express` and `@lattice/plugin-nextjs`) to GitHub Packages.

## Prerequisites

1. **GitHub Personal Access Token (PAT)**
   - Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Create a new token with `write:packages` and `read:packages` permissions
   - Save the token securely

2. **Local Authentication**
   ```bash
   # Add to your shell profile (~/.bashrc, ~/.zshrc, etc.)
   export NODE_AUTH_TOKEN=your_github_token_here
   ```

## Configuration

The plugins are already configured for GitHub Packages:

- **package.json**: Both plugins have `publishConfig` pointing to GitHub Packages registry
- **.npmrc**: Root-level configuration routes `@lattice` scope to GitHub Packages
- **GitHub Actions**: Automated workflow for publishing on tag push

## Publishing Methods

### Method 1: Automated via GitHub Actions (Recommended)

1. **Create and push a version tag:**
   ```bash
   # Update version in both plugin package.json files first
   cd packages/plugin-express
   # Edit package.json version to e.g., 0.1.1

   cd ../plugin-nextjs
   # Edit package.json version to match

   # Commit changes
   git add .
   git commit -m "Bump plugin versions to 0.1.1"

   # Create and push tag
   git tag v0.1.1
   git push origin main --tags
   ```

2. The GitHub Actions workflow will automatically:
   - Build both plugins
   - Publish to GitHub Packages

### Method 2: Manual Workflow Dispatch

1. Go to GitHub Actions tab in the repository
2. Select "Publish Plugins" workflow
3. Click "Run workflow"
4. Enter the version number
5. Click "Run workflow" button

### Method 3: Manual Local Publishing

1. **Authenticate:**
   ```bash
   export NODE_AUTH_TOKEN=your_github_token_here
   ```

2. **Build and publish plugin-express:**
   ```bash
   cd packages/plugin-express
   yarn build
   yarn publish --access public
   ```

3. **Build and publish plugin-nextjs:**
   ```bash
   cd packages/plugin-nextjs
   yarn build
   yarn publish --access public
   ```

## Installing Published Plugins

Users can install the published plugins:

```bash
# Configure npm to use GitHub Packages for @lattice scope
echo "@lattice:registry=https://npm.pkg.github.com" >> .npmrc

# Install plugins
yarn add @lattice/plugin-express
yarn add @lattice/plugin-nextjs
```

For private packages, users need to authenticate:
```bash
echo "//npm.pkg.github.com/:_authToken=YOUR_TOKEN" >> .npmrc
```

## Versioning

Follow semantic versioning (semver):
- **Patch** (0.1.x): Bug fixes
- **Minor** (0.x.0): New features, backwards compatible
- **Major** (x.0.0): Breaking changes

## Troubleshooting

### Authentication Issues
- Ensure `NODE_AUTH_TOKEN` environment variable is set
- Verify token has `write:packages` permission
- Check `.npmrc` configuration is correct

### Build Failures
- Run `yarn build` locally first to catch TypeScript errors
- Ensure all dependencies are installed: `yarn install`

### Package Not Found After Publishing
- Wait a few minutes for GitHub Packages to index
- Verify package visibility settings on GitHub
- Check that package name matches `@lattice/plugin-*` format
