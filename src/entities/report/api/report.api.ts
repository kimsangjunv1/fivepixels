import type {
    CreateReportFeedbackPayload,
    ReportFeedback,
    ReportStorageAdapter,
    UpdateReportFeedbackPayload,
} from "../model/report.type.js";

export async function listReports(adapter: ReportStorageAdapter, pathname: string) {
    return adapter.list({ pathname });
}

export async function createReport(adapter: ReportStorageAdapter, payload: CreateReportFeedbackPayload) {
    return adapter.create(payload);
}

export async function updateReport(adapter: ReportStorageAdapter, id: string, payload: UpdateReportFeedbackPayload) {
    return adapter.update(id, payload);
}

export type ReportApiListResponse = ReportFeedback[];
