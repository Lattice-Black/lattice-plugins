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
      await client.query('DELETE FROM "Dependency" WHERE "serviceId" = $1', [serviceId]);

      // Insert new dependencies
      for (const dep of dependencies) {
        const query = `
          INSERT INTO "Dependency" (
            id, "serviceId", "packageName", version, "versionRange", "dependencyType",
            scope, "installedSize", "publishSize", "fileCount", "hasVulnerabilities",
            "vulnerabilityCount", "highestSeverity", description, license, repository,
            homepage, "firstSeen", "lastSeen", metadata
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
    const where: Record<string, unknown> = {};

    if (filters?.packageName) {
      where['packageName'] = { contains: filters.packageName };
    }

    if (filters?.hasVulnerabilities !== undefined) {
      where['hasVulnerabilities'] = filters.hasVulnerabilities;
    }

    return prisma.dependency.findMany({
      where,
      include: {
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}
