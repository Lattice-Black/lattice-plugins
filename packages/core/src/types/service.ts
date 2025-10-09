/**
 * Service entity - Represents a deployed application or microservice
 */
export interface Service {
  // Identity
  id: string;
  name: string;
  version?: string;

  // Runtime Environment
  environment?: 'development' | 'staging' | 'production' | string;
  deploymentType?: 'kubernetes' | 'docker' | 'serverless' | 'bare-metal';

  // Technology Stack
  language: string;
  framework: string;
  runtime?: string;

  // Metadata
  description?: string;
  repository?: string;
  healthCheckUrl?: string;

  // Tracking
  status: 'active' | 'inactive' | 'unknown';
  firstSeen: Date;
  lastSeen: Date;

  // Plugin Information
  discoveredBy: {
    pluginName: string;
    pluginVersion: string;
    schemaVersion: string;
  };

  // Extensibility
  metadata?: Record<string, unknown>;
}

/**
 * Service status enum
 */
export enum ServiceStatus {
  Active = 'active',
  Inactive = 'inactive',
  Unknown = 'unknown',
}

/**
 * Deployment type enum
 */
export enum DeploymentType {
  Kubernetes = 'kubernetes',
  Docker = 'docker',
  Serverless = 'serverless',
  BareMetal = 'bare-metal',
}

/**
 * Environment enum
 */
export enum Environment {
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
}
