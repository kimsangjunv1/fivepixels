import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReport, useReportPreferences } from "../../../providers/reportContext.js";
import { formatClockTime } from "../../../utils/shared/format.js";
import { canEditReportCases, getCaseById } from "../../../utils/report/reportCases.js";
import { buildCaseThreadTimeline, buildThreadTimeline, canShowAdjudicationActionsOnBranchReply, canShowCaseThreadActions, canShowCaseClaimAction, canShowCheckoutBranchActionsForCase, canShowSuggestedBranchActionsForCase, getReportReplies, isAssigneeEventStatus, isBranchReplyAuthor, ISSUE_ROOT_PARENT_ID, resolveOriginalFeedbackAuthorName, shouldForceExpandQuestionGroup, } from "../../../utils/feedback/feedbackThread.js";
import { usesReplyInfiniteScroll } from "../../../constants/replyHistory.js";
import { REPLY_HISTORY_SCROLL_THRESHOLD_PX } from "../../../utils/feedback/replyHistory.js";
import { getGitHubIssueUrl, isGitIssuedSystemReply } from "../../../utils/github/githubIntegration.js";
import { ResolvedStatusIcon } from "../../../components/icons/Icons.js";
import { FEEDBACK_STATUS_COLOR } from "../../../constants/feedbackStatus.js";
import { AssigneeThreadEntry } from "./AssigneeThreadEntry.js";
import { FeedbackCaseList } from "./FeedbackCaseList.js";
import { FeedbackCreatorBadge } from "./FeedbackCreatorBadge.js";
import { FeedbackStatusBadge } from "./FeedbackStatusBadge.js";
import { GitIssuedThreadEntry } from "./GitIssuedThreadEntry.js";
import { QuestionThreadGroup } from "./QuestionThreadGroup.js";
import { ThreadAuthorMeta } from "./ThreadAuthorMeta.js";
import { ThreadTimelineRow } from "./ThreadTimelineRow.js";
import { CaseThreadEntryActions, ThreadEntryActions, THREAD_ACTION_ENTRY_SURFACE_CLASS, THREAD_CASE_ENTRY_SURFACE_CLASS, } from "./ThreadEntryActions.js";
function getScrollOverflowState(element) {
    const { scrollTop, scrollHeight, clientHeight } = element;
    const hasOverflow = scrollHeight > clientHeight + 1;
    return {
        canScrollUp: hasOverflow && scrollTop > 0,
        canScrollDown: hasOverflow && scrollTop + clientHeight < scrollHeight - 1,
    };
}
const SCROLL_HINT_CLASS = "pointer-events-none absolute left-0 right-0 z-10 px-[16px] py-[12px] text-center text-[12px] text-[var(--adaptive-black600)]";
function ThreadResolvedDivider() {
    const { messages } = useReportPreferences();
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
    const hasActions = showBranchActions && (canAct || isOwnBranchReply) && (canShowAdjudicationActionsOnBranchReply(reply, actorName) ? canAct : true);
    const entryBody = (_jsxs(_Fragment, { children: [_jsx(FeedbackStatusBadge, { status: reply.status, isNeedGray: true }), _jsx("p", { className: "leading-[1.5] text-[14px] text-[var(--adaptive-text-primary)]", children: reply.message }), reply.author_name ? (_jsx(ThreadAuthorMeta, { authorName: reply.author_name, createdAt: reply.created_at, showCreator: reply.author_name.trim() === originalAuthorName })) : null, _jsx(ThreadEntryActions, { reply: reply, report: report, caseId: caseId, authors: authors, pendingComposer: pendingComposer, confirmAuthorName: confirmAuthorName, showConfirmAuthorSelect: showConfirmAuthorSelect, onConfirmAuthorNameChange: onConfirmAuthorNameChange, onStartDeny: onStartDeny, onStartCheckout: onStartCheckout, onStartAskQuestion: onStartAskQuestion, onConfirm: onConfirm, isUpdating: isUpdating, canAct: canAct, actorName: actorName })] }));
    return (_jsx(ThreadTimelineRow, { time: formatClockTime(reply.created_at), children: _jsx("div", { className: hasActions ? THREAD_ACTION_ENTRY_SURFACE_CLASS : THREAD_CASE_ENTRY_SURFACE_CLASS, children: entryBody }) }));
}
export function FeedbackThread({ report, authors, pendingComposer, confirmAuthorName, showConfirmAuthorSelect, onConfirmAuthorNameChange, onToggleConfirmAuthorSelect: _onToggleConfirmAuthorSelect, onStartDeny, onStartCheckout, onStartAskQuestion, onClaimAssignee, onTransferAssignee, onConfirm, isUpdating, isClaimingAssignee, hideCaseSelector = false, }) {
    const { messages, fields, caseEditReportId, caseEditCases, beginCaseEdit, cancelCaseEdit, handleCaseEditSave, updateCaseEditDraftCase, addCaseEditDraftCase, removeCaseEditDraftCase, focusedCaseId, selectCase, replyAuthorName, errorMessage, replyHistory, replyHistoryByReportId, loadOlderReplies, loadRepliesIfNeeded, } = useReport();
    const scrollRef = useRef(null);
    const loadingOlderRef = useRef(false);
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
    const replyHistoryState = replyHistoryByReportId[report.id];
    useEffect(() => {
        void loadRepliesIfNeeded(report);
    }, [loadRepliesIfNeeded, report.id]);
    const triggerLoadOlderReplies = useCallback(async () => {
        const element = scrollRef.current;
        if (!element || loadingOlderRef.current) {
            return;
        }
        const history = replyHistoryByReportId[report.id];
        if (!history?.hasMoreOlder || history.isLoadingOlder) {
            return;
        }
        loadingOlderRef.current = true;
        const previousHeight = element.scrollHeight;
        const previousTop = element.scrollTop;
        try {
            await loadOlderReplies(report.id, replyHistory);
            requestAnimationFrame(() => {
                const nextElement = scrollRef.current;
                if (!nextElement) {
                    return;
                }
                const heightDelta = nextElement.scrollHeight - previousHeight;
                nextElement.scrollTop = previousTop + heightDelta;
            });
        }
        finally {
            loadingOlderRef.current = false;
        }
    }, [loadOlderReplies, replyHistory, replyHistoryByReportId, report.id]);
    useEffect(() => {
        setIsAllCasesView(false);
    }, [report.id]);
    const refreshScrollOverflow = useCallback(() => {
        const element = scrollRef.current;
        if (!element) {
            return;
        }
        setScrollOverflow(getScrollOverflowState(element));
        if (!usesReplyInfiniteScroll(replyHistory.mode)) {
            return;
        }
        if (element.scrollTop > REPLY_HISTORY_SCROLL_THRESHOLD_PX) {
            return;
        }
        void triggerLoadOlderReplies();
    }, [replyHistory.mode, triggerLoadOlderReplies]);
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
    return (_jsxs("div", { className: "relative min-h-0 flex-1", children: [scrollOverflow.canScrollUp ? _jsx("p", { className: `${SCROLL_HINT_CLASS} top-0 bg-[linear-gradient(0deg,transparent,var(--adaptive-black50))]`, children: messages.thread.scrollHintUp }) : null, scrollOverflow.canScrollDown ? _jsx("p", { className: `${SCROLL_HINT_CLASS} bottom-0 bg-[linear-gradient(180deg,transparent,var(--adaptive-black50))]`, children: messages.thread.scrollHintDown }) : null, _jsxs("section", { ref: scrollRef, className: `flex h-full flex-col overflow-auto px-[12px] ${hideCaseSelector ? "" : "gap-[16px] max-h-[360px]"}`, children: [hideCaseSelector ? null : (_jsxs("article", { className: "flex flex-col gap-[4px] border-t border-[var(--adaptive-border-subtle)]", children: [_jsx(FeedbackCaseList, { report: report, cases: casesForEditor, isEditing: isEditingCases, canEdit: canEditReportCases(report) && !isEditingCases, isSaving: isUpdating, errorMessage: isEditingCases ? errorMessage : "", focusedCaseId: focusedCaseId, onSelectCase: selectCase, onAllTabActiveChange: setIsAllCasesView, onBeginEdit: () => beginCaseEdit(report), onCancelEdit: cancelCaseEdit, onSaveEdit: () => void handleCaseEditSave(), onCaseChange: updateCaseEditDraftCase, onAddCase: addCaseEditDraftCase, onRemoveCase: removeCaseEditDraftCase }), report.author_name ? (_jsxs("div", { className: "flex items-center gap-[6px] px-[16px]", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: report.author_name }), _jsx(FeedbackCreatorBadge, {})] })) : null] })), _jsxs("div", { className: "relative flex flex-col pt-[12px] pb-[57px]", children: [showTimelineRail ? (_jsx("div", { className: "pointer-events-none absolute bottom-[12px] left-[20px] top-[12px] w-px bg-[linear-gradient(180deg,_var(--adaptive-black900)_60%,transparent_90%)]" })) : null, focusedCaseId && !isAllCasesView ? (_jsxs(_Fragment, { children: [focusedCase ? (_jsx(CaseThreadEntry, { report: report, caseId: focusedCaseId, caseText: focusedCase.text, caseCreatedAt: focusedCase.created_at, caseStatus: focusedCase.status, actorName: actorName, onClaimAssignee: onClaimAssignee, isUpdating: isUpdating, isClaimingAssignee: isClaimingAssignee, isEditingCases: isEditingCases })) : null, _jsx(QuestionThreadGroup, { questions: timeline.issueChildren, originalAuthorName: originalAuthorName, forceExpanded: shouldForceExpandQuestionGroup(report, focusedCaseId, timeline.issueChildren, {
                                            composerTargetsGroup: pendingComposer?.type === "question" && pendingComposer.targetReplyId === ISSUE_ROOT_PARENT_ID,
                                        }) }), timeline.branches.map((branch) => (_jsxs("div", { className: "flex flex-col", children: [_jsx(ThreadRootReply, { reply: branch.root, report: report, caseId: focusedCaseId, authors: authors, pendingComposer: pendingComposer, confirmAuthorName: confirmAuthorName, showConfirmAuthorSelect: showConfirmAuthorSelect, originalAuthorName: originalAuthorName, issueUrl: issueUrl, onConfirmAuthorNameChange: onConfirmAuthorNameChange, onStartDeny: onStartDeny, onStartCheckout: onStartCheckout, onStartAskQuestion: onStartAskQuestion, onTransferAssignee: onTransferAssignee, onConfirm: onConfirm, isUpdating: isUpdating, isClaimingAssignee: isClaimingAssignee, actorName: actorName }), _jsx(QuestionThreadGroup, { questions: branch.children, originalAuthorName: originalAuthorName, forceExpanded: shouldForceExpandQuestionGroup(report, focusedCaseId, branch.children, {
                                                    composerTargetsGroup: pendingComposer?.type === "question" && pendingComposer.targetReplyId === branch.root.id,
                                                }) })] }, branch.root.id)))] })) : (_jsx("p", { className: "px-[12px] py-[8px] text-[12px] text-[var(--adaptive-black500)]", children: messages.cases.selectToView })), systemBranches.map((branch) => (_jsx(ThreadRootReply, { reply: branch.root, report: report, caseId: focusedCaseId ?? "", authors: authors, pendingComposer: pendingComposer, confirmAuthorName: confirmAuthorName, showConfirmAuthorSelect: showConfirmAuthorSelect, originalAuthorName: originalAuthorName, issueUrl: issueUrl, onConfirmAuthorNameChange: onConfirmAuthorNameChange, onStartDeny: onStartDeny, onStartCheckout: onStartCheckout, onStartAskQuestion: onStartAskQuestion, onTransferAssignee: onTransferAssignee, onConfirm: onConfirm, isUpdating: isUpdating, isClaimingAssignee: isClaimingAssignee, actorName: actorName }, branch.root.id)))] })] })] }));
}
//# sourceMappingURL=FeedbackThread.js.map