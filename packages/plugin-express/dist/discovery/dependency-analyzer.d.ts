import { Dependency } from '@lattice.black/core';
export declare class DependencyAnalyzer {
    analyzeDependencies(serviceId: string, packageJsonPath?: string): Dependency[];
    private findPackageJson;
    private readPackageJson;
    private parseDependencies;
    private extractVersion;
    private extractScope;
}
//# sourceMappingURL=dependency-analyzer.d.ts.map