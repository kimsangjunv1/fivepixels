import type { ReportFeedback, ReportReply } from "../../../types/report.js";
import { formatDate } from "../../../utils/format.js";
import { canCheckoutReply, canReviewLatestSuggestion } from "../../../utils/feedbackThread.js";
import { FeedbackStatusBadge } from "./FeedbackStatusBadge.js";

type PendingComposer = {
    type: "deny" | "checkout";
    targetReplyId: string;
} | null;

type FeedbackThreadProps = {
    report: ReportFeedback;
    pendingComposer: PendingComposer;
    onStartDeny: () => void;
    onStartCheckout: (replyId: string) => void;
    onConfirm: () => void;
    isUpdating?: boolean;
};

function ThreadEntryActions({
    reply,
    report,
    pendingComposer,
    onStartDeny,
    onStartCheckout,
    onConfirm,
    isUpdating,
}: {
    reply: ReportReply;
    report: ReportFeedback;
    pendingComposer: PendingComposer;
    onStartDeny: () => void;
    onStartCheckout: (replyId: string) => void;
    onConfirm: () => void;
    isUpdating?: boolean;
}) {
    const isLatest = report.replies[report.replies.length - 1]?.id === reply.id;
    const showReview = isLatest && canReviewLatestSuggestion(report);
    const showCheckout = canCheckoutReply(reply);
    const denyActive = pendingComposer?.type === "deny" && pendingComposer.targetReplyId === reply.id;
    const checkoutActive = pendingComposer?.type === "checkout" && pendingComposer.targetReplyId === reply.id;

    if (!showReview && !showCheckout) {
        return null;
    }

    return (
        <div className="mt-[10px] flex gap-[8px]">
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
                                : "flex-1 rounded-full border border-[var(--adaptive-grey400)] px-[12px] py-[8px] text-[12px] font-semibold text-[var(--adaptive-grey700)]"
                        }
                    >
                        denied
                    </button>
                    <button
                        type="button"
                        data-stitchable-interactive=""
                        disabled={isUpdating}
                        onClick={onConfirm}
                        className="flex-1 rounded-full border border-[var(--adaptive-grey400)] px-[12px] py-[8px] text-[12px] font-semibold text-[var(--adaptive-grey700)]"
                    >
                        confirm
                    </button>
                </>
            ) : null}
            {showCheckout ? (
                <>
                    <button
                        type="button"
                        data-stitchable-interactive=""
                        disabled
                        className="flex-1 rounded-full border border-[var(--adaptive-grey400)] px-[12px] py-[8px] text-[12px] font-semibold text-[var(--adaptive-grey500)] opacity-60"
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
                                ? "flex-1 rounded-full bg-[var(--adaptive-grey900)] px-[12px] py-[8px] text-[12px] font-semibold text-[var(--adaptive-grey50)]"
                                : "flex-1 rounded-full border border-[var(--adaptive-grey400)] px-[12px] py-[8px] text-[12px] font-semibold text-[var(--adaptive-grey700)]"
                        }
                    >
                        checkout
                    </button>
                </>
            ) : null}
        </div>
    );
}

export function FeedbackThread({ report, pendingComposer, onStartDeny, onStartCheckout, onConfirm, isUpdating }: FeedbackThreadProps) {
    if (report.replies.length === 0) {
        return null;
    }

    const chronological = [...report.replies].reverse();

    return (
        <section className="flex flex-col bg-[var(--adaptive-grey50)]">
            {chronological.map((reply) => (
                <article
                    key={reply.id}
                    className="flex flex-col gap-[8px] border-t border-[var(--adaptive-greyOpacity200)] p-[16px]"
                >
                    <div className="flex items-start justify-between gap-[8px]">
                        <FeedbackStatusBadge status={reply.status} />
                        <span className="text-[11px] text-[var(--adaptive-grey500)]">{formatDate(reply.created_at)}</span>
                    </div>
                    <p className="text-[13px] leading-[1.45] text-[var(--adaptive-grey900)]">{reply.message}</p>
                    {reply.author_name ? <p className="text-[12px] text-[var(--adaptive-grey500)]">{reply.author_name}</p> : null}
                    <ThreadEntryActions
                        reply={reply}
                        report={report}
                        pendingComposer={pendingComposer}
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
