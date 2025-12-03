"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultScrubber = exports.DataScrubber = void 0;
exports.scrubObject = scrubObject;
exports.createDataScrubber = createDataScrubber;
exports.scrubHeaders = scrubHeaders;
exports.scrubQueryParams = scrubQueryParams;
exports.scrubRequestBody = scrubRequestBody;
const core_1 = require("@lattice.black/core");
const REDACTED = '[REDACTED]';
const MAX_DEPTH = 10;
function createSensitiveFieldSet(additionalFields = []) {
    const fields = [...core_1.DEFAULT_SENSITIVE_FIELDS, ...additionalFields];
    return new Set(fields.map((f) => f.toLowerCase()));
}
function isSensitiveField(fieldName, sensitiveFields) {
    const lowerName = fieldName.toLowerCase();
    for (const sensitive of sensitiveFields) {
        if (lowerName === sensitive || lowerName.includes(sensitive)) {
            return true;
        }
    }
    return false;
}
function scrubPatterns(value) {
    let result = value;
    for (const pattern of core_1.SENSITIVE_PATTERNS) {
        const regex = new RegExp(pattern.source, pattern.flags);
        result = result.replace(regex, REDACTED);
    }
    return result;
}
function scrubObject(obj, sensitiveFields, depth = 0) {
    if (depth > MAX_DEPTH) {
        return obj;
    }
    if (obj === null || obj === undefined) {
        return obj;
    }
    if (typeof obj === 'string') {
        return scrubPatterns(obj);
    }
    if (typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map((item) => scrubObject(item, sensitiveFields, depth + 1));
    }
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        if (isSensitiveField(key, sensitiveFields)) {
            result[key] = REDACTED;
        }
        else if (typeof value === 'string') {
            result[key] = scrubPatterns(value);
        }
        else if (typeof value === 'object' && value !== null) {
            result[key] = scrubObject(value, sensitiveFields, depth + 1);
        }
        else {
            result[key] = value;
        }
    }
    return result;
}
class DataScrubber {
    sensitiveFields;
    constructor(additionalFields = []) {
        this.sensitiveFields = createSensitiveFieldSet(additionalFields);
    }
    scrub(obj) {
        return scrubObject(obj, this.sensitiveFields);
    }
    scrubString(value) {
        return scrubPatterns(value);
    }
    isSensitive(fieldName) {
        return isSensitiveField(fieldName, this.sensitiveFields);
    }
}
exports.DataScrubber = DataScrubber;
function createDataScrubber(privacy) {
    return new DataScrubber(privacy.additionalPiiFields);
}
exports.defaultScrubber = new DataScrubber();
function scrubHeaders(headers, privacy) {
    if (!privacy.captureRequestHeaders) {
        const safeSet = new Set(privacy.safeHeaders.map((h) => h.toLowerCase()));
        const result = {};
        for (const [key, value] of Object.entries(headers)) {
            if (safeSet.has(key.toLowerCase())) {
                result[key] = value;
            }
        }
        return result;
    }
    const scrubber = createDataScrubber(privacy);
    return scrubber.scrub(headers);
}
function scrubQueryParams(query, privacy) {
    if (!privacy.captureQueryParams) {
        return undefined;
    }
    const scrubber = createDataScrubber(privacy);
    return scrubber.scrub(query);
}
function scrubRequestBody(body, privacy) {
    if (!privacy.captureRequestBody) {
        return undefined;
    }
    if (typeof body !== 'object' || body === null) {
        return body;
    }
    const scrubber = createDataScrubber(privacy);
    return scrubber.scrub(body);
}
//# sourceMappingURL=data-scrubber.js.map