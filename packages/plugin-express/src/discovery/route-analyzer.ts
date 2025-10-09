import { Application } from 'express';
import listEndpoints from 'express-list-endpoints';
import { Route, HttpMethod, generateId } from '@lattice/core';

/**
 * Route analyzer for Express applications
 * Discovers all HTTP endpoints using express-list-endpoints
 */
export class RouteAnalyzer {
  /**
   * Analyze Express app and extract all routes
   */
  analyzeRoutes(app: Application, serviceId: string): Route[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const endpoints = listEndpoints(app as any);
    const routes: Route[] = [];

    for (const endpoint of endpoints) {
      for (const method of endpoint.methods) {
        // Skip OPTIONS and HEAD if they're auto-generated
        if (method === 'OPTIONS' || method === 'HEAD') {
          continue;
        }

        const route: Route = {
          id: generateId(),
          serviceId,
          method: this.normalizeMethod(method),
          path: this.normalizePath(endpoint.path),
          middlewareChain: endpoint.middlewares || [],
          firstSeen: new Date(),
          lastSeen: new Date(),
        };

        routes.push(route);
      }
    }

    return routes;
  }

  /**
   * Normalize HTTP method to enum value
   */
  private normalizeMethod(method: string): HttpMethod {
    const upperMethod = method.toUpperCase();

    if (upperMethod in HttpMethod) {
      return HttpMethod[upperMethod as keyof typeof HttpMethod];
    }

    // Default to ALL for unknown methods
    return HttpMethod.ALL;
  }

  /**
   * Normalize path to ensure it starts with /
   */
  private normalizePath(path: string): string {
    // Remove trailing slashes except for root
    if (path !== '/' && path.endsWith('/')) {
      path = path.slice(0, -1);
    }

    // Ensure it starts with /
    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    return path;
  }
}
