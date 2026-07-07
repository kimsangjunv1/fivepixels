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
    onStartDeny: (targetReplyId?: string) => void;
    onStartCheckout: (replyId: string) => void;
    onStartAskQuestion: () => void;
    onClaimAssignee: () => void;
    onTransferAssignee: () => void;
    onConfirm: () => void;
    isUpdating?: boolean;
    isClaimingAssignee?: boolean;
    /** Hide the built-in case tab selector when the case list is rendered elsewhere (e.g. the marker window sidebar). */
    hideCaseSelector?: boolean;
};
export declare function FeedbackThread({ report, authors, pendingComposer, confirmAuthorName, showConfirmAuthorSelect, onConfirmAuthorNameChange, onToggleConfirmAuthorSelect: _onToggleConfirmAuthorSelect, onStartDeny, onStartCheckout, onStartAskQuestion, onClaimAssignee, onTransferAssignee, onConfirm, isUpdating, isClaimingAssignee, hideCaseSelector, }: FeedbackThreadProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=FeedbackThread.d.ts.map