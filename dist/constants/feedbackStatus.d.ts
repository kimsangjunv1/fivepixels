import type { ReportReplyStatus } from "../types/report.js";
export type FeedbackDisplayStatus = "currently_wait" | "wait_for_reply" | "issue_apply" | "git_issued" | ReportReplyStatus;
export declare const FEEDBACK_STATUS_LABEL: Record<FeedbackDisplayStatus, string>;
export declare const FEEDBACK_STATUS_COLOR: Record<FeedbackDisplayStatus, string>;
export declare const FEEDBACK_DISPLAY_STATUS_ORDER: FeedbackDisplayStatus[];
//# sourceMappingURL=feedbackStatus.d.ts.map