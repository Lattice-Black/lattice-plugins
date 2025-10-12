import { Application } from 'express';
import { Route } from '@lattice.black/core';
export declare class RouteAnalyzer {
    analyzeRoutes(app: Application, serviceId: string): Route[];
    private normalizeMethod;
    private normalizePath;
}
//# sourceMappingURL=route-analyzer.d.ts.map