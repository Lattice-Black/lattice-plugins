import type { BatchConfig } from '@lattice.black/core';
import { type ErrorHandler } from './safe-wrapper';
export type FlushCallback<T> = (events: T[]) => Promise<void>;
export interface EventQueueConfig<T> extends BatchConfig {
    onFlush: FlushCallback<T>;
    onError?: ErrorHandler;
    enabled?: boolean;
}
export interface QueueState {
    size: number;
    dropped: number;
    flushCount: number;
    failedFlushCount: number;
    isFlushing: boolean;
    isShutdown: boolean;
}
export declare class EventQueue<T> {
    private queue;
    private timer;
    private isFlushing;
    private isShutdown;
    private droppedCount;
    private flushCount;
    private failedFlushCount;
    private readonly config;
    constructor(config: EventQueueConfig<T>);
    enqueue(event: T): boolean;
    flush(): Promise<void>;
    forceFlush(timeoutMs?: number): Promise<void>;
    shutdown(): void;
    getState(): QueueState;
    isEmpty(): boolean;
    size(): number;
    private startTimer;
    private stopTimer;
    private clamp;
    private sleep;
}
export declare function createEventQueue<T>(onFlush: FlushCallback<T>, config?: Partial<Omit<EventQueueConfig<T>, 'onFlush'>>): EventQueue<T>;
//# sourceMappingURL=event-queue.d.ts.map