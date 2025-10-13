/**
 * HTTP client interceptor for Next.js
 * Injects distributed tracing headers for service-to-service tracking
 */

export class HttpInterceptor {
  constructor(private serviceName: string) {}

  /**
   * Wrap fetch to automatically inject X-Origin-Service header
   */
  async fetch(url: string | URL | Request, init?: RequestInit): Promise<Response> {
    const headers = new Headers(init?.headers);

    // Inject origin service header for distributed tracing
    if (!headers.has('X-Origin-Service')) {
      headers.set('X-Origin-Service', this.serviceName);
    }

    return fetch(url, {
      ...init,
      headers,
    });
  }

  /**
   * Get headers to inject for manual HTTP clients
   * Use this with axios, fetch, or other HTTP libraries
   */
  getTracingHeaders(): Record<string, string> {
    return {
      'X-Origin-Service': this.serviceName,
    };
  }
}

// Global HTTP interceptor instance
let globalHttpInterceptor: HttpInterceptor | null = null;

/**
 * Initialize global HTTP interceptor for Next.js
 */
export function initHttpInterceptor(serviceName: string): HttpInterceptor {
  if (!globalHttpInterceptor) {
    globalHttpInterceptor = new HttpInterceptor(serviceName);
  }
  return globalHttpInterceptor;
}

/**
 * Get global HTTP interceptor instance
 */
export function getHttpInterceptor(): HttpInterceptor | null {
  return globalHttpInterceptor;
}
