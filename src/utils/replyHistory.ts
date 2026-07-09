import type { ListRepliesParams, ListRepliesResult, ReportFeedback, ReportReply } from "@/types/report.js";
import { getReportReplies } from "@/utils/feedbackThread.js";

export const DEFAULT_REPLY_HISTORY_PAGE_SIZE = 10;
export const DEFAULT_REPLY_HISTORY_MODE = "button-and-scroll" as const;
export const REPLY_HISTORY_SCROLL_THRESHOLD_PX = 80;

export function sortRepliesChronologically(replies: ReportReply[]): ReportReply[] {
    return [...replies].sort((left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime());
}

export function getTotalReplyCount(report: Pick<ReportFeedback, "replies" | "reply_count">): number {
    if (typeof report.reply_count === "number") {
        return report.reply_count;
    }

    return report.replies?.length ?? 0;
}

export function paginateSortedReplies(sorted: ReportReply[], params: ListRepliesParams): ListRepliesResult {
    const limit = Math.max(1, params.limit ?? DEFAULT_REPLY_HISTORY_PAGE_SIZE);
    let endIndex = sorted.length;

    if (params.cursor) {
        const cursorIndex = sorted.findIndex((reply) => reply.id === params.cursor);

        if (cursorIndex >= 0) {
            endIndex = cursorIndex;
        }
    }

    const startIndex = Math.max(0, endIndex - limit);
    const items = sorted.slice(startIndex, endIndex);
    const hasMore = startIndex > 0;

    return {
        items,
        hasMore,
        nextCursor: hasMore ? items[0]?.id : undefined,
        totalCount: sorted.length,
    };
}

export function normalizeListRepliesResult(result: ListRepliesResult | ReportReply[], params?: ListRepliesParams): ListRepliesResult {
    if (Array.isArray(result)) {
        const sorted = sortRepliesChronologically(result);

        if (!params) {
            return {
                items: sorted,
                hasMore: false,
                totalCount: sorted.length,
            };
        }

        return paginateSortedReplies(sorted, params);
    }

    return {
        ...result,
        items: sortRepliesChronologically(result.items),
        totalCount: result.totalCount ?? result.items.length,
    };
}

export function prependReplies(existing: ReportReply[], older: ReportReply[]): ReportReply[] {
    const existingIds = new Set(existing.map((reply) => reply.id));
    const uniqueOlder = older.filter((reply) => !existingIds.has(reply.id));

    return sortRepliesChronologically([...uniqueOlder, ...existing]);
}

export function appendReplyUnique(existing: ReportReply[], reply: ReportReply): ReportReply[] {
    if (existing.some((item) => item.id === reply.id)) {
        return existing;
    }

    return sortRepliesChronologically([...existing, reply]);
}

export function getPaginationWindow(sorted: ReportReply[], pageIndex: number, pageSize: number, totalCount?: number) {
    const total = totalCount ?? sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePageIndex = Math.min(Math.max(pageIndex, 0), totalPages - 1);
    const end = total - safePageIndex * pageSize;
    const start = Math.max(0, end - pageSize);

    return {
        items: sorted.slice(start, end),
        totalPages,
        pageIndex: safePageIndex,
        hasOlderPage: safePageIndex < totalPages - 1,
        hasNewerPage: safePageIndex > 0,
    };
}

export function getEmbeddedRepliesForHistory(report: ReportFeedback): ReportReply[] {
    return sortRepliesChronologically(getReportReplies(report));
}

export function shouldPaginateReplyHistory(report: ReportFeedback, pageSize: number): boolean {
    return getTotalReplyCount(report) > pageSize;
}
