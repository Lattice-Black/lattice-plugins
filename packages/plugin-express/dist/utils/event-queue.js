"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventQueue = void 0;
exports.createEventQueue = createEventQueue;
const core_1 = require("@lattice.black/core");
const safe_wrapper_1 = require("./safe-wrapper");
class EventQueue {
    queue = [];
    timer = null;
    isFlushing = false;
    isShutdown = false;
    droppedCount = 0;
    flushCount = 0;
    failedFlushCount = 0;
    config;
    constructor(config) {
        this.config = {
            ...config,
            maxBatchSize: this.clamp(config.maxBatchSize, core_1.BATCH_LIMITS.MIN_BATCH_SIZE, core_1.BATCH_LIMITS.MAX_BATCH_SIZE),
            flushIntervalMs: this.clamp(config.flushIntervalMs, core_1.BATCH_LIMITS.MIN_FLUSH_INTERVAL, core_1.BATCH_LIMITS.MAX_FLUSH_INTERVAL),
            maxQueueSize: this.clamp(config.maxQueueSize, core_1.BATCH_LIMITS.MIN_QUEUE_SIZE, core_1.BATCH_LIMITS.MAX_QUEUE_SIZE),
            onError: config.onError ?? safe_wrapper_1.defaultErrorHandler,
            enabled: config.enabled ?? true,
        };
        if (this.config.enabled) {
            this.startTimer();
        }
    }
    enqueue(event) {
        if (this.isShutdown || !this.config.enabled) {
            return false;
        }
        if (this.queue.length >= this.config.maxQueueSize) {
            this.droppedCount++;
            this.config.onError?.(new Error(`Queue full (${this.config.maxQueueSize}), dropping event`), 'EventQueue.enqueue');
            return false;
        }
        this.queue.push(event);
        if (this.queue.length >= this.config.maxBatchSize) {
            this.flush().catch(() => {
            });
        }
        return true;
    }
    async flush() {
        if (this.isShutdown || this.isFlushing || this.queue.length === 0) {
            return;
        }
        this.isFlushing = true;
        try {
            const batch = this.queue.splice(0, this.config.maxBatchSize);
            if (batch.length > 0) {
                await this.config.onFlush(batch);
                this.flushCount++;
            }
        }
        catch (error) {
            this.failedFlushCount++;
            if (error instanceof Error) {
                this.config.onError?.(error, 'EventQueue.flush');
            }
        }
        finally {
            this.isFlushing = false;
        }
    }
    async forceFlush(timeoutMs = core_1.SHUTDOWN_CONFIG.DEFAULT_FLUSH_TIMEOUT) {
        if (this.isShutdown) {
            return;
        }
        this.stopTimer();
        const startTime = Date.now();
        while (this.queue.length > 0 && Date.now() - startTime < timeoutMs) {
            await this.flush();
            if (this.queue.length > 0) {
                await this.sleep(100);
            }
        }
        if (!this.isShutdown && this.config.enabled) {
            this.startTimer();
        }
    }
    shutdown() {
        this.isShutdown = true;
        this.stopTimer();
        this.queue = [];
    }
    getState() {
        return {
            size: this.queue.length,
            dropped: this.droppedCount,
            flushCount: this.flushCount,
            failedFlushCount: this.failedFlushCount,
            isFlushing: this.isFlushing,
            isShutdown: this.isShutdown,
        };
    }
    isEmpty() {
        return this.queue.length === 0;
    }
    size() {
        return this.queue.length;
    }
    startTimer() {
        if (this.timer) {
            return;
        }
        this.timer = setInterval(() => {
            this.flush().catch(() => {
            });
        }, this.config.flushIntervalMs);
        this.timer.unref();
    }
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.EventQueue = EventQueue;
function createEventQueue(onFlush, config) {
    return new EventQueue({
        maxBatchSize: 10,
        flushIntervalMs: 5000,
        maxQueueSize: 1000,
        ...config,
        onFlush,
    });
}
//# sourceMappingURL=event-queue.js.map