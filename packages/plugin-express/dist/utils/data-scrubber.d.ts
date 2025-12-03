import { type PrivacyConfig } from '@lattice.black/core';
export declare function scrubObject(obj: unknown, sensitiveFields: Set<string>, depth?: number): unknown;
export declare class DataScrubber {
    private readonly sensitiveFields;
    constructor(additionalFields?: string[]);
    scrub<T extends Record<string, unknown>>(obj: T): T;
    scrubString(value: string): string;
    isSensitive(fieldName: string): boolean;
}
export declare function createDataScrubber(privacy: PrivacyConfig): DataScrubber;
export declare const defaultScrubber: DataScrubber;
export declare function scrubHeaders(headers: Record<string, string | string[] | undefined>, privacy: PrivacyConfig): Record<string, string | string[] | undefined>;
export declare function scrubQueryParams(query: Record<string, unknown>, privacy: PrivacyConfig): Record<string, unknown> | undefined;
export declare function scrubRequestBody(body: unknown, privacy: PrivacyConfig): unknown;
//# sourceMappingURL=data-scrubber.d.ts.map