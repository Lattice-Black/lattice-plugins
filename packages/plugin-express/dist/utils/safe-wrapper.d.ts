export type ErrorHandler = (error: Error, context?: string) => void;
export declare const defaultErrorHandler: ErrorHandler;
export interface SafeWrapperOptions<T> {
    fallback: T;
    onError?: ErrorHandler;
    context?: string;
    logErrors?: boolean;
}
export declare function createSafeAsyncWrapper<TArgs extends unknown[], TReturn>(fn: (...args: TArgs) => Promise<TReturn>, { fallback, onError, context, logErrors }: SafeWrapperOptions<TReturn>): (...args: TArgs) => Promise<TReturn>;
export declare function createSafeSyncWrapper<TArgs extends unknown[], TReturn>(fn: (...args: TArgs) => TReturn, { fallback, onError, context, logErrors }: SafeWrapperOptions<TReturn>): (...args: TArgs) => TReturn;
export declare function safeAsync<T>(fn: () => Promise<T>, fallback: T, context?: string, onError?: ErrorHandler): Promise<T>;
export declare function safeSync<T>(fn: () => T, fallback: T, context?: string, onError?: ErrorHandler): T;
export declare function safeAsyncWithTimeout<T>(fn: () => Promise<T>, fallback: T, timeoutMs: number, context?: string, onError?: ErrorHandler): Promise<T>;
export declare function isError(value: unknown): value is Error;
//# sourceMappingURL=safe-wrapper.d.ts.map