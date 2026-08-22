import { type FivePixelsSync } from "../../constants/loginMethod.js";
import type { ReportPersistenceHandlers, ReportStorageAdapter } from "../../types/report.js";
export type ResolveStorageAdapterOptions = {
    projectId: string;
    environment?: string;
    appVersion?: string;
    sync?: FivePixelsSync;
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
} | {
    /** Remote sync (`api` / `artemis`) without a complete persistence API — no localStorage fallback. */
    mode: "unavailable";
    missingHandlers: RequiredPersistenceHandlerName[];
    ignoredHandlers: PersistenceHandlerName[];
};
export declare function hasCustomPersistenceHandlers(options: Pick<ResolveStorageAdapterOptions, "onList" | "onCreate" | "onUpdate">): options is Required<Pick<ResolveStorageAdapterOptions, "onList" | "onCreate" | "onUpdate">>;
export declare function resolvePersistenceStatus(options: Pick<ResolveStorageAdapterOptions, PersistenceHandlerName | "sync">): PersistenceStatus;
/** No localStorage reads — used when remote sync requires API persistence that is not wired. */
export declare function createUnavailableReportAdapter(): ReportStorageAdapter;
export declare function resolveStorageAdapter({ projectId, environment, appVersion, sync, onList, onListAll, onListReplies, onCreate, onCreateReply, onUpdate, onDelete, }: ResolveStorageAdapterOptions): {
    adapter: ReportStorageAdapter;
    usesLocalStorage: boolean;
    persistenceStatus: PersistenceStatus;
};
export {};
//# sourceMappingURL=storage.d.ts.map