import { pool } from '../lib/db';
import { Route } from '@lattice.black/core';

/**
 * Service for managing routes
 */
export class RouteService {
  /**
   * Upsert routes for a service - replaces all existing routes
   */
  async upsertRoutes(serviceId: string, routes: Route[]) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Delete existing routes for this service
      await client.query('DELETE FROM routes WHERE service_id = $1', [serviceId]);

      // Insert new routes
      for (const route of routes) {
        const query = `
          INSERT INTO routes (
            id, service_id, method, path, middleware_chain, handler_location,
            path_parameters, query_parameters, request_schema, response_schema,
            description, tags, avg_response_time_ms, call_frequency, error_rate,
            first_seen, last_seen, metadata
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW(), $16)
        `;

        const values = [
          route.id,
          serviceId,
          route.method,
          route.path,
          route.middlewareChain || [],
          route.handlerLocation ? JSON.stringify(route.handlerLocation) : null,
          route.pathParameters ? JSON.stringify(route.pathParameters) : null,
          route.queryParameters ? JSON.stringify(route.queryParameters) : null,
          route.requestSchema ? JSON.stringify(route.requestSchema) : null,
          route.responseSchema ? JSON.stringify(route.responseSchema) : null,
          route.description || null,
          route.tags || [],
          route.avgResponseTimeMs || null,
          route.callFrequency || null,
          route.errorRate || null,
          route.metadata ? JSON.stringify(route.metadata) : null,
        ];

        await client.query(query, values);
      }

      await client.query('COMMIT');
      return routes.length;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Search routes across all services
   */
  async searchRoutes(filters?: {
    path?: string;
    method?: string;
    serviceId?: string;
  }) {
    const client = await pool.connect();
    try {
      let query = `
        SELECT r.*, s.id as service_id, s.name as service_name
        FROM routes r
        JOIN services s ON r.service_id = s.id
        WHERE 1=1
      `;
      const values: unknown[] = [];

      if (filters?.path) {
        values.push(`%${filters.path}%`);
        query += ` AND r.path ILIKE $${values.length}`;
      }

      if (filters?.method) {
        values.push(filters.method);
        query += ` AND r.method = $${values.length}`;
      }

      if (filters?.serviceId) {
        values.push(filters.serviceId);
        query += ` AND r.service_id = $${values.length}`;
      }

      const result = await client.query(query, values);
      return result.rows;
    } finally {
      client.release();
    }
  }
}
