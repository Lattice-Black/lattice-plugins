/**
 * Example API Route demonstrating logger usage
 *
 * The logger is initialized in instrumentation.ts before this code runs,
 * so it's safe to use getLogger() anywhere in your Server Components or API Routes.
 */

import { NextResponse } from 'next/server'
import { getLogger } from '@/lib/logging'

export function GET(request: Request) {
  const logger = getLogger()

  // Log request received (pino format: message, data object)
  logger.info({
    msg: 'API request received',
    path: request.url,
    method: request.method,
    userAgent: request.headers.get('user-agent'),
  })

  try {
    // Your logic here
    const data = {
      message: 'Hello from Lattice!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    }

    // Log successful response
    logger.info({
      msg: 'API request successful',
      responseData: data,
    })

    return NextResponse.json(data)
  } catch (error) {
    // Log error
    logger.error({
      msg: 'API request failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
