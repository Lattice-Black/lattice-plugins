import { createClient } from './client';

/**
 * Get the current user's session token (client-side only)
 * Use this in Client Components
 */
export async function getSessionToken(): Promise<string | null> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

/**
 * Get the current user (browser-side)
 * Use this in Client Components
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Sign out the current user (browser-side)
 * Use this in Client Components
 */
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
