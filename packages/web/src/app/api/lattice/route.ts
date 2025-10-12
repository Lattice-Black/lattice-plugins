import { NextResponse } from 'next/server';

/**
 * Manual Lattice plugin trigger endpoint
 *
 * NOTE: Disabled in Vercel serverless environment.
 * Service discovery runs during build via CLI tool (see package.json postbuild).
 */
export function GET() {
  return NextResponse.json({
    success: false,
    message: 'Runtime discovery disabled. Service metadata is submitted during build via CLI tool.',
    note: 'See package.json postbuild script',
  }, { status: 501 });
}
