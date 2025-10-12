"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteAnalyzer = void 0;
const tslib_1 = require("tslib");
const express_list_endpoints_1 = tslib_1.__importDefault(require("express-list-endpoints"));
const core_1 = require("@lattice.black/core");
class RouteAnalyzer {
    analyzeRoutes(app, serviceId) {
        const endpoints = (0, express_list_endpoints_1.default)(app);
        const routes = [];
        for (const endpoint of endpoints) {
            for (const method of endpoint.methods) {
                if (method === 'OPTIONS' || method === 'HEAD') {
                    continue;
                }
                const route = {
                    id: (0, core_1.generateId)(),
                    serviceId,
                    method: this.normalizeMethod(method),
                    path: this.normalizePath(endpoint.path),
                    middlewareChain: endpoint.middlewares || [],
                    firstSeen: new Date(),
                    lastSeen: new Date(),
                };
                routes.push(route);
            }
        }
        return routes;
    }
    normalizeMethod(method) {
        const upperMethod = method.toUpperCase();
        if (upperMethod in core_1.HttpMethod) {
            return core_1.HttpMethod[upperMethod];
        }
        return core_1.HttpMethod.ALL;
    }
    normalizePath(path) {
        if (path !== '/' && path.endsWith('/')) {
            path = path.slice(0, -1);
        }
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        return path;
    }
}
exports.RouteAnalyzer = RouteAnalyzer;
//# sourceMappingURL=route-analyzer.js.map