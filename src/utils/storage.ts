import { createLocalStorageReportAdapter } from "../storage/local/localStorageAdapter.js";
import type { ReportStorageAdapter } from "../types/report.js";

export type ResolveStorageAdapterOptions = {
    projectId: string;
    environment?: string;
    storage?: "local" | ReportStorageAdapter;
    storageAdapter?: ReportStorageAdapter;
};

export function resolveStorageAdapter({
    projectId,
    environment,
    storage = "local",
    storageAdapter,
}: ResolveStorageAdapterOptions): ReportStorageAdapter {
    if (storageAdapter) {
        return storageAdapter;
    }

    if (storage !== "local") {
        return storage;
    }

    return createLocalStorageReportAdapter({ projectId, environment });
}
