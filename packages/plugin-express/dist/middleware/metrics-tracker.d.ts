import { Request, Response, NextFunction } from 'express';
export interface RequestMetrics {
    method: string;
    path: string;
    statusCode: number;
    responseTime: number;
    timestamp: Date;
    serviceName?: string;
}
export declare class MetricsTracker {
    private serviceName;
    private apiEndpoint;
    private apiKey;
    private metrics;
    private maxMetrics;
    constructor(serviceName: string, apiEndpoint: string, apiKey: string);
    middleware(): (req: Request, res: Response, next: NextFunction) => void;
    private storeMetric;
    private submitMetrics;
    getStats(): {
        totalRequests: number;
        avgResponseTime: number;
        errorCount: number;
        errorRate: string;
        recentRequests: RequestMetrics[];
    };
}
//# sourceMappingURL=metrics-tracker.d.ts.map