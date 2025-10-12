"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyAnalyzer = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const core_1 = require("@lattice.black/core");
class DependencyAnalyzer {
    analyzeDependencies(serviceId, packageJsonPath) {
        const pkgPath = this.findPackageJson(packageJsonPath);
        if (!pkgPath) {
            console.warn('package.json not found, skipping dependency analysis');
            return [];
        }
        const packageJson = this.readPackageJson(pkgPath);
        const dependencies = [];
        if (packageJson.dependencies) {
            dependencies.push(...this.parseDependencies(serviceId, packageJson.dependencies, core_1.DependencyType.Direct));
        }
        if (packageJson.devDependencies) {
            dependencies.push(...this.parseDependencies(serviceId, packageJson.devDependencies, core_1.DependencyType.Dev));
        }
        if (packageJson.peerDependencies) {
            dependencies.push(...this.parseDependencies(serviceId, packageJson.peerDependencies, core_1.DependencyType.Peer));
        }
        return dependencies;
    }
    findPackageJson(customPath) {
        if (customPath) {
            return (0, fs_1.existsSync)(customPath) ? customPath : null;
        }
        let currentDir = process.cwd();
        for (let i = 0; i < 5; i++) {
            const pkgPath = (0, path_1.join)(currentDir, 'package.json');
            if ((0, fs_1.existsSync)(pkgPath)) {
                return pkgPath;
            }
            const parentDir = (0, path_1.resolve)(currentDir, '..');
            if (parentDir === currentDir) {
                break;
            }
            currentDir = parentDir;
        }
        return null;
    }
    readPackageJson(path) {
        try {
            const content = (0, fs_1.readFileSync)(path, 'utf-8');
            return JSON.parse(content);
        }
        catch (error) {
            console.error('Failed to read package.json:', error);
            return {};
        }
    }
    parseDependencies(serviceId, deps, type) {
        return Object.entries(deps).map(([packageName, versionRange]) => {
            const dependency = {
                id: (0, core_1.generateId)(),
                serviceId,
                packageName,
                version: this.extractVersion(versionRange),
                versionRange,
                dependencyType: type,
                scope: this.extractScope(packageName),
                firstSeen: new Date(),
                lastSeen: new Date(),
            };
            return dependency;
        });
    }
    extractVersion(versionRange) {
        return versionRange.replace(/^[~^>=<*]/, '').trim();
    }
    extractScope(packageName) {
        if (packageName.startsWith('@')) {
            const parts = packageName.split('/');
            return parts[0];
        }
        return undefined;
    }
}
exports.DependencyAnalyzer = DependencyAnalyzer;
//# sourceMappingURL=dependency-analyzer.js.map