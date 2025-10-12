import type { ServiceMetadataSubmission } from '@lattice.black/core';

export async function register() {
  // Only run in production and on Node.js runtime
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NODE_ENV === 'production') {
    console.log('🔍 Initializing Lattice plugin for Next.js web app...');

    try {
      // Dynamic import to prevent webpack from bundling the plugin
      const { LatticeNextPlugin } = await import('@lattice.black/plugin-nextjs');

      const lattice = new LatticeNextPlugin({
        serviceName: 'lattice-web',
        environment: 'production',
        apiEndpoint: 'https://lattice-api-production.up.railway.app/api/v1',
        apiKey: process.env.LATTICE_API_KEY,
        enabled: true,
        autoSubmit: true,
        onAnalyzed: (metadata: ServiceMetadataSubmission) => {
          console.log('📊 Lattice web service metadata analyzed:', {
            service: metadata.service.name,
            routes: metadata.routes?.length || 0,
            dependencies: metadata.dependencies?.length || 0,
          });
        },
        onSubmitted: (response: { serviceId: string }) => {
          console.log('✅ Metadata submitted to Lattice:', response.serviceId);
        },
        onError: (error: Error) => {
          console.error('❌ Lattice error:', error.message);
        },
      });

      await lattice.analyze();
    } catch (error) {
      console.error('Failed to initialize or analyze Lattice service:', error);
    }
  }
}
