import type { ReportEvent, ReportFeedback } from "../../types/report.js";
export type ReportSideEffectCallbacks = {
    onEvent?: (event: ReportEvent) => void | Promise<void>;
    onReply?: (params: {
        feedbackId: string;
        message: string;
    }) => void | Promise<void>;
};
export declare function notifyFeedbackCreate(callbacks: ReportSideEffectCallbacks, feedback: ReportFeedback): Promise<void>;
export declare function notifyFeedbackUpdate(callbacks: ReportSideEffectCallbacks, feedback: ReportFeedback): Promise<void>;
export declare function notifyFeedbackDelete(callbacks: ReportSideEffectCallbacks, id: string): Promise<void>;
export declare function notifyFeedbackReply(callbacks: ReportSideEffectCallbacks, params: {
    feedbackId: string;
    message: string;
}): Promise<void>;
export declare function notifyGitHubIssueCreated(callbacks: ReportSideEffectCallbacks, params: {
    feedback: ReportFeedback;
    issueUrl: string;
}): Promise<void>;
//# sourceMappingURL=reportCallbacks.d.ts.map