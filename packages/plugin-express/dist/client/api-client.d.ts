import { ServiceMetadataSubmission, ErrorEvent } from '@lattice.black/core';
import { SubmissionResponse } from '../config/types';
import type { LatticeApiClient } from './noop-client';
export declare class ApiClient implements LatticeApiClient {
    private apiEndpoint;
    private apiKey;
    constructor(apiEndpoint: string, apiKey: string);
    submitMetadata(metadata: ServiceMetadataSubmission): Promise<SubmissionResponse>;
    healthCheck(): Promise<boolean>;
    submitErrors(errors: Partial<ErrorEvent>[]): Promise<void>;
    submitMetrics(metrics: unknown[]): Promise<void>;
}
//# sourceMappingURL=api-client.d.ts.map