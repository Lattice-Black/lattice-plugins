import { Router } from 'express';
import { createIngestRouter } from './ingest';
import { createServicesRouter } from './services';
import { createMetricsRouter } from './metrics';
import { createAuthRouter } from './auth';
import { createBillingRouter } from './billing';
import { createWebhooksRouter } from './webhooks';

/**
 * Main API router
 */
export const createApiRouter = (): Router => {
  const router = Router();

  // Health check endpoint
  router.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      version: '1.0.0',
      schemaVersion: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Register routes
  router.use('/auth', createAuthRouter());
  router.use('/billing', createBillingRouter());
  router.use('/webhooks', createWebhooksRouter());
  router.use('/ingest', createIngestRouter());
  router.use('/services', createServicesRouter());
  router.use('/metrics', createMetricsRouter());

  // TODO: Register additional routes
  // router.use('/graph', graphRouter);
  // router.use('/routes', routesRouter);
  // router.use('/dependencies', dependenciesRouter);

  return router;
};
