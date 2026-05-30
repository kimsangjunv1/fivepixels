import type { ReportStorageAdapter } from "../../types/report.js";
export type LocalStorageReportAdapterOptions = {
    projectId: string;
    environment?: string;
};
export declare function createLocalStorageReportAdapter({ projectId, environment }: LocalStorageReportAdapterOptions): ReportStorageAdapter;
/** @deprecated Use createLocalStorageReportAdapter({ projectId }) instead. */
export declare const localStorageReportAdapter: ReportStorageAdapter;
//# sourceMappingURL=localStorageAdapter.d.ts.map