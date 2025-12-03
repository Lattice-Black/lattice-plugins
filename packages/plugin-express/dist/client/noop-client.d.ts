import type { ServiceMetadataSubmission, ErrorEvent } from '@lattice.black/core';
import type { SubmissionResponse } from '../config/types';
export interface LatticeApiClient {
    submitMetadata(metadata: ServiceMetadataSubmission): Promise<SubmissionResponse>;
    submitErrors(errors: Partial<ErrorEvent>[]): Promise<void>;
    submitMetrics(metrics: unknown[]): Promise<void>;
    healthCheck(): Promise<boolean>;
}
export declare class NoOpClient implements LatticeApiClient {
    submitMetadata(_metadata: ServiceMetadataSubmission): Promise<SubmissionResponse>;
    submitErrors(_errors: Partial<ErrorEvent>[]): Promise<void>;
    submitMetrics(_metrics: unknown[]): Promise<void>;
    healthCheck(): Promise<boolean>;
}
export declare const noOpClient: NoOpClient;
//# sourceMappingURL=noop-client.d.ts.map