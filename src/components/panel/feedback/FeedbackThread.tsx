import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReportAuthor, ReportFeedback, ReportReply } from "@/types/report.js";
import { useReport } from "@/providers/reportContext.js";
import { formatClockTime } from "@/utils/format.js";
import { canEditReportCases, getCaseById } from "@/utils/reportCases.js";
import {
    buildCaseThreadTimeline,
    buildConfirmAuthorOptions,
    buildThreadTimeline,
    canShowAdjudicationActionsOnBranchReply,
    canShowCaseThreadActions,
    canShowCaseClaimAction,
    canShowCheckoutBranchActionsForCase,
    canShowSuggestedBranchActionsForCase,
    getReportReplies,
    isAssigneeEventStatus,
    isBranchReplyAuthor,
    ISSUE_ROOT_PARENT_ID,
    resolveOriginalFeedbackAuthorName,
    shouldForceExpandQuestionGroup,
} from "@/utils/feedbackThread.js";
import { getGitHubIssueUrl, isGitIssuedSystemReply } from "@/utils/githubIntegration.js";
import { CheckIcon, CloseIcon, ResolvedStatusIcon, RevertIcon } from "@/components/icons/Icons.js";
import { FEEDBACK_STATUS_COLOR } from "@/constants/feedbackStatus.js";
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
// const THREAD_CASE_ENTRY_SURFACE_CLASS = "flex flex-col gap-[4px] rounded-[12px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface-overlay)] p-[8px_12px]";

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

function ThreadEntryActions({
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

    return (
        <div className="mt-[10px] flex flex-col gap-[8px]">
            <div className="flex flex-wrap items-center justify-end">
                {showReview ? (
                    <>
                        {canUseReplyAction ? (
                            <button
                                type="button"
                                data-fivepixels-interactive=""
                                disabled={isUpdating}
                                onClick={onStartAskQuestion}
                                className={`${THREAD_ACTION_BUTTON_BASE} ${askQuestionActive ? "bg-[var(--adaptive-blue50)] text-[var(--adaptive-blue500)]" : THREAD_ACTION_GHOST}`}
                            >
                                <RevertIcon className="h-[13px] w-[13px]" />
                                {messages.thread.reply}
                            </button>
                        ) : null}

                        {showAdjudication && canAct ? (
                            <>
                                {canUseReplyAction ? (
                                    <span
                                        className={THREAD_ACTION_DIVIDER}
                                        aria-hidden
                                    />
                                ) : null}

                                <button
                                    type="button"
                                    data-fivepixels-interactive=""
                                    disabled={isUpdating}
                                    onClick={() => onStartDeny()}
                                    aria-label={messages.thread.denied}
                                    className={`${THREAD_ACTION_BUTTON_BASE} px-[6px] ${denyActive ? "bg-[#FF2B6A] text-white" : THREAD_ACTION_GHOST}`}
                                >
                                    <CloseIcon className="h-[13px] w-[13px]" />
                                </button>

                                <button
                                    type="button"
                                    data-fivepixels-interactive=""
                                    disabled={isUpdating}
                                    onClick={handleResolvedClick}
                                    aria-label={isResolvedConfirming ? messages.thread.resolvedConfirmAriaLabel : messages.thread.resolved}
                                    className={`${THREAD_ACTION_BUTTON_BASE} px-[6px] ${isResolvedConfirming ? "bg-[#D94A22] text-white" : THREAD_ACTION_GHOST}`}
                                >
                                    <CheckIcon className="h-[13px] w-[13px]" />
                                </button>
                            </>
                        ) : null}
                    </>
                ) : null}

                {showCheckout ? (
                    <>
                        {canUseReplyAction ? (
                            <button
                                type="button"
                                data-fivepixels-interactive=""
                                disabled={isUpdating}
                                onClick={onStartAskQuestion}
                                className={`${THREAD_ACTION_BUTTON_BASE} ${askQuestionActive ? "bg-[var(--adaptive-blue50)] text-[var(--adaptive-blue500)]" : THREAD_ACTION_GHOST}`}
                            >
                                <RevertIcon className="h-[13px] w-[13px]" />
                                {messages.thread.reply}
                            </button>
                        ) : null}
                        {showAdjudication && canAct ? (
                            <>
                                {canUseReplyAction ? (
                                    <span
                                        className={THREAD_ACTION_DIVIDER}
                                        aria-hidden
                                    />
                                ) : null}
                                <button
                                    type="button"
                                    data-fivepixels-interactive=""
                                    disabled={isUpdating}
                                    onClick={() => onStartDeny()}
                                    aria-label={messages.thread.denied}
                                    className={`${THREAD_ACTION_BUTTON_BASE} px-[6px] ${denyActive ? "bg-[#FF2B6A] text-white" : THREAD_ACTION_GHOST}`}
                                >
                                    <CloseIcon className="h-[13px] w-[13px]" />
                                </button>
                                <button
                                    type="button"
                                    data-fivepixels-interactive=""
                                    disabled={isUpdating}
                                    onClick={() => onStartCheckout(reply.id)}
                                    aria-label={messages.thread.leaveResult}
                                    className={`${THREAD_ACTION_BUTTON_BASE} px-[6px] ${checkoutActive ? "bg-[#F6572E] text-white" : THREAD_ACTION_GHOST}`}
                                >
                                    <CheckIcon className="h-[13px] w-[13px]" />
                                </button>
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

function CaseThreadEntryActions({
    report,
    caseId,
    actorName,
    onClaimAssignee,
    isUpdating,
    isClaimingAssignee,
}: {
    report: ReportFeedback;
    caseId: string;
    actorName: string;
    onClaimAssignee: () => void;
    isUpdating?: boolean;
    isClaimingAssignee?: boolean;
}) {
    const { messages } = useReport();

    if (!canShowCaseClaimAction(report, caseId, actorName)) {
        return null;
    }

    return (
        <div className="mt-[10px] flex flex-wrap items-center justify-end">
            <button
                type="button"
                data-fivepixels-interactive=""
                disabled={isUpdating || isClaimingAssignee}
                onClick={onClaimAssignee}
                className={`${THREAD_ACTION_BUTTON_BASE} ${THREAD_ACTION_GHOST}`}
            >
                {messages.thread.claimAssignee}
            </button>
        </div>
    );
}

function ThreadResolvedDivider() {
    const { messages } = useReport();
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
    onClaimAssignee: () => void;
    isUpdating?: boolean;
    isClaimingAssignee?: boolean;
    isEditingCases?: boolean;
}) {
    const hasActions = !isEditingCases && canShowCaseClaimAction(report, caseId, actorName);

    const entryBody = (
        <>
            <FeedbackStatusBadge
                status="issue_apply"
                isNeedGray
            />

            <p className={`leading-[1.5] text-[14px] text-[var(--adaptive-text-primary)] ${caseStatus === "resolved" ? "text-[var(--adaptive-black500)] line-through" : ""}`}>{caseText}</p>

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
                    onClaimAssignee={onClaimAssignee}
                    isUpdating={isUpdating}
                    isClaimingAssignee={isClaimingAssignee}
                />
            )}
        </>
    );

    return (
        <ThreadTimelineRow time={formatClockTime(caseCreatedAt)}>
            <div className={hasActions ? THREAD_ACTION_ENTRY_SURFACE_CLASS : THREAD_CASE_ENTRY_SURFACE_CLASS}>{entryBody}</div>
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
    const hasActions =
        showBranchActions &&
        (canAct || isOwnBranchReply) &&
        (canShowAdjudicationActionsOnBranchReply(reply, actorName) ? canAct : true);

    const entryBody = (
        <>
            <FeedbackStatusBadge
                status={reply.status}
                isNeedGray
            />

            <p className="leading-[1.5] text-[14px] text-[var(--adaptive-text-primary)]">{reply.message}</p>
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
            <div className={hasActions ? THREAD_ACTION_ENTRY_SURFACE_CLASS : THREAD_CASE_ENTRY_SURFACE_CLASS}>{entryBody}</div>
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
    } = useReport();
    const scrollRef = useRef<HTMLElement>(null);
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

    return (
        <div className="relative min-h-0 flex-1">
            {scrollOverflow.canScrollUp ? <p className={`${SCROLL_HINT_CLASS} top-0 bg-[linear-gradient(0deg,transparent,var(--adaptive-black50))]`}>{messages.thread.scrollHintUp}</p> : null}
            {scrollOverflow.canScrollDown ? (
                <p className={`${SCROLL_HINT_CLASS} bottom-[57px] bg-[linear-gradient(180deg,transparent,var(--adaptive-black50))]`}>{messages.thread.scrollHintDown}</p>
            ) : null}
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

                <div className="relative flex flex-col pt-[12px] pb-[57px]">
                    {showTimelineRail ? <div className="pointer-events-none absolute bottom-[12px] left-[20px] top-[12px] w-px bg-[var(--adaptive-border-subtle)]" /> : null}

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
