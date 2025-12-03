import { ServiceMetadataSubmission, ErrorEvent, PrivacyConfig, SamplingConfig, BatchConfig, BeforeSendHook } from '@lattice.black/core';
export interface LatticeConfig {
    serviceName?: string;
    environment?: string;
    apiEndpoint?: string;
    apiKey?: string;
    enabled?: boolean;
    autoSubmit?: boolean;
    submitInterval?: number;
    debug?: boolean;
    discoverRoutes?: boolean;
    discoverDependencies?: boolean;
    dependencyDepth?: number;
    packageJsonPath?: string;
    privacy?: Partial<PrivacyConfig>;
    sampling?: Partial<SamplingConfig>;
    batching?: Partial<BatchConfig>;
    beforeSendError?: BeforeSendHook<Partial<ErrorEvent>>;
    beforeSendMetric?: BeforeSendHook<RequestMetrics>;
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
export interface RequestMetrics {
    method: string;
    path: string;
    statusCode: number;
    durationMs: number;
    timestamp: Date;
    serviceName: string;
}
export interface ResolvedLatticeConfig {
    serviceName: string;
    environment: string;
    apiEndpoint: string;
    apiKey: string;
    enabled: boolean;
    autoSubmit: boolean;
    submitInterval: number;
    debug: boolean;
    discoverRoutes: boolean;
    discoverDependencies: boolean;
    dependencyDepth: number;
    packageJsonPath?: string;
    privacy: PrivacyConfig;
    sampling: SamplingConfig;
    batching: BatchConfig;
    beforeSendError?: BeforeSendHook<Partial<ErrorEvent>>;
    beforeSendMetric?: BeforeSendHook<RequestMetrics>;
    onAnalyzed?: (metadata: ServiceMetadataSubmission) => void;
    onSubmitted?: (response: SubmissionResponse) => void;
    onError?: (error: Error) => void;
}
export declare const DEFAULT_CONFIG: Omit<ResolvedLatticeConfig, 'beforeSendError' | 'beforeSendMetric' | 'onAnalyzed' | 'onSubmitted' | 'onError' | 'packageJsonPath'>;
export declare function resolveConfig(config?: LatticeConfig): ResolvedLatticeConfig;
//# sourceMappingURL=types.d.ts.map