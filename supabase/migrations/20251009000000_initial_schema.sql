-- Migration: Initial Lattice Schema for Supabase
-- Created: 2025-10-09
-- Description: Complete schema with multi-tenancy and Row Level Security

-- ============================================================================
-- USER PROFILES (extends Supabase auth.users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles are viewable by the user themselves
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================================
-- API KEYS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.api_keys (
  id TEXT PRIMARY KEY DEFAULT ('key_' || substr(md5(random()::text || clock_timestamp()::text), 1, 24)),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL,
  name TEXT,
  last_used TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_apikey_user_id ON public.api_keys(user_id);

-- Enable RLS on api_keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Users can only see their own API keys
CREATE POLICY "Users can view own API keys"
  ON public.api_keys
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys"
  ON public.api_keys
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
  ON public.api_keys
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- SUBSCRIPTIONS (Stripe integration)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id TEXT PRIMARY KEY DEFAULT ('sub_' || substr(md5(random()::text || clock_timestamp()::text), 1, 24)),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT DEFAULT 'inactive', -- active, canceled, past_due, inactive
  plan TEXT DEFAULT 'annual', -- annual ($25/year)
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscription_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscription_stripe_customer ON public.subscriptions(stripe_customer_id);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own subscription
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- SERVICES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  version TEXT,
  environment TEXT,
  deployment_type TEXT,
  language TEXT NOT NULL,
  framework TEXT NOT NULL,
  runtime TEXT,
  description TEXT,
  repository TEXT,
  health_check_url TEXT,
  status TEXT NOT NULL DEFAULT 'unknown',
  first_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL,
  discovered_by JSONB NOT NULL,
  metadata JSONB,

  -- Computed stats columns
  total_requests INTEGER DEFAULT 0,
  avg_response_time_ms INTEGER DEFAULT 0,
  error_rate DECIMAL(5,2) DEFAULT 0.0,
  last_metric_update TIMESTAMP WITH TIME ZONE
);

CREATE UNIQUE INDEX services_name_user_idx ON public.services(name, user_id);
CREATE INDEX services_name_idx ON public.services(name);
CREATE INDEX services_status_idx ON public.services(status);
CREATE INDEX services_last_seen_idx ON public.services(last_seen);
CREATE INDEX services_user_id_idx ON public.services(user_id);

-- Enable RLS on services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Users can only see their own services
CREATE POLICY "Users can view own services"
  ON public.services
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own services"
  ON public.services
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own services"
  ON public.services
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own services"
  ON public.services
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- ROUTES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.routes (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  middleware_chain TEXT[],
  handler_location JSONB,
  path_parameters JSONB,
  query_parameters JSONB,
  request_schema JSONB,
  response_schema JSONB,
  description TEXT,
  tags TEXT[],
  avg_response_time_ms DOUBLE PRECISION,
  call_frequency DOUBLE PRECISION,
  error_rate DOUBLE PRECISION,
  first_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB
);

CREATE INDEX routes_service_id_idx ON public.routes(service_id);
CREATE INDEX routes_method_idx ON public.routes(method);
CREATE UNIQUE INDEX routes_service_method_path_idx ON public.routes(service_id, method, path);

-- Enable RLS on routes (inherit from services)
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view routes of own services"
  ON public.routes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.services
      WHERE services.id = routes.service_id
      AND services.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert routes for own services"
  ON public.routes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.services
      WHERE services.id = routes.service_id
      AND services.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update routes of own services"
  ON public.routes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.services
      WHERE services.id = routes.service_id
      AND services.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete routes of own services"
  ON public.routes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.services
      WHERE services.id = routes.service_id
      AND services.user_id = auth.uid()
    )
  );

-- ============================================================================
-- DEPENDENCIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.dependencies (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  package_name TEXT NOT NULL,
  version TEXT NOT NULL,
  version_range TEXT,
  dependency_type TEXT NOT NULL,
  scope TEXT,
  installed_size INTEGER,
  publish_size INTEGER,
  file_count INTEGER,
  has_vulnerabilities BOOLEAN,
  vulnerability_count INTEGER,
  highest_severity TEXT,
  description TEXT,
  license TEXT,
  repository TEXT,
  homepage TEXT,
  first_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB
);

CREATE INDEX dependencies_service_id_idx ON public.dependencies(service_id);
CREATE INDEX dependencies_package_name_idx ON public.dependencies(package_name);
CREATE INDEX dependencies_has_vulnerabilities_idx ON public.dependencies(has_vulnerabilities);
CREATE UNIQUE INDEX dependencies_service_package_idx ON public.dependencies(service_id, package_name);

-- Enable RLS on dependencies
ALTER TABLE public.dependencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view dependencies of own services"
  ON public.dependencies
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.services
      WHERE services.id = dependencies.service_id
      AND services.user_id = auth.uid()
    )
  );

-- ============================================================================
-- CONNECTIONS (Service-to-Service)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.connections (
  id TEXT PRIMARY KEY,
  source_service_id TEXT NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  target_service_id TEXT NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  target_route_id TEXT REFERENCES public.routes(id) ON DELETE SET NULL,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  call_count INTEGER NOT NULL DEFAULT 0,
  avg_response_time_ms DOUBLE PRECISION,
  p95_response_time_ms DOUBLE PRECISION,
  p99_response_time_ms DOUBLE PRECISION,
  success_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  error_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
  request_frequency DOUBLE PRECISION,
  peak_time TEXT,
  first_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL,
  sample_trace_ids TEXT[],
  metadata JSONB
);

CREATE INDEX connections_source_service_id_idx ON public.connections(source_service_id);
CREATE INDEX connections_target_service_id_idx ON public.connections(target_service_id);
CREATE INDEX connections_source_target_idx ON public.connections(source_service_id, target_service_id);
CREATE INDEX connections_last_seen_idx ON public.connections(last_seen);
CREATE UNIQUE INDEX connections_unique_idx ON public.connections(source_service_id, target_service_id, method, path);

-- Enable RLS on connections
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view connections of own services"
  ON public.connections
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.services
      WHERE services.id = connections.source_service_id
      AND services.user_id = auth.uid()
    )
  );

-- ============================================================================
-- PLUGINS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.plugins (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  supported_frameworks TEXT[],
  supported_schema_versions TEXT[],
  preferred_schema_version TEXT NOT NULL,
  can_discover_routes BOOLEAN NOT NULL DEFAULT false,
  can_discover_dependencies BOOLEAN NOT NULL DEFAULT false,
  can_track_connections BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  author TEXT,
  repository TEXT,
  documentation TEXT,
  services_using INTEGER NOT NULL DEFAULT 0,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

CREATE UNIQUE INDEX plugins_name_idx ON public.plugins(name);
CREATE INDEX plugins_name_lookup_idx ON public.plugins(name);

-- Plugins are public (no RLS)

-- ============================================================================
-- SERVICE METRICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.service_metrics (
  id TEXT PRIMARY KEY DEFAULT ('met_' || substr(md5(random()::text || clock_timestamp()::text), 1, 24)),
  service_id TEXT NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER NOT NULL,
  caller_service_name TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX service_metrics_service_id_idx ON public.service_metrics(service_id);
CREATE INDEX service_metrics_timestamp_idx ON public.service_metrics(timestamp DESC);
CREATE INDEX service_metrics_path_idx ON public.service_metrics(path);
CREATE INDEX service_metrics_caller_idx ON public.service_metrics(caller_service_name);

-- Enable RLS on service_metrics
ALTER TABLE public.service_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view metrics of own services"
  ON public.service_metrics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.services
      WHERE services.id = service_metrics.service_id
      AND services.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert metrics for own services"
  ON public.service_metrics
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.services
      WHERE services.id = service_metrics.service_id
      AND services.user_id = auth.uid()
    )
  );

-- ============================================================================
-- VIEWS FOR ANALYTICS
-- ============================================================================

-- Service statistics view
CREATE OR REPLACE VIEW public.service_stats AS
SELECT
  s.id,
  s.name,
  s.user_id,
  COUNT(m.id) as total_requests,
  AVG(m.response_time_ms)::INTEGER as avg_response_time_ms,
  SUM(CASE WHEN m.status_code >= 400 THEN 1 ELSE 0 END)::DECIMAL / NULLIF(COUNT(m.id), 0) * 100 as error_rate,
  MAX(m.timestamp) as last_request_time
FROM public.services s
LEFT JOIN public.service_metrics m ON s.id = m.service_id
WHERE m.timestamp > NOW() - INTERVAL '1 hour'
GROUP BY s.id, s.name, s.user_id;

-- Inter-service connections view
CREATE OR REPLACE VIEW public.service_connections_view AS
SELECT
  s.user_id,
  m.caller_service_name as source_service,
  s.name as target_service,
  COUNT(*) as call_count,
  AVG(m.response_time_ms)::INTEGER as avg_response_time
FROM public.service_metrics m
JOIN public.services s ON m.service_id = s.id
WHERE m.caller_service_name IS NOT NULL
  AND m.timestamp > NOW() - INTERVAL '1 hour'
GROUP BY s.user_id, m.caller_service_name, s.name;

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for subscriptions table
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
