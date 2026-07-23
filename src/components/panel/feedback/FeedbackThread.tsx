import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReportAuthor, ReportFeedback, ReportReply } from "@/types/report.js";
import { useReport, useReportPreferences } from "@/providers/reportContext.js";
import { formatClockTime } from "@/utils/shared/format.js";
import { canEditReportCases, getCaseById } from "@/utils/report/reportCases.js";
import {
    buildCaseThreadTimeline,
    buildThreadTimeline,
    canShowAdjudicationActionsOnBranchReply,
    canShowCaseThreadActions,
    canShowCaseClaimAction,
    canShowCaseEntryActions,
    canShowCheckoutBranchActionsForCase,
    canShowSuggestedBranchActionsForCase,
    getReportReplies,
    isAssigneeEventStatus,
    isBranchReplyAuthor,
    ISSUE_ROOT_PARENT_ID,
    resolveOriginalFeedbackAuthorName,
    shouldForceExpandQuestionGroup,
} from "@/utils/feedback/feedbackThread.js";
import { usesReplyInfiniteScroll } from "@/constants/replyHistory.js";
import { REPLY_HISTORY_SCROLL_THRESHOLD_PX } from "@/utils/feedback/replyHistory.js";
import { getGitHubIssueUrl, isGitIssuedSystemReply } from "@/utils/github/githubIntegration.js";
import { ResolvedStatusIcon } from "@/components/icons/Icons.js";
import { FEEDBACK_STATUS_COLOR } from "@/constants/feedbackStatus.js";
import { AssigneeThreadEntry } from "./AssigneeThreadEntry.js";
import { FeedbackCaseList } from "./FeedbackCaseList.js";
import { FeedbackCreatorBadge } from "./FeedbackCreatorBadge.js";
import { FeedbackStatusBadge } from "./FeedbackStatusBadge.js";
import { GitIssuedThreadEntry } from "./GitIssuedThreadEntry.js";
import { QuestionThreadGroup } from "./QuestionThreadGroup.js";
import { ReplyHistoryControls } from "./ReplyHistoryControls.js";
import { ThreadAuthorMeta } from "./ThreadAuthorMeta.js";
import { ThreadTimelineRow } from "./ThreadTimelineRow.js";
import { CaseThreadEntryActions, ThreadEntryActions, THREAD_ACTION_ENTRY_SURFACE_CLASS, THREAD_CASE_ENTRY_SURFACE_CLASS } from "./ThreadEntryActions.js";

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

type ScrollOverflowState = {
    canScrollUp: boolean;
    canScrollDown: boolean;
};

function getScrollOverflowState(element: HTMLElement): ScrollOverflowState {
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

    return (
        <ThreadTimelineRow>
            <div
                className="flex items-center gap-[8px]"
                role="status"
            >
                <span
                    aria-hidden
                    className="h-px flex-1 bg-[var(--adaptive-border-subtle)]"
                />
                <span className="inline-flex shrink-0 items-center gap-[6px]">
                    <span
                        aria-hidden
                        className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full"
                        style={{ backgroundColor: resolvedColor }}
                    >
                        <ResolvedStatusIcon
                            className="h-[11px] w-[11px]"
                            fill="#ffffff"
                        />
                    </span>
                    <span
                        className="text-[13px] font-bold leading-none"
                        style={{ color: resolvedColor }}
                    >
                        {messages.thread.issueResolvedDivider}
                    </span>
                </span>
                <span
                    aria-hidden
                    className="h-px flex-1 bg-[var(--adaptive-border-subtle)]"
                />
            </div>
        </ThreadTimelineRow>
    );
}

function CaseThreadEntry({
    report,
    caseId,
    caseText,
    caseCreatedAt,
    caseStatus,
    actorName,
    pendingComposer,
    onStartAskQuestion,
    onClaimAssignee,
    isUpdating,
    isClaimingAssignee,
    isEditingCases = false,
}: {
    report: ReportFeedback;
    caseId: string;
    caseText: string;
    caseCreatedAt: string;
    caseStatus: "open" | "resolved";
    actorName: string;
    pendingComposer: PendingComposer;
    onStartAskQuestion: () => void;
    onClaimAssignee: () => void;
    isUpdating?: boolean;
    isClaimingAssignee?: boolean;
    isEditingCases?: boolean;
}) {
    const showPreClaimDiscussion = !isEditingCases && canShowCaseEntryActions(report, caseId);
    const hasActions = showPreClaimDiscussion && (Boolean(actorName.trim()) || canShowCaseClaimAction(report, caseId, actorName));
    const isComposerTarget = pendingComposer?.type === "question" && pendingComposer.targetReplyId === ISSUE_ROOT_PARENT_ID;
    const surfaceClass = isComposerTarget
        ? `${THREAD_ACTION_ENTRY_SURFACE_CLASS} border-[#10B981] bg-[rgba(16,185,129,0.08)]`
        : hasActions
          ? THREAD_ACTION_ENTRY_SURFACE_CLASS
          : THREAD_CASE_ENTRY_SURFACE_CLASS;

    const entryBody = (
        <>
            <FeedbackStatusBadge
                status="issue_apply"
                isNeedGray
            />

            <p className={`leading-[1.5] text-[14px] text-[var(--adaptive-text-primary)] whitespace-break-spaces ${caseStatus === "resolved" ? "text-[var(--adaptive-black500)] line-through" : ""}`}>
                {caseText}
            </p>

            {report.author_name ? (
                <ThreadAuthorMeta
                    authorName={report.author_name}
                    createdAt={caseCreatedAt}
                    showCreator
                />
            ) : null}

            {isEditingCases ? null : (
                <CaseThreadEntryActions
                    report={report}
                    caseId={caseId}
                    actorName={actorName}
                    pendingComposer={pendingComposer}
                    onStartAskQuestion={onStartAskQuestion}
                    onClaimAssignee={onClaimAssignee}
                    isUpdating={isUpdating}
                    isClaimingAssignee={isClaimingAssignee}
                />
            )}
        </>
    );

    return (
        <ThreadTimelineRow time={formatClockTime(caseCreatedAt)}>
            <div className={surfaceClass}>{entryBody}</div>
        </ThreadTimelineRow>
    );
}

function ThreadRootReply({
    reply,
    report,
    caseId,
    authors,
    pendingComposer,
    confirmAuthorName,
    showConfirmAuthorSelect,
    originalAuthorName,
    issueUrl,
    onConfirmAuthorNameChange,
    onStartDeny,
    onStartCheckout,
    onStartAskQuestion,
    onTransferAssignee,
    onConfirm,
    isUpdating,
    isClaimingAssignee,
    actorName,
}: {
    reply: ReportReply;
    report: ReportFeedback;
    caseId: string;
    authors: ReportAuthor[];
    pendingComposer: PendingComposer;
    confirmAuthorName: string;
    showConfirmAuthorSelect: boolean;
    originalAuthorName: string;
    issueUrl: string | null | undefined;
    onConfirmAuthorNameChange: (name: string) => void;
    onStartDeny: (targetReplyId?: string) => void;
    onStartCheckout: (replyId: string) => void;
    onStartAskQuestion: () => void;
    onTransferAssignee: () => void;
    onConfirm: () => void;
    isUpdating?: boolean;
    isClaimingAssignee?: boolean;
    actorName: string;
}) {
    if (isGitIssuedSystemReply(reply, report) && issueUrl) {
        return (
            <ThreadTimelineRow time={formatClockTime(reply.created_at)}>
                <GitIssuedThreadEntry
                    reply={reply}
                    issueUrl={issueUrl}
                />
            </ThreadTimelineRow>
        );
    }

    if (reply.status === "resolved") {
        return <ThreadResolvedDivider />;
    }

    if (isAssigneeEventStatus(reply.status)) {
        return (
            <AssigneeThreadEntry
                reply={reply}
                report={report}
                caseId={caseId}
                authors={authors}
                actorName={actorName}
                pendingComposer={pendingComposer}
                onStartDeny={() => onStartDeny(reply.id)}
                onStartCheckout={onStartCheckout}
                onTransferAssignee={onTransferAssignee}
                isUpdating={isUpdating}
                isClaimingAssignee={isClaimingAssignee}
            />
        );
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

    const entryBody = (
        <>
            <FeedbackStatusBadge
                status={reply.status}
                isNeedGray
            />

            <p className="leading-[1.5] text-[14px] text-[var(--adaptive-text-primary)] whitespace-break-spaces">{reply.message}</p>
            {reply.author_name ? (
                <ThreadAuthorMeta
                    authorName={reply.author_name}
                    createdAt={reply.created_at}
                    showCreator={reply.author_name.trim() === originalAuthorName}
                />
            ) : null}
            <ThreadEntryActions
                reply={reply}
                report={report}
                caseId={caseId}
                authors={authors}
                pendingComposer={pendingComposer}
                confirmAuthorName={confirmAuthorName}
                showConfirmAuthorSelect={showConfirmAuthorSelect}
                onConfirmAuthorNameChange={onConfirmAuthorNameChange}
                onStartDeny={onStartDeny}
                onStartCheckout={onStartCheckout}
                onStartAskQuestion={onStartAskQuestion}
                onConfirm={onConfirm}
                isUpdating={isUpdating}
                canAct={canAct}
                actorName={actorName}
            />
        </>
    );

    return (
        <ThreadTimelineRow time={formatClockTime(reply.created_at)}>
            <div className={surfaceClass}>{entryBody}</div>
        </ThreadTimelineRow>
    );
}

export function FeedbackThread({
    report,
    authors,
    pendingComposer,
    confirmAuthorName,
    showConfirmAuthorSelect,
    onConfirmAuthorNameChange,
    onToggleConfirmAuthorSelect: _onToggleConfirmAuthorSelect,
    onStartDeny,
    onStartCheckout,
    onStartAskQuestion,
    onClaimAssignee,
    onTransferAssignee,
    onConfirm,
    isUpdating,
    isClaimingAssignee,
    hideCaseSelector = false,
}: FeedbackThreadProps) {
    const {
        messages,
        fields,
        caseEditReportId,
        caseEditCases,
        beginCaseEdit,
        cancelCaseEdit,
        handleCaseEditSave,
        updateCaseEditDraftCase,
        addCaseEditDraftCase,
        removeCaseEditDraftCase,
        focusedCaseId,
        selectCase,
        replyAuthorName,
        errorMessage,
        replyHistory,
        replyHistoryByReportId,
        loadOlderReplies,
        loadRepliesIfNeeded,
    } = useReport();
    const scrollRef = useRef<HTMLElement>(null);
    const loadingOlderRef = useRef(false);
    const [isAllCasesView, setIsAllCasesView] = useState(false);
    const [scrollOverflow, setScrollOverflow] = useState<ScrollOverflowState>({
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
        } finally {
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

    return (
        <div className="relative min-h-0 flex-1">
            {scrollOverflow.canScrollUp ? <p className={`${SCROLL_HINT_CLASS} top-0 bg-[linear-gradient(0deg,transparent,var(--adaptive-black50))]`}>{messages.thread.scrollHintUp}</p> : null}
            {scrollOverflow.canScrollDown ? <p className={`${SCROLL_HINT_CLASS} bottom-0 bg-[linear-gradient(180deg,transparent,var(--adaptive-black50))]`}>{messages.thread.scrollHintDown}</p> : null}
            <section
                ref={scrollRef}
                className={`flex h-full flex-col overflow-auto px-[12px] ${hideCaseSelector ? "" : "gap-[16px] max-h-[360px]"}`}
            >
                {hideCaseSelector ? null : (
                    <article className="flex flex-col gap-[4px] border-t border-[var(--adaptive-border-subtle)]">
                        <FeedbackCaseList
                            report={report}
                            cases={casesForEditor}
                            isEditing={isEditingCases}
                            canEdit={canEditReportCases(report) && !isEditingCases}
                            isSaving={isUpdating}
                            errorMessage={isEditingCases ? errorMessage : ""}
                            focusedCaseId={focusedCaseId}
                            onSelectCase={selectCase}
                            onAllTabActiveChange={setIsAllCasesView}
                            onBeginEdit={() => beginCaseEdit(report)}
                            onCancelEdit={cancelCaseEdit}
                            onSaveEdit={() => void handleCaseEditSave()}
                            onCaseChange={updateCaseEditDraftCase}
                            onAddCase={addCaseEditDraftCase}
                            onRemoveCase={removeCaseEditDraftCase}
                        />
                        {report.author_name ? (
                            <div className="flex items-center gap-[6px] px-[16px]">
                                <p className="text-[12px] text-[var(--adaptive-black500)]">{report.author_name}</p>
                                <FeedbackCreatorBadge />
                            </div>
                        ) : null}
                    </article>
                )}

                <div className={`relative flex flex-col pt-[12px] ${hideCaseSelector ? "pb-[12px]" : "pb-[57px]"}`}>
                    {/* <ReplyHistoryControls
                        reportId={report.id}
                        history={replyHistoryState}
                    /> */}
                    {showTimelineRail ? (
                        <div className="pointer-events-none absolute bottom-[12px] left-[20px] top-[12px] w-px bg-[linear-gradient(180deg,_var(--adaptive-black900)_60%,transparent_90%)]" />
                    ) : null}

                    {focusedCaseId && !isAllCasesView ? (
                        <>
                            {focusedCase ? (
                                <CaseThreadEntry
                                    report={report}
                                    caseId={focusedCaseId}
                                    caseText={focusedCase.text}
                                    caseCreatedAt={focusedCase.created_at}
                                    caseStatus={focusedCase.status}
                                    actorName={actorName}
                                    pendingComposer={pendingComposer}
                                    onStartAskQuestion={onStartAskQuestion}
                                    onClaimAssignee={onClaimAssignee}
                                    isUpdating={isUpdating}
                                    isClaimingAssignee={isClaimingAssignee}
                                    isEditingCases={isEditingCases}
                                />
                            ) : null}

                            <QuestionThreadGroup
                                questions={timeline.issueChildren}
                                originalAuthorName={originalAuthorName}
                                forceExpanded={shouldForceExpandQuestionGroup(report, focusedCaseId, timeline.issueChildren, {
                                    composerTargetsGroup: pendingComposer?.type === "question" && pendingComposer.targetReplyId === ISSUE_ROOT_PARENT_ID,
                                })}
                            />
                            {timeline.branches.map((branch) => (
                                <div
                                    key={branch.root.id}
                                    className="flex flex-col"
                                >
                                    <ThreadRootReply
                                        reply={branch.root}
                                        report={report}
                                        caseId={focusedCaseId}
                                        authors={authors}
                                        pendingComposer={pendingComposer}
                                        confirmAuthorName={confirmAuthorName}
                                        showConfirmAuthorSelect={showConfirmAuthorSelect}
                                        originalAuthorName={originalAuthorName}
                                        issueUrl={issueUrl}
                                        onConfirmAuthorNameChange={onConfirmAuthorNameChange}
                                        onStartDeny={onStartDeny}
                                        onStartCheckout={onStartCheckout}
                                        onStartAskQuestion={onStartAskQuestion}
                                        onTransferAssignee={onTransferAssignee}
                                        onConfirm={onConfirm}
                                        isUpdating={isUpdating}
                                        isClaimingAssignee={isClaimingAssignee}
                                        actorName={actorName}
                                    />
                                    <QuestionThreadGroup
                                        questions={branch.children}
                                        originalAuthorName={originalAuthorName}
                                        forceExpanded={shouldForceExpandQuestionGroup(report, focusedCaseId, branch.children, {
                                            composerTargetsGroup: pendingComposer?.type === "question" && pendingComposer.targetReplyId === branch.root.id,
                                        })}
                                    />
                                </div>
                            ))}
                        </>
                    ) : (
                        <p className="px-[12px] py-[8px] text-[12px] text-[var(--adaptive-black500)]">{messages.cases.selectToView}</p>
                    )}

                    {systemBranches.map((branch) => (
                        <ThreadRootReply
                            key={branch.root.id}
                            reply={branch.root}
                            report={report}
                            caseId={focusedCaseId ?? ""}
                            authors={authors}
                            pendingComposer={pendingComposer}
                            confirmAuthorName={confirmAuthorName}
                            showConfirmAuthorSelect={showConfirmAuthorSelect}
                            originalAuthorName={originalAuthorName}
                            issueUrl={issueUrl}
                            onConfirmAuthorNameChange={onConfirmAuthorNameChange}
                            onStartDeny={onStartDeny}
                            onStartCheckout={onStartCheckout}
                            onStartAskQuestion={onStartAskQuestion}
                            onTransferAssignee={onTransferAssignee}
                            onConfirm={onConfirm}
                            isUpdating={isUpdating}
                            isClaimingAssignee={isClaimingAssignee}
                            actorName={actorName}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}
