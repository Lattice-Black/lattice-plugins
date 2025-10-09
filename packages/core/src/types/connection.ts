/**
 * Connection entity - Represents a detected communication link between two services
 */
export interface Connection {
  // Identity
  id: string;

  // Service Relationship
  sourceServiceId: string;
  targetServiceId: string;

  // Route Details
  targetRouteId?: string;
  method: string;
  path: string;

  // Traffic Metrics
  callCount: number;
  avgResponseTimeMs?: number;
  p95ResponseTimeMs?: number;
  p99ResponseTimeMs?: number;

  // Reliability
  successCount: number;
  errorCount: number;
  errorRate: number;

  // Pattern Analysis
  requestFrequency?: number;
  peakTime?: string;

  // Tracking
  firstSeen: Date;
  lastSeen: Date;

  // Tracing
  sampleTraceIds?: string[];

  // Extensibility
  metadata?: Record<string, unknown>;
}
