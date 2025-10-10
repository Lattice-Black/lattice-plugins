import { Router, Response } from 'express';
import { schemaValidator } from '@lattice/core';
import { MetadataService } from '../services/metadata-service';
import { RouteService } from '../services/route-service';
import { DependencyService } from '../services/dependency-service';
import { authenticateApiKey, AuthenticatedRequest } from '../middleware/auth';

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
   * Requires API key authentication - associates services with authenticated user
   */
  router.post('/metadata', authenticateApiKey, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Ensure user is authenticated
      if (!req.user?.id) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User authentication required',
        });
        return;
      }

      const userId = req.user.id;

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

      // Upsert service with user association
      const upsertedService = await metadataService.upsertService(service, userId);

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
