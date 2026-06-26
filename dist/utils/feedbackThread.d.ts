import type { FeedbackDisplayStatus } from "../constants/feedbackStatus.js";
import type { ReportAuthor, ReportFeedback, ReportReply, ReportReplyStatus } from "../types/report.js";
export declare function getLatestReply(report: ReportFeedback): ReportReply | null;
export declare function getRemainingReplyCount(report: ReportFeedback): number;
export declare function getFeedbackDisplayStatus(report: ReportFeedback, expanded?: boolean): FeedbackDisplayStatus;
export declare function getCheckboxFieldsFromValues(fieldValues: ReportFeedback["field_values"], labels: Map<string, string>): {
    key: string;
    label: string;
}[];
export declare function isBranchRootStatus(status: ReportReplyStatus): boolean;
export declare function getLatestBranchRoot(replies: ReportReply[]): ReportReply | null;
export declare function isActiveBranchRoot(report: ReportFeedback, reply: ReportReply): boolean;
export declare function canShowSuggestedBranchActions(report: ReportFeedback, reply: ReportReply): boolean;
export declare function canShowCheckoutBranchActions(report: ReportFeedback, reply: ReportReply): boolean;
export declare function canReviewLatestSuggestion(report: ReportFeedback): boolean;
export declare function canAskQuestionOnLatest(report: ReportFeedback): boolean;
export declare function canManagerAskQuestionOnLatest(report: ReportFeedback): boolean;
export declare function canCheckoutReply(report: ReportFeedback, reply: ReportReply): boolean;
export declare function canShowIssueEntryActions(report: ReportFeedback): boolean;
export declare function resolveOriginalFeedbackAuthorName(report: ReportFeedback): string;
export declare function buildConfirmAuthorOptions(report: ReportFeedback, authors: ReportAuthor[]): ReportAuthor[];
export declare function createReplyStatusForSubmit(pending: "deny" | "recheck" | "checkout" | "question" | null, asQuestion?: boolean): ReportReplyStatus;
export declare function shouldShowReplyComposer(report: ReportFeedback, pendingComposer: {
    type: string;
} | null): boolean;
export declare const ISSUE_ROOT_PARENT_ID = "__issue_root__";
export type FeedbackReplyBranch = {
    root: ReportReply;
    children: ReportReply[];
};
export type FeedbackThreadTimeline = {
    issueChildren: ReportReply[];
    branches: FeedbackReplyBranch[];
};
export declare function inferParentReplyId(replies: ReportReply[], replyIndex: number): string | null;
export declare function normalizeReplyParents(replies: ReportReply[]): ReportReply[];
export declare function buildThreadTimeline(report: ReportFeedback): FeedbackThreadTimeline;
/** @deprecated Use buildThreadTimeline instead. */
export declare function groupRepliesIntoBranches(replies: ReportReply[]): FeedbackReplyBranch[];
export declare function resolveParentReplyIdForQuestion(report: ReportFeedback, pendingComposer: {
    type: string;
    targetReplyId: string;
} | null): string | null;
//# sourceMappingURL=feedbackThread.d.ts.map