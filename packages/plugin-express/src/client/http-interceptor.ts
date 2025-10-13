import { HTTP_HEADERS } from '@lattice.black/core';

/**
 * HTTP client interceptor that injects distributed tracing headers
 * for service-to-service connection tracking
 */
export class HttpInterceptor {
  constructor(private serviceName: string) {}

  /**
   * Wrap fetch to automatically inject X-Origin-Service header
   */
  fetch(url: string | URL | Request, init?: RequestInit): Promise<Response> {
    const headers = new Headers(init?.headers);

    // Inject origin service header for distributed tracing
    if (!headers.has(HTTP_HEADERS.ORIGIN_SERVICE)) {
      headers.set(HTTP_HEADERS.ORIGIN_SERVICE, this.serviceName);
    }

    return fetch(url, {
      ...init,
      headers,
    });
  }

  /**
   * Get headers to inject for manual HTTP clients
   * Use this with axios, node-fetch, or other HTTP libraries
   */
  getTracingHeaders(): Record<string, string> {
    return {
      [HTTP_HEADERS.ORIGIN_SERVICE]: this.serviceName,
    };
  }

  /**
   * Wrap axios instance to automatically inject headers
   */
  wrapAxios(axios: any) {
    // Add request interceptor
    axios.interceptors.request.use((config: any) => {
      config.headers = config.headers || {};
      config.headers[HTTP_HEADERS.ORIGIN_SERVICE] = this.serviceName;
      return config;
    });
    return axios;
  }
}
