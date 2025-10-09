import { ServiceMetadataSubmission } from '@lattice/core';

/**
 * Lattice plugin configuration interface
 */
export interface LatticeConfig {
  // Service Identity
  serviceName?: string;
  environment?: string;

  // API Connection
  apiEndpoint?: string;
  apiKey?: string;

  // Behavior
  enabled?: boolean;
  autoSubmit?: boolean;
  submitInterval?: number;

  // Discovery Options
  discoverRoutes?: boolean;
  discoverDependencies?: boolean;
  dependencyDepth?: number;
  packageJsonPath?: string;

  // Callbacks
  onAnalyzed?: (metadata: ServiceMetadataSubmission) => void;
  onSubmitted?: (response: SubmissionResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Submission response from collector API
 */
export interface SubmissionResponse {
  success: boolean;
  serviceId: string;
  routesProcessed: number;
  dependenciesProcessed: number;
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Required<Omit<LatticeConfig, 'onAnalyzed' | 'onSubmitted' | 'onError' | 'packageJsonPath'>> = {
  serviceName: '',
  environment: process.env['NODE_ENV'] || 'development',
  apiEndpoint: process.env['LATTICE_API_ENDPOINT'] || 'https://api.lattice.dev/v1',
  apiKey: process.env['LATTICE_API_KEY'] || '',
  enabled: process.env['LATTICE_ENABLED'] !== 'false',
  autoSubmit: process.env['LATTICE_AUTO_SUBMIT'] !== 'false',
  submitInterval: parseInt(process.env['LATTICE_SUBMIT_INTERVAL'] || '300000', 10),
  discoverRoutes: true,
  discoverDependencies: true,
  dependencyDepth: 1,
};
