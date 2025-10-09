import { Router, Request, Response } from 'express';
import { schemaValidator } from '@lattice/core';
import { MetadataService } from '../services/metadata-service';
import { RouteService } from '../services/route-service';
import { DependencyService } from '../services/dependency-service';
import { authenticateApiKey } from '../middleware/auth';

/**
 * Ingestion routes for plugin metadata submission
 */
export const createIngestRouter = (): Router => {
  const router = Router();
  const metadataService = new MetadataService();
  const routeService = new RouteService();
  const dependencyService = new DependencyService();

  /**
   * POST /ingest/metadata
   * Submit service metadata from plugins
   */
  router.post('/metadata', authenticateApiKey, async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validationResult = schemaValidator.validateServiceMetadata(req.body);

      if (!validationResult.valid) {
        res.status(400).json({
          error: 'Validation failed',
          message: 'Invalid service metadata format',
          details: validationResult.errors,
        });
        return;
      }

      const { service, routes = [], dependencies = [] } = validationResult.data!;

      // Upsert service
      const upsertedService = await metadataService.upsertService(service);

      // Upsert routes
      const routesProcessed = await routeService.upsertRoutes(
        upsertedService.id,
        routes
      );

      // Upsert dependencies
      const dependenciesProcessed = await dependencyService.upsertDependencies(
        upsertedService.id,
        dependencies
      );

      // Return success response
      res.status(200).json({
        success: true,
        serviceId: upsertedService.id,
        routesProcessed,
        dependenciesProcessed,
      });
    } catch (error) {
      console.error('Ingestion error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  return router;
};
