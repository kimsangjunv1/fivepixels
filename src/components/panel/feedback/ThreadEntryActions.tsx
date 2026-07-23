import { useEffect, useMemo, useState } from "react";
import type { ReportAuthor, ReportFeedback, ReportReply } from "@/types/report.js";
import { useReportPreferences } from "@/providers/reportContext.js";
import {
    buildConfirmAuthorOptions,
    canShowAdjudicationActionsOnBranchReply,
    canShowCaseClaimAction,
    canShowCaseEntryActions,
    canShowCheckoutBranchActionsForCase,
    canShowSuggestedBranchActionsForCase,
    isBranchReplyAuthor,
} from "@/utils/feedback/feedbackThread.js";
import { getThreadActionButtonClass, THREAD_ACTION_STYLE, type ThreadActionKind } from "@/constants/threadActionStyles.js";
import { AskActionIcon, CheckIcon, CompleteActionIcon, DeniedActionIcon } from "@/components/icons/Icons.js";
import { AuthorSelector } from "./AuthorSelector.js";
import { HoverTooltip } from "@/components/ui/HoverTooltip.js";

export const THREAD_ACTION_BUTTON_BASE = "flex items-center gap-[4px] rounded-[6px] px-[8px] py-[4px] text-[12px] font-semibold transition-colors";
export const THREAD_ACTION_GHOST = "text-[var(--adaptive-text-primary)] hover:bg-[var(--adaptive-black100)]";
export const THREAD_ACTION_DIVIDER = "mx-[2px] h-[12px] w-px bg-[var(--adaptive-border-subtle)]";
export const THREAD_ACTION_ENTRY_SURFACE_CLASS = "flex flex-col gap-[4px] rounded-[12px] border-[2px] border-[var(--adaptive-grey900)] bg-[var(--adaptive-surface-overlay)] p-[8px_12px]";
export const THREAD_CASE_ENTRY_SURFACE_CLASS = "flex flex-col gap-[4px] rounded-[12px]";

type PendingComposer = {
    type: "deny" | "recheck" | "checkout" | "question";
    targetReplyId: string;
} | null;

function ThreadActionIcon({ kind, className }: { kind: ThreadActionKind; className?: string }) {
    const color = THREAD_ACTION_STYLE[kind].color;

    if (kind === "ask") {
        return (
            <AskActionIcon
                className={className}
                fill={color}
            />
        );
    }

    if (kind === "denied") {
        return (
            <DeniedActionIcon
                className={className}
                fill={color}
            />
        );
    }

    return (
        <CompleteActionIcon
            className={className}
            fill={color}
        />
    );
}

function ThreadActionButton({
    label,
    tooltip,
    active,
    kind,
    disabled,
    onClick,
    showLabel = false,
}: {
    label: string;
    tooltip: string;
    active: boolean;
    kind: ThreadActionKind;
    disabled?: boolean;
    onClick: () => void;
    showLabel?: boolean;
}) {
    const color = THREAD_ACTION_STYLE[kind].color;

    return (
        <HoverTooltip label={tooltip}>
            <button
                type="button"
                data-fivepixels-interactive=""
                disabled={disabled}
                onClick={onClick}
                aria-label={label}
                className={`${THREAD_ACTION_BUTTON_BASE} ${showLabel ? "" : "px-[6px]"} ${getThreadActionButtonClass(kind, active)}`}
                style={{ color }}
            >
                <ThreadActionIcon
                    kind={kind}
                    className="h-[13px] w-[13px]"
                />
                {showLabel ? <span style={{ color }}>{label}</span> : null}
            </button>
        </HoverTooltip>
    );
}

export function ThreadEntryActions({
    reply,
    report,
    caseId,
    authors,
    pendingComposer,
    confirmAuthorName,
    showConfirmAuthorSelect,
    onConfirmAuthorNameChange,
    onStartDeny,
    onStartCheckout,
    onStartAskQuestion,
    onConfirm,
    isUpdating,
    canAct,
    actorName,
}: {
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
}) {
    const { messages } = useReportPreferences();
    const [isResolvedConfirming, setIsResolvedConfirming] = useState(false);
    const confirmAuthorOptions = useMemo(() => buildConfirmAuthorOptions(report, authors), [authors, report]);
    const showReview = canShowSuggestedBranchActionsForCase(report, reply, caseId);
    const showCheckout = canShowCheckoutBranchActionsForCase(report, reply, caseId);
    const showAdjudication = canShowAdjudicationActionsOnBranchReply(reply, actorName);
    const isOwnBranchReply = isBranchReplyAuthor(reply, actorName);
    const canUseReplyAction = Boolean(actorName.trim()) && (canAct || isOwnBranchReply || showAdjudication);
    const denyActive = (pendingComposer?.type === "deny" || pendingComposer?.type === "recheck") && pendingComposer.targetReplyId === reply.id;
    const checkoutActive = pendingComposer?.type === "checkout" && pendingComposer.targetReplyId === reply.id;
    const askQuestionActive = pendingComposer?.type === "question" && pendingComposer.targetReplyId === reply.id;

    useEffect(() => {
        if (!isResolvedConfirming) {
            return;
        }

        const timer = window.setTimeout(() => setIsResolvedConfirming(false), 1500);

        return () => window.clearTimeout(timer);
    }, [isResolvedConfirming]);

    const handleResolvedClick = () => {
        if (isUpdating || !canAct) {
            return;
        }

        if (!isResolvedConfirming) {
            setIsResolvedConfirming(true);
            return;
        }

        setIsResolvedConfirming(false);
        onConfirm();
    };

    if (!showReview && !showCheckout) {
        return null;
    }

    if (!canUseReplyAction && !((showReview || showCheckout) && showAdjudication && canAct)) {
        return null;
    }

    return (
        <div className="mt-[10px] flex flex-col gap-[8px]">
            <div className="flex flex-wrap items-center justify-end">
                {showReview ? (
                    <>
                        {canUseReplyAction ? (
                            <ThreadActionButton
                                label={messages.thread.ask}
                                tooltip={messages.thread.askTooltip}
                                active={askQuestionActive}
                                kind="ask"
                                disabled={isUpdating}
                                onClick={onStartAskQuestion}
                                showLabel
                            />
                        ) : null}

                        {showAdjudication && canAct ? (
                            <>
                                {canUseReplyAction ? (
                                    <span
                                        className={THREAD_ACTION_DIVIDER}
                                        aria-hidden
                                    />
                                ) : null}

                                <ThreadActionButton
                                    label={messages.thread.denied}
                                    tooltip={messages.thread.deniedTooltip}
                                    active={denyActive}
                                    kind="denied"
                                    disabled={isUpdating}
                                    onClick={() => onStartDeny()}
                                />

                                <button
                                    type="button"
                                    data-fivepixels-interactive=""
                                    disabled={isUpdating}
                                    onClick={handleResolvedClick}
                                    aria-label={isResolvedConfirming ? messages.thread.resolvedConfirmAriaLabel : messages.thread.resolved}
                                    className={`${THREAD_ACTION_BUTTON_BASE} ${isResolvedConfirming ? "bg-[#D94A22] px-[8px] text-white" : `px-[6px] ${THREAD_ACTION_GHOST}`}`}
                                >
                                    <CheckIcon className="h-[13px] w-[13px]" />
                                    {isResolvedConfirming ? messages.thread.resolvedConfirmLabel : null}
                                </button>
                            </>
                        ) : null}
                    </>
                ) : null}

                {showCheckout ? (
                    <>
                        {canUseReplyAction ? (
                            <ThreadActionButton
                                label={messages.thread.ask}
                                tooltip={messages.thread.askTooltip}
                                active={askQuestionActive}
                                kind="ask"
                                disabled={isUpdating}
                                onClick={onStartAskQuestion}
                                showLabel
                            />
                        ) : null}
                        {showAdjudication && canAct ? (
                            <>
                                {canUseReplyAction ? (
                                    <span
                                        className={THREAD_ACTION_DIVIDER}
                                        aria-hidden
                                    />
                                ) : null}
                                <ThreadActionButton
                                    label={messages.thread.denied}
                                    tooltip={messages.thread.deniedTooltip}
                                    active={denyActive}
                                    kind="denied"
                                    disabled={isUpdating}
                                    onClick={() => onStartDeny()}
                                />
                                <ThreadActionButton
                                    label={messages.thread.complete}
                                    tooltip={messages.thread.completeTooltip}
                                    active={checkoutActive}
                                    kind="complete"
                                    disabled={isUpdating}
                                    onClick={() => onStartCheckout(reply.id)}
                                    showLabel
                                />
                            </>
                        ) : null}
                    </>
                ) : null}
            </div>

            {!canAct && !isOwnBranchReply && !showAdjudication ? <p className="text-[11px] text-[var(--adaptive-black500)]">{messages.errors.caseAssigneeOnly}</p> : null}

            {showReview && showAdjudication && showConfirmAuthorSelect ? (
                <AuthorSelector
                    authors={confirmAuthorOptions}
                    value={confirmAuthorName}
                    onChange={onConfirmAuthorNameChange}
                />
            ) : null}
        </div>
    );
}

export function CaseThreadEntryActions({
    report,
    caseId,
    actorName,
    pendingComposer,
    onStartAskQuestion,
    onClaimAssignee,
    isUpdating,
    isClaimingAssignee,
}: {
    report: ReportFeedback;
    caseId: string;
    actorName: string;
    pendingComposer: PendingComposer;
    onStartAskQuestion: () => void;
    onClaimAssignee: () => void;
    isUpdating?: boolean;
    isClaimingAssignee?: boolean;
}) {
    const { messages } = useReportPreferences();
    const showPreClaimDiscussion = canShowCaseEntryActions(report, caseId);
    const showClaim = canShowCaseClaimAction(report, caseId, actorName);
    const canReply = showPreClaimDiscussion && Boolean(actorName.trim());
    const replyActive = pendingComposer?.type === "question";

    if (!showPreClaimDiscussion) {
        return null;
    }

    return (
        <div className="mt-[10px] flex flex-wrap items-center justify-end gap-[4px]">
            {canReply ? (
                <ThreadActionButton
                    label={messages.thread.ask}
                    tooltip={messages.thread.askTooltip}
                    active={replyActive}
                    kind="ask"
                    disabled={isUpdating}
                    onClick={onStartAskQuestion}
                    showLabel
                />
            ) : null}
            {showClaim ? (
                <button
                    type="button"
                    data-fivepixels-interactive=""
                    disabled={isUpdating || isClaimingAssignee}
                    onClick={onClaimAssignee}
                    className={`${THREAD_ACTION_BUTTON_BASE} ${THREAD_ACTION_GHOST}`}
                >
                    {messages.thread.claimAssignee}
                </button>
            ) : null}
        </div>
    );
}
