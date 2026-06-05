import type { ReportFeedback, ReportStorageAdapter } from "../../types/report.js";
export type LocalStorageReportAdapterOptions = {
    projectId: string;
    environment?: string;
    appVersion?: string;
};
export declare function readAllReportsFromStorage(storageKey: string): ReportFeedback[];
export declare function writeAllReportsToStorage(storageKey: string, items: ReportFeedback[]): void;
export declare function createLocalStorageReportAdapter({ projectId, environment, appVersion }: LocalStorageReportAdapterOptions): ReportStorageAdapter;
/** @deprecated Use createLocalStorageReportAdapter({ projectId }) instead. */
export declare const localStorageReportAdapter: ReportStorageAdapter;
//# sourceMappingURL=localStorageAdapter.d.ts.map