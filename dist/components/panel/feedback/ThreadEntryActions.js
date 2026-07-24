import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useReportPreferences } from "../../../providers/reportContext.js";
import { buildConfirmAuthorOptions, canShowAdjudicationActionsOnBranchReply, canShowCaseClaimAction, canShowCaseEntryActions, canShowCheckoutBranchActionsForCase, canShowSuggestedBranchActionsForCase, isBranchReplyAuthor, } from "../../../utils/feedback/feedbackThread.js";
import { getThreadActionButtonClass, THREAD_ACTION_STYLE } from "../../../constants/threadActionStyles.js";
import { AskActionIcon, CheckIcon, CompleteActionIcon, DeniedActionIcon } from "../../../components/icons/Icons.js";
import { AuthorSelector } from "./AuthorSelector.js";
import { HoverTooltip } from "../../../components/ui/HoverTooltip.js";
export const THREAD_ACTION_BUTTON_BASE = "flex items-center gap-[4px] rounded-[6px] px-[8px] py-[4px] text-[12px] font-semibold transition-colors";
export const THREAD_ACTION_GHOST = "text-[var(--adaptive-text-primary)] hover:bg-[var(--adaptive-black100)]";
export const THREAD_ACTION_DIVIDER = "mx-[2px] h-[12px] w-px bg-[var(--adaptive-border-subtle)]";
export const THREAD_ACTION_ENTRY_SURFACE_CLASS = "flex flex-col gap-[4px] rounded-[12px] border-[2px] border-[var(--adaptive-grey900)] bg-[var(--adaptive-surface-overlay)] p-[8px_12px]";
export const THREAD_CASE_ENTRY_SURFACE_CLASS = "flex flex-col gap-[4px] rounded-[12px]";
function ThreadActionIcon({ kind, className }) {
    const color = THREAD_ACTION_STYLE[kind].color;
    if (kind === "ask") {
        return (_jsx(AskActionIcon, { className: className, fill: color }));
    }
    if (kind === "denied") {
        return (_jsx(DeniedActionIcon, { className: className, fill: color }));
    }
    return (_jsx(CompleteActionIcon, { className: className, fill: color }));
}
function ThreadActionButton({ label, tooltip, active, kind, disabled, onClick, showLabel = false, }) {
    const color = THREAD_ACTION_STYLE[kind].color;
    return (_jsx(HoverTooltip, { label: tooltip, children: _jsxs("button", { type: "button", "data-fivepixels-interactive": "", disabled: disabled, onClick: onClick, "aria-label": label, className: `${THREAD_ACTION_BUTTON_BASE} ${showLabel ? "" : "px-[6px]"} ${getThreadActionButtonClass(kind, active)}`, style: { color }, children: [_jsx(ThreadActionIcon, { kind: kind, className: "h-[13px] w-[13px]" }), showLabel ? _jsx("span", { style: { color }, children: label }) : null] }) }));
}
export function ThreadEntryActions({ reply, report, caseId, authors, pendingComposer, confirmAuthorName, showConfirmAuthorSelect, onConfirmAuthorNameChange, onStartDeny, onStartCheckout, onStartAskQuestion, onConfirm, isUpdating, canAct, actorName, }) {
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
    return (_jsxs("div", { className: "mt-[10px] flex flex-col gap-[8px]", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-end", children: [showReview ? (_jsxs(_Fragment, { children: [canUseReplyAction ? (_jsx(ThreadActionButton, { label: messages.thread.ask, tooltip: messages.thread.askTooltip, active: askQuestionActive, kind: "ask", disabled: isUpdating, onClick: onStartAskQuestion, showLabel: true })) : null, showAdjudication && canAct ? (_jsxs(_Fragment, { children: [canUseReplyAction ? (_jsx("span", { className: THREAD_ACTION_DIVIDER, "aria-hidden": true })) : null, _jsx(ThreadActionButton, { label: messages.thread.denied, tooltip: messages.thread.deniedTooltip, active: denyActive, kind: "denied", disabled: isUpdating, onClick: () => onStartDeny() }), _jsxs("button", { type: "button", "data-fivepixels-interactive": "", disabled: isUpdating, onClick: handleResolvedClick, "aria-label": isResolvedConfirming ? messages.thread.resolvedConfirmAriaLabel : messages.thread.resolved, className: `${THREAD_ACTION_BUTTON_BASE} ${isResolvedConfirming ? "bg-[#D94A22] px-[8px] text-white" : `px-[6px] ${THREAD_ACTION_GHOST}`}`, children: [_jsx(CheckIcon, { className: "h-[13px] w-[13px]" }), isResolvedConfirming ? messages.thread.resolvedConfirmLabel : null] })] })) : null] })) : null, showCheckout ? (_jsxs(_Fragment, { children: [canUseReplyAction ? (_jsx(ThreadActionButton, { label: messages.thread.ask, tooltip: messages.thread.askTooltip, active: askQuestionActive, kind: "ask", disabled: isUpdating, onClick: onStartAskQuestion, showLabel: true })) : null, showAdjudication && canAct ? (_jsxs(_Fragment, { children: [canUseReplyAction ? (_jsx("span", { className: THREAD_ACTION_DIVIDER, "aria-hidden": true })) : null, _jsx(ThreadActionButton, { label: messages.thread.denied, tooltip: messages.thread.deniedTooltip, active: denyActive, kind: "denied", disabled: isUpdating, onClick: () => onStartDeny() }), _jsx(ThreadActionButton, { label: messages.thread.complete, tooltip: messages.thread.completeTooltip, active: checkoutActive, kind: "complete", disabled: isUpdating, onClick: () => onStartCheckout(reply.id), showLabel: true })] })) : null] })) : null] }), !canAct && !isOwnBranchReply && !showAdjudication ? _jsx("p", { className: "text-[11px] text-[var(--adaptive-black500)]", children: messages.errors.caseAssigneeOnly }) : null, showReview && showAdjudication && showConfirmAuthorSelect ? (_jsx(AuthorSelector, { authors: confirmAuthorOptions, value: confirmAuthorName, onChange: onConfirmAuthorNameChange })) : null] }));
}
export function CaseThreadEntryActions({ report, caseId, actorName, pendingComposer, onStartAskQuestion, onClaimAssignee, isUpdating, isClaimingAssignee, }) {
    const { messages } = useReportPreferences();
    const showPreClaimDiscussion = canShowCaseEntryActions(report, caseId);
    const showClaim = canShowCaseClaimAction(report, caseId, actorName);
    const canReply = showPreClaimDiscussion && Boolean(actorName.trim());
    const replyActive = pendingComposer?.type === "question";
    if (!showPreClaimDiscussion) {
        return null;
    }
    return (_jsxs("div", { className: "mt-[10px] flex flex-wrap items-center justify-end gap-[4px]", children: [canReply ? (_jsx(ThreadActionButton, { label: messages.thread.ask, tooltip: messages.thread.askTooltip, active: replyActive, kind: "ask", disabled: isUpdating, onClick: onStartAskQuestion, showLabel: true })) : null, showClaim ? (_jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: isUpdating || isClaimingAssignee, onClick: onClaimAssignee, className: `${THREAD_ACTION_BUTTON_BASE} ${THREAD_ACTION_GHOST}`, children: messages.thread.claimAssignee })) : null] }));
}
//# sourceMappingURL=ThreadEntryActions.js.map