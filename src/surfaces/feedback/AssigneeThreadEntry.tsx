import type { ReportAuthor, ReportFeedback, ReportReply } from "@/shared/types/report.js";
import { useReportPreferences } from "@/shared/providers/reportContext.js";
import { formatClockTime } from "@/shared/utils/shared/format.js";
import { formatAssigneeLabel, resolveAuthorDepartment } from "@/shared/utils/report/reportCases.js";
import { resolveAssigneeEntryActionRole } from "@/shared/utils/feedback/feedbackThread.js";
import { getThreadActionButtonClass, THREAD_ACTION_STYLE } from "@/shared/constants/threadActionStyles.js";
import { AssigneeAssignedIcon, AssigneeTransferredIcon, CompleteActionIcon, DeniedActionIcon } from "@/shared/components/icons/Icons.js";
import { HoverTooltip } from "@/surfaces/tooltip/HoverTooltip.js";
import { FeedActivityLine } from "./feed/FeedCommentMeta.js";
import { getFeedActivitySurfaceClass, resolveFeedActivityTone } from "./feed/feedActivitySurface.js";
import { FeedSpineIcon } from "./feed/FeedTimelineRow.js";
import { ThreadLayoutShell } from "./feed/ThreadLayoutShell.js";

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
    const { messages, threadLayout } = useReportPreferences();
    const assigneeName = reply.author_name?.trim() ?? "";
    const department = resolveAuthorDepartment(authors, assigneeName);
    const displayAssignee = formatAssigneeLabel(assigneeName, department);
    const actionRole = resolveAssigneeEntryActionRole(report, reply, caseId, actorName);
    const denyActive = (pendingComposer?.type === "deny" || pendingComposer?.type === "recheck") && pendingComposer.targetReplyId === reply.id;
    const checkoutActive = pendingComposer?.type === "checkout" && pendingComposer.targetReplyId === reply.id;
    const hasActions = actionRole !== null;
    const deniedStyle = THREAD_ACTION_STYLE.denied;
    const completeStyle = THREAD_ACTION_STYLE.complete;
    const isFeed = threadLayout === "feed";
    const surfaceClass =
        denyActive || checkoutActive
            ? `${THREAD_ACTION_ENTRY_SURFACE_CLASS} ${denyActive ? deniedStyle.cardHighlight : completeStyle.cardHighlight}`
            : hasActions
              ? THREAD_ACTION_ENTRY_SURFACE_CLASS
              : THREAD_CASE_ENTRY_SURFACE_CLASS;
    const feedAction =
        reply.status === "assignee_transferred" ? messages.thread.feedAssigneeTransferredAction : messages.thread.feedAssigneeAssignedAction;

    const actions =
        actionRole === "assignee" ? (
            <div className="mt-[8px] flex flex-wrap items-center justify-end">
                <HoverTooltip label={messages.thread.deniedTooltip}>
                    <button
                        type="button"
                        data-fivepixels-interactive=""
                        disabled={isUpdating || isClaimingAssignee}
                        onClick={onStartDeny}
                        aria-label={messages.thread.denied}
                        className={`${THREAD_ACTION_BUTTON_BASE} px-[6px] ${getThreadActionButtonClass("denied", denyActive)}`}
                        style={{ color: deniedStyle.color }}
                    >
                        <DeniedActionIcon
                            className="h-[13px] w-[13px]"
                            fill={deniedStyle.color}
                        />
                    </button>
                </HoverTooltip>
                <span
                    className={THREAD_ACTION_DIVIDER}
                    aria-hidden
                />
                <HoverTooltip label={messages.thread.completeTooltip}>
                    <button
                        type="button"
                        data-fivepixels-interactive=""
                        disabled={isUpdating || isClaimingAssignee}
                        onClick={() => onStartCheckout(reply.id)}
                        aria-label={messages.thread.complete}
                        className={`${THREAD_ACTION_BUTTON_BASE} ${getThreadActionButtonClass("complete", checkoutActive)}`}
                        style={{ color: completeStyle.color }}
                    >
                        <CompleteActionIcon
                            className="h-[13px] w-[13px]"
                            fill={completeStyle.color}
                        />
                        <span style={{ color: completeStyle.color }}>{messages.thread.complete}</span>
                    </button>
                </HoverTooltip>
            </div>
        ) : actionRole === "takeover" ? (
            <div className="mt-[8px] flex flex-wrap items-center justify-end">
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
        ) : null;

    if (isFeed) {
        return (
            <ThreadLayoutShell
                classicTime={formatClockTime(reply.created_at)}
                density="activity"
                feedNode={
                    <FeedSpineIcon tone={resolveFeedActivityTone(reply.status)}>
                        {reply.status === "assignee_transferred" ? (
                            <AssigneeTransferredIcon
                                className="h-[12px] w-[12px]"
                                fill="currentColor"
                            />
                        ) : (
                            <AssigneeAssignedIcon
                                className="h-[12px] w-[12px]"
                                fill="currentColor"
                            />
                        )}
                    </FeedSpineIcon>
                }
            >
                <div className={hasActions ? surfaceClass : getFeedActivitySurfaceClass(resolveFeedActivityTone(reply.status))}>
                    <FeedActivityLine
                        actorName={displayAssignee || undefined}
                        action={feedAction}
                        createdAt={reply.created_at}
                    />
                    {actions}
                </div>
            </ThreadLayoutShell>
        );
    }

    return (
        <ThreadLayoutShell classicTime={formatClockTime(reply.created_at)}>
            <div className={surfaceClass}>
                <p className="leading-[1.5] text-[14px] text-[var(--adaptive-text-primary)] whitespace-break-spaces">{reply.message}</p>
                {assigneeName ? <p className="text-[12px] text-[var(--adaptive-black500)]">{displayAssignee}</p> : null}
                {actions}
            </div>
        </ThreadLayoutShell>
    );
}
