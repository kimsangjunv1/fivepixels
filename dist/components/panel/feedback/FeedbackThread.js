import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { formatDate } from "../../../utils/format.js";
import { canCheckoutReply, canReviewLatestSuggestion } from "../../../utils/feedbackThread.js";
import { FeedbackStatusBadge } from "./FeedbackStatusBadge.js";
function ThreadEntryActions({ reply, report, pendingComposer, onStartDeny, onStartCheckout, onConfirm, isUpdating, }) {
    const isLatest = report.replies[report.replies.length - 1]?.id === reply.id;
    const showReview = isLatest && canReviewLatestSuggestion(report);
    const showCheckout = canCheckoutReply(reply);
    const denyActive = pendingComposer?.type === "deny" && pendingComposer.targetReplyId === reply.id;
    const checkoutActive = pendingComposer?.type === "checkout" && pendingComposer.targetReplyId === reply.id;
    if (!showReview && !showCheckout) {
        return null;
    }
    return (_jsxs("div", { className: "mt-[10px] flex gap-[8px]", children: [showReview ? (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", "data-stitchable-interactive": "", disabled: isUpdating, onClick: onStartDeny, className: denyActive
                            ? "flex-1 rounded-full bg-[var(--adaptive-red400)] px-[12px] py-[8px] text-[12px] font-semibold text-white"
                            : "flex-1 rounded-full border border-[var(--adaptive-grey400)] px-[12px] py-[8px] text-[12px] font-semibold text-[var(--adaptive-grey700)]", children: "denied" }), _jsx("button", { type: "button", "data-stitchable-interactive": "", disabled: isUpdating, onClick: onConfirm, className: "flex-1 rounded-full border border-[var(--adaptive-grey400)] px-[12px] py-[8px] text-[12px] font-semibold text-[var(--adaptive-grey700)]", children: "confirm" })] })) : null, showCheckout ? (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", "data-stitchable-interactive": "", disabled: true, className: "flex-1 rounded-full border border-[var(--adaptive-grey400)] px-[12px] py-[8px] text-[12px] font-semibold text-[var(--adaptive-grey500)] opacity-60", children: "denied" }), _jsx("button", { type: "button", "data-stitchable-interactive": "", disabled: isUpdating, onClick: () => onStartCheckout(reply.id), className: checkoutActive
                            ? "flex-1 rounded-full bg-[var(--adaptive-grey900)] px-[12px] py-[8px] text-[12px] font-semibold text-[var(--adaptive-grey50)]"
                            : "flex-1 rounded-full border border-[var(--adaptive-grey400)] px-[12px] py-[8px] text-[12px] font-semibold text-[var(--adaptive-grey700)]", children: "checkout" })] })) : null] }));
}
export function FeedbackThread({ report, pendingComposer, onStartDeny, onStartCheckout, onConfirm, isUpdating }) {
    if (report.replies.length === 0) {
        return null;
    }
    const chronological = [...report.replies].reverse();
    return (_jsx("section", { className: "flex flex-col bg-[var(--adaptive-grey50)]", children: chronological.map((reply) => (_jsxs("article", { className: "flex flex-col gap-[8px] border-t border-[var(--adaptive-greyOpacity200)] p-[16px]", children: [_jsxs("div", { className: "flex items-start justify-between gap-[8px]", children: [_jsx(FeedbackStatusBadge, { status: reply.status }), _jsx("span", { className: "text-[11px] text-[var(--adaptive-grey500)]", children: formatDate(reply.created_at) })] }), _jsx("p", { className: "text-[13px] leading-[1.45] text-[var(--adaptive-grey900)]", children: reply.message }), reply.author_name ? _jsx("p", { className: "text-[12px] text-[var(--adaptive-grey500)]", children: reply.author_name }) : null, _jsx(ThreadEntryActions, { reply: reply, report: report, pendingComposer: pendingComposer, onStartDeny: onStartDeny, onStartCheckout: onStartCheckout, onConfirm: onConfirm, isUpdating: isUpdating })] }, reply.id))) }));
}
//# sourceMappingURL=FeedbackThread.js.map