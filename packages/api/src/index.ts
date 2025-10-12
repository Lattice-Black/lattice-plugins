import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env, validateEnv } from './lib/env';
import { requestLogger } from './middleware/request-logger';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { createApiRouter } from './routes';

/**
 * Create and configure Express application
 */
const createApp = (): express.Application => {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(
    cors({
      origin: env.ALLOWED_ORIGINS,
      credentials: true,
    })
  );

  // Stripe webhook needs raw body for signature verification
  app.use(
    '/api/v1/webhooks/stripe',
    express.raw({ type: 'application/json' })
  );

  // Body parsing for all other routes
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use(requestLogger);

  // API routes
  app.use('/api/v1', createApiRouter());

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
  try {
    // Validate environment
    validateEnv();

    // Create Express app
    const app = createApp();

    // Start listening
    app.listen(env.PORT, async () => {
      console.log(`🚀 Lattice API server running on port ${env.PORT}`);
      console.log(`📊 Environment: ${env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${env.PORT}/api/v1/health`);

      // Initialize Lattice self-discovery
      try {
        const { LatticePlugin } = await import('@lattice.black/plugin-express');

        const lattice = new LatticePlugin({
          serviceName: 'lattice-api',
          environment: env.NODE_ENV,
          apiEndpoint: `http://localhost:${env.PORT}/api/v1`,
          apiKey: env.LATTICE_API_KEY,
          enabled: true,
          autoSubmit: true,
        });

        // Add metrics tracking middleware BEFORE analyze
        // This starts collecting request metrics immediately
        app.use(lattice.createMetricsMiddleware());

        await lattice.analyze(app);

        console.log('✅ Lattice self-discovery initialized');
        console.log('📊 Metrics tracking enabled');
      } catch (error) {
        console.error('⚠️  Lattice self-discovery failed:', error);
        // Don't crash the server if self-discovery fails
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

export { createApp, startServer };
