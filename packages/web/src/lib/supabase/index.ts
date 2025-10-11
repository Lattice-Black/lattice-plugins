/**
 * Supabase client utilities for Next.js App Router
 *
 * Use the appropriate client for your context:
 * - Client Components: import { createClient } from '@/lib/supabase/client'
 * - Server Components: import { createClient } from '@/lib/supabase/server'
 * - Middleware: import { createClient } from '@/lib/supabase/middleware'
 * - Utilities: import { getSessionToken, getCurrentUser, signOut } from '@/lib/supabase/utils'
 */

export { createClient as createBrowserClient } from './client';
export { createClient as createServerClient } from './server';
export { createClient as createMiddlewareClient } from './middleware';
export { getSessionToken, getCurrentUser, signOut } from './utils';
