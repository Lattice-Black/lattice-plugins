export declare class HttpInterceptor {
    private serviceName;
    constructor(serviceName: string);
    fetch(url: string | URL | Request, init?: RequestInit): Promise<Response>;
    getTracingHeaders(): Record<string, string>;
    wrapAxios(axios: any): any;
}
//# sourceMappingURL=http-interceptor.d.ts.map