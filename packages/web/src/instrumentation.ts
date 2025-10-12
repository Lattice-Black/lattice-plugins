/**
 * Instrumentation for Lattice service discovery
 *
 * NOTE: This doesn't work reliably in Vercel's serverless environment.
 * We use the CLI tool in postbuild script instead (see package.json).
 *
 * Keeping this file for local development and other deployment environments.
 */

export async function register() {
  // Disabled for Vercel - using CLI tool in postbuild instead
  // See package.json: "postbuild": "lattice-next --service-name=lattice-web"
  console.log('ℹ️  Lattice instrumentation hook (disabled - using CLI tool in postbuild)')
}
