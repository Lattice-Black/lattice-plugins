"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noOpClient = exports.NoOpClient = void 0;
class NoOpClient {
    async submitMetadata(_metadata) {
        return {
            success: true,
            serviceId: 'noop',
            routesProcessed: 0,
            dependenciesProcessed: 0,
        };
    }
    async submitErrors(_errors) {
    }
    async submitMetrics(_metrics) {
    }
    async healthCheck() {
        return true;
    }
}
exports.NoOpClient = NoOpClient;
exports.noOpClient = new NoOpClient();
//# sourceMappingURL=noop-client.js.map