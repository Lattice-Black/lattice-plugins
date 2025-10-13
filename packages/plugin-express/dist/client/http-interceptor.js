"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpInterceptor = void 0;
const core_1 = require("@lattice.black/core");
class HttpInterceptor {
    serviceName;
    constructor(serviceName) {
        this.serviceName = serviceName;
    }
    fetch(url, init) {
        const headers = new Headers(init?.headers);
        if (!headers.has(core_1.HTTP_HEADERS.ORIGIN_SERVICE)) {
            headers.set(core_1.HTTP_HEADERS.ORIGIN_SERVICE, this.serviceName);
        }
        return fetch(url, {
            ...init,
            headers,
        });
    }
    getTracingHeaders() {
        return {
            [core_1.HTTP_HEADERS.ORIGIN_SERVICE]: this.serviceName,
        };
    }
    wrapAxios(axios) {
        axios.interceptors.request.use((config) => {
            config.headers = config.headers || {};
            config.headers[core_1.HTTP_HEADERS.ORIGIN_SERVICE] = this.serviceName;
            return config;
        });
        return axios;
    }
}
exports.HttpInterceptor = HttpInterceptor;
//# sourceMappingURL=http-interceptor.js.map