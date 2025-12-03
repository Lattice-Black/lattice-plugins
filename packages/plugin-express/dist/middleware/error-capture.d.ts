import { Request, Response, NextFunction } from 'express';
import { PrivacyConfig, BeforeSendHook } from '@lattice.black/core';
import type { ErrorEvent } from '@lattice.black/core';
import type { ResolvedLatticeConfig } from '../config/types';
export interface ErrorCaptureConfig {
    serviceName: string;
    apiEndpoint: string;
    apiKey: string;
    environment?: string;
    enabled?: boolean;
    debug?: boolean;
    privacy?: Partial<PrivacyConfig>;
    sampling?: {
        errors?: number;
        rules?: Array<{
            match: {
                path?: string;
                method?: string;
                errorType?: string;
            };
            rate: number;
        }>;
    };
    batching?: {
        maxBatchSize?: number;
        flushIntervalMs?: number;
        maxQueueSize?: number;
    };
    beforeSend?: BeforeSendHook<Partial<ErrorEvent>>;
}
export declare class ErrorCapture {
    private readonly config;
    private readonly sampler;
    private readonly eventQueue;
    private readonly beforeSend?;
    private isShutdown;
    constructor(config: ErrorCaptureConfig);
    middleware(): (err: Error, req: Request, _res: Response, next: NextFunction) => Promise<void>;
    captureError(error: Error, context?: Record<string, unknown>): Promise<void>;
    forceFlush(): Promise<void>;
    shutdown(): void;
    getState(): import("../utils/event-queue").QueueState;
    private buildRequestContext;
    private parseStackTrace;
    private sendBatch;
    private log;
}
export declare function createErrorCapture(config: ResolvedLatticeConfig): ErrorCapture;
//# sourceMappingURL=error-capture.d.ts.map