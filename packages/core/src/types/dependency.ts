/**
 * Dependency entity - Represents an external package or library used by a service
 */
export interface Dependency {
  // Identity
  id: string;
  serviceId: string;

  // Package Information
  packageName: string;
  version: string;
  versionRange?: string;

  // Classification
  dependencyType: DependencyType;
  scope?: string;

  // Size & Impact
  installedSize?: number;
  publishSize?: number;
  fileCount?: number;

  // Security
  hasVulnerabilities?: boolean;
  vulnerabilityCount?: number;
  highestSeverity?: VulnerabilitySeverity;

  // Metadata
  description?: string;
  license?: string;
  repository?: string;
  homepage?: string;

  // Tracking
  firstSeen: Date;
  lastSeen: Date;

  // Extensibility
  metadata?: Record<string, unknown>;
}

/**
 * Dependency type enum
 */
export enum DependencyType {
  Direct = 'direct',
  Transitive = 'transitive',
  Peer = 'peer',
  Dev = 'dev',
}

/**
 * Vulnerability severity enum
 */
export enum VulnerabilitySeverity {
  Critical = 'critical',
  High = 'high',
  Medium = 'medium',
  Low = 'low',
}
