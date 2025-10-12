"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONFIG = void 0;
exports.DEFAULT_CONFIG = {
    serviceName: '',
    environment: process.env['NODE_ENV'] || 'development',
    apiEndpoint: process.env['LATTICE_API_ENDPOINT'] || 'https://api.lattice.dev/v1',
    apiKey: process.env['LATTICE_API_KEY'] || '',
    enabled: process.env['LATTICE_ENABLED'] !== 'false',
    autoSubmit: process.env['LATTICE_AUTO_SUBMIT'] !== 'false',
    submitInterval: parseInt(process.env['LATTICE_SUBMIT_INTERVAL'] || '300000', 10),
    discoverRoutes: true,
    discoverDependencies: true,
    dependencyDepth: 1,
};
//# sourceMappingURL=types.js.map