import type { FivePixelsSync } from "@/constants/loginMethod.js";
import type { FivePixelsAdapter } from "@/types/adapter.js";
import {
    createUnavailableReportAdapter,
    hasCustomAdapter,
    resolveAdapterMissingHandlers,
    resolveAdapterPersistenceStatus,
    resolveStorageAdapterFromAdapter,
    type AdapterHandlerName,
    type PersistenceStatus,
} from "@/utils/adapter/resolveAdapter.js";

export type { AdapterHandlerName, PersistenceStatus };

export type ResolveStorageAdapterOptions = {
    projectId: string;
    environment?: string;
    appVersion?: string;
    sync?: FivePixelsSync;
    adapter?: FivePixelsAdapter;
};

export function hasCustomPersistenceAdapter(adapter?: FivePixelsAdapter): boolean {
    return hasCustomAdapter(adapter);
}

export function resolvePersistenceStatus(
    options: Pick<ResolveStorageAdapterOptions, "adapter" | "sync">,
): PersistenceStatus {
    return resolveAdapterPersistenceStatus(options.adapter, options.sync ?? "local");
}

export { createUnavailableReportAdapter };

export function resolveStorageAdapter(options: ResolveStorageAdapterOptions) {
    return resolveStorageAdapterFromAdapter(options);
}

export function resolvePersistenceMissingHandlers(adapter?: FivePixelsAdapter): AdapterHandlerName[] {
    return resolveAdapterMissingHandlers(adapter);
}
