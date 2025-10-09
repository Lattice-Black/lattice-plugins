import { Router } from 'express';
import { createIngestRouter } from './ingest';
import { createServicesRouter } from './services';

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
  router.use('/ingest', createIngestRouter());
  router.use('/services', createServicesRouter());

  // TODO: Register additional routes
  // router.use('/graph', graphRouter);
  // router.use('/routes', routesRouter);
  // router.use('/dependencies', dependenciesRouter);
  // router.use('/metrics', metricsRouter);

  return router;
};
