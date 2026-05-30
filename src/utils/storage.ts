import { localStorageReportAdapter } from "../storage/local/localStorageAdapter.js";
import type { ReportStorageAdapter } from "../types/report.js";

export function resolveStorageAdapter(storage?: "local" | ReportStorageAdapter) {
    if (!storage || storage === "local") {
        return localStorageReportAdapter;
    }

    return storage;
}
