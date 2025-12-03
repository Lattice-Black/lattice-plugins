"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONFIG = void 0;
exports.resolveConfig = resolveConfig;
const core_1 = require("@lattice.black/core");
exports.DEFAULT_CONFIG = {
    serviceName: '',
    environment: process.env['NODE_ENV'] || 'development',
    apiEndpoint: process.env['LATTICE_API_ENDPOINT'] || 'https://lattice-production.up.railway.app/api/v1',
    apiKey: process.env['LATTICE_API_KEY'] || '',
    enabled: process.env['LATTICE_ENABLED'] !== 'false',
    autoSubmit: process.env['LATTICE_AUTO_SUBMIT'] !== 'false',
    submitInterval: parseInt(process.env['LATTICE_SUBMIT_INTERVAL'] || '300000', 10),
    debug: process.env['LATTICE_DEBUG'] === 'true',
    discoverRoutes: true,
    discoverDependencies: true,
    dependencyDepth: 1,
    privacy: core_1.DEFAULT_PRIVACY_CONFIG,
    sampling: core_1.DEFAULT_SAMPLING_CONFIG,
    batching: core_1.DEFAULT_BATCH_CONFIG,
};
function resolveConfig(config = {}) {
    return {
        ...exports.DEFAULT_CONFIG,
        ...config,
        privacy: {
            ...core_1.DEFAULT_PRIVACY_CONFIG,
            ...config.privacy,
        },
        sampling: {
            ...core_1.DEFAULT_SAMPLING_CONFIG,
            ...config.sampling,
        },
        batching: {
            ...core_1.DEFAULT_BATCH_CONFIG,
            ...config.batching,
        },
    };
}
//# sourceMappingURL=types.js.map