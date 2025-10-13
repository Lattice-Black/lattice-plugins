import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env, validateEnv } from './lib/env';
import { requestLogger } from './middleware/request-logger';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { createApiRouter } from './routes';

/**
 * Create and configure Express application
 * @param metricsMiddleware Optional metrics tracking middleware to add before routes
 */
const createApp = (metricsMiddleware?: express.RequestHandler): express.Application => {
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

  // Metrics tracking middleware (must be BEFORE routes)
  if (metricsMiddleware) {
    app.use(metricsMiddleware);
    console.log('📊 Metrics middleware registered');
  }

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

    // Initialize Lattice plugin and get metrics middleware BEFORE creating app
    let latticePlugin: any = null;
    let metricsMiddleware: express.RequestHandler | undefined = undefined;

    try {
      const { LatticePlugin } = await import('@lattice.black/plugin-express');

      // Use Railway public URL in production, localhost in development
      const apiEndpoint = env.NODE_ENV === 'production'
        ? 'https://lattice-production.up.railway.app/api/v1'
        : `http://localhost:${env.PORT}/api/v1`;

      latticePlugin = new LatticePlugin({
        serviceName: 'lattice-api',
        environment: env.NODE_ENV,
        apiEndpoint,
        apiKey: env.LATTICE_API_KEY,
        enabled: true,
        autoSubmit: true,
      });

      // Get metrics middleware to pass to createApp
      metricsMiddleware = latticePlugin.createMetricsMiddleware();
      console.log('✅ Lattice plugin initialized');
    } catch (error) {
      console.error('⚠️  Lattice plugin initialization failed:', error);
      // Continue without Lattice - don't crash the server
    }

    // Create Express app with metrics middleware
    const app = createApp(metricsMiddleware);

    // Analyze routes and submit metadata (after app is created with routes)
    if (latticePlugin) {
      try {
        await latticePlugin.analyze(app);
        console.log('✅ Lattice self-discovery completed');
      } catch (error) {
        console.error('⚠️  Lattice self-discovery failed:', error);
      }
    }

    // Start listening
    app.listen(env.PORT, () => {
      console.log(`🚀 Lattice API server running on port ${env.PORT}`);
      console.log(`📊 Environment: ${env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${env.PORT}/api/v1/health`);
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
