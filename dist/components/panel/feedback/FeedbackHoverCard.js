import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { getDetachedMarkerHint } from "../../../utils/markerContext.js";
import { getFeedbackDisplayStatus, getLatestReply, getRemainingReplyCount } from "../../../utils/feedbackThread.js";
import { FeedbackCreatorBadge } from "./FeedbackCreatorBadge.js";
import { FeedbackFieldTags } from "./FeedbackFieldTags.js";
import { FeedbackStatusBadge } from "./FeedbackStatusBadge.js";
export function FeedbackHoverCard({ report, fieldTags, detached = false, detachedKind = null, detachedHint, detachedModalHint }) {
    const displayStatus = getFeedbackDisplayStatus(report, true);
    const latestReply = getLatestReply(report);
    const remainingReplyCount = getRemainingReplyCount(report);
    const resolvedDetachedHint = detached && detachedHint && detachedModalHint
        ? getDetachedMarkerHint(detachedKind, { detachedHint, detachedModalHint })
        : null;
    return (
    // <div className="flex w-[260px] flex-col gap-[10px] bg-transparent p-[16px]">
    _jsxs("div", { className: "flex w-[260px] flex-col gap-[10px] bg-transparent p-[12px]", children: [_jsx(FeedbackStatusBadge, { status: displayStatus }), resolvedDetachedHint ? _jsx("p", { className: "text-[12px] leading-[1.4] text-[var(--adaptive-black500)]", children: resolvedDetachedHint }) : null, _jsx("p", { className: "line-clamp-2 leading-[1.5] text-[16px] text-[var(--adaptive-text-primary)]", children: report.message }), report.author_name ? (_jsxs("div", { className: "flex items-center gap-[6px]", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: report.author_name }), _jsx(FeedbackCreatorBadge, {})] })) : null, _jsx(FeedbackFieldTags, { tags: fieldTags }), latestReply ? (_jsxs("div", { className: "flex min-w-0 items-center gap-[6px] border-t border-[var(--adaptive-border-subtle)] pt-[10px] text-[12px] text-[var(--adaptive-text-muted)]", children: [latestReply.author_name ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "shrink-0", children: latestReply.author_name }), _jsx("span", { className: "shrink-0 text-[var(--adaptive-black700)]", children: "|" })] })) : null, _jsx("span", { className: "min-w-0 flex-1 truncate text-[var(--adaptive-black400)]", children: latestReply.message }), remainingReplyCount > 0 ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "shrink-0 text-[var(--adaptive-black700)]", children: "|" }), _jsxs("span", { className: "shrink-0 tabular-nums", children: ["+", remainingReplyCount] })] })) : null] })) : null] }));
}
//# sourceMappingURL=FeedbackHoverCard.js.map