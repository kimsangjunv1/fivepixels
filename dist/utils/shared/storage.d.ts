import type { ReportPersistenceHandlers, ReportStorageAdapter } from "../../types/report.js";
export type ResolveStorageAdapterOptions = {
    projectId: string;
    environment?: string;
    appVersion?: string;
    onList?: ReportPersistenceHandlers["onList"];
    onListAll?: ReportPersistenceHandlers["onListAll"];
    onListReplies?: ReportPersistenceHandlers["onListReplies"];
    onCreate?: ReportPersistenceHandlers["onCreate"];
    onCreateReply?: ReportPersistenceHandlers["onCreateReply"];
    onUpdate?: ReportPersistenceHandlers["onUpdate"];
    onDelete?: ReportPersistenceHandlers["onDelete"];
};
declare const REQUIRED_PERSISTENCE_HANDLER_NAMES: readonly ["onList", "onCreate", "onUpdate"];
declare const PERSISTENCE_HANDLER_NAMES: readonly ["onList", "onListAll", "onListReplies", "onCreate", "onCreateReply", "onUpdate", "onDelete"];
export type RequiredPersistenceHandlerName = (typeof REQUIRED_PERSISTENCE_HANDLER_NAMES)[number];
export type PersistenceHandlerName = (typeof PERSISTENCE_HANDLER_NAMES)[number];
export type PersistenceStatus = {
    mode: "localStorage";
    missingHandlers: [];
    ignoredHandlers: [];
} | {
    mode: "API";
    missingHandlers: [];
    ignoredHandlers: [];
} | {
    mode: "conflict";
    missingHandlers: RequiredPersistenceHandlerName[];
    ignoredHandlers: PersistenceHandlerName[];
};
export declare function hasCustomPersistenceHandlers(options: Pick<ResolveStorageAdapterOptions, "onList" | "onCreate" | "onUpdate">): options is Required<Pick<ResolveStorageAdapterOptions, "onList" | "onCreate" | "onUpdate">>;
export declare function resolvePersistenceStatus(options: Pick<ResolveStorageAdapterOptions, PersistenceHandlerName>): PersistenceStatus;
export declare function resolveStorageAdapter({ projectId, environment, appVersion, onList, onListAll, onListReplies, onCreate, onCreateReply, onUpdate, onDelete, }: ResolveStorageAdapterOptions): {
    adapter: ReportStorageAdapter;
    usesLocalStorage: boolean;
    persistenceStatus: PersistenceStatus;
};
export {};
//# sourceMappingURL=storage.d.ts.map