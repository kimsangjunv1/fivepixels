import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReportAuthor, ReportFeedback, ReportReply } from "@/types/report.js";
import type { ReportLocale } from "@/i18n/types.js";
import { useReport } from "@/providers/reportContext.js";
import { formatDate } from "@/utils/format.js";
import {
    buildConfirmAuthorOptions,
    buildThreadTimeline,
    canShowCheckoutBranchActions,
    canShowIssueEntryActions,
    canShowSuggestedBranchActions,
    getReportReplies,
    ISSUE_ROOT_PARENT_ID,
    resolveOriginalFeedbackAuthorName,
} from "@/utils/feedbackThread.js";
import { getGitHubIssueUrl, isGitIssuedSystemReply } from "@/utils/githubIntegration.js";
import { AuthorSelector } from "./AuthorSelector.js";
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

function ThreadEntryActions({
    reply,
    report,
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
}: {
    reply: ReportReply;
    report: ReportFeedback;
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
}) {
    const { messages } = useReport();
    const [isResolvedConfirming, setIsResolvedConfirming] = useState(false);
    const confirmAuthorOptions = useMemo(() => buildConfirmAuthorOptions(report, authors), [authors, report]);
    const showReview = canShowSuggestedBranchActions(report, reply);
    const showCheckout = canShowCheckoutBranchActions(report, reply);
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
        if (isUpdating) {
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
                            disabled={isUpdating}
                            onClick={onStartDeny}
                            className={`rounded-full py-[4px] px-[8px] text-[12px] font-semibold border ${denyActive ? " bg-[#FF2B6A] text-white border-transparent" : " border-[var(--adaptive-border-subtle)] text-[var(--adaptive-text-primary)]"}`}
                        >
                            {messages.thread.denied}
                        </button>

                        <button
                            type="button"
                            data-fivepixels-interactive=""
                            disabled={isUpdating}
                            onClick={onStartAskQuestion}
                            className={`rounded-full border py-[4px] px-[8px] text-[12px] font-semibold ${askQuestionActive ? "border-transparent bg-[var(--adaptive-blue500)] text-white" : "border-[var(--adaptive-border-subtle)] text-[var(--adaptive-text-primary)]"}`}
                        >
                            {messages.thread.askQuestion}
                        </button>

                        <button
                            type="button"
                            data-fivepixels-interactive=""
                            disabled={isUpdating}
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
                            disabled={isUpdating}
                            onClick={onStartDeny}
                            className={`rounded-[8px] border py-[4px] px-[8px] text-[12px] font-semibold ${denyActive ? "border-transparent bg-[#FF2B6A] text-white" : "border-[var(--adaptive-border-subtle)] text-[var(--adaptive-text-primary)]"}`}
                        >
                            {messages.thread.denied}
                        </button>
                        <button
                            type="button"
                            data-fivepixels-interactive=""
                            disabled={isUpdating}
                            onClick={onStartAskQuestion}
                            className={`rounded-[8px] border py-[4px] px-[8px] text-[12px] font-semibold ${askQuestionActive ? "border-transparent bg-[var(--adaptive-blue500)] text-white" : "border-[var(--adaptive-border-subtle)] text-[var(--adaptive-text-primary)]"}`}
                        >
                            {messages.thread.askQuestion}
                        </button>
                        <button
                            type="button"
                            data-fivepixels-interactive=""
                            disabled={isUpdating}
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

function ThreadIssueEntryActions({
    report,
    pendingComposer,
    onStartAskQuestion,
    onStartCheckout,
    isUpdating,
}: {
    report: ReportFeedback;
    pendingComposer: PendingComposer;
    onStartAskQuestion: () => void;
    onStartCheckout: (replyId: string) => void;
    isUpdating?: boolean;
}) {
    const { messages } = useReport();

    if (!canShowIssueEntryActions(report)) {
        return null;
    }

    const askQuestionActive = pendingComposer?.type === "question" && pendingComposer.targetReplyId === ISSUE_ROOT_PARENT_ID;
    const leaveResultActive = pendingComposer?.type === "checkout" && pendingComposer.targetReplyId === ISSUE_ROOT_PARENT_ID;

    return (
        <div className="mt-[10px] flex flex-col gap-[8px]">
            <div className="flex gap-[8px]">
                <button
                    type="button"
                    data-fivepixels-interactive=""
                    disabled={isUpdating}
                    onClick={onStartAskQuestion}
                    className={`rounded-full border py-[4px] px-[8px] text-[12px] font-semibold ${askQuestionActive ? "border-transparent bg-[var(--adaptive-blue500)] text-white" : "border-[var(--adaptive-border-subtle)] text-[var(--adaptive-text-primary)]"}`}
                >
                    {messages.thread.askQuestion}
                </button>
                <button
                    type="button"
                    data-fivepixels-interactive=""
                    disabled={isUpdating}
                    onClick={() => onStartCheckout(ISSUE_ROOT_PARENT_ID)}
                    className={"flex-1 rounded-full py-[4px] text-[12px] font-semibold " + (leaveResultActive ? "bg-[#F6572E] text-white" : "bg-[#F6572E20] text-[#F6572E]")}
                >
                    {messages.thread.leaveResult}
                </button>
            </div>
        </div>
    );
}

function ThreadIssueEntry({
    report,
    children,
    locale,
    originalAuthorName,
    threadReplyPrefix,
    pendingComposer,
    onStartAskQuestion,
    onStartCheckout,
    isUpdating,
}: {
    report: ReportFeedback;
    children: ReportReply[];
    locale: ReportLocale;
    originalAuthorName: string;
    threadReplyPrefix: string;
    pendingComposer: PendingComposer;
    onStartAskQuestion: () => void;
    onStartCheckout: (replyId: string) => void;
    isUpdating?: boolean;
}) {
    return (
        <div className="flex flex-col">
            <article className="flex flex-col gap-[4px] border-t border-[var(--adaptive-border-subtle)] p-[8px]">
                <div className="flex items-start justify-between gap-[8px]">
                    <FeedbackStatusBadge status="wait_for_reply" />
                    <span className="text-[12px] text-[var(--adaptive-black500)]">{formatDate(report.created_at, locale)}</span>
                </div>

                <p className="leading-[1.5] text-[14px] text-[var(--adaptive-text-primary)]">{report.message}</p>
                {report.author_name ? (
                    <div className="flex items-center gap-[6px]">
                        <p className="text-[12px] text-[var(--adaptive-black500)]">{report.author_name}</p>
                        <FeedbackCreatorBadge />
                    </div>
                ) : null}
                <ThreadIssueEntryActions
                    report={report}
                    pendingComposer={pendingComposer}
                    onStartAskQuestion={onStartAskQuestion}
                    onStartCheckout={onStartCheckout}
                    isUpdating={isUpdating}
                />
            </article>
            {children.map((child) => (
                <ThreadChildReply
                    key={child.id}
                    reply={child}
                    originalAuthorName={originalAuthorName}
                    locale={locale}
                    threadReplyPrefix={threadReplyPrefix}
                />
            ))}
        </div>
    );
}

function ThreadRootReply({
    reply,
    report,
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
}: {
    reply: ReportReply;
    report: ReportFeedback;
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
    const { locale, messages } = useReport();
    const scrollRef = useRef<HTMLElement>(null);
    const [scrollOverflow, setScrollOverflow] = useState<ScrollOverflowState>({
        canScrollUp: false,
        canScrollDown: false,
    });

    const replies = getReportReplies(report);
    const timeline = useMemo(() => buildThreadTimeline(report), [report, replies]);
    const originalAuthorName = resolveOriginalFeedbackAuthorName(report);
    const issueUrl = getGitHubIssueUrl(report);

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
    }, [refreshScrollOverflow, replies.length]);

    useEffect(() => {
        scrollToBottom();
    }, [replies.length, scrollToBottom]);

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
                <ThreadIssueEntry
                    report={report}
                    children={timeline.issueChildren}
                    locale={locale}
                    originalAuthorName={originalAuthorName}
                    threadReplyPrefix={messages.feedbackList.threadReplyPrefix}
                    pendingComposer={pendingComposer}
                    onStartAskQuestion={onStartAskQuestion}
                    onStartCheckout={onStartCheckout}
                    isUpdating={isUpdating}
                />
                {timeline.branches.map((branch) => (
                    <div
                        key={branch.root.id}
                        className="flex flex-col"
                    >
                        <ThreadRootReply
                            reply={branch.root}
                            report={report}
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
            </section>
        </div>
    );
}
