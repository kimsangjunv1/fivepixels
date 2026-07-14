import type { ListRepliesParams, ListRepliesResult, ReportFeedback, ReportReply } from "../../types/report.js";
export declare const DEFAULT_REPLY_HISTORY_PAGE_SIZE = 10;
export declare const DEFAULT_REPLY_HISTORY_MODE: "button-and-scroll";
export declare const REPLY_HISTORY_SCROLL_THRESHOLD_PX = 80;
export declare function sortRepliesChronologically(replies: ReportReply[]): ReportReply[];
export declare function getTotalReplyCount(report: Pick<ReportFeedback, "replies" | "reply_count">): number;
export declare function paginateSortedReplies(sorted: ReportReply[], params: ListRepliesParams): ListRepliesResult;
export declare function normalizeListRepliesResult(result: ListRepliesResult | ReportReply[], params?: ListRepliesParams): ListRepliesResult;
export declare function prependReplies(existing: ReportReply[], older: ReportReply[]): ReportReply[];
export declare function appendReplyUnique(existing: ReportReply[], reply: ReportReply): ReportReply[];
export declare function getPaginationWindow(sorted: ReportReply[], pageIndex: number, pageSize: number, totalCount?: number): {
    items: ReportReply[];
    totalPages: number;
    pageIndex: number;
    hasOlderPage: boolean;
    hasNewerPage: boolean;
};
export declare function getEmbeddedRepliesForHistory(report: ReportFeedback): ReportReply[];
export declare function shouldPaginateReplyHistory(report: ReportFeedback, pageSize: number): boolean;
//# sourceMappingURL=replyHistory.d.ts.map