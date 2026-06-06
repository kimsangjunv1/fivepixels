import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReportAuthor, ReportFeedback, ReportReply } from "../../../types/report.js";
import { useReport } from "../../../providers/reportContext.js";
import { formatDate } from "../../../utils/format.js";
import { canCheckoutReply, canReviewLatestSuggestion, resolveOriginalFeedbackAuthorName } from "../../../utils/feedbackThread.js";
import { getGitHubIssueUrl, isGitIssuedSystemReply } from "../../../utils/githubIntegration.js";
import { AuthorSelector } from "./AuthorSelector.js";
import { FeedbackStatusBadge } from "./FeedbackStatusBadge.js";
import { GitIssuedThreadEntry } from "./GitIssuedThreadEntry.js";

type PendingComposer = {
    type: "deny" | "checkout";
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
    onConfirm: () => void;
    isUpdating?: boolean;
};

function buildConfirmAuthorOptions(report: ReportFeedback, authors: ReportAuthor[]): ReportAuthor[] {
    const byName = new Map<string, ReportAuthor>();

    for (const author of authors) {
        byName.set(author.name, author);
    }

    const originalName = resolveOriginalFeedbackAuthorName(report);

    if (originalName && !byName.has(originalName)) {
        byName.set(originalName, { id: "__original_feedback_author__", name: originalName });
    }

    return Array.from(byName.values());
}

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
    onToggleConfirmAuthorSelect,
    onStartDeny,
    onStartCheckout,
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
    onToggleConfirmAuthorSelect: () => void;
    onStartDeny: () => void;
    onStartCheckout: (replyId: string) => void;
    onConfirm: () => void;
    isUpdating?: boolean;
}) {
    const { messages } = useReport();
    const confirmAuthorOptions = useMemo(() => buildConfirmAuthorOptions(report, authors), [authors, report]);
    const isLatest = report.replies[report.replies.length - 1]?.id === reply.id;
    const showReview = isLatest && canReviewLatestSuggestion(report);
    const showCheckout = canCheckoutReply(report, reply);
    const denyActive = pendingComposer?.type === "deny" && pendingComposer.targetReplyId === reply.id;
    const checkoutActive = pendingComposer?.type === "checkout" && pendingComposer.targetReplyId === reply.id;

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
                            data-stitchable-interactive=""
                            disabled={isUpdating}
                            onClick={onStartDeny}
                            className={`flex-1 rounded-full py-[4px] px-[8px] text-[12px] font-semibold border ${denyActive ? " bg-[#FF2B6A] text-white border-transparent" : " border-[var(--adaptive-black800)] text-[var(--adaptive-black500)] text-[var(--adaptive-black50)]"}`}
                        >
                            {messages.thread.denied}
                        </button>

                        <section className="flex items-center gap-[8px] py-[4px] px-[8px] border border-[var(--adaptive-black800)] bg-[var(--adaptive-black900)] rounded-full">
                            <button
                                type="button"
                                data-stitchable-interactive=""
                                disabled={isUpdating}
                                onClick={onConfirm}
                                className="flex-1 rounded-full text-[12px] font-semibold text-[var(--adaptive-black500)]"
                            >
                                {messages.thread.resolved}
                            </button>
                            <div className="h-full w-[1px] bg-[var(--adaptive-black700)]" />

                            <button
                                type="button"
                                data-stitchable-interactive=""
                                disabled={isUpdating}
                                onClick={onToggleConfirmAuthorSelect}
                                className={
                                    showConfirmAuthorSelect
                                        ? "shrink-0 rounded-full bg-[var(--adaptive-black900)] text-[12px] font-semibold text-[var(--adaptive-black50)]"
                                        : "shrink-0 rounded-fulltext-[12px] font-semibold text-[var(--adaptive-black700)]"
                                }
                            >
                                {messages.thread.select}
                            </button>
                        </section>
                    </>
                ) : null}

                {showCheckout ? (
                    <>
                        <button
                            type="button"
                            data-stitchable-interactive=""
                            disabled
                            className="flex-1 border border-[var(--adaptive-black400)] py-[4px] rounded-[8px] text-[12px] font-semibold text-[var(--adaptive-black500)] opacity-60"
                        >
                            {messages.thread.denied}
                        </button>
                        <button
                            type="button"
                            data-stitchable-interactive=""
                            disabled={isUpdating}
                            onClick={() => onStartCheckout(reply.id)}
                            className={
                                "flex-1 py-[4px] rounded-[8px] text-[12px] font-semibold " +
                                (checkoutActive
                                    ? "bg-[var(--adaptive-black900)] text-[var(--adaptive-black50)]"
                                    : "bg-[var(--adaptive-black900)] border border-[var(--adaptive-black400)] text-[var(--adaptive-black300)]")
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

export function FeedbackThread({
    report,
    authors,
    pendingComposer,
    confirmAuthorName,
    showConfirmAuthorSelect,
    onConfirmAuthorNameChange,
    onToggleConfirmAuthorSelect,
    onStartDeny,
    onStartCheckout,
    onConfirm,
    isUpdating,
}: FeedbackThreadProps) {
    const { locale, messages } = useReport();
    const scrollRef = useRef<HTMLElement>(null);
    const [scrollOverflow, setScrollOverflow] = useState<ScrollOverflowState>({
        canScrollUp: false,
        canScrollDown: false,
    });

    const refreshScrollOverflow = useCallback(() => {
        const element = scrollRef.current;

        if (!element) {
            return;
        }

        setScrollOverflow(getScrollOverflowState(element));
    }, []);

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
    }, [refreshScrollOverflow, report.replies]);

    if (report.replies.length === 0) {
        return null;
    }

    const chronological = [...report.replies].reverse();

    return (
        <div className="relative max-h-[512px]">
            {scrollOverflow.canScrollUp ? <p className={`${SCROLL_HINT_CLASS} top-0 bg-[linear-gradient(0deg,transparent,var(--adaptive-black900))]`}>{messages.thread.scrollHintUp}</p> : null}
            {scrollOverflow.canScrollDown ? <p className={`${SCROLL_HINT_CLASS} bottom-0 bg-[linear-gradient(180deg,transparent,var(--adaptive-black900))]`}>{messages.thread.scrollHintDown}</p> : null}
            <section
                ref={scrollRef}
                className="flex max-h-[512px] flex-col overflow-auto bg-[var(--adaptive-blackOpacity900)] backdrop-blur-[10px]"
            >
                {chronological.map((reply) => {
                    const issueUrl = getGitHubIssueUrl(report);

                    if (isGitIssuedSystemReply(reply, report) && issueUrl) {
                        return (
                            <GitIssuedThreadEntry
                                key={reply.id}
                                reply={reply}
                                issueUrl={issueUrl}
                            />
                        );
                    }

                    return (
                    <article
                        key={reply.id}
                        className="flex flex-col gap-[8px] border-t border-[var(--adaptive-black800)] p-[16px]"
                    >
                        <div className="flex items-start justify-between gap-[8px]">
                            <FeedbackStatusBadge status={reply.status} />
                            <span className="text-[12px] text-[var(--adaptive-black500)]">{formatDate(reply.created_at, locale)}</span>
                        </div>
                        <p className="leading-[1.5] text-[14px] text-[var(--adaptive-black50)]">{reply.message}</p>
                        {reply.author_name ? <p className="text-[12px] text-[var(--adaptive-black500)]">{reply.author_name}</p> : null}
                        <ThreadEntryActions
                            reply={reply}
                            report={report}
                            authors={authors}
                            pendingComposer={pendingComposer}
                            confirmAuthorName={confirmAuthorName}
                            showConfirmAuthorSelect={showConfirmAuthorSelect}
                            onConfirmAuthorNameChange={onConfirmAuthorNameChange}
                            onToggleConfirmAuthorSelect={onToggleConfirmAuthorSelect}
                            onStartDeny={onStartDeny}
                            onStartCheckout={onStartCheckout}
                            onConfirm={onConfirm}
                            isUpdating={isUpdating}
                        />
                    </article>
                    );
                })}
            </section>
        </div>
    );
}
