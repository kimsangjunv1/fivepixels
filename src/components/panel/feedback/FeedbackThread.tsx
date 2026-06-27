import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReportAuthor, ReportFeedback, ReportReply } from "@/types/report.js";
import type { ReportLocale } from "@/i18n/types.js";
import { useReport } from "@/providers/reportContext.js";
import { formatDate } from "@/utils/format.js";
import { canActOnCase, canEditReportCases } from "@/utils/reportCases.js";
import {
    buildCaseThreadTimeline,
    buildConfirmAuthorOptions,
    buildThreadTimeline,
    canShowCaseEntryActions,
    canShowCheckoutBranchActionsForCase,
    canShowSuggestedBranchActionsForCase,
    getReportReplies,
    ISSUE_ROOT_PARENT_ID,
    resolveOriginalFeedbackAuthorName,
} from "@/utils/feedbackThread.js";
import { getGitHubIssueUrl, isGitIssuedSystemReply } from "@/utils/githubIntegration.js";
import { AuthorSelector } from "./AuthorSelector.js";
import { FeedbackCaseList } from "./FeedbackCaseList.js";
import { FeedbackCreatorBadge } from "./FeedbackCreatorBadge.js";
import { FeedbackStatusBadge } from "./FeedbackStatusBadge.js";
import { GitIssuedThreadEntry } from "./GitIssuedThreadEntry.js";

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
    onStartDeny: () => void;
    onStartCheckout: (replyId: string) => void;
    onStartAskQuestion: () => void;
    onConfirm: () => void;
    isUpdating?: boolean;
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

function canShowCaseThreadActions(report: ReportFeedback, caseId: string, replyAuthorName: string, confirmAuthorName: string) {
    const actorCandidates = [replyAuthorName.trim(), confirmAuthorName.trim(), resolveOriginalFeedbackAuthorName(report)].filter(Boolean);

    return actorCandidates.some((actorName) => canActOnCase(report, caseId, actorName));
}

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
}: {
    reply: ReportReply;
    report: ReportFeedback;
    caseId: string;
    authors: ReportAuthor[];
    pendingComposer: PendingComposer;
    confirmAuthorName: string;
    showConfirmAuthorSelect: boolean;
    onConfirmAuthorNameChange: (name: string) => void;
    onStartDeny: () => void;
    onStartCheckout: (replyId: string) => void;
    onStartAskQuestion: () => void;
    onConfirm: () => void;
    isUpdating?: boolean;
    canAct: boolean;
}) {
    const { messages } = useReport();
    const [isResolvedConfirming, setIsResolvedConfirming] = useState(false);
    const confirmAuthorOptions = useMemo(() => buildConfirmAuthorOptions(report, authors), [authors, report]);
    const showReview = canShowSuggestedBranchActionsForCase(report, reply, caseId);
    const showCheckout = canShowCheckoutBranchActionsForCase(report, reply, caseId);
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

    return (
        <div className="mt-[10px] flex flex-col gap-[8px]">
            <div className="flex gap-[8px]">
                {showReview ? (
                    <>
                        <button
                            type="button"
                            data-fivepixels-interactive=""
                            disabled={isUpdating || !canAct}
                            onClick={onStartDeny}
                            className={`rounded-full py-[4px] px-[8px] text-[12px] font-semibold border ${denyActive ? " bg-[#FF2B6A] text-white border-transparent" : " border-[var(--adaptive-border-subtle)] text-[var(--adaptive-text-primary)]"}`}
                        >
                            {messages.thread.denied}
                        </button>

                        <button
                            type="button"
                            data-fivepixels-interactive=""
                            disabled={isUpdating || !canAct}
                            onClick={onStartAskQuestion}
                            className={`rounded-full border py-[4px] px-[8px] text-[12px] font-semibold ${askQuestionActive ? "border-transparent bg-[var(--adaptive-blue500)] text-white" : "border-[var(--adaptive-border-subtle)] text-[var(--adaptive-text-primary)]"}`}
                        >
                            {messages.thread.askQuestion}
                        </button>

                        <button
                            type="button"
                            data-fivepixels-interactive=""
                            disabled={isUpdating || !canAct}
                            onClick={handleResolvedClick}
                            aria-label={isResolvedConfirming ? messages.thread.resolvedConfirmAriaLabel : messages.thread.resolved}
                            className={`flex-1 rounded-full text-[12px] font-semibold text-white ${isResolvedConfirming ? "bg-[#D94A22]" : "bg-[#F6572E]"}`}
                        >
                            {isResolvedConfirming ? messages.thread.resolvedConfirmLabel : messages.thread.resolved}
                        </button>
                    </>
                ) : null}

                {showCheckout ? (
                    <>
                        <button
                            type="button"
                            data-fivepixels-interactive=""
                            disabled={isUpdating || !canAct}
                            onClick={onStartDeny}
                            className={`rounded-[8px] border py-[4px] px-[8px] text-[12px] font-semibold ${denyActive ? "border-transparent bg-[#FF2B6A] text-white" : "border-[var(--adaptive-border-subtle)] text-[var(--adaptive-text-primary)]"}`}
                        >
                            {messages.thread.denied}
                        </button>
                        <button
                            type="button"
                            data-fivepixels-interactive=""
                            disabled={isUpdating || !canAct}
                            onClick={onStartAskQuestion}
                            className={`rounded-[8px] border py-[4px] px-[8px] text-[12px] font-semibold ${askQuestionActive ? "border-transparent bg-[var(--adaptive-blue500)] text-white" : "border-[var(--adaptive-border-subtle)] text-[var(--adaptive-text-primary)]"}`}
                        >
                            {messages.thread.askQuestion}
                        </button>
                        <button
                            type="button"
                            data-fivepixels-interactive=""
                            disabled={isUpdating || !canAct}
                            onClick={() => onStartCheckout(reply.id)}
                            className={
                                "flex-1 py-[4px] rounded-[8px] text-[12px] font-semibold " + (checkoutActive ? "bg-[#F6572E] text-[var(--adaptive-text-inverse)]" : "bg-[#F6572E20] text-[#F6572E]")
                            }
                        >
                            {messages.thread.leaveResult}
                        </button>
                    </>
                ) : null}
            </div>

            {!canAct ? <p className="text-[11px] text-[var(--adaptive-black500)]">{messages.errors.caseAssigneeOnly}</p> : null}

            {showReview && showConfirmAuthorSelect ? (
                <AuthorSelector
                    authors={confirmAuthorOptions}
                    value={confirmAuthorName}
                    onChange={onConfirmAuthorNameChange}
                />
            ) : null}
        </div>
    );
}

function ThreadChildReply({ reply, originalAuthorName, locale, threadReplyPrefix }: { reply: ReportReply; originalAuthorName: string; locale: ReportLocale; threadReplyPrefix: string }) {
    return (
        <article className={`flex flex-col gap-[4px] border-t border-[var(--adaptive-border-subtle)] ${threadReplyPrefix ? "py-[8px] pl-[18px]" : "py-[8px] pl-[12px]"}`}>
            <div className="flex items-start justify-between gap-[8px]">
                <FeedbackStatusBadge status={reply.status} />
                <span className="text-[12px] text-[var(--adaptive-black500)]">{formatDate(reply.created_at, locale)}</span>
            </div>

            <p className="leading-[1.5] text-[13px] text-[var(--adaptive-text-primary)]">
                <span className="text-[var(--adaptive-black400)]">{threadReplyPrefix}</span> {reply.message}
            </p>

            {reply.author_name ? (
                <div className="flex items-center gap-[6px]">
                    <p className="text-[12px] text-[var(--adaptive-black500)]">{reply.author_name}</p>
                    {reply.author_name.trim() === originalAuthorName ? <FeedbackCreatorBadge /> : null}
                </div>
            ) : null}
        </article>
    );
}

function CaseThreadEntryActions({
    report,
    caseId,
    pendingComposer,
    onStartAskQuestion,
    onStartCheckout,
    isUpdating,
    canAct,
}: {
    report: ReportFeedback;
    caseId: string;
    pendingComposer: PendingComposer;
    onStartAskQuestion: () => void;
    onStartCheckout: (replyId: string) => void;
    isUpdating?: boolean;
    canAct: boolean;
}) {
    const { messages } = useReport();

    if (!canShowCaseEntryActions(report, caseId)) {
        return null;
    }

    const askQuestionActive = pendingComposer?.type === "question" && pendingComposer.targetReplyId === ISSUE_ROOT_PARENT_ID;
    const leaveResultActive = pendingComposer?.type === "checkout" && pendingComposer.targetReplyId === ISSUE_ROOT_PARENT_ID;

    return (
        <div className="mt-[10px] flex flex-col gap-[8px] px-[8px]">
            <div className="flex gap-[8px]">
                <button
                    type="button"
                    data-fivepixels-interactive=""
                    disabled={isUpdating || !canAct}
                    onClick={onStartAskQuestion}
                    className={`rounded-full border py-[4px] px-[8px] text-[12px] font-semibold ${askQuestionActive ? "border-transparent bg-[var(--adaptive-blue500)] text-white" : "border-[var(--adaptive-border-subtle)] text-[var(--adaptive-text-primary)]"}`}
                >
                    {messages.thread.askQuestion}
                </button>
                <button
                    type="button"
                    data-fivepixels-interactive=""
                    disabled={isUpdating || !canAct}
                    onClick={() => onStartCheckout(ISSUE_ROOT_PARENT_ID)}
                    className={"flex-1 rounded-full py-[4px] text-[12px] font-semibold " + (leaveResultActive ? "bg-[#F6572E] text-white" : "bg-[#F6572E20] text-[#F6572E]")}
                >
                    {messages.thread.leaveResult}
                </button>
            </div>
            {!canAct ? <p className="text-[11px] text-[var(--adaptive-black500)]">{messages.errors.caseAssigneeOnly}</p> : null}
        </div>
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
    locale,
    issueUrl,
    onConfirmAuthorNameChange,
    onStartDeny,
    onStartCheckout,
    onStartAskQuestion,
    onConfirm,
    isUpdating,
    canAct,
}: {
    reply: ReportReply;
    report: ReportFeedback;
    caseId: string;
    authors: ReportAuthor[];
    pendingComposer: PendingComposer;
    confirmAuthorName: string;
    showConfirmAuthorSelect: boolean;
    originalAuthorName: string;
    locale: ReportLocale;
    issueUrl: string | null | undefined;
    onConfirmAuthorNameChange: (name: string) => void;
    onStartDeny: () => void;
    onStartCheckout: (replyId: string) => void;
    onStartAskQuestion: () => void;
    onConfirm: () => void;
    isUpdating?: boolean;
    canAct: boolean;
}) {
    if (isGitIssuedSystemReply(reply, report) && issueUrl) {
        return (
            <GitIssuedThreadEntry
                reply={reply}
                issueUrl={issueUrl}
            />
        );
    }

    return (
        <article className="flex flex-col gap-[4px] border-t border-[var(--adaptive-border-subtle)] p-[8px]">
            <div className="flex items-start justify-between gap-[8px]">
                <FeedbackStatusBadge status={reply.status} />
                <span className="text-[12px] text-[var(--adaptive-black500)]">{formatDate(reply.created_at, locale)}</span>
            </div>

            <p className="leading-[1.5] text-[14px] text-[var(--adaptive-text-primary)]">{reply.message}</p>
            {reply.author_name ? (
                <div className="flex items-center gap-[6px]">
                    <p className="text-[12px] text-[var(--adaptive-black500)]">{reply.author_name}</p>
                    {reply.author_name.trim() === originalAuthorName ? <FeedbackCreatorBadge /> : null}
                </div>
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
            />
        </article>
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
    onConfirm,
    isUpdating,
}: FeedbackThreadProps) {
    const {
        locale,
        messages,
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
    const [scrollOverflow, setScrollOverflow] = useState<ScrollOverflowState>({
        canScrollUp: false,
        canScrollDown: false,
    });

    const isEditingCases = caseEditReportId === report.id && caseEditCases !== null;
    const casesForEditor = isEditingCases ? caseEditCases : report.cases;
    const hasOpenCases = casesForEditor.some((item) => item.status === "open");
    const caseSelectionEnabled = !isEditingCases && report.status !== "archived" && casesForEditor.length > 0;
    const replies = getReportReplies(report);
    const timeline = useMemo(
        () => (focusedCaseId ? buildCaseThreadTimeline(report, focusedCaseId) : { issueChildren: [], branches: [] }),
        [focusedCaseId, report, replies],
    );
    const originalAuthorName = resolveOriginalFeedbackAuthorName(report);
    const issueUrl = getGitHubIssueUrl(report);
    const canAct = focusedCaseId ? canShowCaseThreadActions(report, focusedCaseId, replyAuthorName, confirmAuthorName) : false;
    const systemBranches = useMemo(
        () => buildThreadTimeline(report).branches.filter((branch) => isGitIssuedSystemReply(branch.root, report)),
        [report, replies],
    );

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
            {scrollOverflow.canScrollUp ? <p className={`${SCROLL_HINT_CLASS} top-0 bg-[linear-gradient(0deg,transparent,var(--adaptive-surface-overlay))]`}>{messages.thread.scrollHintUp}</p> : null}
            {scrollOverflow.canScrollDown ? (
                <p className={`${SCROLL_HINT_CLASS} bottom-0 bg-[linear-gradient(180deg,transparent,var(--adaptive-surface-overlay))]`}>{messages.thread.scrollHintDown}</p>
            ) : null}
            <section
                ref={scrollRef}
                className="flex h-full max-h-[360px] flex-col overflow-auto bg-transparent"
            >
                <article className="flex flex-col gap-[4px] border-t border-[var(--adaptive-border-subtle)] p-[8px]">
                    <FeedbackCaseList
                        report={report}
                        cases={casesForEditor}
                        isEditing={isEditingCases}
                        canEdit={canEditReportCases(report) && !isEditingCases}
                        isSaving={isUpdating}
                        errorMessage={isEditingCases ? errorMessage : ""}
                        selectable={caseSelectionEnabled}
                        focusedCaseId={focusedCaseId}
                        onSelectCase={selectCase}
                        onBeginEdit={() => beginCaseEdit(report)}
                        onCancelEdit={cancelCaseEdit}
                        onSaveEdit={() => void handleCaseEditSave()}
                        onCaseChange={updateCaseEditDraftCase}
                        onAddCase={addCaseEditDraftCase}
                        onRemoveCase={removeCaseEditDraftCase}
                    />
                    {report.author_name ? (
                        <div className="flex items-center gap-[6px] px-[8px]">
                            <p className="text-[12px] text-[var(--adaptive-black500)]">{report.author_name}</p>
                            <FeedbackCreatorBadge />
                        </div>
                    ) : null}
                </article>

                {focusedCaseId ? (
                    <>
                        {timeline.issueChildren.map((child) => (
                            <ThreadChildReply
                                key={child.id}
                                reply={child}
                                originalAuthorName={originalAuthorName}
                                locale={locale}
                                threadReplyPrefix={messages.feedbackList.threadReplyPrefix}
                            />
                        ))}
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
                                    locale={locale}
                                    issueUrl={issueUrl}
                                    onConfirmAuthorNameChange={onConfirmAuthorNameChange}
                                    onStartDeny={onStartDeny}
                                    onStartCheckout={onStartCheckout}
                                    onStartAskQuestion={onStartAskQuestion}
                                    onConfirm={onConfirm}
                                    isUpdating={isUpdating}
                                    canAct={canAct}
                                />
                                {branch.children.map((child) => (
                                    <ThreadChildReply
                                        key={child.id}
                                        reply={child}
                                        originalAuthorName={originalAuthorName}
                                        locale={locale}
                                        threadReplyPrefix={messages.feedbackList.threadReplyPrefix}
                                    />
                                ))}
                            </div>
                        ))}
                        {!isEditingCases ? (
                            <CaseThreadEntryActions
                                report={report}
                                caseId={focusedCaseId}
                                pendingComposer={pendingComposer}
                                onStartAskQuestion={onStartAskQuestion}
                                onStartCheckout={onStartCheckout}
                                isUpdating={isUpdating}
                                canAct={canAct}
                            />
                        ) : null}
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
                        locale={locale}
                        issueUrl={issueUrl}
                        onConfirmAuthorNameChange={onConfirmAuthorNameChange}
                        onStartDeny={onStartDeny}
                        onStartCheckout={onStartCheckout}
                        onStartAskQuestion={onStartAskQuestion}
                        onConfirm={onConfirm}
                        isUpdating={isUpdating}
                        canAct={false}
                    />
                ))}
            </section>
        </div>
    );
}
