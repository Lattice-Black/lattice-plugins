/**
 * Plugin entity - Represents a framework-specific analyzer
 */
export interface Plugin {
  // Identity
  id: string;
  name: string;
  version: string;

  // Compatibility
  supportedFrameworks: string[];
  supportedSchemaVersions: string[];
  preferredSchemaVersion: string;

  // Capabilities
  canDiscoverRoutes: boolean;
  canDiscoverDependencies: boolean;
  canTrackConnections: boolean;

  // Metadata
  description?: string;
  author?: string;
  repository?: string;
  documentation?: string;

  // Statistics (from collector)
  servicesUsing?: number;

  // Tracking
  registeredAt: Date;
  lastUsed?: Date;

  // Extensibility
  metadata?: Record<string, unknown>;
}
