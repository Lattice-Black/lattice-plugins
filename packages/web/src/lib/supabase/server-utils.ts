import { createClient } from './server';

/**
 * Get the current user's session token (server-side only)
 * Use this in Server Components and Server Actions
 */
export async function getSessionToken(): Promise<string | null> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

/**
 * Get the current user (server-side)
 * Use this in Server Components and Server Actions
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
