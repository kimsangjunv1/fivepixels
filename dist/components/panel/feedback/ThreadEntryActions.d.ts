import type { ReportAuthor, ReportFeedback, ReportReply } from "../../../types/report.js";
export declare const THREAD_ACTION_BUTTON_BASE = "flex items-center gap-[4px] rounded-[6px] px-[8px] py-[4px] text-[12px] font-semibold transition-colors";
export declare const THREAD_ACTION_GHOST = "text-[var(--adaptive-text-primary)] hover:bg-[var(--adaptive-black100)]";
export declare const THREAD_ACTION_DIVIDER = "mx-[2px] h-[12px] w-px bg-[var(--adaptive-border-subtle)]";
export declare const THREAD_ACTION_ENTRY_SURFACE_CLASS = "flex flex-col gap-[4px] rounded-[12px] border-[2px] border-[var(--adaptive-grey900)] bg-[var(--adaptive-surface-overlay)] p-[8px_12px]";
export declare const THREAD_CASE_ENTRY_SURFACE_CLASS = "flex flex-col gap-[4px] rounded-[12px]";
type PendingComposer = {
    type: "deny" | "recheck" | "checkout" | "question";
    targetReplyId: string;
} | null;
export declare function ThreadEntryActions({ reply, report, caseId, authors, pendingComposer, confirmAuthorName, showConfirmAuthorSelect, onConfirmAuthorNameChange, onStartDeny, onStartCheckout, onStartAskQuestion, onConfirm, isUpdating, canAct, actorName, }: {
    reply: ReportReply;
    report: ReportFeedback;
    caseId: string;
    authors: ReportAuthor[];
    pendingComposer: PendingComposer;
    confirmAuthorName: string;
    showConfirmAuthorSelect: boolean;
    onConfirmAuthorNameChange: (name: string) => void;
    onStartDeny: (targetReplyId?: string) => void;
    onStartCheckout: (replyId: string) => void;
    onStartAskQuestion: () => void;
    onConfirm: () => void;
    isUpdating?: boolean;
    canAct: boolean;
    actorName: string;
}): import("react").JSX.Element | null;
export declare function CaseThreadEntryActions({ report, caseId, actorName, pendingComposer, onStartAskQuestion, onClaimAssignee, isUpdating, isClaimingAssignee, }: {
    report: ReportFeedback;
    caseId: string;
    actorName: string;
    pendingComposer: PendingComposer;
    onStartAskQuestion: () => void;
    onClaimAssignee: () => void;
    isUpdating?: boolean;
    isClaimingAssignee?: boolean;
}): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=ThreadEntryActions.d.ts.map