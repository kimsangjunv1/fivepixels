import type { CreateReportFeedbackPayload, ReportFeedback, ReportListAllParams, ReportListAllResult, ReportStorageAdapter, UpdateReportFeedbackPayload } from "@/types/report.js";
export declare function listReports(adapter: ReportStorageAdapter, pathname: string): Promise<ReportFeedback[]>;
export declare function listAllReports(adapter: ReportStorageAdapter, params: ReportListAllParams): Promise<ReportListAllResult>;
export declare function createReport(adapter: ReportStorageAdapter, payload: CreateReportFeedbackPayload): Promise<ReportFeedback>;
export declare function updateReport(adapter: ReportStorageAdapter, id: string, payload: UpdateReportFeedbackPayload): Promise<ReportFeedback>;
export declare function deleteReport(adapter: ReportStorageAdapter, id: string): Promise<void>;
export type ReportApiListResponse = ReportFeedback[];
//# sourceMappingURL=report.api.d.ts.map