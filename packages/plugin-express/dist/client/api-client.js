"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiClient = void 0;
const core_1 = require("@lattice.black/core");
class ApiClient {
    apiEndpoint;
    apiKey;
    constructor(apiEndpoint, apiKey) {
        this.apiEndpoint = apiEndpoint.replace(/\/$/, '');
        this.apiKey = apiKey;
    }
    async submitMetadata(metadata) {
        const url = `${this.apiEndpoint}${core_1.API_ENDPOINTS.INGEST_METADATA}`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.apiKey && { [core_1.HTTP_HEADERS.API_KEY]: this.apiKey }),
                    [core_1.HTTP_HEADERS.SCHEMA_VERSION]: '1.0.0',
                },
                body: JSON.stringify(metadata),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API submission failed: ${response.status} ${response.statusText} - ${errorText}`);
            }
            const result = (await response.json());
            return result;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to submit metadata: ${error.message}`);
            }
            throw error;
        }
    }
    async healthCheck() {
        const url = `${this.apiEndpoint}${core_1.API_ENDPOINTS.HEALTH}`;
        try {
            const response = await fetch(url, {
                method: 'GET',
            });
            return response.ok;
        }
        catch {
            return false;
        }
    }
    async submitErrors(errors) {
        const url = `${this.apiEndpoint}/errors/batch`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.apiKey && { [core_1.HTTP_HEADERS.API_KEY]: this.apiKey }),
                },
                body: JSON.stringify({ errors }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error submission failed: ${response.status} ${response.statusText} - ${errorText}`);
            }
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to submit errors: ${error.message}`);
            }
            throw error;
        }
    }
    async submitMetrics(metrics) {
        const url = `${this.apiEndpoint}/performance/traces/batch`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.apiKey && { [core_1.HTTP_HEADERS.API_KEY]: this.apiKey }),
                },
                body: JSON.stringify({ traces: metrics }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Metrics submission failed: ${response.status} ${response.statusText} - ${errorText}`);
            }
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to submit metrics: ${error.message}`);
            }
            throw error;
        }
    }
}
exports.ApiClient = ApiClient;
//# sourceMappingURL=api-client.js.map