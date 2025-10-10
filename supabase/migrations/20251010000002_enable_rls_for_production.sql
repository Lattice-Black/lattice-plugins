-- Enable Row Level Security for Production
-- This migration re-enables RLS and creates proper security policies
-- Run this migration BEFORE deploying to production

-- Re-enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_metrics ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- API KEYS TABLE POLICIES
-- ============================================================================

-- Users can view their own API keys
CREATE POLICY "Users can view own API keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own API keys
CREATE POLICY "Users can create own API keys" ON api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own API keys
CREATE POLICY "Users can delete own API keys" ON api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- SUBSCRIPTIONS TABLE POLICIES
-- ============================================================================

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Note: Subscriptions are created/updated by webhook handler using service role
-- so no INSERT/UPDATE policies needed for regular users

-- ============================================================================
-- SERVICES TABLE POLICIES
-- ============================================================================

-- Users can view services for their tenant
CREATE POLICY "Users can view tenant services" ON services
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Users can create services for their tenant
CREATE POLICY "Users can create tenant services" ON services
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Users can update services for their tenant
CREATE POLICY "Users can update tenant services" ON services
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Users can delete services for their tenant
CREATE POLICY "Users can delete tenant services" ON services
  FOR DELETE USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- ROUTES TABLE POLICIES
-- ============================================================================

-- Users can view routes for their tenant's services
CREATE POLICY "Users can view tenant routes" ON routes
  FOR SELECT USING (
    service_id IN (
      SELECT id FROM services WHERE tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Users can create routes for their tenant's services
CREATE POLICY "Users can create tenant routes" ON routes
  FOR INSERT WITH CHECK (
    service_id IN (
      SELECT id FROM services WHERE tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Users can update routes for their tenant's services
CREATE POLICY "Users can update tenant routes" ON routes
  FOR UPDATE USING (
    service_id IN (
      SELECT id FROM services WHERE tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Users can delete routes for their tenant's services
CREATE POLICY "Users can delete tenant routes" ON routes
  FOR DELETE USING (
    service_id IN (
      SELECT id FROM services WHERE tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- ============================================================================
-- DEPENDENCIES TABLE POLICIES
-- ============================================================================

-- Users can view dependencies for their tenant's services
CREATE POLICY "Users can view tenant dependencies" ON dependencies
  FOR SELECT USING (
    service_id IN (
      SELECT id FROM services WHERE tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Users can create dependencies for their tenant's services
CREATE POLICY "Users can create tenant dependencies" ON dependencies
  FOR INSERT WITH CHECK (
    service_id IN (
      SELECT id FROM services WHERE tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Users can update dependencies for their tenant's services
CREATE POLICY "Users can update tenant dependencies" ON dependencies
  FOR UPDATE USING (
    service_id IN (
      SELECT id FROM services WHERE tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Users can delete dependencies for their tenant's services
CREATE POLICY "Users can delete tenant dependencies" ON dependencies
  FOR DELETE USING (
    service_id IN (
      SELECT id FROM services WHERE tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- ============================================================================
-- CONNECTIONS TABLE POLICIES
-- ============================================================================

-- Users can view connections for their tenant's services
CREATE POLICY "Users can view tenant connections" ON connections
  FOR SELECT USING (
    service_id IN (
      SELECT id FROM services WHERE tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Users can create connections for their tenant's services
CREATE POLICY "Users can create tenant connections" ON connections
  FOR INSERT WITH CHECK (
    service_id IN (
      SELECT id FROM services WHERE tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- ============================================================================
-- SERVICE METRICS TABLE POLICIES
-- ============================================================================

-- Users can view metrics for their tenant's services
CREATE POLICY "Users can view tenant metrics" ON service_metrics
  FOR SELECT USING (
    service_id IN (
      SELECT id FROM services WHERE tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Users can create metrics for their tenant's services
CREATE POLICY "Users can create tenant metrics" ON service_metrics
  FOR INSERT WITH CHECK (
    service_id IN (
      SELECT id FROM services WHERE tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- ============================================================================
-- IMPORTANT NOTES FOR PRODUCTION
-- ============================================================================

-- 1. The API uses Supabase Service Role key which bypasses RLS
--    This is necessary for:
--    - Webhook handlers (Stripe)
--    - Ingestion endpoints (API key auth)
--    - Administrative operations
--
-- 2. User-facing endpoints using Supabase Auth will respect RLS
--    This includes:
--    - /auth/* routes (signup, login, etc.)
--    - /billing/* routes (subscription management)
--    - Any future dashboard/UI endpoints
--
-- 3. Ensure SUPABASE_SERVICE_KEY is only used server-side
--    Never expose service role key to client applications
--
-- 4. Test these policies thoroughly before production deployment

-- Verification Query (run after applying this migration):
-- SELECT schemaname, tablename, policyname
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
