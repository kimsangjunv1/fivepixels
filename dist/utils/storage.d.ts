import type { ReportStorageAdapter } from "../types/report.js";
export type ResolveStorageAdapterOptions = {
    projectId: string;
    environment?: string;
    storage?: "local" | ReportStorageAdapter;
    storageAdapter?: ReportStorageAdapter;
};
export declare function resolveStorageAdapter({ projectId, environment, storage, storageAdapter, }: ResolveStorageAdapterOptions): ReportStorageAdapter;
//# sourceMappingURL=storage.d.ts.map