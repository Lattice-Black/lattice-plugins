import { readFileSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { hostname } from 'os';

/**
 * Service name detector with 9-tier fallback chain
 * Based on research.md recommendations
 */
export class ServiceNameDetector {
  /**
   * Detect service name using fallback chain
   */
  detectServiceName(customName?: string): string {
    // Tier 1: Custom name provided via config
    if (customName) {
      return this.sanitizeName(customName);
    }

    // Tier 2: LATTICE_SERVICE_NAME environment variable
    if (process.env['LATTICE_SERVICE_NAME']) {
      return this.sanitizeName(process.env['LATTICE_SERVICE_NAME']);
    }

    // Tier 3: SERVICE_NAME environment variable
    if (process.env['SERVICE_NAME']) {
      return this.sanitizeName(process.env['SERVICE_NAME']);
    }

    // Tier 4: package.json name field
    const pkgName = this.getPackageJsonName();
    if (pkgName) {
      return this.sanitizeName(pkgName);
    }

    // Tier 5: Kubernetes metadata
    const k8sName = this.getKubernetesServiceName();
    if (k8sName) {
      return this.sanitizeName(k8sName);
    }

    // Tier 6: Docker container name
    const dockerName = this.getDockerContainerName();
    if (dockerName) {
      return this.sanitizeName(dockerName);
    }

    // Tier 7: Cloud provider metadata (AWS, GCP, Azure)
    const cloudName = this.getCloudServiceName();
    if (cloudName) {
      return this.sanitizeName(cloudName);
    }

    // Tier 8: Git repository name
    const gitName = this.getGitRepoName();
    if (gitName) {
      return this.sanitizeName(gitName);
    }

    // Tier 9: Hostname or current directory name
    const fallbackName = this.getFallbackName();
    return this.sanitizeName(fallbackName);
  }

  /**
   * Tier 4: Get name from package.json
   */
  private getPackageJsonName(): string | null {
    try {
      let currentDir = process.cwd();

      for (let i = 0; i < 5; i++) {
        const pkgPath = join(currentDir, 'package.json');

        if (existsSync(pkgPath)) {
          const content = readFileSync(pkgPath, 'utf-8');
          const pkg = JSON.parse(content) as { name?: string };

          if (pkg.name) {
            // Remove npm scope if present
            return pkg.name.replace(/^@[\w-]+\//, '');
          }
        }

        const parentDir = join(currentDir, '..');
        if (parentDir === currentDir) break;
        currentDir = parentDir;
      }
    } catch (error) {
      // Ignore errors
    }

    return null;
  }

  /**
   * Tier 5: Get Kubernetes service name from environment
   */
  private getKubernetesServiceName(): string | null {
    // Kubernetes sets these environment variables
    return (
      process.env['K8S_SERVICE_NAME'] ||
      process.env['KUBERNETES_SERVICE_NAME'] ||
      process.env['K8S_POD_NAME'] ||
      null
    );
  }

  /**
   * Tier 6: Get Docker container name from hostname
   */
  private getDockerContainerName(): string | null {
    // Docker containers often have hostname set to container ID/name
    if (process.env['DOCKER_CONTAINER_NAME']) {
      return process.env['DOCKER_CONTAINER_NAME'];
    }

    // Check if running in Docker by looking for .dockerenv
    if (existsSync('/.dockerenv')) {
      return hostname();
    }

    return null;
  }

  /**
   * Tier 7: Get cloud service name from metadata
   */
  private getCloudServiceName(): string | null {
    // AWS ECS
    if (process.env['AWS_ECS_SERVICE_NAME']) {
      return process.env['AWS_ECS_SERVICE_NAME'];
    }

    // Google Cloud Run
    if (process.env['K_SERVICE']) {
      return process.env['K_SERVICE'];
    }

    // Azure Container Apps
    if (process.env['CONTAINER_APP_NAME']) {
      return process.env['CONTAINER_APP_NAME'];
    }

    return null;
  }

  /**
   * Tier 8: Get Git repository name
   */
  private getGitRepoName(): string | null {
    try {
      // Try to read .git/config
      const gitConfigPath = join(process.cwd(), '.git', 'config');

      if (existsSync(gitConfigPath)) {
        const config = readFileSync(gitConfigPath, 'utf-8');
        const urlMatch = config.match(/url\s*=\s*.*\/([^/]+?)(?:\.git)?$/m);

        if (urlMatch?.[1]) {
          return urlMatch[1];
        }
      }
    } catch (error) {
      // Ignore errors
    }

    return null;
  }

  /**
   * Tier 9: Fallback to hostname or directory name
   */
  private getFallbackName(): string {
    // Try current directory name
    const dirName = basename(process.cwd());

    if (dirName && dirName !== '/' && dirName !== '.') {
      return dirName;
    }

    // Last resort: hostname
    return hostname() || 'unknown-service';
  }

  /**
   * Sanitize service name to DNS-compatible format
   * Rules: lowercase, alphanumeric + hyphens, 2-63 chars
   */
  private sanitizeName(name: string): string {
    // Convert to lowercase
    let sanitized = name.toLowerCase();

    // Replace invalid characters with hyphens
    sanitized = sanitized.replace(/[^a-z0-9-]/g, '-');

    // Remove leading/trailing hyphens
    sanitized = sanitized.replace(/^-+|-+$/g, '');

    // Collapse multiple hyphens
    sanitized = sanitized.replace(/-+/g, '-');

    // Ensure length constraints
    if (sanitized.length < 2) {
      sanitized = 'svc-' + sanitized;
    }

    if (sanitized.length > 63) {
      sanitized = sanitized.substring(0, 63);
    }

    // Remove trailing hyphen after truncation
    sanitized = sanitized.replace(/-+$/, '');

    return sanitized || 'unknown-service';
  }
}
