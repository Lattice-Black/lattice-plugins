import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Manual Lattice plugin trigger...');

    const { LatticeNextPlugin } = await import('@lattice.black/plugin-nextjs');

    const lattice = new LatticeNextPlugin({
      serviceName: 'lattice-web',
      environment: process.env.NODE_ENV || 'production',
      apiEndpoint: process.env.LATTICE_API_ENDPOINT || 'https://lattice-production.up.railway.app/api/v1',
      apiKey: process.env.LATTICE_API_KEY,
      enabled: true,
      autoSubmit: true,
    });

    const metadata = await lattice.analyze();

    return NextResponse.json({
      success: true,
      message: 'Lattice metadata submitted',
      service: metadata.service.name,
      routes: metadata.routes?.length || 0,
      dependencies: metadata.dependencies?.length || 0,
    });
  } catch (error) {
    console.error('Failed to run Lattice plugin:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
