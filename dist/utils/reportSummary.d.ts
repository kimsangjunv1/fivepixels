import type { ReportFeedback, ReportReply, ReportReplySummary } from "../types/report.js";
export declare function toReplySummary(reply: ReportReply): ReportReplySummary;
export declare function summaryToReply(summary: ReportReplySummary, commentId: string): ReportReply;
export declare function normalizeListReport(item: ReportFeedback): ReportFeedback;
export declare function mergeRepliesIntoReport(report: ReportFeedback, replies: ReportReply[]): ReportFeedback;
export declare function needsReplyLoad(report: ReportFeedback, canListReplies: boolean): boolean;
//# sourceMappingURL=reportSummary.d.ts.map