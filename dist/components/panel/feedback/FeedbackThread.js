import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
function getScrollOverflowState(element) {
    const { scrollTop, scrollHeight, clientHeight } = element;
    const hasOverflow = scrollHeight > clientHeight + 1;
    return {
        canScrollUp: hasOverflow && scrollTop > 0,
        canScrollDown: hasOverflow && scrollTop + clientHeight < scrollHeight - 1,
    };
}
const SCROLL_HINT_CLASS = "pointer-events-none absolute left-0 right-0 z-10 px-[16px] py-[12px] text-center text-[12px] text-[var(--adaptive-black600)]";
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
    return (_jsxs("div", { className: "mt-[10px] flex flex-col gap-[8px]", children: [_jsxs("div", { className: "flex gap-[8px]", children: [showReview ? (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", "data-stitchable-interactive": "", disabled: isUpdating, onClick: onStartDeny, className: `flex-1 rounded-full py-[4px] px-[8px] text-[12px] font-semibold border ${denyActive ? " bg-[#FF2B6A] text-white border-transparent" : " border-[var(--adaptive-black800)] text-[var(--adaptive-black500)] text-[var(--adaptive-black50)]"}`, children: "denied" }), _jsxs("section", { className: "flex items-center gap-[8px] py-[4px] px-[8px] border border-[var(--adaptive-black800)] bg-[var(--adaptive-black900)] rounded-full", children: [_jsx("button", { type: "button", "data-stitchable-interactive": "", disabled: isUpdating, onClick: onConfirm, className: "flex-1 rounded-full text-[12px] font-semibold text-[var(--adaptive-black500)]", children: "resolved" }), _jsx("div", { className: "h-full w-[1px] bg-[var(--adaptive-black700)]" }), _jsx("button", { type: "button", "data-stitchable-interactive": "", disabled: isUpdating, onClick: onToggleConfirmAuthorSelect, className: showConfirmAuthorSelect
                                            ? "shrink-0 rounded-full bg-[var(--adaptive-black900)] text-[12px] font-semibold text-[var(--adaptive-black50)]"
                                            : "shrink-0 rounded-fulltext-[12px] font-semibold text-[var(--adaptive-black700)]", children: "select" })] })] })) : null, showCheckout ? (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", "data-stitchable-interactive": "", disabled: true, className: "flex-1 border border-[var(--adaptive-black400)] py-[4px] rounded-[8px] text-[12px] font-semibold text-[var(--adaptive-black500)] opacity-60", children: "denied" }), _jsx("button", { type: "button", "data-stitchable-interactive": "", disabled: isUpdating, onClick: () => onStartCheckout(reply.id), className: "flex-1 py-[4px] rounded-[8px] text-[12px] font-semibold " +
                                    (checkoutActive
                                        ? "bg-[var(--adaptive-black900)] text-[var(--adaptive-black50)]"
                                        : "bg-[var(--adaptive-black900)] border border-[var(--adaptive-black400)] text-[var(--adaptive-black300)]"), children: "leave a resu\u3134lt" })] })) : null] }), showReview && showConfirmAuthorSelect ? (_jsx(AuthorSelector, { authors: confirmAuthorOptions, value: confirmAuthorName, onChange: onConfirmAuthorNameChange })) : null] }));
}
export function FeedbackThread({ report, authors, pendingComposer, confirmAuthorName, showConfirmAuthorSelect, onConfirmAuthorNameChange, onToggleConfirmAuthorSelect, onStartDeny, onStartCheckout, onConfirm, isUpdating, }) {
    const scrollRef = useRef(null);
    const [scrollOverflow, setScrollOverflow] = useState({
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
    return (_jsxs("div", { className: "relative max-h-[512px]", children: [scrollOverflow.canScrollUp ? _jsx("p", { className: `${SCROLL_HINT_CLASS} top-0 bg-[linear-gradient(0deg,transparent,var(--adaptive-black900))]`, children: "message available up" }) : null, scrollOverflow.canScrollDown ? _jsx("p", { className: `${SCROLL_HINT_CLASS} bottom-0 bg-[linear-gradient(180deg,transparent,var(--adaptive-black900))]`, children: "message available down" }) : null, _jsx("section", { ref: scrollRef, className: "flex max-h-[512px] flex-col overflow-auto bg-[var(--adaptive-blackOpacity900)] backdrop-blur-[10px]", children: chronological.map((reply) => (_jsxs("article", { className: "flex flex-col gap-[8px] border-t border-[var(--adaptive-black800)] p-[16px]", children: [_jsxs("div", { className: "flex items-start justify-between gap-[8px]", children: [_jsx(FeedbackStatusBadge, { status: reply.status }), _jsx("span", { className: "text-[12px] text-[var(--adaptive-black500)]", children: formatDate(reply.created_at) })] }), _jsx("p", { className: "leading-[1.5] text-[14px] text-[var(--adaptive-black50)]", children: reply.message }), reply.author_name ? _jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: reply.author_name }) : null, _jsx(ThreadEntryActions, { reply: reply, report: report, authors: authors, pendingComposer: pendingComposer, confirmAuthorName: confirmAuthorName, showConfirmAuthorSelect: showConfirmAuthorSelect, onConfirmAuthorNameChange: onConfirmAuthorNameChange, onToggleConfirmAuthorSelect: onToggleConfirmAuthorSelect, onStartDeny: onStartDeny, onStartCheckout: onStartCheckout, onConfirm: onConfirm, isUpdating: isUpdating })] }, reply.id))) })] }));
}
//# sourceMappingURL=FeedbackThread.js.map