import pino, { Logger } from 'pino'

let logger: Logger | null = null

interface LoggerConfig {
  level: string
  service: string
  environment: string
}

/**
 * Initialize global logger instance
 * - Must be called in instrumentation.ts BEFORE any other code
 * - Only works in Node.js runtime
 */
export async function initLogger(config: LoggerConfig): Promise<Logger> {
  if (logger) {
    return logger // Already initialized
  }

  const isProduction = config.environment === 'production'

  logger = pino({
    level: config.level,
    base: {
      service: config.service,
      env: config.environment,
    },
    // Production: JSON output for log aggregation
    // Development: Pretty-print for readability
    transport: isProduction
      ? undefined
      : {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
    // Format timestamps in ISO format
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
  })

  return logger
}

/**
 * Get logger instance (safe - returns console if not initialized)
 */
export function getLogger(): Logger | Console {
  if (!logger) {
    // Fallback to console if logger not initialized
    return console
  }
  return logger
}

/**
 * Log error with full context
 */
export async function logError(context: {
  error: Error
  digest?: string
  path?: string
  method?: string
  [key: string]: unknown
}): Promise<void> {
  const log = getLogger()

  if ('error' in log && typeof log.error === 'function') {
    log.error({
      msg: context.error.message,
      stack: context.error.stack,
      digest: context.digest,
      path: context.path,
      method: context.method,
    })
  } else {
    console.error('Error:', context)
  }
}
