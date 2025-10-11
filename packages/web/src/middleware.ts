import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

export async function middleware(req: NextRequest) {
  const { supabase, response } = createClient(req);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes - require authentication
  const protectedPaths = ['/', '/graph', '/metrics', '/services'];
  const isProtectedPath = protectedPaths.some(path =>
    req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith(`${path}/`)
  );

  // Auth routes - should redirect to home if already authenticated
  const authPaths = ['/login', '/signup'];
  const isAuthPath = authPaths.includes(req.nextUrl.pathname);

  // If accessing protected route without session, redirect to login
  if (isProtectedPath && !session) {
    const redirectUrl = new URL('/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If accessing auth route with session, redirect to home
  if (isAuthPath && session) {
    const redirectUrl = new URL('/', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
