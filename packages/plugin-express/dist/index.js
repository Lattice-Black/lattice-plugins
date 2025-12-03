"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LatticeExpress = exports.createSafeSyncWrapper = exports.createSafeAsyncWrapper = exports.safeSync = exports.safeAsync = exports.createDataScrubber = exports.DataScrubber = exports.createSampler = exports.Sampler = exports.createEventQueue = exports.EventQueue = exports.NoOpClient = exports.ErrorCapture = exports.HttpInterceptor = exports.LatticePlugin = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@lattice.black/core");
const types_1 = require("./config/types");
const route_analyzer_1 = require("./discovery/route-analyzer");
const dependency_analyzer_1 = require("./discovery/dependency-analyzer");
const service_name_detector_1 = require("./discovery/service-name-detector");
const api_client_1 = require("./client/api-client");
const noop_client_1 = require("./client/noop-client");
const metrics_tracker_1 = require("./middleware/metrics-tracker");
const http_interceptor_1 = require("./client/http-interceptor");
const error_capture_1 = require("./middleware/error-capture");
const safe_wrapper_1 = require("./utils/safe-wrapper");
class LatticePlugin {
    config;
    routeAnalyzer;
    dependencyAnalyzer;
    serviceNameDetector;
    apiClient;
    metadata = null;
    submitTimer = null;
    metricsTracker = null;
    httpInterceptor = null;
    errorCapture = null;
    state = core_1.SDKState.Uninitialized;
    initError = null;
    constructor(config = {}) {
        try {
            this.state = core_1.SDKState.Initializing;
            this.config = (0, types_1.resolveConfig)(config);
            this.routeAnalyzer = new route_analyzer_1.RouteAnalyzer();
            this.dependencyAnalyzer = new dependency_analyzer_1.DependencyAnalyzer();
            this.serviceNameDetector = new service_name_detector_1.ServiceNameDetector();
            if (this.config.enabled) {
                this.apiClient = new api_client_1.ApiClient(this.config.apiEndpoint, this.config.apiKey);
            }
            else {
                this.apiClient = new noop_client_1.NoOpClient();
            }
            this.state = core_1.SDKState.Ready;
            this.log('debug', 'Plugin initialized successfully');
        }
        catch (error) {
            this.state = core_1.SDKState.Failed;
            this.initError = error;
            this.apiClient = new noop_client_1.NoOpClient();
            this.routeAnalyzer = new route_analyzer_1.RouteAnalyzer();
            this.dependencyAnalyzer = new dependency_analyzer_1.DependencyAnalyzer();
            this.serviceNameDetector = new service_name_detector_1.ServiceNameDetector();
            this.config = (0, types_1.resolveConfig)({});
            this.log('error', `Initialization failed: ${error.message}`);
        }
    }
    async analyze(app) {
        if (!this.config.enabled || this.state === core_1.SDKState.Failed) {
            this.log('debug', 'Plugin is disabled or failed, returning empty metadata');
            return this.getEmptyMetadata();
        }
        const result = await (0, safe_wrapper_1.safeAsync)(async () => {
            const serviceName = this.serviceNameDetector.detectServiceName(this.config.serviceName);
            this.config.serviceName = serviceName;
            const pkgJson = this.getPackageJson();
            const serviceId = (0, core_1.generateId)();
            const service = {
                id: serviceId,
                name: serviceName,
                version: pkgJson?.version,
                environment: this.config.environment,
                language: 'typescript',
                framework: 'express',
                runtime: `node-${process.version}`,
                status: core_1.ServiceStatus.Active,
                firstSeen: new Date(),
                lastSeen: new Date(),
                discoveredBy: {
                    pluginName: '@lattice/plugin-express',
                    pluginVersion: '0.2.0',
                    schemaVersion: '1.0.0',
                },
            };
            const routes = this.config.discoverRoutes
                ? this.routeAnalyzer.analyzeRoutes(app, serviceId)
                : [];
            const dependencies = this.config.discoverDependencies
                ? this.dependencyAnalyzer.analyzeDependencies(serviceId, this.config.packageJsonPath)
                : [];
            this.metadata = {
                service,
                routes,
                dependencies,
            };
            if (this.config.onAnalyzed) {
                this.config.onAnalyzed(this.metadata);
            }
            this.log('info', `Discovered service "${serviceName}" with ${routes.length} routes and ${dependencies.length} dependencies`);
            if (this.config.autoSubmit) {
                await this.submit();
            }
            this.start();
            return this.metadata;
        }, this.getEmptyMetadata(), 'LatticePlugin.analyze');
        return result;
    }
    async submit(metadata) {
        if (!this.config.enabled) {
            return null;
        }
        const dataToSubmit = metadata || this.metadata;
        if (!dataToSubmit) {
            this.log('warn', 'No metadata to submit. Call analyze() first.');
            return null;
        }
        const result = await (0, safe_wrapper_1.safeAsync)(async () => {
            const response = await this.apiClient.submitMetadata(dataToSubmit);
            if (this.config.onSubmitted) {
                this.config.onSubmitted(response);
            }
            this.log('debug', `Metadata submitted: ${response.serviceId}`);
            return response;
        }, null, 'LatticePlugin.submit');
        return result;
    }
    getMetadata() {
        return this.metadata;
    }
    getServiceName() {
        return this.metadata?.service.name || this.config.serviceName || 'unknown';
    }
    isEnabled() {
        return this.config.enabled;
    }
    getState() {
        return this.state;
    }
    getInitError() {
        return this.initError;
    }
    start() {
        if (!this.config.enabled || !this.config.autoSubmit || this.submitTimer) {
            return;
        }
        this.submitTimer = setInterval(() => {
            if (this.metadata) {
                this.metadata.service.lastSeen = new Date();
                this.submit().catch(() => {
                });
            }
        }, this.config.submitInterval);
        this.submitTimer.unref();
    }
    stop() {
        if (this.submitTimer) {
            clearInterval(this.submitTimer);
            this.submitTimer = null;
        }
    }
    async forceFlush(timeoutMs) {
        this.log('debug', 'Force flushing all pending events');
        const promises = [];
        if (this.errorCapture) {
            promises.push(this.errorCapture.forceFlush());
        }
        if (this.metricsTracker) {
            promises.push(this.metricsTracker.forceFlush());
        }
        if (timeoutMs) {
            await Promise.race([
                Promise.allSettled(promises),
                new Promise((resolve) => setTimeout(resolve, timeoutMs)),
            ]);
        }
        else {
            await Promise.allSettled(promises);
        }
    }
    async shutdown(timeoutMs = 10000) {
        if (this.state === core_1.SDKState.ShuttingDown || this.state === core_1.SDKState.Shutdown) {
            return;
        }
        this.state = core_1.SDKState.ShuttingDown;
        this.log('debug', 'Shutting down...');
        this.stop();
        await this.forceFlush(timeoutMs);
        if (this.errorCapture) {
            this.errorCapture.shutdown();
        }
        if (this.metricsTracker) {
            this.metricsTracker.shutdown();
        }
        this.state = core_1.SDKState.Shutdown;
        this.log('debug', 'Shutdown complete');
    }
    createMetricsMiddleware() {
        if (!this.metricsTracker) {
            const serviceName = this.serviceNameDetector.detectServiceName(this.config.serviceName);
            this.metricsTracker = new metrics_tracker_1.MetricsTracker(serviceName, this.config.apiEndpoint, this.config.apiKey, {
                enabled: this.config.enabled,
                debug: this.config.debug,
                sampling: this.config.sampling,
                batching: this.config.batching,
            });
        }
        return this.metricsTracker.middleware();
    }
    getHttpClient() {
        if (!this.httpInterceptor) {
            const serviceName = this.serviceNameDetector.detectServiceName(this.config.serviceName);
            this.httpInterceptor = new http_interceptor_1.HttpInterceptor(serviceName);
        }
        return this.httpInterceptor;
    }
    errorHandler() {
        if (!this.errorCapture) {
            const serviceName = this.serviceNameDetector.detectServiceName(this.config.serviceName);
            this.errorCapture = (0, error_capture_1.createErrorCapture)({
                ...this.config,
                serviceName,
            });
        }
        return this.errorCapture.middleware();
    }
    async captureError(error, context) {
        if (!this.errorCapture) {
            const serviceName = this.serviceNameDetector.detectServiceName(this.config.serviceName);
            this.errorCapture = (0, error_capture_1.createErrorCapture)({
                ...this.config,
                serviceName,
            });
        }
        await this.errorCapture.captureError(error, context);
    }
    getConfig() {
        return this.config;
    }
    log(level, message) {
        const prefix = '[Lattice]';
        if (level === 'error') {
            console.error(`${prefix} ${message}`);
            if (this.config.onError) {
                this.config.onError(new Error(message));
            }
        }
        else if (level === 'warn') {
            console.warn(`${prefix} ${message}`);
        }
        else if (level === 'info') {
            console.log(`${prefix} ✅ ${message}`);
        }
        else if (this.config.debug) {
            console.log(`${prefix} ${message}`);
        }
    }
    getPackageJson() {
        try {
            const fs = require('fs');
            const path = require('path');
            const pkgPath = path.join(process.cwd(), 'package.json');
            if (fs.existsSync(pkgPath)) {
                return JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
            }
        }
        catch {
        }
        return null;
    }
    getEmptyMetadata() {
        return {
            service: {
                id: (0, core_1.generateId)(),
                name: 'disabled',
                language: 'typescript',
                framework: 'express',
                status: core_1.ServiceStatus.Unknown,
                firstSeen: new Date(),
                lastSeen: new Date(),
                discoveredBy: {
                    pluginName: '@lattice/plugin-express',
                    pluginVersion: '0.2.0',
                    schemaVersion: '1.0.0',
                },
            },
            routes: [],
            dependencies: [],
        };
    }
}
exports.LatticePlugin = LatticePlugin;
tslib_1.__exportStar(require("./config/types"), exports);
var http_interceptor_2 = require("./client/http-interceptor");
Object.defineProperty(exports, "HttpInterceptor", { enumerable: true, get: function () { return http_interceptor_2.HttpInterceptor; } });
var error_capture_2 = require("./middleware/error-capture");
Object.defineProperty(exports, "ErrorCapture", { enumerable: true, get: function () { return error_capture_2.ErrorCapture; } });
var noop_client_2 = require("./client/noop-client");
Object.defineProperty(exports, "NoOpClient", { enumerable: true, get: function () { return noop_client_2.NoOpClient; } });
var event_queue_1 = require("./utils/event-queue");
Object.defineProperty(exports, "EventQueue", { enumerable: true, get: function () { return event_queue_1.EventQueue; } });
Object.defineProperty(exports, "createEventQueue", { enumerable: true, get: function () { return event_queue_1.createEventQueue; } });
var sampler_1 = require("./utils/sampler");
Object.defineProperty(exports, "Sampler", { enumerable: true, get: function () { return sampler_1.Sampler; } });
Object.defineProperty(exports, "createSampler", { enumerable: true, get: function () { return sampler_1.createSampler; } });
var data_scrubber_1 = require("./utils/data-scrubber");
Object.defineProperty(exports, "DataScrubber", { enumerable: true, get: function () { return data_scrubber_1.DataScrubber; } });
Object.defineProperty(exports, "createDataScrubber", { enumerable: true, get: function () { return data_scrubber_1.createDataScrubber; } });
var safe_wrapper_2 = require("./utils/safe-wrapper");
Object.defineProperty(exports, "safeAsync", { enumerable: true, get: function () { return safe_wrapper_2.safeAsync; } });
Object.defineProperty(exports, "safeSync", { enumerable: true, get: function () { return safe_wrapper_2.safeSync; } });
Object.defineProperty(exports, "createSafeAsyncWrapper", { enumerable: true, get: function () { return safe_wrapper_2.createSafeAsyncWrapper; } });
Object.defineProperty(exports, "createSafeSyncWrapper", { enumerable: true, get: function () { return safe_wrapper_2.createSafeSyncWrapper; } });
var index_1 = require("./index");
Object.defineProperty(exports, "LatticeExpress", { enumerable: true, get: function () { return index_1.LatticePlugin; } });
//# sourceMappingURL=index.js.map