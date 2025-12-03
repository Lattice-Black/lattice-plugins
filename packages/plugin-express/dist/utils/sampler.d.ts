import type { SamplingConfig } from '@lattice.black/core';
export interface SamplingContext {
    path?: string;
    method?: string;
    errorType?: string;
    eventType: 'error' | 'metric';
}
export declare class Sampler {
    private readonly config;
    constructor(config?: Partial<SamplingConfig>);
    shouldSample(context: SamplingContext): boolean;
    getRate(context: SamplingContext): number;
    private matchesRule;
    private matchPath;
    private clampRate;
}
export declare function createSampler(config?: Partial<SamplingConfig>): Sampler;
export declare const defaultSampler: Sampler;
//# sourceMappingURL=sampler.d.ts.map