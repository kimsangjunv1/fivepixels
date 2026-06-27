import type { ReportAuthor, ReportFeedback } from "../../../types/report.js";
type PendingComposer = {
    type: "deny" | "recheck" | "checkout" | "question";
    targetReplyId: string;
} | null;
type FeedbackThreadProps = {
    report: ReportFeedback;
    authors: ReportAuthor[];
    pendingComposer: PendingComposer;
    confirmAuthorName: string;
    showConfirmAuthorSelect: boolean;
    onConfirmAuthorNameChange: (name: string) => void;
    onToggleConfirmAuthorSelect: () => void;
    onStartDeny: () => void;
    onStartCheckout: (replyId: string) => void;
    onStartAskQuestion: () => void;
    onConfirm: () => void;
    isUpdating?: boolean;
};
export declare function FeedbackThread({ report, authors, pendingComposer, confirmAuthorName, showConfirmAuthorSelect, onConfirmAuthorNameChange, onToggleConfirmAuthorSelect: _onToggleConfirmAuthorSelect, onStartDeny, onStartCheckout, onStartAskQuestion, onConfirm, isUpdating, }: FeedbackThreadProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=FeedbackThread.d.ts.map