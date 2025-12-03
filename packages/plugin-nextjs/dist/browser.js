/**
 * Browser stub for @lattice.black/plugin-nextjs
 *
 * This file is used when webpack tries to bundle the plugin for the browser.
 * It exports no-op implementations that won't cause build errors.
 *
 * The actual implementation (index.ts) uses Node.js-only modules like fs and glob.
 */
/**
 * Browser stub for LatticeNextPlugin
 * This should never actually be instantiated in the browser.
 */
export class LatticeNextPlugin {
    constructor(_config) {
        // Check if we're in a browser environment without using 'window' directly
        // to avoid TypeScript DOM type requirements
        const isBrowser = typeof globalThis !== 'undefined' && 'document' in globalThis;
        if (isBrowser) {
            console.warn('[@lattice.black/plugin-nextjs] This plugin is server-only and should not be used in the browser.');
        }
    }
    async analyze() {
        throw new Error('[@lattice.black/plugin-nextjs] analyze() is only available on the server. ' +
            'Make sure you are using this plugin in instrumentation.ts or server-side code.');
    }
}
