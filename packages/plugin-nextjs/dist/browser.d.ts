/**
 * Browser stub for @lattice.black/plugin-nextjs
 *
 * This file is used when webpack tries to bundle the plugin for the browser.
 * It exports no-op implementations that won't cause build errors.
 *
 * The actual implementation (index.ts) uses Node.js-only modules like fs and glob.
 */
export interface LatticeNextConfig {
    serviceName: string;
    environment?: string;
    apiEndpoint?: string;
    apiKey?: string;
    enabled?: boolean;
    autoSubmit?: boolean;
    appDir?: string;
    onAnalyzed?: (metadata: unknown) => void;
    onSubmitted?: (response: unknown) => void;
    onError?: (error: Error) => void;
}
/**
 * Browser stub for LatticeNextPlugin
 * This should never actually be instantiated in the browser.
 */
export declare class LatticeNextPlugin {
    constructor(_config: LatticeNextConfig);
    analyze(): Promise<never>;
}
