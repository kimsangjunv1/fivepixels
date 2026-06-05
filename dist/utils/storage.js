import { createLocalStorageReportAdapter } from "../storage/local/localStorageAdapter.js";
export function resolveStorageAdapter({ projectId, environment, appVersion, storage = "local", storageAdapter, }) {
    if (storageAdapter) {
        return storageAdapter;
    }
    if (storage !== "local") {
        return storage;
    }
    return createLocalStorageReportAdapter({ projectId, environment, appVersion });
}
//# sourceMappingURL=storage.js.map