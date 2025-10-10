-- Migration: Add metrics tracking
-- Created: 2025-01-10

-- Create ServiceMetric table for real-time request tracking
CREATE TABLE IF NOT EXISTS "ServiceMetric" (
  id TEXT PRIMARY KEY DEFAULT ('met_' || substr(md5(random()::text || clock_timestamp()::text), 1, 24)),
  service_id TEXT NOT NULL REFERENCES "Service"(id) ON DELETE CASCADE,

  -- Request details
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER NOT NULL,

  -- Inter-service tracking
  caller_service_name TEXT,

  -- Timestamps
  timestamp TIMESTAMP DEFAULT NOW(),

  -- Indexes for fast queries
  CONSTRAINT fk_service FOREIGN KEY (service_id) REFERENCES "Service"(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_metric_service_id ON "ServiceMetric"(service_id);
CREATE INDEX IF NOT EXISTS idx_metric_timestamp ON "ServiceMetric"(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_metric_path ON "ServiceMetric"(path);
CREATE INDEX IF NOT EXISTS idx_metric_caller ON "ServiceMetric"(caller_service_name);

-- Add computed stats columns to Service table
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS total_requests INTEGER DEFAULT 0;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS avg_response_time_ms INTEGER DEFAULT 0;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS error_rate DECIMAL(5,2) DEFAULT 0.0;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS last_metric_update TIMESTAMP;

-- Create view for service statistics
CREATE OR REPLACE VIEW service_stats AS
SELECT
  s.id,
  s.name,
  COUNT(m.id) as total_requests,
  AVG(m.response_time_ms)::INTEGER as avg_response_time_ms,
  SUM(CASE WHEN m.status_code >= 400 THEN 1 ELSE 0 END)::DECIMAL / NULLIF(COUNT(m.id), 0) * 100 as error_rate,
  MAX(m.timestamp) as last_request_time
FROM "Service" s
LEFT JOIN "ServiceMetric" m ON s.id = m.service_id
WHERE m.timestamp > NOW() - INTERVAL '1 hour'  -- Last hour only
GROUP BY s.id, s.name;

-- Create view for inter-service calls
CREATE OR REPLACE VIEW service_connections_view AS
SELECT
  m.caller_service_name as source_service,
  s.name as target_service,
  COUNT(*) as call_count,
  AVG(m.response_time_ms)::INTEGER as avg_response_time
FROM "ServiceMetric" m
JOIN "Service" s ON m.service_id = s.id
WHERE m.caller_service_name IS NOT NULL
  AND m.timestamp > NOW() - INTERVAL '1 hour'
GROUP BY m.caller_service_name, s.name;
