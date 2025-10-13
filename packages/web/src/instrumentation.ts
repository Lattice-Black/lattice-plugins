/**
 * Next.js Instrumentation Hook
 *
 * This runs ONCE when the Next.js server starts, before any routes are loaded.
 * Perfect for initializing logging and monitoring.
 *
 * NOTE: Service discovery uses CLI tool in postbuild (see package.json)
 * This is the recommended approach for Vercel to avoid cold start penalties.
 */

/**
 * register() - Called once when Next.js server starts
 * - Runs before any routes are initialized
 * - Can be async
 */
export async function register() {
  // Only run in Node.js runtime (not Edge runtime)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🚀 Initializing Next.js server instrumentation...')

    try {
      // Initialize logging infrastructure
      await initializeLogging()

      // Initialize metrics tracking
      await initializeMetrics()

      console.log('✅ Server instrumentation complete')
    } catch (error) {
      // Don't throw - log and continue (server should still start)
      console.error('❌ Failed to initialize instrumentation:', error)
    }
  }
}

/**
 * Initialize logging infrastructure
 * - Must run BEFORE any other code that uses logging
 * - Sets up global logger instance
 */
async function initializeLogging() {
  try {
    // Dynamic import to avoid bundling issues
    const { initLogger } = await import('./lib/logging')

    initLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      service: 'lattice-web',
      environment: process.env.NODE_ENV || 'development',
    })

    console.log('📝 Logging initialized')
  } catch (error) {
    console.error('Failed to initialize logging:', error)
  }
}

/**
 * Initialize metrics tracking
 * - Tracks API route performance and submits to Lattice API
 * - Requires LATTICE_API_ENDPOINT and optionally LATTICE_API_KEY
 */
async function initializeMetrics() {
  try {
    // Dynamic import to avoid bundling issues
    const { initMetricsTracker } = await import('./lib/metrics-tracker')
    const { initHttpInterceptor } = await import('./lib/http-interceptor')

    const apiEndpoint = process.env.LATTICE_API_ENDPOINT || 'https://lattice-production.up.railway.app/api/v1'
    const apiKey = process.env.LATTICE_API_KEY
    const serviceName = 'lattice-web'

    if (!apiKey) {
      console.warn('⚠️  LATTICE_API_KEY not set - metrics will be submitted without authentication')
    }

    initMetricsTracker({
      serviceName,
      apiEndpoint,
      apiKey,
    })

    // Initialize HTTP interceptor for outgoing requests
    initHttpInterceptor(serviceName)

    console.log('📊 Metrics tracking and HTTP interceptor initialized')
  } catch (error) {
    console.error('Failed to initialize metrics tracking:', error)
  }
}
