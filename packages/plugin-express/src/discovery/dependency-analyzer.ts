import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { Dependency, DependencyType, generateId } from '@caryyon/core';

/**
 * Package.json structure
 */
interface PackageJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

/**
 * Dependency analyzer for Node.js projects
 * Parses package.json to extract dependencies
 */
export class DependencyAnalyzer {
  /**
   * Analyze package.json and extract dependencies
   */
  analyzeDependencies(serviceId: string, packageJsonPath?: string): Dependency[] {
    const pkgPath = this.findPackageJson(packageJsonPath);

    if (!pkgPath) {
      console.warn('package.json not found, skipping dependency analysis');
      return [];
    }

    const packageJson = this.readPackageJson(pkgPath);
    const dependencies: Dependency[] = [];

    // Direct dependencies
    if (packageJson.dependencies) {
      dependencies.push(
        ...this.parseDependencies(
          serviceId,
          packageJson.dependencies,
          DependencyType.Direct
        )
      );
    }

    // Dev dependencies
    if (packageJson.devDependencies) {
      dependencies.push(
        ...this.parseDependencies(
          serviceId,
          packageJson.devDependencies,
          DependencyType.Dev
        )
      );
    }

    // Peer dependencies
    if (packageJson.peerDependencies) {
      dependencies.push(
        ...this.parseDependencies(
          serviceId,
          packageJson.peerDependencies,
          DependencyType.Peer
        )
      );
    }

    return dependencies;
  }

  /**
   * Find package.json in current directory or parent directories
   */
  private findPackageJson(customPath?: string): string | null {
    if (customPath) {
      return existsSync(customPath) ? customPath : null;
    }

    // Start from current working directory
    let currentDir = process.cwd();

    // Search up to 5 levels
    for (let i = 0; i < 5; i++) {
      const pkgPath = join(currentDir, 'package.json');

      if (existsSync(pkgPath)) {
        return pkgPath;
      }

      // Move to parent directory
      const parentDir = resolve(currentDir, '..');
      if (parentDir === currentDir) {
        break; // Reached root
      }
      currentDir = parentDir;
    }

    return null;
  }

  /**
   * Read and parse package.json
   */
  private readPackageJson(path: string): PackageJson {
    try {
      const content = readFileSync(path, 'utf-8');
      return JSON.parse(content) as PackageJson;
    } catch (error) {
      console.error('Failed to read package.json:', error);
      return {};
    }
  }

  /**
   * Parse dependencies object into Dependency entities
   */
  private parseDependencies(
    serviceId: string,
    deps: Record<string, string>,
    type: DependencyType
  ): Dependency[] {
    return Object.entries(deps).map(([packageName, versionRange]) => {
      const dependency: Dependency = {
        id: generateId(),
        serviceId,
        packageName,
        version: this.extractVersion(versionRange),
        versionRange,
        dependencyType: type,
        scope: this.extractScope(packageName),
        firstSeen: new Date(),
        lastSeen: new Date(),
      };

      return dependency;
    });
  }

  /**
   * Extract actual version from version range
   * This is a simplified version - in production, you'd resolve the actual installed version
   */
  private extractVersion(versionRange: string): string {
    // Remove common prefixes
    return versionRange.replace(/^[~^>=<*]/, '').trim();
  }

  /**
   * Extract npm scope from package name (e.g., @caryyon/core -> @lattice)
   */
  private extractScope(packageName: string): string | undefined {
    if (packageName.startsWith('@')) {
      const parts = packageName.split('/');
      return parts[0];
    }
    return undefined;
  }
}
