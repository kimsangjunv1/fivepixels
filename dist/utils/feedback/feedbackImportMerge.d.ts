import type { ReportFeedback, ReportReply } from "../../types/report.js";
export type FeedbackMergeStats = {
    inserted: number;
    updated: number;
    kept: number;
    localRepliesPreserved: number;
};
export type FeedbackMergeResult = FeedbackMergeStats & {
    items: ReportFeedback[];
};
export declare function mergeReplyCollections(existing: ReportReply[], incoming: ReportReply[]): {
    replies: ReportReply[];
    localOnlyPreserved: number;
};
export declare function mergeFeedbackItem(existing: ReportFeedback, incoming: ReportFeedback): {
    item: ReportFeedback;
    localRepliesPreserved: number;
};
/**
 * Merge localStorage feedback with an import payload.
 * - local-only ids are kept
 * - incoming-only ids are inserted
 * - matching ids take incoming content fields, and union replies by reply id
 */
export declare function mergeFeedbackCollections(existing: ReportFeedback[], incoming: ReportFeedback[]): FeedbackMergeResult;
//# sourceMappingURL=feedbackImportMerge.d.ts.map