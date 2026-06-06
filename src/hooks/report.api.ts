import type {
    CreateReportFeedbackPayload,
    ReportFeedback,
    ReportStorageAdapter,
    UpdateReportFeedbackPayload,
} from "../types/report.js";

export async function listReports(adapter: ReportStorageAdapter, pathname: string) {
    return adapter.list({ pathname });
}

export async function createReport(adapter: ReportStorageAdapter, payload: CreateReportFeedbackPayload) {
    return adapter.create(payload);
}

export async function updateReport(adapter: ReportStorageAdapter, id: string, payload: UpdateReportFeedbackPayload) {
    return adapter.update(id, payload);
}

export async function deleteReport(adapter: ReportStorageAdapter, id: string) {
    if (!adapter.remove) {
        throw new Error("onDelete가 없어서 삭제할 수 없어요.");
    }

    await adapter.remove(id);
}

export type ReportApiListResponse = ReportFeedback[];
