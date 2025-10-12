import { ServiceMetadataSubmission } from '@lattice.black/core';
export interface LatticeNextConfig {
    serviceName: string;
    environment?: string;
    apiEndpoint?: string;
    apiKey?: string;
    enabled?: boolean;
    autoSubmit?: boolean;
    appDir?: string;
    onAnalyzed?: (metadata: ServiceMetadataSubmission) => void;
    onSubmitted?: (response: any) => void;
    onError?: (error: Error) => void;
}
export declare class LatticeNextPlugin {
    private config;
    constructor(config: LatticeNextConfig);
    analyze(): Promise<ServiceMetadataSubmission>;
    private discoverRoutes;
    private extractHTTPMethods;
    private discoverDependencies;
    private getPackageVersion;
    private submit;
}
