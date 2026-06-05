import { useMemo } from "react";
import type { ReportAuthor, ReportFeedback, ReportReply } from "../../../types/report.js";
import { formatDate } from "../../../utils/format.js";
import { canCheckoutReply, canReviewLatestSuggestion, resolveOriginalFeedbackAuthorName } from "../../../utils/feedbackThread.js";
import { AuthorSelector } from "./AuthorSelector.js";
import { FeedbackStatusBadge } from "./FeedbackStatusBadge.js";

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
                            className={
                                denyActive
                                    ? "flex-1 rounded-full bg-[var(--adaptive-red400)] px-[12px] py-[8px] text-[12px] font-semibold text-white"
                                    : "flex-1 rounded-full border border-[var(--adaptive-black400)] px-[12px] py-[8px] text-[12px] font-semibold text-[var(--adaptive-black700)]"
                            }
                        >
                            denied
                        </button>
                        <button
                            type="button"
                            data-stitchable-interactive=""
                            disabled={isUpdating}
                            onClick={onConfirm}
                            className="flex-1 rounded-full border border-[var(--adaptive-black400)] px-[12px] py-[8px] text-[12px] font-semibold text-[var(--adaptive-black700)]"
                        >
                            confirm
                        </button>
                        <button
                            type="button"
                            data-stitchable-interactive=""
                            disabled={isUpdating}
                            onClick={onToggleConfirmAuthorSelect}
                            className={
                                showConfirmAuthorSelect
                                    ? "shrink-0 rounded-full bg-[var(--adaptive-black900)] px-[12px] py-[8px] text-[12px] font-semibold text-[var(--adaptive-black50)]"
                                    : "shrink-0 rounded-full border border-[var(--adaptive-black400)] px-[12px] py-[8px] text-[12px] font-semibold text-[var(--adaptive-black700)]"
                            }
                        >
                            select
                        </button>
                    </>
                ) : null}
                {showCheckout ? (
                    <>
                        <button
                            type="button"
                            data-stitchable-interactive=""
                            disabled
                            className="flex-1 rounded-full border border-[var(--adaptive-black400)] px-[12px] py-[8px] text-[12px] font-semibold text-[var(--adaptive-black500)] opacity-60"
                        >
                            denied
                        </button>
                        <button
                            type="button"
                            data-stitchable-interactive=""
                            disabled={isUpdating}
                            onClick={() => onStartCheckout(reply.id)}
                            className={
                                checkoutActive
                                    ? "flex-1 rounded-full bg-[var(--adaptive-black900)] px-[12px] py-[8px] text-[12px] font-semibold text-[var(--adaptive-black50)]"
                                    : "flex-1 rounded-full border border-[var(--adaptive-black400)] px-[12px] py-[8px] text-[12px] font-semibold text-[var(--adaptive-black700)]"
                            }
                        >
                            checkout
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
    if (report.replies.length === 0) {
        return null;
    }

    const chronological = [...report.replies].reverse();

    return (
        <section className="flex flex-col bg-[var(--adaptive-black50)] max-h-[512px] overflow-auto">
            {chronological.map((reply) => (
                <article
                    key={reply.id}
                    className="flex flex-col gap-[8px] border-t border-[var(--adaptive-blackOpacity200)] p-[16px]"
                >
                    <div className="flex items-start justify-between gap-[8px]">
                        <FeedbackStatusBadge status={reply.status} />
                        <span className="text-[12px] text-[var(--adaptive-black500)]">{formatDate(reply.created_at)}</span>
                    </div>
                    <p className="leading-[1.45] text-[var(--adaptive-black900)]">{reply.message}</p>
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
            ))}
        </section>
    );
}
