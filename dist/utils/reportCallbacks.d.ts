import type { ReportEvent, ReportFeedback } from "../types/report.js";
export type ReportEventCallbacks = {
    onCreate?: (feedback: ReportFeedback) => void | Promise<void>;
    onUpdate?: (feedback: ReportFeedback) => void | Promise<void>;
    onDelete?: (id: string) => void | Promise<void>;
    onReply?: (params: {
        feedbackId: string;
        message: string;
    }) => void | Promise<void>;
    onEvent?: (event: ReportEvent) => void | Promise<void>;
};
export declare function notifyFeedbackCreate(callbacks: ReportEventCallbacks, feedback: ReportFeedback): Promise<void>;
export declare function notifyFeedbackUpdate(callbacks: ReportEventCallbacks, feedback: ReportFeedback): Promise<void>;
export declare function notifyFeedbackDelete(callbacks: ReportEventCallbacks, id: string): Promise<void>;
export declare function notifyFeedbackReply(callbacks: ReportEventCallbacks, params: {
    feedbackId: string;
    message: string;
}): Promise<void>;
//# sourceMappingURL=reportCallbacks.d.ts.map