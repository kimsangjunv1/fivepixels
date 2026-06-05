import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { formatDate } from "../../../utils/format.js";
import { canCheckoutReply, canReviewLatestSuggestion, resolveOriginalFeedbackAuthorName } from "../../../utils/feedbackThread.js";
import { AuthorSelector } from "./AuthorSelector.js";
import { FeedbackStatusBadge } from "./FeedbackStatusBadge.js";
function buildConfirmAuthorOptions(report, authors) {
    const byName = new Map();
    for (const author of authors) {
        byName.set(author.name, author);
    }
    const originalName = resolveOriginalFeedbackAuthorName(report);
    if (originalName && !byName.has(originalName)) {
        byName.set(originalName, { id: "__original_feedback_author__", name: originalName });
    }
    return Array.from(byName.values());
}
function ThreadEntryActions({ reply, report, authors, pendingComposer, confirmAuthorName, showConfirmAuthorSelect, onConfirmAuthorNameChange, onToggleConfirmAuthorSelect, onStartDeny, onStartCheckout, onConfirm, isUpdating, }) {
    const confirmAuthorOptions = useMemo(() => buildConfirmAuthorOptions(report, authors), [authors, report]);
    const isLatest = report.replies[report.replies.length - 1]?.id === reply.id;
    const showReview = isLatest && canReviewLatestSuggestion(report);
    const showCheckout = canCheckoutReply(report, reply);
    const denyActive = pendingComposer?.type === "deny" && pendingComposer.targetReplyId === reply.id;
    const checkoutActive = pendingComposer?.type === "checkout" && pendingComposer.targetReplyId === reply.id;
    if (!showReview && !showCheckout) {
        return null;
    }
    return (_jsxs("div", { className: "mt-[10px] flex flex-col gap-[8px]", children: [_jsxs("div", { className: "flex gap-[8px]", children: [showReview ? (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", "data-stitchable-interactive": "", disabled: isUpdating, onClick: onStartDeny, className: denyActive
                                    ? "flex-1 rounded-full bg-[var(--adaptive-red400)] px-[12px] py-[8px] text-[12px] font-semibold text-white"
                                    : "flex-1 rounded-full border border-[var(--adaptive-grey400)] px-[12px] py-[8px] text-[12px] font-semibold text-[var(--adaptive-grey700)]", children: "denied" }), _jsx("button", { type: "button", "data-stitchable-interactive": "", disabled: isUpdating, onClick: onConfirm, className: "flex-1 rounded-full border border-[var(--adaptive-grey400)] px-[12px] py-[8px] text-[12px] font-semibold text-[var(--adaptive-grey700)]", children: "confirm" }), _jsx("button", { type: "button", "data-stitchable-interactive": "", disabled: isUpdating, onClick: onToggleConfirmAuthorSelect, className: showConfirmAuthorSelect
                                    ? "shrink-0 rounded-full bg-[var(--adaptive-grey900)] px-[12px] py-[8px] text-[12px] font-semibold text-[var(--adaptive-grey50)]"
                                    : "shrink-0 rounded-full border border-[var(--adaptive-grey400)] px-[12px] py-[8px] text-[12px] font-semibold text-[var(--adaptive-grey700)]", children: "select" })] })) : null, showCheckout ? (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", "data-stitchable-interactive": "", disabled: true, className: "flex-1 rounded-full border border-[var(--adaptive-grey400)] px-[12px] py-[8px] text-[12px] font-semibold text-[var(--adaptive-grey500)] opacity-60", children: "denied" }), _jsx("button", { type: "button", "data-stitchable-interactive": "", disabled: isUpdating, onClick: () => onStartCheckout(reply.id), className: checkoutActive
                                    ? "flex-1 rounded-full bg-[var(--adaptive-grey900)] px-[12px] py-[8px] text-[12px] font-semibold text-[var(--adaptive-grey50)]"
                                    : "flex-1 rounded-full border border-[var(--adaptive-grey400)] px-[12px] py-[8px] text-[12px] font-semibold text-[var(--adaptive-grey700)]", children: "checkout" })] })) : null] }), showReview && showConfirmAuthorSelect ? (_jsx(AuthorSelector, { authors: confirmAuthorOptions, value: confirmAuthorName, onChange: onConfirmAuthorNameChange })) : null] }));
}
export function FeedbackThread({ report, authors, pendingComposer, confirmAuthorName, showConfirmAuthorSelect, onConfirmAuthorNameChange, onToggleConfirmAuthorSelect, onStartDeny, onStartCheckout, onConfirm, isUpdating, }) {
    if (report.replies.length === 0) {
        return null;
    }
    const chronological = [...report.replies].reverse();
    return (_jsx("section", { className: "flex flex-col bg-[var(--adaptive-grey50)] max-h-[512px] overflow-auto", children: chronological.map((reply) => (_jsxs("article", { className: "flex flex-col gap-[8px] border-t border-[var(--adaptive-greyOpacity200)] p-[16px]", children: [_jsxs("div", { className: "flex items-start justify-between gap-[8px]", children: [_jsx(FeedbackStatusBadge, { status: reply.status }), _jsx("span", { className: "text-[11px] text-[var(--adaptive-grey500)]", children: formatDate(reply.created_at) })] }), _jsx("p", { className: "text-[13px] leading-[1.45] text-[var(--adaptive-grey900)]", children: reply.message }), reply.author_name ? _jsx("p", { className: "text-[12px] text-[var(--adaptive-grey500)]", children: reply.author_name }) : null, _jsx(ThreadEntryActions, { reply: reply, report: report, authors: authors, pendingComposer: pendingComposer, confirmAuthorName: confirmAuthorName, showConfirmAuthorSelect: showConfirmAuthorSelect, onConfirmAuthorNameChange: onConfirmAuthorNameChange, onToggleConfirmAuthorSelect: onToggleConfirmAuthorSelect, onStartDeny: onStartDeny, onStartCheckout: onStartCheckout, onConfirm: onConfirm, isUpdating: isUpdating })] }, reply.id))) }));
}
//# sourceMappingURL=FeedbackThread.js.map