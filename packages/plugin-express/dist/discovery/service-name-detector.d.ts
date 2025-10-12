export declare class ServiceNameDetector {
    detectServiceName(customName?: string): string;
    private getPackageJsonName;
    private getKubernetesServiceName;
    private getDockerContainerName;
    private getCloudServiceName;
    private getGitRepoName;
    private getFallbackName;
    private sanitizeName;
}
//# sourceMappingURL=service-name-detector.d.ts.map