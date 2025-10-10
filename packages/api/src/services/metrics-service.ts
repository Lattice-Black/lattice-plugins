import { pool } from '../lib/db';

/**
 * Metric data structure for ingestion
 */
export interface MetricData {
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  timestamp?: Date;
  callerServiceName?: string;
}

/**
 * Service for managing metrics
 */
export class MetricsService {
  /**
   * Insert metrics for a service (user-scoped)
   */
  async insertMetrics(serviceName: string, userId: string, metrics: MetricData[]): Promise<number> {
    // First, get the service ID from the service name (user-scoped)
    const serviceQuery = `SELECT id FROM services WHERE name = $1 AND user_id = $2`;
    const serviceResult = await pool.query(serviceQuery, [serviceName, userId]);

    if (serviceResult.rows.length === 0) {
      throw new Error(`Service not found: ${serviceName}`);
    }

    const serviceId = serviceResult.rows[0].id;

    // Insert all metrics in a single transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let insertedCount = 0;
      for (const metric of metrics) {
        const query = `
          INSERT INTO service_metrics (
            service_id, method, path, status_code, response_time_ms,
            caller_service_name, timestamp
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;

        const values = [
          serviceId,
          metric.method,
          metric.path,
          metric.statusCode,
          metric.responseTime,
          metric.callerServiceName || null,
          metric.timestamp || new Date(),
        ];

        await client.query(query, values);
        insertedCount++;
      }

      await client.query('COMMIT');
      return insertedCount;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get service statistics (user-scoped)
   */
  async getServiceStats(userId: string, serviceId?: string) {
    let query = `SELECT * FROM service_stats WHERE user_id = $1`;
    const params: (string | undefined)[] = [userId];

    if (serviceId) {
      query += ` AND id = $2`;
      params.push(serviceId);
    }

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Get inter-service connection statistics (user-scoped)
   */
  async getServiceConnections(userId: string) {
    const query = `SELECT * FROM service_connections_view WHERE user_id = $1`;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  /**
   * Get recent metrics for a service (user-scoped)
   */
  async getRecentMetrics(serviceName: string, userId: string, limit: number = 100) {
    const query = `
      SELECT m.*
      FROM service_metrics m
      JOIN services s ON s.id = m.service_id
      WHERE s.name = $1 AND s.user_id = $2
      ORDER BY m.timestamp DESC
      LIMIT $3
    `;

    const result = await pool.query(query, [serviceName, userId, limit]);
    return result.rows;
  }
}
