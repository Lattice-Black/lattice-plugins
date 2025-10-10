import { Request, Response, NextFunction } from 'express';

export interface RequestMetrics {
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  serviceName?: string;
}

export class MetricsTracker {
  private metrics: RequestMetrics[] = [];
  private maxMetrics = 1000; // Keep last 1000 requests

  constructor(private serviceName: string, private apiEndpoint: string) {}

  middleware() {
    const self = this;
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();

      // Capture the original end function
      const originalEnd = res.end;

      // Override res.end to capture metrics
      res.end = function (...args: any[]): Response {
        const responseTime = Date.now() - startTime;

        const metric: RequestMetrics = {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          responseTime,
          timestamp: new Date(),
          serviceName: req.get('X-Service-Name'),
        };

        // Store metric
        self.storeMetric(metric);

        // Submit to API periodically
        self.submitMetrics();

        // Call original end
        return (originalEnd as any).apply(this, args);
      };

      next();
    };
  }

  private storeMetric(metric: RequestMetrics) {
    this.metrics.push(metric);

    // Keep only last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  private async submitMetrics() {
    // Submit every 10 requests
    if (this.metrics.length % 10 === 0) {
      const metricsToSend = [...this.metrics];

      try {
        await fetch(`${this.apiEndpoint}/metrics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceName: this.serviceName,
            metrics: metricsToSend.slice(-10), // Send last 10
          }),
        });
      } catch (error) {
        // Silently fail - don't break the app
        console.error('Failed to submit metrics:', error);
      }
    }
  }

  getStats() {
    const totalRequests = this.metrics.length;
    const avgResponseTime = this.metrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests || 0;
    const errorCount = this.metrics.filter(m => m.statusCode >= 400).length;
    const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;

    return {
      totalRequests,
      avgResponseTime: Math.round(avgResponseTime),
      errorCount,
      errorRate: errorRate.toFixed(2),
      recentRequests: this.metrics.slice(-10),
    };
  }
}
