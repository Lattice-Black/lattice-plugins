import { Application } from 'express';
import { ServiceMetadataSubmission } from '@lattice.black/core';
import { LatticeConfig, SubmissionResponse } from './config/types';
export declare class LatticePlugin {
    private config;
    private routeAnalyzer;
    private dependencyAnalyzer;
    private serviceNameDetector;
    private apiClient;
    private metadata;
    private submitTimer;
    private metricsTracker;
    constructor(config?: LatticeConfig);
    analyze(app: Application): Promise<ServiceMetadataSubmission>;
    submit(metadata?: ServiceMetadataSubmission): Promise<SubmissionResponse | null>;
    getMetadata(): ServiceMetadataSubmission | null;
    getServiceName(): string;
    isEnabled(): boolean;
    start(): void;
    stop(): void;
    createMetricsMiddleware(): (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => void;
    private handleError;
    private getPackageJson;
    private getEmptyMetadata;
}
export * from './config/types';
//# sourceMappingURL=index.d.ts.map