import { pool } from '../lib/db';
import { Dependency } from '@lattice/core';

/**
 * Service for managing dependencies
 */
export class DependencyService {
  /**
   * Upsert dependencies for a service
   */
  async upsertDependencies(serviceId: string, dependencies: Dependency[]) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Delete existing dependencies for this service
      await client.query('DELETE FROM dependencies WHERE service_id = $1', [serviceId]);

      // Insert new dependencies
      for (const dep of dependencies) {
        const query = `
          INSERT INTO dependencies (
            id, service_id, package_name, version, version_range, dependency_type,
            scope, installed_size, publish_size, file_count, has_vulnerabilities,
            vulnerability_count, highest_severity, description, license, repository,
            homepage, first_seen, last_seen, metadata
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW(), $18)
        `;

        const values = [
          dep.id,
          serviceId,
          dep.packageName,
          dep.version,
          dep.versionRange || null,
          dep.dependencyType,
          dep.scope || null,
          dep.installedSize || null,
          dep.publishSize || null,
          dep.fileCount || null,
          dep.hasVulnerabilities || null,
          dep.vulnerabilityCount || null,
          dep.highestSeverity || null,
          dep.description || null,
          dep.license || null,
          dep.repository || null,
          dep.homepage || null,
          dep.metadata ? JSON.stringify(dep.metadata) : null,
        ];

        await client.query(query, values);
      }

      await client.query('COMMIT');
      return dependencies.length;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * List dependencies with optional filters
   */
  async listDependencies(filters?: {
    packageName?: string;
    hasVulnerabilities?: boolean;
  }) {
    const client = await pool.connect();
    try {
      let query = `
        SELECT d.*, s.id as service_id, s.name as service_name
        FROM dependencies d
        JOIN services s ON d.service_id = s.id
        WHERE 1=1
      `;
      const values: unknown[] = [];

      if (filters?.packageName) {
        values.push(`%${filters.packageName}%`);
        query += ` AND d.package_name ILIKE $${values.length}`;
      }

      if (filters?.hasVulnerabilities !== undefined) {
        values.push(filters.hasVulnerabilities);
        query += ` AND d.has_vulnerabilities = $${values.length}`;
      }

      const result = await client.query(query, values);
      return result.rows;
    } finally {
      client.release();
    }
  }
}
