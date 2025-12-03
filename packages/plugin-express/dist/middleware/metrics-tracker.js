"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsTracker = void 0;
const core_1 = require("@lattice.black/core");
const event_queue_1 = require("../utils/event-queue");
const sampler_1 = require("../utils/sampler");
class MetricsTracker {
    serviceName;
    apiEndpoint;
    apiKey;
    sampler;
    eventQueue;
    enabled;
    debug;
    isShutdown = false;
    constructor(serviceName, apiEndpoint, apiKey, config = {}) {
        this.serviceName = serviceName;
        this.apiEndpoint = apiEndpoint;
        this.apiKey = apiKey;
        this.enabled = config.enabled !== false;
        this.debug = config.debug ?? false;
        this.sampler = (0, sampler_1.createSampler)({
            errors: 1.0,
            metrics: config.sampling?.metrics ?? 1.0,
            rules: config.sampling?.rules ?? [],
        });
        this.eventQueue = (0, event_queue_1.createEventQueue)(async (metrics) => this.sendBatch(metrics), {
            maxBatchSize: config.batching?.maxBatchSize ?? 10,
            flushIntervalMs: config.batching?.flushIntervalMs ?? 5000,
            maxQueueSize: config.batching?.maxQueueSize ?? 1000,
            onError: (error) => this.log('error', `Batch send failed: ${error.message}`),
            enabled: this.enabled,
        });
    }
    middleware() {
        return (req, res, next) => {
            if (!this.enabled || this.isShutdown) {
                return next();
            }
            const shouldTrack = this.sampler.shouldSample({
                eventType: 'metric',
                path: req.path,
                method: req.method,
            });
            if (!shouldTrack) {
                this.log('debug', `Skipping metric (sampled out): ${req.method} ${req.path}`);
                return next();
            }
            const startTime = Date.now();
            const originalEnd = res.end.bind(res);
            const self = this;
            res.end = function (...args) {
                const responseTime = Date.now() - startTime;
                const headerValue = req.get(core_1.HTTP_HEADERS.ORIGIN_SERVICE) || req.get('X-Origin-Service');
                const callerServiceName = Array.isArray(headerValue) ? headerValue[0] : headerValue;
                const metric = {
                    method: req.method,
                    path: req.path,
                    statusCode: res.statusCode,
                    responseTime,
                    timestamp: new Date(),
                    callerServiceName,
                    serviceName: self.serviceName,
                };
                self.enqueueMetric(metric);
                return originalEnd(...args);
            };
            next();
        };
    }
    async forceFlush() {
        await this.eventQueue.forceFlush();
    }
    shutdown() {
        this.isShutdown = true;
        this.eventQueue.shutdown();
    }
    getState() {
        return this.eventQueue.getState();
    }
    getStats() {
        const state = this.eventQueue.getState();
        return {
            queueSize: state.size,
            droppedCount: state.dropped,
            flushCount: state.flushCount,
            failedFlushCount: state.failedFlushCount,
        };
    }
    enqueueMetric(metric) {
        const queued = this.eventQueue.enqueue(metric);
        if (queued) {
            this.log('debug', `Queued metric: ${metric.method} ${metric.path} - ${metric.statusCode} (${metric.responseTime}ms)`);
        }
        else {
            this.log('warn', 'Metric dropped: queue full');
        }
    }
    async sendBatch(metrics) {
        if (metrics.length === 0) {
            return;
        }
        try {
            const traces = metrics.map((metric) => ({
                service_id: metric.serviceName,
                operation_name: `${metric.method} ${metric.path}`,
                operation_type: 'http_request',
                start_time: new Date(metric.timestamp.getTime() - metric.responseTime),
                duration_ms: metric.responseTime,
                status_code: metric.statusCode,
                method: metric.method,
                path: metric.path,
                caller_service: metric.callerServiceName,
            }));
            const response = await fetch(`${this.apiEndpoint}/performance/traces/batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.apiKey && { [core_1.HTTP_HEADERS.API_KEY]: this.apiKey }),
                },
                body: JSON.stringify({ traces }),
            });
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            this.log('debug', `Sent ${metrics.length} metrics to API`);
        }
        catch (error) {
            this.log('error', `Failed to send metrics: ${error.message}`);
            throw error;
        }
    }
    log(level, message) {
        const prefix = '[Lattice MetricsTracker]';
        if (level === 'error') {
            console.error(`${prefix} ${message}`);
        }
        else if (level === 'warn') {
            console.warn(`${prefix} ${message}`);
        }
        else if (this.debug) {
            console.log(`${prefix} ${message}`);
        }
    }
}
exports.MetricsTracker = MetricsTracker;
//# sourceMappingURL=metrics-tracker.js.map