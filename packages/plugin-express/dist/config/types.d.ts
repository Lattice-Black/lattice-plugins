import { ServiceMetadataSubmission } from '@lattice.black/core';
export interface LatticeConfig {
    serviceName?: string;
    environment?: string;
    apiEndpoint?: string;
    apiKey?: string;
    enabled?: boolean;
    autoSubmit?: boolean;
    submitInterval?: number;
    discoverRoutes?: boolean;
    discoverDependencies?: boolean;
    dependencyDepth?: number;
    packageJsonPath?: string;
    onAnalyzed?: (metadata: ServiceMetadataSubmission) => void;
    onSubmitted?: (response: SubmissionResponse) => void;
    onError?: (error: Error) => void;
}
export interface SubmissionResponse {
    success: boolean;
    serviceId: string;
    routesProcessed: number;
    dependenciesProcessed: number;
}
export declare const DEFAULT_CONFIG: Required<Omit<LatticeConfig, 'onAnalyzed' | 'onSubmitted' | 'onError' | 'packageJsonPath'>>;
//# sourceMappingURL=types.d.ts.map