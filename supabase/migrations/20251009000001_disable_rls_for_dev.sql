-- Temporary: Disable RLS for development
-- This allows testing without authentication
-- Re-enable RLS when adding authentication

-- Disable RLS on all tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dependencies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_metrics DISABLE ROW LEVEL SECURITY;

-- Note: plugins table doesn't have RLS, so we skip it
