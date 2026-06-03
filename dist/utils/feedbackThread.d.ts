import type { FeedbackDisplayStatus } from "../constants/feedbackStatus.js";
import type { ReportFeedback, ReportReply, ReportReplyStatus } from "../types/report.js";
export declare function getLatestReply(report: ReportFeedback): ReportReply | null;
export declare function getFeedbackDisplayStatus(report: ReportFeedback, expanded?: boolean): FeedbackDisplayStatus;
export declare function getCheckboxFieldsFromValues(fieldValues: ReportFeedback["field_values"], labels: Map<string, string>): {
    key: string;
    label: string;
}[];
export declare function canReviewLatestSuggestion(report: ReportFeedback): boolean;
export declare function canCheckoutReply(reply: ReportReply): boolean;
export declare function createReplyStatusForSubmit(pending: "deny" | "checkout" | null): ReportReplyStatus;
//# sourceMappingURL=feedbackThread.d.ts.map