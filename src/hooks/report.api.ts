import { getActiveReportMessages } from "@/i18n/index.js";
import type {
    CreateReportFeedbackPayload,
    CreateReplyPayload,
    ListRepliesParams,
    ListRepliesResult,
    ReportFeedback,
    ReportListAllParams,
    ReportListAllResult,
    ReportReply,
    ReportStorageAdapter,
    UpdateReportFeedbackPayload,
} from "@/types/report.js";
import { normalizeListReport } from "@/utils/report/reportSummary.js";
import { normalizeListRepliesResult } from "@/utils/feedback/replyHistory.js";

export async function listReports(adapter: ReportStorageAdapter, pathname: string) {
    const items = await adapter.list({ pathname });
    return items.map(normalizeListReport);
}

export async function listAllReports(adapter: ReportStorageAdapter, params: ReportListAllParams): Promise<ReportListAllResult> {
    const result = await adapter.listAll?.(params);

    if (!result) {
        return { items: [] };
    }

    return {
        ...result,
        items: result.items.map(normalizeListReport),
    };
}

export async function listReplies(adapter: ReportStorageAdapter, commentId: string, params?: ListRepliesParams): Promise<ListRepliesResult> {
    if (!adapter.listReplies) {
        throw new Error(getActiveReportMessages().errors.loadRepliesFailed);
    }

    const result = await adapter.listReplies(commentId, params);

    return normalizeListRepliesResult(result, params);
}

export async function createReport(adapter: ReportStorageAdapter, payload: CreateReportFeedbackPayload) {
    return normalizeListReport(await adapter.create(payload));
}

export async function createReply(adapter: ReportStorageAdapter, commentId: string, payload: CreateReplyPayload) {
    if (!adapter.createReply) {
        throw new Error(getActiveReportMessages().errors.createReplyFailed);
    }

    return adapter.createReply(commentId, payload);
}

export async function updateReport(adapter: ReportStorageAdapter, id: string, payload: UpdateReportFeedbackPayload) {
    return normalizeListReport(await adapter.update(id, payload));
}

export async function deleteReport(adapter: ReportStorageAdapter, id: string) {
    if (!adapter.remove) {
        throw new Error(getActiveReportMessages().errors.deleteHandlerMissing);
    }

    await adapter.remove(id);
}

export type ReportApiListResponse = ReportFeedback[];
