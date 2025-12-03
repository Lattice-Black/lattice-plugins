"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultSampler = exports.Sampler = void 0;
exports.createSampler = createSampler;
const core_1 = require("@lattice.black/core");
class Sampler {
    config;
    constructor(config) {
        this.config = {
            ...core_1.DEFAULT_SAMPLING_CONFIG,
            ...config,
            rules: config?.rules ?? [],
        };
    }
    shouldSample(context) {
        const rate = this.getRate(context);
        if (rate <= 0) {
            return false;
        }
        if (rate >= 1) {
            return true;
        }
        return Math.random() < rate;
    }
    getRate(context) {
        for (const rule of this.config.rules) {
            if (this.matchesRule(context, rule)) {
                return this.clampRate(rule.rate);
            }
        }
        const globalRate = context.eventType === 'error' ? this.config.errors : this.config.metrics;
        return this.clampRate(globalRate);
    }
    matchesRule(context, rule) {
        const { match } = rule;
        if (match.path !== undefined && !this.matchPath(context.path, match.path)) {
            return false;
        }
        if (match.method !== undefined && context.method?.toUpperCase() !== match.method.toUpperCase()) {
            return false;
        }
        if (match.errorType !== undefined && context.errorType !== match.errorType) {
            return false;
        }
        return true;
    }
    matchPath(actual, pattern) {
        if (!actual) {
            return false;
        }
        if (pattern === actual) {
            return true;
        }
        const regexPattern = pattern
            .replace(/\*\*/g, '___DOUBLE_STAR___')
            .replace(/\*/g, '[^/]+')
            .replace(/___DOUBLE_STAR___/g, '.*');
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(actual);
    }
    clampRate(rate) {
        return Math.min(Math.max(rate, 0), 1);
    }
}
exports.Sampler = Sampler;
function createSampler(config) {
    return new Sampler(config);
}
exports.defaultSampler = new Sampler();
//# sourceMappingURL=sampler.js.map