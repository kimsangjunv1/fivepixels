import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReportData, useReportPreferences, useReportSession } from "../../shared/providers/reportContext.js";
import { formatClockTime, formatDateOnly } from "../../shared/utils/shared/format.js";
import { canEditReportCases, getCaseById } from "../../shared/utils/report/reportCases.js";
import { buildCaseThreadTimeline, buildThreadTimeline, canShowAdjudicationActionsOnBranchReply, canShowCaseThreadActions, canShowCaseClaimAction, canShowCaseEntryActions, canShowCheckoutBranchActionsForCase, canShowSuggestedBranchActionsForCase, getReportReplies, isAssigneeEventStatus, isBranchReplyAuthor, ISSUE_ROOT_PARENT_ID, resolveOriginalFeedbackAuthorName, shouldForceExpandQuestionGroup, } from "../../shared/utils/feedback/feedbackThread.js";
import { usesReplyInfiniteScroll } from "../../shared/constants/replyHistory.js";
import { REPLY_HISTORY_SCROLL_THRESHOLD_PX } from "../../shared/utils/feedback/replyHistory.js";
import { getGitHubIssueUrl, isGitIssuedSystemReply } from "../../shared/utils/github/githubIntegration.js";
import { ACCENT_COLOR } from "../../shared/constants/accentColors.js";
import { CheckCircleIcon } from "../../shared/components/icons/Icons.js";
import { AssigneeThreadEntry } from "./AssigneeThreadEntry.js";
import { FeedbackCaseList } from "./FeedbackCaseList.js";
import { FeedbackCreatorBadge } from "./FeedbackCreatorBadge.js";
import { FeedbackStatusBadge } from "./FeedbackStatusBadge.js";
import { GitIssuedThreadEntry } from "./GitIssuedThreadEntry.js";
import { QuestionThreadGroup } from "./QuestionThreadGroup.js";
import { ThreadAuthorMeta } from "./ThreadAuthorMeta.js";
import { ThreadTimelineRow } from "./ThreadTimelineRow.js";
import { CaseThreadEntryActions, ThreadEntryActions, THREAD_ACTION_ENTRY_SURFACE_CLASS, THREAD_CASE_ENTRY_SURFACE_CLASS } from "./ThreadEntryActions.js";
import { MentionMessage } from "./MentionMessage.js";
import { ThreadAskAiFloatingButton } from "./ThreadAskAiFloatingButton.js";
import { FeedAuthorAvatar } from "./feed/FeedAuthorAvatar.js";
import { FeedActivityLine, FeedCommentMeta } from "./feed/FeedCommentMeta.js";
import { getFeedActivitySurfaceClass, resolveFeedActivityTone } from "./feed/feedActivitySurface.js";
import { FeedSpineDot, FeedSpineIcon } from "./feed/FeedTimelineRow.js";
import { FeedTimelineTrack } from "./feed/FeedTimelineTrack.js";
import { ThreadLayoutShell } from "./feed/ThreadLayoutShell.js";
import { getFeedbackTargetElement } from "../../shared/utils/marker/locateFeedback.js";
function getScrollOverflowState(element) {
    const { scrollTop, scrollHeight, clientHeight } = element;
    const hasOverflow = scrollHeight > clientHeight + 1;
    return {
        canScrollUp: hasOverflow && scrollTop > 0,
        canScrollDown: hasOverflow && scrollTop + clientHeight < scrollHeight - 1,
    };
}
const SCROLL_HINT_CLASS = "pointer-events-none absolute left-0 right-0 z-10 px-[16px] py-[12px] text-center text-[12px] text-[var(--adaptive-black600)]";
function ThreadResolvedDivider({ createdAt }) {
    const { messages, threadLayout } = useReportPreferences();
    const resolvedColor = ACCENT_COLOR.green;
    const isFeed = threadLayout === "feed";
    if (isFeed) {
        return (_jsx(ThreadLayoutShell, { density: "activity", feedNode: _jsx(FeedSpineIcon, { tone: "resolved", children: _jsx(CheckCircleIcon, { className: "h-[14px] w-[14px]", fill: "currentColor" }) }), children: _jsx("div", { className: getFeedActivitySurfaceClass("resolved"), children: _jsx(FeedActivityLine, { action: messages.thread.feedIssueResolvedAction, createdAt: createdAt }) }) }));
    }
    return (_jsx(ThreadTimelineRow, { children: _jsxs("div", { className: "flex items-center gap-[8px]", role: "status", children: [_jsx("span", { "aria-hidden": true, className: "h-px flex-1 bg-[var(--adaptive-border-subtle)]" }), _jsxs("span", { className: "inline-flex shrink-0 items-center gap-[6px]", children: [_jsx(CheckCircleIcon, { className: "h-[16px] w-[16px] shrink-0", fill: resolvedColor }), _jsx("span", { className: "text-[13px] font-bold leading-none", style: { color: resolvedColor }, children: messages.thread.issueResolvedDivider })] }), _jsx("span", { "aria-hidden": true, className: "h-px flex-1 bg-[var(--adaptive-border-subtle)]" })] }) }));
}
function ThreadStartedDivider({ createdAt }) {
    const { locale, threadLayout } = useReportPreferences();
    // Feed layout skips the day banner — continuous spine reads cleaner without horizontal rules.
    if (threadLayout === "feed") {
        return null;
    }
    const dateColor = "var(--adaptive-black500)";
    return (_jsx(ThreadTimelineRow, { children: _jsxs("div", { className: "flex items-center gap-[8px]", role: "status", children: [_jsx("span", { "aria-hidden": true, className: "h-px flex-1 bg-[var(--adaptive-border-subtle)]" }), _jsx("span", { className: "inline-flex shrink-0 items-center gap-[6px]", children: _jsx("span", { className: "text-[13px] font-bold leading-none tabular-nums", style: { color: dateColor }, children: formatDateOnly(createdAt, locale) }) }), _jsx("span", { "aria-hidden": true, className: "h-px flex-1 bg-[var(--adaptive-border-subtle)]" })] }) }));
}
function ThreadDetachedTargetDivider() {
    const { messages, threadLayout } = useReportPreferences();
    const labelColor = "var(--adaptive-black500)";
    const isFeed = threadLayout === "feed";
    if (isFeed) {
        return (_jsx(ThreadLayoutShell, { density: "activity", feedNode: _jsx(FeedSpineDot, {}), children: _jsx("div", { className: getFeedActivitySurfaceClass("neutral"), children: _jsx(FeedActivityLine, { action: messages.thread.feedDetachedTargetAction }) }) }));
    }
    return (_jsx(ThreadTimelineRow, { children: _jsxs("div", { className: "flex items-center gap-[8px]", role: "status", children: [_jsx("span", { "aria-hidden": true, className: "h-px flex-1 bg-[var(--adaptive-border-subtle)]" }), _jsx("span", { className: "inline-flex shrink-0 items-center gap-[6px]", children: _jsx("span", { className: "text-[13px] font-bold leading-none", style: { color: labelColor }, children: messages.thread.detachedTargetDivider }) }), _jsx("span", { "aria-hidden": true, className: "h-px flex-1 bg-[var(--adaptive-border-subtle)]" })] }) }));
}
function CaseThreadEntry({ report, caseId, caseText, caseMentions = [], caseUserMentions = [], caseCreatedAt, caseStatus, authors, actorName, pendingComposer, onStartAskQuestion, onClaimAssignee, isUpdating, isClaimingAssignee, isEditingCases = false, }) {
    const { threadLayout } = useReportPreferences();
    const isFeed = threadLayout === "feed";
    const showPreClaimDiscussion = !isEditingCases && canShowCaseEntryActions(report, caseId);
    const hasActions = showPreClaimDiscussion && (Boolean(actorName.trim()) || canShowCaseClaimAction(report, caseId, actorName));
    const isComposerTarget = pendingComposer?.type === "question" && pendingComposer.targetReplyId === ISSUE_ROOT_PARENT_ID;
    const surfaceClass = isComposerTarget
        ? `${THREAD_ACTION_ENTRY_SURFACE_CLASS} border-[#10B981] bg-[rgba(16,185,129,0.08)]`
        : hasActions
            ? THREAD_ACTION_ENTRY_SURFACE_CLASS
            : THREAD_CASE_ENTRY_SURFACE_CLASS;
    const authorName = report.author_name?.trim() ?? "";
    const entryBody = (_jsxs(_Fragment, { children: [isFeed ? (authorName ? (_jsx(FeedCommentMeta, { authorName: authorName, createdAt: caseCreatedAt, authors: authors, status: "issue_apply" })) : null) : (_jsxs("div", { className: "flex min-w-0 items-center justify-between gap-[8px]", children: [_jsx(FeedbackStatusBadge, { status: "issue_apply", isNeedGray: true, className: "shrink-0" }), authorName ? (_jsx(ThreadAuthorMeta, { authorName: authorName, authors: authors, showMine: authorName === actorName, showCreator: true })) : null] })), _jsx(MentionMessage, { message: caseText, mentions: caseMentions, userMentions: caseUserMentions, className: `leading-[1.45] text-[14px] text-[var(--adaptive-text-primary)] whitespace-break-spaces ${isFeed ? "mt-[2px]" : ""} ${caseStatus === "resolved" ? "text-[var(--adaptive-black500)] line-through" : ""}` }), isEditingCases ? null : (_jsx(CaseThreadEntryActions, { report: report, caseId: caseId, actorName: actorName, pendingComposer: pendingComposer, onStartAskQuestion: onStartAskQuestion, onClaimAssignee: onClaimAssignee, isUpdating: isUpdating, isClaimingAssignee: isClaimingAssignee }))] }));
    return (_jsx(ThreadLayoutShell, { classicTime: formatClockTime(caseCreatedAt), density: "comment", feedNode: authorName ? _jsx(FeedAuthorAvatar, { name: authorName }) : _jsx(FeedSpineDot, {}), children: _jsx("div", { className: isFeed && !hasActions && !isComposerTarget ? undefined : surfaceClass, children: entryBody }) }));
}
function ThreadRootReply({ reply, report, caseId, authors, pendingComposer, confirmAuthorName, showConfirmAuthorSelect, originalAuthorName, issueUrl, onConfirmAuthorNameChange, onStartDeny, onStartCheckout, onStartAskQuestion, onTransferAssignee, onConfirm, isUpdating, isClaimingAssignee, actorName, }) {
    const { threadLayout } = useReportPreferences();
    const isFeed = threadLayout === "feed";
    if (isGitIssuedSystemReply(reply, report) && issueUrl) {
        return (_jsx(ThreadLayoutShell, { classicTime: formatClockTime(reply.created_at), feedNode: _jsx(FeedSpineDot, {}), children: _jsx(GitIssuedThreadEntry, { reply: reply, issueUrl: issueUrl }) }));
    }
    if (reply.status === "resolved") {
        return _jsx(ThreadResolvedDivider, { createdAt: reply.created_at });
    }
    if (isAssigneeEventStatus(reply.status)) {
        return (_jsx(AssigneeThreadEntry, { reply: reply, report: report, caseId: caseId, authors: authors, actorName: actorName, pendingComposer: pendingComposer, onStartDeny: () => onStartDeny(reply.id), onStartCheckout: onStartCheckout, onTransferAssignee: onTransferAssignee, isUpdating: isUpdating, isClaimingAssignee: isClaimingAssignee }));
    }
    const showBranchActions = canShowSuggestedBranchActionsForCase(report, reply, caseId) || canShowCheckoutBranchActionsForCase(report, reply, caseId);
    const canAct = canShowCaseThreadActions(report, caseId, actorName);
    const isOwnBranchReply = isBranchReplyAuthor(reply, actorName);
    const hasActions = showBranchActions && (canAct || isOwnBranchReply) && (canShowAdjudicationActionsOnBranchReply(reply, actorName) ? canAct : true);
    const isComposerTarget = pendingComposer?.type === "question" && pendingComposer.targetReplyId === reply.id;
    const surfaceClass = isComposerTarget
        ? `${THREAD_ACTION_ENTRY_SURFACE_CLASS} border-[#10B981] bg-[rgba(16,185,129,0.08)]`
        : hasActions
            ? THREAD_ACTION_ENTRY_SURFACE_CLASS
            : THREAD_CASE_ENTRY_SURFACE_CLASS;
    const authorName = reply.author_name?.trim() ?? "";
    const feedStatusSurface = isFeed && !hasActions && !isComposerTarget && reply.status !== "suggested"
        ? getFeedActivitySurfaceClass(resolveFeedActivityTone(reply.status))
        : undefined;
    const entryBody = (_jsxs(_Fragment, { children: [isFeed ? (authorName ? (_jsx(FeedCommentMeta, { authorName: authorName, createdAt: reply.created_at, authors: authors, status: reply.status })) : null) : (_jsxs("div", { className: "flex min-w-0 items-center justify-between gap-[8px]", children: [_jsx(FeedbackStatusBadge, { status: reply.status, isNeedGray: true, className: "shrink-0" }), authorName ? (_jsx(ThreadAuthorMeta, { authorName: authorName, authors: authors, showMine: authorName === actorName, showCreator: authorName === originalAuthorName })) : null] })), _jsx("p", { className: `leading-[1.45] text-[14px] text-[var(--adaptive-text-primary)] whitespace-break-spaces ${isFeed ? "mt-[2px]" : ""}`, children: _jsx(MentionMessage, { message: reply.message, mentions: reply.mentions, userMentions: reply.user_mentions }) }), _jsx(ThreadEntryActions, { reply: reply, report: report, caseId: caseId, authors: authors, pendingComposer: pendingComposer, confirmAuthorName: confirmAuthorName, showConfirmAuthorSelect: showConfirmAuthorSelect, onConfirmAuthorNameChange: onConfirmAuthorNameChange, onStartDeny: onStartDeny, onStartCheckout: onStartCheckout, onStartAskQuestion: onStartAskQuestion, onConfirm: onConfirm, isUpdating: isUpdating, canAct: canAct, actorName: actorName })] }));
    return (_jsx(ThreadLayoutShell, { classicTime: formatClockTime(reply.created_at), density: "comment", feedNode: authorName ? _jsx(FeedAuthorAvatar, { name: authorName }) : _jsx(FeedSpineDot, {}), children: _jsx("div", { className: feedStatusSurface ?? surfaceClass, children: entryBody }) }));
}
export function FeedbackThread({ report, authors, pendingComposer, confirmAuthorName, showConfirmAuthorSelect, onConfirmAuthorNameChange, onToggleConfirmAuthorSelect: _onToggleConfirmAuthorSelect, onStartDeny, onStartCheckout, onStartAskQuestion, onClaimAssignee, onTransferAssignee, onConfirm, isUpdating, isClaimingAssignee, hideCaseSelector = false, }) {
    const { messages, fields, threadLayout } = useReportPreferences();
    const { caseEditReportId, caseEditCases, beginCaseEdit, cancelCaseEdit, updateCaseEditDraftCase, addCaseEditDraftCase, removeCaseEditDraftCase, focusedCaseId, selectCase, replyAuthorName, errorMessage, } = useReportSession();
    const { handleCaseEditSave, replyHistory, replyHistoryByReportId, loadOlderReplies, loadRepliesIfNeeded, } = useReportData();
    const isFeedLayout = threadLayout === "feed";
    const scrollRef = useRef(null);
    const loadingOlderRef = useRef(false);
    const [isAllCasesView, setIsAllCasesView] = useState(false);
    const [isOriginalTargetMissing, setIsOriginalTargetMissing] = useState(() => !getFeedbackTargetElement(report));
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
        const syncOriginalTarget = () => {
            setIsOriginalTargetMissing(!getFeedbackTargetElement(report));
        };
        syncOriginalTarget();
        const intervalId = window.setInterval(syncOriginalTarget, 500);
        return () => window.clearInterval(intervalId);
    }, [report]);
    useEffect(() => {
        void loadRepliesIfNeeded(report, focusedCaseId ?? undefined);
    }, [focusedCaseId, loadRepliesIfNeeded, report.id]);
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
    return (_jsxs("div", { className: "group/thread-section relative min-h-0 h-full", children: [hideCaseSelector && focusedCaseId && focusedCase && !isAllCasesView ? (_jsx("div", { className: "pointer-events-none absolute right-[22px] top-[10px] z-20 opacity-50 transition-opacity duration-150 focus-within:opacity-100 group-hover/thread-section:opacity-100", children: _jsx("div", { className: "pointer-events-auto", children: _jsx(ThreadAskAiFloatingButton, { report: report, fields: fields, messages: messages, caseId: focusedCaseId }) }) })) : null, scrollOverflow.canScrollUp ? _jsx("p", { className: `${SCROLL_HINT_CLASS} top-0 bg-[linear-gradient(0deg,transparent,var(--adaptive-black50))]`, children: messages.thread.scrollHintUp }) : null, scrollOverflow.canScrollDown ? _jsx("p", { className: `${SCROLL_HINT_CLASS} bottom-0 bg-[linear-gradient(180deg,transparent,var(--adaptive-black50))]`, children: messages.thread.scrollHintDown }) : null, _jsxs("section", { ref: scrollRef, className: `flex h-full flex-col overflow-auto px-[12px] ${hideCaseSelector ? "" : "gap-[16px] max-h-[360px]"}`, children: [hideCaseSelector ? null : (_jsxs("article", { className: "flex flex-col gap-[4px] border-t border-[var(--adaptive-border-subtle)]", children: [_jsx(FeedbackCaseList, { report: report, cases: casesForEditor, isEditing: isEditingCases, canEdit: canEditReportCases(report) && !isEditingCases, isSaving: isUpdating, errorMessage: isEditingCases ? errorMessage : "", focusedCaseId: focusedCaseId, onSelectCase: selectCase, onAllTabActiveChange: setIsAllCasesView, onBeginEdit: () => beginCaseEdit(report), onCancelEdit: cancelCaseEdit, onSaveEdit: () => void handleCaseEditSave(), onCaseChange: updateCaseEditDraftCase, onAddCase: addCaseEditDraftCase, onRemoveCase: removeCaseEditDraftCase, enableElementMentions: true }), report.author_name ? (_jsxs("div", { className: "flex items-center gap-[6px] px-[16px]", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: report.author_name }), _jsx(FeedbackCreatorBadge, {})] })) : null] })), _jsx("div", { className: `relative flex flex-col pt-[12px] ${hideCaseSelector ? "pb-[12px]" : "pb-[57px]"}`, children: (() => {
                            const timelineContent = focusedCaseId && !isAllCasesView ? (_jsxs(_Fragment, { children: [focusedCase ? (_jsxs(_Fragment, { children: [_jsx(ThreadStartedDivider, { createdAt: focusedCase.created_at }), _jsx(CaseThreadEntry, { report: report, caseId: focusedCaseId, caseText: focusedCase.text, caseMentions: focusedCase.mentions, caseUserMentions: focusedCase.user_mentions, caseCreatedAt: focusedCase.created_at, caseStatus: focusedCase.status, authors: authors, actorName: actorName, pendingComposer: pendingComposer, onStartAskQuestion: onStartAskQuestion, onClaimAssignee: onClaimAssignee, isUpdating: isUpdating, isClaimingAssignee: isClaimingAssignee, isEditingCases: isEditingCases })] })) : null, _jsx(QuestionThreadGroup, { questions: timeline.issueChildren, authors: authors, originalAuthorName: originalAuthorName, actorName: actorName, forceExpanded: shouldForceExpandQuestionGroup(report, focusedCaseId, timeline.issueChildren, {
                                            composerTargetsGroup: pendingComposer?.type === "question" && pendingComposer.targetReplyId === ISSUE_ROOT_PARENT_ID,
                                        }) }), timeline.branches.map((branch) => (_jsxs("div", { className: "flex flex-col", children: [_jsx(ThreadRootReply, { reply: branch.root, report: report, caseId: focusedCaseId, authors: authors, pendingComposer: pendingComposer, confirmAuthorName: confirmAuthorName, showConfirmAuthorSelect: showConfirmAuthorSelect, originalAuthorName: originalAuthorName, issueUrl: issueUrl, onConfirmAuthorNameChange: onConfirmAuthorNameChange, onStartDeny: onStartDeny, onStartCheckout: onStartCheckout, onStartAskQuestion: onStartAskQuestion, onTransferAssignee: onTransferAssignee, onConfirm: onConfirm, isUpdating: isUpdating, isClaimingAssignee: isClaimingAssignee, actorName: actorName }), _jsx(QuestionThreadGroup, { questions: branch.children, authors: authors, originalAuthorName: originalAuthorName, actorName: actorName, forceExpanded: shouldForceExpandQuestionGroup(report, focusedCaseId, branch.children, {
                                                    composerTargetsGroup: pendingComposer?.type === "question" && pendingComposer.targetReplyId === branch.root.id,
                                                }) })] }, branch.root.id))), isOriginalTargetMissing ? _jsx(ThreadDetachedTargetDivider, {}) : null] })) : (_jsx("p", { className: "px-[12px] py-[8px] text-[12px] text-[var(--adaptive-black500)]", children: messages.cases.selectToView }));
                            const withSystem = (_jsxs(_Fragment, { children: [timelineContent, systemBranches.map((branch) => (_jsx(ThreadRootReply, { reply: branch.root, report: report, caseId: focusedCaseId ?? "", authors: authors, pendingComposer: pendingComposer, confirmAuthorName: confirmAuthorName, showConfirmAuthorSelect: showConfirmAuthorSelect, originalAuthorName: originalAuthorName, issueUrl: issueUrl, onConfirmAuthorNameChange: onConfirmAuthorNameChange, onStartDeny: onStartDeny, onStartCheckout: onStartCheckout, onStartAskQuestion: onStartAskQuestion, onTransferAssignee: onTransferAssignee, onConfirm: onConfirm, isUpdating: isUpdating, isClaimingAssignee: isClaimingAssignee, actorName: actorName }, branch.root.id)))] }));
                            return isFeedLayout ? _jsx(FeedTimelineTrack, { children: withSystem }) : withSystem;
                        })() })] })] }));
}
//# sourceMappingURL=FeedbackThread.js.map