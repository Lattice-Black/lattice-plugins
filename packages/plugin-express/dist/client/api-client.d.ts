import { ServiceMetadataSubmission } from '@lattice.black/core';
import { SubmissionResponse } from '../config/types';
export declare class ApiClient {
    private apiEndpoint;
    private apiKey;
    constructor(apiEndpoint: string, apiKey: string);
    submitMetadata(metadata: ServiceMetadataSubmission): Promise<SubmissionResponse>;
    healthCheck(): Promise<boolean>;
}
//# sourceMappingURL=api-client.d.ts.map