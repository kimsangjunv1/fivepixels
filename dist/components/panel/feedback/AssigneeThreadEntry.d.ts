import type { ReportAuthor, ReportFeedback, ReportReply } from "../../../types/report.js";
type AssigneeThreadEntryProps = {
    reply: ReportReply;
    report: ReportFeedback;
    caseId: string;
    authors: ReportAuthor[];
    actorName: string;
    pendingComposer: {
        type: "deny" | "recheck" | "checkout" | "question";
        targetReplyId: string;
    } | null;
    onStartDeny: () => void;
    onStartCheckout: (replyId: string) => void;
    onTransferAssignee: () => void;
    isUpdating?: boolean;
    isClaimingAssignee?: boolean;
};
export declare function AssigneeThreadEntry({ reply, report, caseId, authors, actorName, pendingComposer, onStartDeny, onStartCheckout, onTransferAssignee, isUpdating, isClaimingAssignee, }: AssigneeThreadEntryProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=AssigneeThreadEntry.d.ts.map