import { pool } from '../lib/db';
import { Service } from '@lattice/core';

/**
 * Service for managing service metadata with multi-tenancy support
 */
export class MetadataService {
  /**
   * Upsert service - update if exists, insert if new
   * Services are scoped to the authenticated user
   */
  async upsertService(service: Service, userId: string) {
    const query = `
      INSERT INTO services (
        id, user_id, name, version, environment, deployment_type, language, framework,
        runtime, description, repository, health_check_url, status, first_seen,
        last_seen, discovered_by, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW(), $14, $15)
      ON CONFLICT (name, user_id)
      DO UPDATE SET
        version = $4,
        environment = $5,
        deployment_type = $6,
        language = $7,
        framework = $8,
        runtime = $9,
        description = $10,
        repository = $11,
        health_check_url = $12,
        status = $13,
        last_seen = NOW(),
        discovered_by = $14,
        metadata = $15
      RETURNING *
    `;

    const values = [
      service.id,
      userId,
      service.name,
      service.version || null,
      service.environment || null,
      service.deploymentType || null,
      service.language,
      service.framework,
      service.runtime || null,
      service.description || null,
      service.repository || null,
      service.healthCheckUrl || null,
      service.status,
      JSON.stringify(service.discoveredBy),
      service.metadata ? JSON.stringify(service.metadata) : null,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Get service by ID (user-scoped)
   */
  async getServiceById(id: string, userId: string) {
    const query = `
      SELECT s.*,
        COALESCE(
          json_agg(DISTINCT r.*) FILTER (WHERE r.id IS NOT NULL),
          '[]'
        ) as routes,
        COALESCE(
          json_agg(DISTINCT d.*) FILTER (WHERE d.id IS NOT NULL),
          '[]'
        ) as dependencies
      FROM services s
      LEFT JOIN routes r ON r.service_id = s.id
      LEFT JOIN dependencies d ON d.service_id = s.id
      WHERE s.id = $1 AND s.user_id = $2
      GROUP BY s.id
    `;

    const result = await pool.query(query, [id, userId]);
    return result.rows[0] || null;
  }

  /**
   * Get service by name (user-scoped)
   */
  async getServiceByName(name: string, userId: string) {
    const query = `
      SELECT s.*,
        COALESCE(
          json_agg(DISTINCT r.*) FILTER (WHERE r.id IS NOT NULL),
          '[]'
        ) as routes,
        COALESCE(
          json_agg(DISTINCT d.*) FILTER (WHERE d.id IS NOT NULL),
          '[]'
        ) as dependencies
      FROM services s
      LEFT JOIN routes r ON r.service_id = s.id
      LEFT JOIN dependencies d ON d.service_id = s.id
      WHERE s.name = $1 AND s.user_id = $2
      GROUP BY s.id
    `;

    const result = await pool.query(query, [name, userId]);
    return result.rows[0] || null;
  }

  /**
   * List all services with optional filters (user-scoped)
   */
  async listServices(
    userId: string,
    filters?: {
      status?: string;
      environment?: string;
      framework?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    const conditions: string[] = ['user_id = $1'];
    const params: unknown[] = [userId];
    let paramIndex = 2;

    if (filters?.status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(filters.status);
    }

    if (filters?.environment) {
      conditions.push(`environment = $${paramIndex++}`);
      params.push(filters.environment);
    }

    if (filters?.framework) {
      conditions.push(`framework = $${paramIndex++}`);
      params.push(filters.framework);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    const countQuery = `SELECT COUNT(*) FROM services ${whereClause}`;
    const servicesQuery = `
      SELECT * FROM services
      ${whereClause}
      ORDER BY last_seen DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const [countResult, servicesResult] = await Promise.all([
      pool.query(countQuery, params),
      pool.query(servicesQuery, [...params, limit, offset]),
    ]);

    return {
      services: servicesResult.rows,
      total: parseInt(countResult.rows[0].count),
    };
  }
}
