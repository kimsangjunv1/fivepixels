import { localStorageReportAdapter } from "../storage/local/localStorageAdapter.js";
export function resolveStorageAdapter(storage) {
    if (!storage || storage === "local") {
        return localStorageReportAdapter;
    }
    return storage;
}
//# sourceMappingURL=storage.js.map