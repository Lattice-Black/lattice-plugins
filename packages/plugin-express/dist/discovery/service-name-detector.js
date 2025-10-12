"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceNameDetector = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const os_1 = require("os");
class ServiceNameDetector {
    detectServiceName(customName) {
        if (customName) {
            return this.sanitizeName(customName);
        }
        if (process.env['LATTICE_SERVICE_NAME']) {
            return this.sanitizeName(process.env['LATTICE_SERVICE_NAME']);
        }
        if (process.env['SERVICE_NAME']) {
            return this.sanitizeName(process.env['SERVICE_NAME']);
        }
        const pkgName = this.getPackageJsonName();
        if (pkgName) {
            return this.sanitizeName(pkgName);
        }
        const k8sName = this.getKubernetesServiceName();
        if (k8sName) {
            return this.sanitizeName(k8sName);
        }
        const dockerName = this.getDockerContainerName();
        if (dockerName) {
            return this.sanitizeName(dockerName);
        }
        const cloudName = this.getCloudServiceName();
        if (cloudName) {
            return this.sanitizeName(cloudName);
        }
        const gitName = this.getGitRepoName();
        if (gitName) {
            return this.sanitizeName(gitName);
        }
        const fallbackName = this.getFallbackName();
        return this.sanitizeName(fallbackName);
    }
    getPackageJsonName() {
        try {
            let currentDir = process.cwd();
            for (let i = 0; i < 5; i++) {
                const pkgPath = (0, path_1.join)(currentDir, 'package.json');
                if ((0, fs_1.existsSync)(pkgPath)) {
                    const content = (0, fs_1.readFileSync)(pkgPath, 'utf-8');
                    const pkg = JSON.parse(content);
                    if (pkg.name) {
                        return pkg.name.replace(/^@[\w-]+\//, '');
                    }
                }
                const parentDir = (0, path_1.join)(currentDir, '..');
                if (parentDir === currentDir)
                    break;
                currentDir = parentDir;
            }
        }
        catch (error) {
        }
        return null;
    }
    getKubernetesServiceName() {
        return (process.env['K8S_SERVICE_NAME'] ||
            process.env['KUBERNETES_SERVICE_NAME'] ||
            process.env['K8S_POD_NAME'] ||
            null);
    }
    getDockerContainerName() {
        if (process.env['DOCKER_CONTAINER_NAME']) {
            return process.env['DOCKER_CONTAINER_NAME'];
        }
        if ((0, fs_1.existsSync)('/.dockerenv')) {
            return (0, os_1.hostname)();
        }
        return null;
    }
    getCloudServiceName() {
        if (process.env['AWS_ECS_SERVICE_NAME']) {
            return process.env['AWS_ECS_SERVICE_NAME'];
        }
        if (process.env['K_SERVICE']) {
            return process.env['K_SERVICE'];
        }
        if (process.env['CONTAINER_APP_NAME']) {
            return process.env['CONTAINER_APP_NAME'];
        }
        return null;
    }
    getGitRepoName() {
        try {
            const gitConfigPath = (0, path_1.join)(process.cwd(), '.git', 'config');
            if ((0, fs_1.existsSync)(gitConfigPath)) {
                const config = (0, fs_1.readFileSync)(gitConfigPath, 'utf-8');
                const urlMatch = config.match(/url\s*=\s*.*\/([^/]+?)(?:\.git)?$/m);
                if (urlMatch?.[1]) {
                    return urlMatch[1];
                }
            }
        }
        catch (error) {
        }
        return null;
    }
    getFallbackName() {
        const dirName = (0, path_1.basename)(process.cwd());
        if (dirName && dirName !== '/' && dirName !== '.') {
            return dirName;
        }
        return (0, os_1.hostname)() || 'unknown-service';
    }
    sanitizeName(name) {
        let sanitized = name.toLowerCase();
        sanitized = sanitized.replace(/[^a-z0-9-]/g, '-');
        sanitized = sanitized.replace(/^-+|-+$/g, '');
        sanitized = sanitized.replace(/-+/g, '-');
        if (sanitized.length < 2) {
            sanitized = 'svc-' + sanitized;
        }
        if (sanitized.length > 63) {
            sanitized = sanitized.substring(0, 63);
        }
        sanitized = sanitized.replace(/-+$/, '');
        return sanitized || 'unknown-service';
    }
}
exports.ServiceNameDetector = ServiceNameDetector;
//# sourceMappingURL=service-name-detector.js.map