import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReport } from "../../../providers/reportContext.js";
import { formatClockTime } from "../../../utils/format.js";
import { canEditReportCases, getCaseById } from "../../../utils/reportCases.js";
import { buildCaseThreadTimeline, buildConfirmAuthorOptions, buildThreadTimeline, canShowAdjudicationActionsOnBranchReply, canShowCaseThreadActions, canShowCaseClaimAction, canShowCheckoutBranchActionsForCase, canShowSuggestedBranchActionsForCase, getReportReplies, isAssigneeEventStatus, isBranchReplyAuthor, ISSUE_ROOT_PARENT_ID, resolveOriginalFeedbackAuthorName, shouldForceExpandQuestionGroup, } from "../../../utils/feedbackThread.js";
import { getGitHubIssueUrl, isGitIssuedSystemReply } from "../../../utils/githubIntegration.js";
import { CheckIcon, CloseIcon, ResolvedStatusIcon, RevertIcon } from "../../../components/icons/Icons.js";
import { FEEDBACK_STATUS_COLOR } from "../../../constants/feedbackStatus.js";
import { AssigneeThreadEntry } from "./AssigneeThreadEntry.js";
import { AuthorSelector } from "./AuthorSelector.js";
import { FeedbackCaseList } from "./FeedbackCaseList.js";
import { FeedbackCreatorBadge } from "./FeedbackCreatorBadge.js";
import { FeedbackStatusBadge } from "./FeedbackStatusBadge.js";
import { GitIssuedThreadEntry } from "./GitIssuedThreadEntry.js";
import { QuestionThreadGroup } from "./QuestionThreadGroup.js";
import { ThreadAuthorMeta } from "./ThreadAuthorMeta.js";
import { ThreadTimelineRow } from "./ThreadTimelineRow.js";
const THREAD_ACTION_BUTTON_BASE = "flex items-center gap-[4px] rounded-[6px] px-[8px] py-[4px] text-[12px] font-semibold transition-colors";
const THREAD_ACTION_GHOST = "text-[var(--adaptive-text-primary)] hover:bg-[var(--adaptive-black100)]";
const THREAD_ACTION_DIVIDER = "mx-[2px] h-[12px] w-px bg-[var(--adaptive-border-subtle)]";
const THREAD_ACTION_ENTRY_SURFACE_CLASS = "flex flex-col gap-[4px] rounded-[12px] border-[2px] border-[var(--adaptive-grey900)] bg-[var(--adaptive-surface-overlay)] p-[8px_12px]";
const THREAD_CASE_ENTRY_SURFACE_CLASS = "flex flex-col gap-[4px] rounded-[12px]";
function getScrollOverflowState(element) {
    const { scrollTop, scrollHeight, clientHeight } = element;
    const hasOverflow = scrollHeight > clientHeight + 1;
    return {
        canScrollUp: hasOverflow && scrollTop > 0,
        canScrollDown: hasOverflow && scrollTop + clientHeight < scrollHeight - 1,
    };
}
const SCROLL_HINT_CLASS = "pointer-events-none absolute left-0 right-0 z-10 px-[16px] py-[12px] text-center text-[12px] text-[var(--adaptive-black600)]";
function ThreadEntryActions({ reply, report, caseId, authors, pendingComposer, confirmAuthorName, showConfirmAuthorSelect, onConfirmAuthorNameChange, onStartDeny, onStartCheckout, onStartAskQuestion, onConfirm, isUpdating, canAct, actorName, }) {
    const { messages } = useReport();
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
    return (_jsxs("div", { className: "mt-[10px] flex flex-col gap-[8px]", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-end", children: [showReview ? (_jsxs(_Fragment, { children: [canUseReplyAction ? (_jsxs("button", { type: "button", "data-fivepixels-interactive": "", disabled: isUpdating, onClick: onStartAskQuestion, className: `${THREAD_ACTION_BUTTON_BASE} ${askQuestionActive ? "bg-[var(--adaptive-blue50)] text-[var(--adaptive-blue500)]" : THREAD_ACTION_GHOST}`, children: [_jsx(RevertIcon, { className: "h-[13px] w-[13px]" }), messages.thread.reply] })) : null, showAdjudication && canAct ? (_jsxs(_Fragment, { children: [canUseReplyAction ? (_jsx("span", { className: THREAD_ACTION_DIVIDER, "aria-hidden": true })) : null, _jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: isUpdating, onClick: () => onStartDeny(), "aria-label": messages.thread.denied, className: `${THREAD_ACTION_BUTTON_BASE} px-[6px] ${denyActive ? "bg-[#FF2B6A] text-white" : THREAD_ACTION_GHOST}`, children: _jsx(CloseIcon, { className: "h-[13px] w-[13px]" }) }), _jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: isUpdating, onClick: handleResolvedClick, "aria-label": isResolvedConfirming ? messages.thread.resolvedConfirmAriaLabel : messages.thread.resolved, className: `${THREAD_ACTION_BUTTON_BASE} px-[6px] ${isResolvedConfirming ? "bg-[#D94A22] text-white" : THREAD_ACTION_GHOST}`, children: _jsx(CheckIcon, { className: "h-[13px] w-[13px]" }) })] })) : null] })) : null, showCheckout ? (_jsxs(_Fragment, { children: [canUseReplyAction ? (_jsxs("button", { type: "button", "data-fivepixels-interactive": "", disabled: isUpdating, onClick: onStartAskQuestion, className: `${THREAD_ACTION_BUTTON_BASE} ${askQuestionActive ? "bg-[var(--adaptive-blue50)] text-[var(--adaptive-blue500)]" : THREAD_ACTION_GHOST}`, children: [_jsx(RevertIcon, { className: "h-[13px] w-[13px]" }), messages.thread.reply] })) : null, showAdjudication && canAct ? (_jsxs(_Fragment, { children: [canUseReplyAction ? (_jsx("span", { className: THREAD_ACTION_DIVIDER, "aria-hidden": true })) : null, _jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: isUpdating, onClick: () => onStartDeny(), "aria-label": messages.thread.denied, className: `${THREAD_ACTION_BUTTON_BASE} px-[6px] ${denyActive ? "bg-[#FF2B6A] text-white" : THREAD_ACTION_GHOST}`, children: _jsx(CloseIcon, { className: "h-[13px] w-[13px]" }) }), _jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: isUpdating, onClick: () => onStartCheckout(reply.id), "aria-label": messages.thread.leaveResult, className: `${THREAD_ACTION_BUTTON_BASE} px-[6px] ${checkoutActive ? "bg-[#F6572E] text-white" : THREAD_ACTION_GHOST}`, children: _jsx(CheckIcon, { className: "h-[13px] w-[13px]" }) })] })) : null] })) : null] }), !canAct && !isOwnBranchReply && !showAdjudication ? _jsx("p", { className: "text-[11px] text-[var(--adaptive-black500)]", children: messages.errors.caseAssigneeOnly }) : null, showReview && showAdjudication && showConfirmAuthorSelect ? (_jsx(AuthorSelector, { authors: confirmAuthorOptions, value: confirmAuthorName, onChange: onConfirmAuthorNameChange })) : null] }));
}
function CaseThreadEntryActions({ report, caseId, actorName, onClaimAssignee, isUpdating, isClaimingAssignee, }) {
    const { messages } = useReport();
    if (!canShowCaseClaimAction(report, caseId, actorName)) {
        return null;
    }
    return (_jsx("div", { className: "mt-[10px] flex flex-wrap items-center justify-end", children: _jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: isUpdating || isClaimingAssignee, onClick: onClaimAssignee, className: `${THREAD_ACTION_BUTTON_BASE} ${THREAD_ACTION_GHOST}`, children: messages.thread.claimAssignee }) }));
}
function ThreadResolvedDivider() {
    const { messages } = useReport();
    const resolvedColor = FEEDBACK_STATUS_COLOR.resolved;
    return (_jsx(ThreadTimelineRow, { children: _jsxs("div", { className: "flex items-center gap-[8px]", role: "status", children: [_jsx("span", { "aria-hidden": true, className: "h-px flex-1 bg-[var(--adaptive-border-subtle)]" }), _jsxs("span", { className: "inline-flex shrink-0 items-center gap-[6px]", children: [_jsx("span", { "aria-hidden": true, className: "inline-flex h-[18px] w-[18px] items-center justify-center rounded-full", style: { backgroundColor: resolvedColor }, children: _jsx(ResolvedStatusIcon, { className: "h-[11px] w-[11px]", fill: "#ffffff" }) }), _jsx("span", { className: "text-[13px] font-bold leading-none", style: { color: resolvedColor }, children: messages.thread.issueResolvedDivider })] }), _jsx("span", { "aria-hidden": true, className: "h-px flex-1 bg-[var(--adaptive-border-subtle)]" })] }) }));
}
function CaseThreadEntry({ report, caseId, caseText, caseCreatedAt, caseStatus, actorName, onClaimAssignee, isUpdating, isClaimingAssignee, isEditingCases = false, }) {
    const hasActions = !isEditingCases && canShowCaseClaimAction(report, caseId, actorName);
    const entryBody = (_jsxs(_Fragment, { children: [_jsx(FeedbackStatusBadge, { status: "issue_apply", isNeedGray: true }), _jsx("p", { className: `leading-[1.5] text-[14px] text-[var(--adaptive-text-primary)] ${caseStatus === "resolved" ? "text-[var(--adaptive-black500)] line-through" : ""}`, children: caseText }), report.author_name ? (_jsx(ThreadAuthorMeta, { authorName: report.author_name, createdAt: caseCreatedAt, showCreator: true })) : null, isEditingCases ? null : (_jsx(CaseThreadEntryActions, { report: report, caseId: caseId, actorName: actorName, onClaimAssignee: onClaimAssignee, isUpdating: isUpdating, isClaimingAssignee: isClaimingAssignee }))] }));
    return (_jsx(ThreadTimelineRow, { time: formatClockTime(caseCreatedAt), children: _jsx("div", { className: hasActions ? THREAD_ACTION_ENTRY_SURFACE_CLASS : THREAD_CASE_ENTRY_SURFACE_CLASS, children: entryBody }) }));
}
function ThreadRootReply({ reply, report, caseId, authors, pendingComposer, confirmAuthorName, showConfirmAuthorSelect, originalAuthorName, issueUrl, onConfirmAuthorNameChange, onStartDeny, onStartCheckout, onStartAskQuestion, onTransferAssignee, onConfirm, isUpdating, isClaimingAssignee, actorName, }) {
    if (isGitIssuedSystemReply(reply, report) && issueUrl) {
        return (_jsx(ThreadTimelineRow, { time: formatClockTime(reply.created_at), children: _jsx(GitIssuedThreadEntry, { reply: reply, issueUrl: issueUrl }) }));
    }
    if (reply.status === "resolved") {
        return _jsx(ThreadResolvedDivider, {});
    }
    if (isAssigneeEventStatus(reply.status)) {
        return (_jsx(AssigneeThreadEntry, { reply: reply, report: report, caseId: caseId, authors: authors, actorName: actorName, pendingComposer: pendingComposer, onStartDeny: () => onStartDeny(reply.id), onStartCheckout: onStartCheckout, onTransferAssignee: onTransferAssignee, isUpdating: isUpdating, isClaimingAssignee: isClaimingAssignee }));
    }
    const showBranchActions = canShowSuggestedBranchActionsForCase(report, reply, caseId) || canShowCheckoutBranchActionsForCase(report, reply, caseId);
    const canAct = canShowCaseThreadActions(report, caseId, actorName);
    const isOwnBranchReply = isBranchReplyAuthor(reply, actorName);
    const hasActions = showBranchActions &&
        (canAct || isOwnBranchReply) &&
        (canShowAdjudicationActionsOnBranchReply(reply, actorName) ? canAct : true);
    const entryBody = (_jsxs(_Fragment, { children: [_jsx(FeedbackStatusBadge, { status: reply.status, isNeedGray: true }), _jsx("p", { className: "leading-[1.5] text-[14px] text-[var(--adaptive-text-primary)]", children: reply.message }), reply.author_name ? (_jsx(ThreadAuthorMeta, { authorName: reply.author_name, createdAt: reply.created_at, showCreator: reply.author_name.trim() === originalAuthorName })) : null, _jsx(ThreadEntryActions, { reply: reply, report: report, caseId: caseId, authors: authors, pendingComposer: pendingComposer, confirmAuthorName: confirmAuthorName, showConfirmAuthorSelect: showConfirmAuthorSelect, onConfirmAuthorNameChange: onConfirmAuthorNameChange, onStartDeny: onStartDeny, onStartCheckout: onStartCheckout, onStartAskQuestion: onStartAskQuestion, onConfirm: onConfirm, isUpdating: isUpdating, canAct: canAct, actorName: actorName })] }));
    return (_jsx(ThreadTimelineRow, { time: formatClockTime(reply.created_at), children: _jsx("div", { className: hasActions ? THREAD_ACTION_ENTRY_SURFACE_CLASS : THREAD_CASE_ENTRY_SURFACE_CLASS, children: entryBody }) }));
}
export function FeedbackThread({ report, authors, pendingComposer, confirmAuthorName, showConfirmAuthorSelect, onConfirmAuthorNameChange, onToggleConfirmAuthorSelect: _onToggleConfirmAuthorSelect, onStartDeny, onStartCheckout, onStartAskQuestion, onClaimAssignee, onTransferAssignee, onConfirm, isUpdating, isClaimingAssignee, hideCaseSelector = false, }) {
    const { messages, fields, caseEditReportId, caseEditCases, beginCaseEdit, cancelCaseEdit, handleCaseEditSave, updateCaseEditDraftCase, addCaseEditDraftCase, removeCaseEditDraftCase, focusedCaseId, selectCase, replyAuthorName, errorMessage, } = useReport();
    const scrollRef = useRef(null);
    const [isAllCasesView, setIsAllCasesView] = useState(false);
    const [scrollOverflow, setScrollOverflow] = useState({
        canScrollUp: false,
        canScrollDown: false,
    });
    const isEditingCases = caseEditReportId === report.id && caseEditCases !== null;
    const casesForEditor = isEditingCases ? caseEditCases : report.cases;
    const replies = getReportReplies(report);
    const timeline = useMemo(() => (focusedCaseId ? buildCaseThreadTimeline(report, focusedCaseId) : { issueChildren: [], branches: [] }), [focusedCaseId, report, replies]);
    const originalAuthorName = resolveOriginalFeedbackAuthorName(report);
    const focusedCase = focusedCaseId ? getCaseById(report, focusedCaseId) : undefined;
    const issueUrl = getGitHubIssueUrl(report);
    const actorName = replyAuthorName.trim() || confirmAuthorName.trim();
    const canAct = focusedCaseId ? canShowCaseThreadActions(report, focusedCaseId, actorName) : false;
    const systemBranches = useMemo(() => buildThreadTimeline(report).branches.filter((branch) => isGitIssuedSystemReply(branch.root, report)), [report, replies]);
    const showTimelineRail = Boolean((focusedCaseId && !isAllCasesView) || systemBranches.length > 0);
    useEffect(() => {
        setIsAllCasesView(false);
    }, [report.id]);
    const refreshScrollOverflow = useCallback(() => {
        const element = scrollRef.current;
        if (!element) {
            return;
        }
        setScrollOverflow(getScrollOverflowState(element));
    }, []);
    const scrollToBottom = useCallback(() => {
        const element = scrollRef.current;
        if (!element) {
            return;
        }
        element.scrollTop = element.scrollHeight;
        refreshScrollOverflow();
    }, [refreshScrollOverflow]);
    useEffect(() => {
        const element = scrollRef.current;
        if (!element) {
            return;
        }
        refreshScrollOverflow();
        element.addEventListener("scroll", refreshScrollOverflow, { passive: true });
        const resizeObserver = new ResizeObserver(refreshScrollOverflow);
        resizeObserver.observe(element);
        return () => {
            element.removeEventListener("scroll", refreshScrollOverflow);
            resizeObserver.disconnect();
        };
    }, [focusedCaseId, refreshScrollOverflow, replies.length]);
    useEffect(() => {
        scrollToBottom();
    }, [focusedCaseId, replies.length, scrollToBottom]);
    return (_jsxs("div", { className: "relative min-h-0 flex-1", children: [scrollOverflow.canScrollUp ? _jsx("p", { className: `${SCROLL_HINT_CLASS} top-0 bg-[linear-gradient(0deg,transparent,var(--adaptive-black50))]`, children: messages.thread.scrollHintUp }) : null, scrollOverflow.canScrollDown ? (_jsx("p", { className: `${SCROLL_HINT_CLASS} bottom-[57px] bg-[linear-gradient(180deg,transparent,var(--adaptive-black50))]`, children: messages.thread.scrollHintDown })) : null, _jsxs("section", { ref: scrollRef, className: `flex h-full flex-col overflow-auto px-[12px] ${hideCaseSelector ? "" : "gap-[16px] max-h-[360px]"}`, children: [hideCaseSelector ? null : (_jsxs("article", { className: "flex flex-col gap-[4px] border-t border-[var(--adaptive-border-subtle)]", children: [_jsx(FeedbackCaseList, { report: report, cases: casesForEditor, isEditing: isEditingCases, canEdit: canEditReportCases(report) && !isEditingCases, isSaving: isUpdating, errorMessage: isEditingCases ? errorMessage : "", focusedCaseId: focusedCaseId, onSelectCase: selectCase, onAllTabActiveChange: setIsAllCasesView, onBeginEdit: () => beginCaseEdit(report), onCancelEdit: cancelCaseEdit, onSaveEdit: () => void handleCaseEditSave(), onCaseChange: updateCaseEditDraftCase, onAddCase: addCaseEditDraftCase, onRemoveCase: removeCaseEditDraftCase }), report.author_name ? (_jsxs("div", { className: "flex items-center gap-[6px] px-[16px]", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: report.author_name }), _jsx(FeedbackCreatorBadge, {})] })) : null] })), _jsxs("div", { className: "relative flex flex-col pt-[12px] pb-[57px]", children: [showTimelineRail ? _jsx("div", { className: "pointer-events-none absolute bottom-[12px] left-[20px] top-[12px] w-px bg-[var(--adaptive-border-subtle)]" }) : null, focusedCaseId && !isAllCasesView ? (_jsxs(_Fragment, { children: [focusedCase ? (_jsx(CaseThreadEntry, { report: report, caseId: focusedCaseId, caseText: focusedCase.text, caseCreatedAt: focusedCase.created_at, caseStatus: focusedCase.status, actorName: actorName, onClaimAssignee: onClaimAssignee, isUpdating: isUpdating, isClaimingAssignee: isClaimingAssignee, isEditingCases: isEditingCases })) : null, _jsx(QuestionThreadGroup, { questions: timeline.issueChildren, originalAuthorName: originalAuthorName, forceExpanded: shouldForceExpandQuestionGroup(report, focusedCaseId, timeline.issueChildren, {
                                            composerTargetsGroup: pendingComposer?.type === "question" && pendingComposer.targetReplyId === ISSUE_ROOT_PARENT_ID,
                                        }) }), timeline.branches.map((branch) => (_jsxs("div", { className: "flex flex-col", children: [_jsx(ThreadRootReply, { reply: branch.root, report: report, caseId: focusedCaseId, authors: authors, pendingComposer: pendingComposer, confirmAuthorName: confirmAuthorName, showConfirmAuthorSelect: showConfirmAuthorSelect, originalAuthorName: originalAuthorName, issueUrl: issueUrl, onConfirmAuthorNameChange: onConfirmAuthorNameChange, onStartDeny: onStartDeny, onStartCheckout: onStartCheckout, onStartAskQuestion: onStartAskQuestion, onTransferAssignee: onTransferAssignee, onConfirm: onConfirm, isUpdating: isUpdating, isClaimingAssignee: isClaimingAssignee, actorName: actorName }), _jsx(QuestionThreadGroup, { questions: branch.children, originalAuthorName: originalAuthorName, forceExpanded: shouldForceExpandQuestionGroup(report, focusedCaseId, branch.children, {
                                                    composerTargetsGroup: pendingComposer?.type === "question" && pendingComposer.targetReplyId === branch.root.id,
                                                }) })] }, branch.root.id)))] })) : (_jsx("p", { className: "px-[12px] py-[8px] text-[12px] text-[var(--adaptive-black500)]", children: messages.cases.selectToView })), systemBranches.map((branch) => (_jsx(ThreadRootReply, { reply: branch.root, report: report, caseId: focusedCaseId ?? "", authors: authors, pendingComposer: pendingComposer, confirmAuthorName: confirmAuthorName, showConfirmAuthorSelect: showConfirmAuthorSelect, originalAuthorName: originalAuthorName, issueUrl: issueUrl, onConfirmAuthorNameChange: onConfirmAuthorNameChange, onStartDeny: onStartDeny, onStartCheckout: onStartCheckout, onStartAskQuestion: onStartAskQuestion, onTransferAssignee: onTransferAssignee, onConfirm: onConfirm, isUpdating: isUpdating, isClaimingAssignee: isClaimingAssignee, actorName: actorName }, branch.root.id)))] })] })] }));
}
//# sourceMappingURL=FeedbackThread.js.map