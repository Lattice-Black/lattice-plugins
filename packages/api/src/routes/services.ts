import { Router, Request, Response } from 'express';
import { MetadataService } from '../services/metadata-service';
import { optionalAuth } from '../middleware/auth';

/**
 * Service query routes for dashboard
 */
export const createServicesRouter = (): Router => {
  const router = Router();
  const metadataService = new MetadataService();

  /**
   * GET /services
   * List all services with optional filtering
   */
  router.get('/', optionalAuth, async (req: Request, res: Response) => {
    try {
      const { status, environment, framework, limit, offset } = req.query;

      const parsedLimit = limit ? parseInt(limit as string, 10) : undefined;
      const parsedOffset = offset ? parseInt(offset as string, 10) : undefined;

      const result = await metadataService.listServices({
        status: status as string | undefined,
        environment: environment as string | undefined,
        framework: framework as string | undefined,
        limit: parsedLimit,
        offset: parsedOffset,
      });

      res.json({
        services: result.services,
        total: result.total,
        limit: parsedLimit || 50,
        offset: parsedOffset || 0,
      });
    } catch (error) {
      console.error('List services error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /services/:id
   * Get service details by ID or name
   */
  router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Service ID is required',
        });
        return;
      }

      // Try to find by ID first, then by name
      let service = await metadataService.getServiceById(id);

      if (!service) {
        service = await metadataService.getServiceByName(id);
      }

      if (!service) {
        res.status(404).json({
          error: 'Not Found',
          message: `Service "${id}" not found`,
        });
        return;
      }

      res.json(service);
    } catch (error) {
      console.error('Get service error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  return router;
};
