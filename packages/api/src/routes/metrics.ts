import { Router, Response } from 'express';
import { MetricsService } from '../services/metrics-service';
import { authenticateApiKey, authenticateSupabase, AuthenticatedRequest } from '../middleware/auth';

/**
 * Metrics routes for runtime statistics
 * All routes require authentication and are user-scoped
 */
export const createMetricsRouter = (): Router => {
  const router = Router();
  const metricsService = new MetricsService();

  /**
   * POST /metrics
   * Submit runtime metrics from services
   * Requires API key authentication - metrics are associated with the authenticated user
   */
  router.post('/', authenticateApiKey, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User authentication required',
        });
        return;
      }

      const userId = req.user.id;
      const { serviceName, metrics } = req.body;

      if (!serviceName) {
        res.status(400).json({
          error: 'Validation failed',
          message: 'serviceName is required',
        });
        return;
      }

      if (!Array.isArray(metrics) || metrics.length === 0) {
        res.status(400).json({
          error: 'Validation failed',
          message: 'metrics must be a non-empty array',
        });
        return;
      }

      // Validate metric structure
      for (const metric of metrics) {
        if (!metric.method || !metric.path || metric.statusCode === undefined || metric.responseTime === undefined) {
          res.status(400).json({
            error: 'Validation failed',
            message: 'Each metric must have method, path, statusCode, and responseTime',
          });
          return;
        }
      }

      const insertedCount = await metricsService.insertMetrics(serviceName, userId, metrics);

      res.status(200).json({
        success: true,
        inserted: insertedCount,
      });
    } catch (error) {
      console.error('Metrics ingestion error:', error);

      if (error instanceof Error && error.message.includes('Service not found')) {
        res.status(404).json({
          error: 'Service not found',
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /metrics/stats
   * Get aggregated service statistics (user-scoped)
   * Requires Supabase JWT authentication
   */
  router.get('/stats', authenticateSupabase, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User authentication required',
        });
        return;
      }

      const userId = req.user.id;
      const { serviceId } = req.query;
      const stats = await metricsService.getServiceStats(userId, serviceId as string | undefined);

      res.status(200).json({
        success: true,
        stats,
      });
    } catch (error) {
      console.error('Stats retrieval error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /metrics/connections
   * Get inter-service connection statistics (user-scoped)
   * Requires Supabase JWT authentication
   */
  router.get('/connections', authenticateSupabase, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User authentication required',
        });
        return;
      }

      const userId = req.user.id;
      const connections = await metricsService.getServiceConnections(userId);

      res.status(200).json({
        success: true,
        connections,
      });
    } catch (error) {
      console.error('Connections retrieval error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /metrics/recent/:serviceName
   * Get recent metrics for a specific service (user-scoped)
   * Requires Supabase JWT authentication
   */
  router.get('/recent/:serviceName', authenticateSupabase, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User authentication required',
        });
        return;
      }

      const userId = req.user.id;
      const { serviceName } = req.params;
      const { limit } = req.query;

      if (!serviceName) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'serviceName is required',
        });
        return;
      }

      const limitNum = limit ? parseInt(limit as string) : 100;
      const metrics = await metricsService.getRecentMetrics(
        serviceName,
        userId,
        limitNum
      );

      res.status(200).json({
        success: true,
        serviceName,
        count: metrics.length,
        metrics,
      });
    } catch (error) {
      console.error('Recent metrics retrieval error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  return router;
};
