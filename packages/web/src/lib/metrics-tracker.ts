/**
 * Metrics tracker for Next.js API routes
 *
 * Tracks request metrics and submits them to Lattice API
 * Similar to the Express MetricsTracker but adapted for Next.js
 */

interface RequestMetric {
  method: string
  path: string
  statusCode: number
  responseTime: number
  timestamp: Date
  callerServiceName?: string
}

export class MetricsTracker {
  private metrics: RequestMetric[] = []
  private maxMetrics = 1000
  private batchSize = 10
  private submitting = false

  constructor(
    private serviceName: string,
    private apiEndpoint: string,
    private apiKey?: string
  ) {}

  /**
   * Track a request metric
   */
  track(metric: RequestMetric): void {
    this.metrics.push(metric)

    // Keep only last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }

    // Submit every N requests
    if (this.metrics.length % this.batchSize === 0) {
      void this.submitMetrics()
    }
  }

  /**
   * Submit metrics to Lattice API
   */
  private async submitMetrics(): Promise<void> {
    // Prevent concurrent submissions
    if (this.submitting || this.metrics.length === 0) {
      return
    }

    this.submitting = true

    try {
      const metricsToSend = this.metrics.slice(-this.batchSize)

      const response = await fetch(`${this.apiEndpoint}/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'X-API-Key': this.apiKey }),
        },
        body: JSON.stringify({
          serviceName: this.serviceName,
          metrics: metricsToSend,
        }),
      })

      if (response.ok) {
        const result = await response.json() as { inserted?: number }
        console.log(`[MetricsTracker] Submitted ${result.inserted ?? 0} metrics`)
      } else {
        console.error(`[MetricsTracker] Failed to submit metrics: ${response.statusText}`)
      }
    } catch (error) {
      // Silently fail - don't break the app
      console.error('[MetricsTracker] Error submitting metrics:', error)
    } finally {
      this.submitting = false
    }
  }

  /**
   * Get current statistics
   */
  getStats() {
    const totalRequests = this.metrics.length
    const avgResponseTime = this.metrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests || 0
    const errorCount = this.metrics.filter(m => m.statusCode >= 400).length
    const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0

    return {
      totalRequests,
      avgResponseTime: Math.round(avgResponseTime),
      errorCount,
      errorRate: errorRate.toFixed(2),
    }
  }
}

// Global metrics tracker instance
let globalTracker: MetricsTracker | null = null

/**
 * Initialize global metrics tracker
 */
export function initMetricsTracker(config: {
  serviceName: string
  apiEndpoint: string
  apiKey?: string
}): MetricsTracker {
  if (!globalTracker) {
    globalTracker = new MetricsTracker(
      config.serviceName,
      config.apiEndpoint,
      config.apiKey
    )
  }
  return globalTracker
}

/**
 * Get global metrics tracker instance
 */
export function getMetricsTracker(): MetricsTracker | null {
  return globalTracker
}
