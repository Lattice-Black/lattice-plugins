/**
 * Route entity - Represents an HTTP endpoint within a service
 */
export interface Route {
  // Identity
  id: string;
  serviceId: string;

  // HTTP Details
  method: HttpMethod;
  path: string;

  // Middleware & Handler
  middlewareChain?: string[];
  handlerLocation?: HandlerLocation;

  // Parameters
  pathParameters?: RouteParameter[];
  queryParameters?: RouteParameter[];

  // Request/Response (if available)
  requestSchema?: JSONSchema;
  responseSchema?: JSONSchema;

  // Documentation
  description?: string;
  tags?: string[];

  // Metrics (computed from Connection data)
  avgResponseTimeMs?: number;
  callFrequency?: number;
  errorRate?: number;

  // Tracking
  firstSeen: Date;
  lastSeen: Date;

  // Extensibility
  metadata?: Record<string, unknown>;
}

/**
 * HTTP method enum
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  ALL = 'ALL',
}

/**
 * Handler location information
 */
export interface HandlerLocation {
  file: string;
  line?: number;
  function?: string;
}

/**
 * Route parameter definition
 */
export interface RouteParameter {
  name: string;
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description?: string;
  example?: unknown;
}

/**
 * Simplified JSON Schema type
 */
export interface JSONSchema {
  type: string;
  properties?: Record<string, JSONSchema>;
  required?: string[];
  [key: string]: unknown;
}
