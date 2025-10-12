# Live Metrics Implementation Guide

## Current State Analysis

### ✅ What We Have (Already Built)

1. **Metrics Tracking Middleware** (`packages/plugin-express/src/middleware/metrics-tracker.ts`)
   - Tracks method, path, status code, response time, timestamp
   - In-memory buffer (last 1000 requests)
   - Auto-submits every 10 requests to API
   - Calculate stats: avg response time, error rate, total requests

2. **Metrics API Endpoints** (`packages/api/src/routes/metrics.ts`)
   - `POST /metrics` - Receive metrics from services (API key auth)
   - `GET /metrics/stats` - Aggregated statistics (Supabase auth)
   - `GET /metrics/connections` - Inter-service connections
   - `GET /metrics/recent/:serviceName` - Recent metrics

3. **Database Table** (`service_metrics`)
   ```sql
   - id (text, primary key)
   - service_id (text, foreign key to services)
   - method (text)
   - path (text)
   - status_code (integer)
   - response_time_ms (integer)
   - caller_service_name (text)
   - timestamp (timestamptz)
   ```
   - Indexed on: service_id, path, timestamp, caller_service_name
   - RLS policies for multi-tenancy

### ❌ What's Missing

1. **Express Plugin Not Using MetricsTracker**
   - The middleware exists but isn't instantiated or attached
   - Need to activate in `LatticePlugin` class

2. **Web App Not Fetching Metrics**
   - Service detail pages don't call metrics APIs
   - No UI components to display metrics data

3. **Real-Time Updates**
   - Currently batch/polling only
   - Could add WebSocket or Server-Sent Events for live updates

4. **Per-Route Metrics Display**
   - Routes table shows static discovery data
   - Should show: request count, avg response time, error rate per route

## How APM Tools Work (Industry Research)

### DataDog & New Relic Approach
- Auto-instrumentation via language agents (Java, Node.js, Python, etc.)
- Middleware wraps all requests to capture timing
- Metrics pushed to centralized collector
- Time-series database for storage (InfluxDB, Prometheus)
- Pre-aggregation for performance (1min, 5min, 1hr buckets)

### Key Metrics They Track (RED Method)
- **Rate**: Requests per second
- **Errors**: Error rate percentage
- **Duration**: Response time (p50, p95, p99)

Additional:
- Throughput (requests/min)
- Apdex score (user satisfaction)
- CPU/Memory usage
- Database query times

### Storage Best Practices
**PostgreSQL** (what we use):
- Good for: Historical data, complex queries, structured storage
- Bad for: High-frequency writes, real-time aggregation
- Solution: Buffer writes, batch insert, use time-based partitioning

**Redis** (we have it available):
- Good for: Real-time data, fast reads/writes, recent metrics
- Bad for: Long-term storage (expensive RAM), complex queries
- Solution: Use as hot cache for last 15min of data

**Hybrid Approach** (Recommended):
1. Services push metrics to API
2. API writes to Redis (fast, recent data)
3. Background job aggregates Redis → PostgreSQL every 1-5 minutes
4. Web app reads from Redis for real-time, PostgreSQL for historical

## Implementation Plan

### Phase 1: Activate Existing Infrastructure (Quick Win)

#### 1.1 Enable MetricsTracker in Express Plugin

```typescript
// packages/plugin-express/src/index.ts

export class LatticePlugin {
  private metricsTracker: MetricsTracker;

  constructor(config?: LatticeConfig) {
    // ... existing code

    // Initialize metrics tracker
    this.metricsTracker = new MetricsTracker(
      this.config.serviceName,
      this.config.apiEndpoint,
      this.config.apiKey || ''
    );
  }

  // Add method to get metrics middleware
  createMetricsMiddleware() {
    return this.metricsTracker.middleware();
  }
}
```

#### 1.2 Use Middleware in lattice-api

```typescript
// packages/api/src/index.ts

const lattice = new LatticePlugin({ ... });

// Add AFTER routes are defined, BEFORE error handlers
app.use(lattice.createMetricsMiddleware());
```

#### 1.3 Update Web App to Fetch Metrics

```typescript
// packages/web/src/lib/api.ts

export async function fetchServiceMetrics(serviceId: string) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(
    `${API_BASE_URL}/metrics/stats?serviceId=${serviceId}`,
    {
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
      },
    }
  );

  return response.json();
}

export async function fetchRouteMetrics(serviceName: string, limit = 100) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(
    `${API_BASE_URL}/metrics/recent/${serviceName}?limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
      },
    }
  );

  return response.json();
}
```

#### 1.4 Display Metrics on Service Detail Page

Add to `packages/web/src/app/dashboard/services/[id]/page.tsx`:

```typescript
// Fetch metrics alongside service data
const [metrics, routeMetrics] = await Promise.all([
  fetchServiceMetrics(id),
  fetchRouteMetrics(service.name)
]);

// Calculate per-route stats
const routeStats = routeMetrics.reduce((acc, metric) => {
  const key = `${metric.method} ${metric.path}`;
  if (!acc[key]) {
    acc[key] = {
      count: 0,
      totalTime: 0,
      errors: 0,
    };
  }
  acc[key].count++;
  acc[key].totalTime += metric.response_time_ms;
  if (metric.status_code >= 400) acc[key].errors++;
  return acc;
}, {});

// Add to routes table:
// - Request Count
// - Avg Response Time
// - Error Rate
// - Last Request (already have)
```

### Phase 2: Enhanced Metrics (Next Steps)

#### 2.1 Add Percentile Calculations
- p50, p95, p99 response times
- Use PostgreSQL window functions or calculate in-memory

#### 2.2 Time-Series Charts
- Use Recharts or Chart.js
- Show requests/min over time
- Response time trends
- Error rate over time

#### 2.3 Real-Time Updates
- WebSocket connection for live metrics
- Server-Sent Events (simpler)
- Auto-refresh every 5-30 seconds

#### 2.4 Service Health Scoring
- Combine uptime, error rate, response time
- Traffic light: 🟢 Healthy, 🟡 Degraded, 🔴 Down
- Show on service cards

### Phase 3: Advanced Features

#### 3.1 Redis Integration
- Store last 15min of metrics in Redis
- Fast read for real-time dashboard
- Background job flushes to PostgreSQL

#### 3.2 Alerting
- Define thresholds (error rate > 5%, response time > 500ms)
- Email/webhook notifications
- Alert history

#### 3.3 Distributed Tracing
- Trace ID propagation
- Request journey across services
- Similar to Jaeger/Zipkin

#### 3.4 Custom Metrics
- Allow services to send custom metrics
- Business metrics (signups, revenue, etc.)
- CPU/memory monitoring

## Quick Start: Enable Metrics Today

1. **Update Express Plugin** - Enable MetricsTracker
2. **Deploy to Railway** - Start collecting data
3. **Wait 5-10 minutes** - Let metrics accumulate
4. **Query Metrics API** - Test with curl/Postman
5. **Build UI Components** - Display on service detail pages

## Database Queries for Metrics

```sql
-- Get recent metrics for a service
SELECT
  method,
  path,
  status_code,
  response_time_ms,
  timestamp
FROM service_metrics
WHERE service_id = 'SERVICE_ID'
ORDER BY timestamp DESC
LIMIT 100;

-- Aggregate stats per route
SELECT
  method,
  path,
  COUNT(*) as request_count,
  AVG(response_time_ms) as avg_response_time,
  MAX(response_time_ms) as max_response_time,
  COUNT(*) FILTER (WHERE status_code >= 400) as error_count,
  COUNT(*) FILTER (WHERE status_code >= 400)::float / COUNT(*) * 100 as error_rate
FROM service_metrics
WHERE service_id = 'SERVICE_ID'
  AND timestamp > NOW() - INTERVAL '24 hours'
GROUP BY method, path
ORDER BY request_count DESC;

-- Service-level aggregates
SELECT
  COUNT(*) as total_requests,
  AVG(response_time_ms) as avg_response_time,
  COUNT(*) FILTER (WHERE status_code >= 400) as error_count,
  COUNT(*) FILTER (WHERE status_code >= 400)::float / COUNT(*) * 100 as error_rate
FROM service_metrics sm
JOIN services s ON s.id = sm.service_id
WHERE s.user_id = 'USER_ID'
  AND sm.timestamp > NOW() - INTERVAL '1 hour';
```

## Example Metrics Display

```
Routes (21)                                    Requests    Avg Time    Error Rate
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GET  /api/v1/services                         1,234       45ms        0.2%
POST /api/v1/metadata                         456         120ms       1.5%
GET  /api/v1/services/:id                     789         32ms        0.1%
...
```

## References

- [Express response-time middleware](https://expressjs.com/en/resources/middleware/response-time.html)
- [Prometheus Express middleware](https://www.npmjs.com/package/express-prometheus-middleware)
- [Redis Time Series](https://redis.io/docs/latest/develop/data-types/timeseries/)
- [DataDog APM Documentation](https://docs.datadoghq.com/tracing/)
- [OpenTelemetry](https://opentelemetry.io/)
