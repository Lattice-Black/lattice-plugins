import { LatticeNextPlugin } from '@lattice.black/plugin-nextjs';

export async function register() {
  // Only run in production and on Node.js runtime
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NODE_ENV === 'production') {
    console.log('🔍 Initializing Lattice plugin for Next.js web app...');

    const lattice = new LatticeNextPlugin({
      serviceName: 'lattice-web',
      environment: 'production',
      apiEndpoint: 'https://lattice-api-production.up.railway.app/api/v1',
      apiKey: process.env.LATTICE_API_KEY,
      enabled: true,
      autoSubmit: true,
      onAnalyzed: (metadata) => {
        console.log('📊 Lattice web service metadata analyzed:', {
          service: metadata.service.name,
          routes: metadata.routes?.length || 0,
          dependencies: metadata.dependencies?.length || 0,
        });
      },
      onSubmitted: (response) => {
        console.log('✅ Metadata submitted to Lattice:', response.serviceId);
      },
      onError: (error) => {
        console.error('❌ Lattice error:', error.message);
      },
    });

    try {
      await lattice.analyze();
    } catch (error) {
      console.error('Failed to analyze service:', error);
    }
  }
}
