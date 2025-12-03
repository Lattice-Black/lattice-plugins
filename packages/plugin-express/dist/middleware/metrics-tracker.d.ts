import { Request, Response, NextFunction } from 'express';
import { SamplingConfig, BatchConfig } from '@lattice.black/core';
export interface RequestMetrics {
    method: string;
    path: string;
    statusCode: number;
    responseTime: number;
    timestamp: Date;
    callerServiceName?: string;
    serviceName: string;
}
export interface MetricsTrackerConfig {
    enabled?: boolean;
    debug?: boolean;
    sampling?: Partial<SamplingConfig>;
    batching?: Partial<BatchConfig>;
}
export declare class MetricsTracker {
    private serviceName;
    private apiEndpoint;
    private apiKey;
    private readonly sampler;
    private readonly eventQueue;
    private readonly enabled;
    private readonly debug;
    private isShutdown;
    constructor(serviceName: string, apiEndpoint: string, apiKey: string, config?: MetricsTrackerConfig);
    middleware(): (req: Request, res: Response, next: NextFunction) => void;
    forceFlush(): Promise<void>;
    shutdown(): void;
    getState(): import("../utils/event-queue").QueueState;
    getStats(): {
        queueSize: number;
        droppedCount: number;
        flushCount: number;
        failedFlushCount: number;
    };
    private enqueueMetric;
    private sendBatch;
    private log;
}
//# sourceMappingURL=metrics-tracker.d.ts.map