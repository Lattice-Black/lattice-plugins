import { pool } from '../lib/db';
import { Service } from '@lattice/core';

/**
 * Service for managing service metadata
 */
export class MetadataService {
  /**
   * Upsert service - update if exists, insert if new
   */
  async upsertService(service: Service) {
    const query = `
      INSERT INTO services (
        id, name, version, environment, deployment_type, language, framework,
        runtime, description, repository, health_check_url, status, first_seen,
        last_seen, discovered_by, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW(), $13, $14)
      ON CONFLICT (name)
      DO UPDATE SET
        version = $3,
        environment = $4,
        deployment_type = $5,
        language = $6,
        framework = $7,
        runtime = $8,
        description = $9,
        repository = $10,
        health_check_url = $11,
        status = $12,
        last_seen = NOW(),
        discovered_by = $13,
        metadata = $14
      RETURNING *
    `;

    const values = [
      service.id,
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
   * Get service by ID
   */
  async getServiceById(id: string) {
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
      WHERE s.id = $1
      GROUP BY s.id
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get service by name
   */
  async getServiceByName(name: string) {
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
      WHERE s.name = $1
      GROUP BY s.id
    `;

    const result = await pool.query(query, [name]);
    return result.rows[0] || null;
  }

  /**
   * List all services with optional filters
   */
  async listServices(filters?: {
    status?: string;
    environment?: string;
    framework?: string;
    limit?: number;
    offset?: number;
  }) {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

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

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
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
