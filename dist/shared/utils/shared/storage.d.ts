import type { FivePixelsSync } from "../../../shared/constants/loginMethod.js";
import type { FivePixelsAdapter } from "../../../shared/types/adapter.js";
import { createUnavailableReportAdapter, type AdapterHandlerName, type PersistenceStatus } from "../../../shared/utils/adapter/resolveAdapter.js";
export type { AdapterHandlerName, PersistenceStatus };
export type ResolveStorageAdapterOptions = {
    projectId: string;
    environment?: string;
    appVersion?: string;
    sync?: FivePixelsSync;
    adapter?: FivePixelsAdapter;
};
export declare function hasCustomPersistenceAdapter(adapter?: FivePixelsAdapter): boolean;
export declare function resolvePersistenceStatus(options: Pick<ResolveStorageAdapterOptions, "adapter" | "sync">): PersistenceStatus;
export { createUnavailableReportAdapter };
export declare function resolveStorageAdapter(options: ResolveStorageAdapterOptions): {
    adapter: import("../../..").ReportStorageAdapter;
    usesLocalStorage: boolean;
    persistenceStatus: PersistenceStatus;
    fivePixelsAdapter?: FivePixelsAdapter;
};
export declare function resolvePersistenceMissingHandlers(adapter?: FivePixelsAdapter): AdapterHandlerName[];
//# sourceMappingURL=storage.d.ts.map