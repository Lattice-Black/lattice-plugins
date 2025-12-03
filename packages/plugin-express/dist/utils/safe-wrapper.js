"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultErrorHandler = void 0;
exports.createSafeAsyncWrapper = createSafeAsyncWrapper;
exports.createSafeSyncWrapper = createSafeSyncWrapper;
exports.safeAsync = safeAsync;
exports.safeSync = safeSync;
exports.safeAsyncWithTimeout = safeAsyncWithTimeout;
exports.isError = isError;
const defaultErrorHandler = (error, context) => {
    const prefix = context ? `[Lattice SDK - ${context}]` : '[Lattice SDK]';
    console.error(`${prefix} ${error.message}`);
};
exports.defaultErrorHandler = defaultErrorHandler;
function createSafeAsyncWrapper(fn, { fallback, onError = exports.defaultErrorHandler, context, logErrors = true }) {
    return async (...args) => {
        try {
            return await fn(...args);
        }
        catch (error) {
            if (logErrors && error instanceof Error) {
                onError(error, context);
            }
            return fallback;
        }
    };
}
function createSafeSyncWrapper(fn, { fallback, onError = exports.defaultErrorHandler, context, logErrors = true }) {
    return (...args) => {
        try {
            return fn(...args);
        }
        catch (error) {
            if (logErrors && error instanceof Error) {
                onError(error, context);
            }
            return fallback;
        }
    };
}
async function safeAsync(fn, fallback, context, onError = exports.defaultErrorHandler) {
    try {
        return await fn();
    }
    catch (error) {
        if (error instanceof Error) {
            onError(error, context);
        }
        return fallback;
    }
}
function safeSync(fn, fallback, context, onError = exports.defaultErrorHandler) {
    try {
        return fn();
    }
    catch (error) {
        if (error instanceof Error) {
            onError(error, context);
        }
        return fallback;
    }
}
async function safeAsyncWithTimeout(fn, fallback, timeoutMs, context, onError = exports.defaultErrorHandler) {
    try {
        const result = await Promise.race([
            fn(),
            new Promise((_, reject) => setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)),
        ]);
        return result;
    }
    catch (error) {
        if (error instanceof Error) {
            onError(error, context);
        }
        return fallback;
    }
}
function isError(value) {
    return value instanceof Error;
}
//# sourceMappingURL=safe-wrapper.js.map