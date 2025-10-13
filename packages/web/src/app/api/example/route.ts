/**
 * Example API Route demonstrating logger usage
 *
 * The logger is initialized in instrumentation.ts before this code runs,
 * so it's safe to use getLogger() anywhere in your Server Components or API Routes.
 */

import { NextResponse } from 'next/server'
import { getLogger } from '@/lib/logging'

export async function GET(request: Request) {
  const logger = getLogger()

  // Log request received
  if ('info' in logger && typeof logger.info === 'function') {
    logger.info('API request received', {
      path: request.url,
      method: request.method,
      userAgent: request.headers.get('user-agent'),
    })
  }

  try {
    // Your logic here
    const data = {
      message: 'Hello from Lattice!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    }

    // Log successful response
    if ('info' in logger && typeof logger.info === 'function') {
      logger.info('API request successful', {
        responseData: data,
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    // Log error
    if ('error' in logger && typeof logger.error === 'function') {
      logger.error('API request failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      })
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
