import type { ReportAuthor, ReportFeedback, ReportReply } from "@/types/report.js";
import { useReport } from "@/providers/reportContext.js";
import { formatClockTime } from "@/utils/format.js";
import { formatAssigneeLabel, resolveAuthorDepartment } from "@/utils/reportCases.js";
import { resolveAssigneeEntryActionRole } from "@/utils/feedbackThread.js";
import { CheckIcon, CloseIcon } from "@/components/icons/Icons.js";
import { ThreadTimelineRow } from "./ThreadTimelineRow.js";

const THREAD_ACTION_BUTTON_BASE = "flex items-center gap-[4px] rounded-[6px] px-[8px] py-[4px] text-[12px] font-semibold transition-colors";
const THREAD_ACTION_GHOST = "text-[var(--adaptive-text-primary)] hover:bg-[var(--adaptive-black100)]";
const THREAD_ACTION_DIVIDER = "mx-[2px] h-[12px] w-px bg-[var(--adaptive-border-subtle)]";
const THREAD_ACTION_ENTRY_SURFACE_CLASS = "flex flex-col gap-[4px] rounded-[12px] border-[2px] border-[var(--adaptive-grey900)] bg-[var(--adaptive-surface-overlay)] p-[8px_12px]";
const THREAD_CASE_ENTRY_SURFACE_CLASS = "flex flex-col gap-[4px] rounded-[12px]";

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

export function AssigneeThreadEntry({
    reply,
    report,
    caseId,
    authors,
    actorName,
    pendingComposer,
    onStartDeny,
    onStartCheckout,
    onTransferAssignee,
    isUpdating,
    isClaimingAssignee,
}: AssigneeThreadEntryProps) {
    const { messages } = useReport();
    const assigneeName = reply.author_name?.trim() ?? "";
    const department = resolveAuthorDepartment(authors, assigneeName);
    const actionRole = resolveAssigneeEntryActionRole(report, reply, caseId, actorName);
    const denyActive = (pendingComposer?.type === "deny" || pendingComposer?.type === "recheck") && pendingComposer.targetReplyId === reply.id;
    const checkoutActive = pendingComposer?.type === "checkout" && pendingComposer.targetReplyId === reply.id;
    const hasActions = actionRole !== null;

    return (
        <ThreadTimelineRow time={formatClockTime(reply.created_at)}>
            <div className={hasActions ? THREAD_ACTION_ENTRY_SURFACE_CLASS : THREAD_CASE_ENTRY_SURFACE_CLASS}>
                <p className="leading-[1.5] text-[14px] text-[var(--adaptive-text-primary)]">{reply.message}</p>
                {assigneeName ? <p className="text-[12px] text-[var(--adaptive-black500)]">{formatAssigneeLabel(assigneeName, department)}</p> : null}

                {actionRole === "assignee" ? (
                    <div className="mt-[10px] flex flex-wrap items-center justify-end">
                        <button
                            type="button"
                            data-fivepixels-interactive=""
                            disabled={isUpdating || isClaimingAssignee}
                            onClick={onStartDeny}
                            aria-label={messages.thread.denied}
                            className={`${THREAD_ACTION_BUTTON_BASE} px-[6px] ${denyActive ? "bg-[#FF2B6A] text-white" : THREAD_ACTION_GHOST}`}
                        >
                            <CloseIcon className="h-[13px] w-[13px]" />
                        </button>
                        <span
                            className={THREAD_ACTION_DIVIDER}
                            aria-hidden
                        />
                        <button
                            type="button"
                            data-fivepixels-interactive=""
                            disabled={isUpdating || isClaimingAssignee}
                            onClick={() => onStartCheckout(reply.id)}
                            aria-label={messages.thread.fixComplete}
                            className={`${THREAD_ACTION_BUTTON_BASE} ${checkoutActive ? "bg-[#F6572E] text-white" : THREAD_ACTION_GHOST}`}
                        >
                            <CheckIcon className="h-[13px] w-[13px]" />
                            {messages.thread.fixComplete}
                            <p>asd</p>
                        </button>
                    </div>
                ) : null}

                {actionRole === "takeover" ? (
                    <div className="mt-[10px] flex flex-wrap items-center justify-end">
                        <button
                            type="button"
                            data-fivepixels-interactive=""
                            disabled={isUpdating || isClaimingAssignee}
                            onClick={onTransferAssignee}
                            className={`${THREAD_ACTION_BUTTON_BASE} ${THREAD_ACTION_GHOST}`}
                        >
                            {messages.thread.takeOverAssignee}
                        </button>
                    </div>
                ) : null}
            </div>
        </ThreadTimelineRow>
    );
}
