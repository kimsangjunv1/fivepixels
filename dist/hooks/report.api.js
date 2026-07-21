import { getActiveReportMessages } from "../i18n/index.js";
import { normalizeListReport } from "../utils/report/reportSummary.js";
import { normalizeListRepliesResult } from "../utils/feedback/replyHistory.js";
export async function listReports(adapter, pathname) {
    const items = await adapter.list({ pathname });
    return items.map(normalizeListReport);
}
export async function listAllReports(adapter, params) {
    const result = await adapter.listAll?.(params);
    if (!result) {
        return { items: [] };
    }
    return {
        ...result,
        items: result.items.map(normalizeListReport),
    };
}
export async function listReplies(adapter, commentId, params) {
    if (!adapter.listReplies) {
        throw new Error(getActiveReportMessages().errors.loadRepliesFailed);
    }
    const result = await adapter.listReplies(commentId, params);
    return normalizeListRepliesResult(result, params);
}
export async function createReport(adapter, payload) {
    return normalizeListReport(await adapter.create(payload));
}
export async function createReply(adapter, commentId, payload) {
    if (!adapter.createReply) {
        throw new Error(getActiveReportMessages().errors.createReplyFailed);
    }
    return adapter.createReply(commentId, payload);
}
export async function updateReport(adapter, id, payload) {
    return normalizeListReport(await adapter.update(id, payload));
}
export async function deleteReport(adapter, id) {
    if (!adapter.remove) {
        throw new Error(getActiveReportMessages().errors.deleteHandlerMissing);
    }
    await adapter.remove(id);
}
//# sourceMappingURL=report.api.js.map