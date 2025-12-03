"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCapture = void 0;
exports.createErrorCapture = createErrorCapture;
const error_stack_parser_es_1 = require("error-stack-parser-es");
const core_1 = require("@lattice.black/core");
const event_queue_1 = require("../utils/event-queue");
const sampler_1 = require("../utils/sampler");
const data_scrubber_1 = require("../utils/data-scrubber");
const safe_wrapper_1 = require("../utils/safe-wrapper");
class ErrorCapture {
    config;
    sampler;
    eventQueue;
    beforeSend;
    isShutdown = false;
    constructor(config) {
        this.config = {
            serviceName: config.serviceName,
            apiEndpoint: config.apiEndpoint.replace(/\/$/, ''),
            apiKey: config.apiKey,
            environment: (config.environment || process.env['NODE_ENV'] || 'development'),
            enabled: config.enabled !== false,
            debug: config.debug ?? false,
            privacy: {
                ...core_1.DEFAULT_PRIVACY_CONFIG,
                ...config.privacy,
            },
        };
        this.beforeSend = config.beforeSend;
        this.sampler = (0, sampler_1.createSampler)({
            errors: config.sampling?.errors ?? 1.0,
            metrics: 1.0,
            rules: config.sampling?.rules ?? [],
        });
        this.eventQueue = (0, event_queue_1.createEventQueue)(async (events) => this.sendBatch(events), {
            maxBatchSize: config.batching?.maxBatchSize ?? 10,
            flushIntervalMs: config.batching?.flushIntervalMs ?? 5000,
            maxQueueSize: config.batching?.maxQueueSize ?? 1000,
            onError: (error) => this.log('error', `Batch send failed: ${error.message}`),
            enabled: this.config.enabled,
        });
    }
    middleware() {
        return async (err, req, _res, next) => {
            if (!this.config.enabled || this.isShutdown) {
                return next(err);
            }
            const shouldCapture = this.sampler.shouldSample({
                eventType: 'error',
                path: req.path,
                method: req.method,
                errorType: err.name,
            });
            if (!shouldCapture) {
                this.log('debug', `Dropping error (sampled out): ${err.name}`);
                return next(err);
            }
            (0, safe_wrapper_1.safeAsync)(() => this.captureError(err, this.buildRequestContext(req)), undefined, 'ErrorCapture.middleware').catch(() => {
            });
            next(err);
        };
    }
    async captureError(error, context) {
        if (!this.config.enabled || this.isShutdown) {
            return;
        }
        try {
            const stackFrames = this.parseStackTrace(error);
            const scrubber = (0, data_scrubber_1.createDataScrubber)(this.config.privacy);
            let errorEvent = {
                service_id: this.config.serviceName,
                environment: this.config.environment,
                error_type: error.name || 'Error',
                message: scrubber.scrubString(error.message || 'Unknown error'),
                stack_trace: stackFrames,
                context: context ? scrubber.scrub(context) : undefined,
                timestamp: new Date(),
            };
            if (this.beforeSend) {
                const result = await (0, safe_wrapper_1.safeAsync)(() => Promise.resolve(this.beforeSend(errorEvent)), errorEvent, 'ErrorCapture.beforeSend');
                if (result === null) {
                    this.log('debug', `Error dropped by beforeSend hook: ${error.name}`);
                    return;
                }
                errorEvent = result;
            }
            const queued = this.eventQueue.enqueue(errorEvent);
            if (!queued) {
                this.log('warn', 'Error dropped: queue full');
            }
        }
        catch (err) {
            this.log('error', `Error in captureError: ${err.message}`);
        }
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
    buildRequestContext(req) {
        const context = {
            method: req.method,
            path: req.path,
            url: req.url,
        };
        const userAgent = req.get('user-agent');
        if (userAgent) {
            context['user_agent'] = userAgent;
        }
        if (this.config.privacy.captureRequestHeaders || this.config.privacy.safeHeaders.length > 0) {
            const headers = (0, data_scrubber_1.scrubHeaders)(req.headers, this.config.privacy);
            if (Object.keys(headers).length > 0) {
                context['headers'] = headers;
            }
        }
        if (this.config.privacy.captureQueryParams && req.query) {
            const query = (0, data_scrubber_1.scrubQueryParams)(req.query, this.config.privacy);
            if (query) {
                context['query'] = query;
            }
        }
        if (this.config.privacy.captureRequestBody && req.body) {
            const body = (0, data_scrubber_1.scrubRequestBody)(req.body, this.config.privacy);
            if (body !== undefined) {
                context['body'] = body;
            }
        }
        if (this.config.privacy.captureIpAddress && req.ip) {
            context['ip'] = req.ip;
        }
        return context;
    }
    parseStackTrace(error) {
        try {
            const frames = (0, error_stack_parser_es_1.parse)(error);
            return frames.map((frame) => ({
                filename: frame.fileName || 'unknown',
                line_number: frame.lineNumber || 0,
                column_number: frame.columnNumber,
                function_name: frame.functionName || '<anonymous>',
            }));
        }
        catch {
            return [
                {
                    filename: 'unknown',
                    line_number: 0,
                    function_name: error.name || 'Error',
                },
            ];
        }
    }
    async sendBatch(errors) {
        if (errors.length === 0) {
            return;
        }
        try {
            const response = await fetch(`${this.config.apiEndpoint}/errors/batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    [core_1.HTTP_HEADERS.API_KEY]: this.config.apiKey,
                },
                body: JSON.stringify({ errors }),
            });
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            this.log('debug', `Sent ${errors.length} errors to API`);
        }
        catch (error) {
            this.log('error', `Failed to send errors: ${error.message}`);
            throw error;
        }
    }
    log(level, message) {
        const prefix = '[Lattice ErrorCapture]';
        if (level === 'error') {
            console.error(`${prefix} ${message}`);
        }
        else if (level === 'warn') {
            console.warn(`${prefix} ${message}`);
        }
        else if (this.config.debug) {
            console.log(`${prefix} ${message}`);
        }
    }
}
exports.ErrorCapture = ErrorCapture;
function createErrorCapture(config) {
    return new ErrorCapture({
        serviceName: config.serviceName,
        apiEndpoint: config.apiEndpoint,
        apiKey: config.apiKey,
        environment: config.environment,
        enabled: config.enabled,
        debug: config.debug,
        privacy: config.privacy,
        sampling: config.sampling,
        batching: config.batching,
        beforeSend: config.beforeSendError,
    });
}
//# sourceMappingURL=error-capture.js.map