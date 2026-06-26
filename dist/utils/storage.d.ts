import type { ReportPersistenceHandlers, ReportStorageAdapter } from "@/types/report.js";
export type ResolveStorageAdapterOptions = {
    projectId: string;
    environment?: string;
    appVersion?: string;
    onList?: ReportPersistenceHandlers["onList"];
    onListAll?: ReportPersistenceHandlers["onListAll"];
    onCreate?: ReportPersistenceHandlers["onCreate"];
    onUpdate?: ReportPersistenceHandlers["onUpdate"];
    onDelete?: ReportPersistenceHandlers["onDelete"];
};
export declare function hasCustomPersistenceHandlers(options: Pick<ResolveStorageAdapterOptions, "onList" | "onCreate" | "onUpdate">): options is Required<Pick<ResolveStorageAdapterOptions, "onList" | "onCreate" | "onUpdate">>;
export declare function resolveStorageAdapter({ projectId, environment, appVersion, onList, onListAll, onCreate, onUpdate, onDelete, }: ResolveStorageAdapterOptions): {
    adapter: ReportStorageAdapter;
    usesLocalStorage: boolean;
};
//# sourceMappingURL=storage.d.ts.map