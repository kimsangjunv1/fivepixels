import type { ReportFeedback } from "../../../types/report.js";
type PendingComposer = {
    type: "deny" | "checkout";
    targetReplyId: string;
} | null;
type FeedbackThreadProps = {
    report: ReportFeedback;
    pendingComposer: PendingComposer;
    onStartDeny: () => void;
    onStartCheckout: (replyId: string) => void;
    onConfirm: () => void;
    isUpdating?: boolean;
};
export declare function FeedbackThread({ report, pendingComposer, onStartDeny, onStartCheckout, onConfirm, isUpdating }: FeedbackThreadProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=FeedbackThread.d.ts.map