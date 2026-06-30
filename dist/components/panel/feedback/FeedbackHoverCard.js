import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getDetachedMarkerHint } from "../../../utils/markerContext.js";
import { getIssueSummary } from "../../../utils/reportCases.js";
import { getFeedbackDisplayStatus, getLatestReply, getRemainingReplyCount } from "../../../utils/feedbackThread.js";
import { resolveTargetBinding } from "../../../utils/targetSelector.js";
import { useReport } from "../../../providers/reportContext.js";
import { CaseProgressLabel } from "./CaseProgressLabel.js";
import { FeedbackCreatorBadge } from "./FeedbackCreatorBadge.js";
import { FeedbackFieldTags } from "./FeedbackFieldTags.js";
import { FeedbackStatusBadge } from "./FeedbackStatusBadge.js";
function getTargetBindingHint(kind, messages) {
    switch (kind) {
        case "selector":
            return messages.pickTarget.bindingSelector;
        case "report-id":
            return messages.pickTarget.bindingReportId;
        case "coordinates":
            return messages.pickTarget.bindingCoordinates;
    }
}
export function FeedbackHoverCard({ report, fieldTags, detached = false, detachedKind = null, detachedHint, detachedModalHint }) {
    const { messages } = useReport();
    const displayStatus = getFeedbackDisplayStatus(report, true);
    const latestReply = getLatestReply(report);
    const remainingReplyCount = getRemainingReplyCount(report);
    const resolvedDetachedHint = detached && detachedHint && detachedModalHint ? getDetachedMarkerHint(detachedKind, { detachedHint, detachedModalHint }) : null;
    const targetBinding = report.target_selector || detached ? resolveTargetBinding(report) : null;
    const targetBindingHint = targetBinding && (report.target_selector || targetBinding.kind === "coordinates") ? getTargetBindingHint(targetBinding.kind, messages) : null;
    return (
    // <div className="flex w-[260px] flex-col gap-[10px] bg-transparent p-[16px]">
    _jsxs("div", { className: "flex w-[260px] flex-col gap-[4px] bg-transparent p-[8px_8px]", children: [_jsx(FeedbackStatusBadge, { status: displayStatus }), resolvedDetachedHint ? _jsx("p", { className: "text-[12px] leading-[1.4] text-[var(--adaptive-black500)]", children: resolvedDetachedHint }) : null, targetBindingHint ? _jsx("p", { className: "text-[12px] leading-[1.4] text-[var(--adaptive-black500)]", children: targetBindingHint }) : null, _jsxs("p", { className: "line-clamp-2 leading-[1.5] text-[14px] text-[var(--adaptive-text-primary)]", children: [getIssueSummary(report, { summaryMore: messages.cases.summaryMore }), _jsx(CaseProgressLabel, { report: report })] }), report.author_name ? (_jsxs("div", { className: "flex items-center gap-[6px]", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: report.author_name }), _jsx(FeedbackCreatorBadge, {})] })) : null, _jsx(FeedbackFieldTags, { tags: fieldTags }), latestReply ? (_jsxs("div", { className: "flex min-w-0 items-center gap-[6px] border-t border-[var(--adaptive-border-subtle)] pt-[10px] text-[12px] text-[var(--adaptive-text-muted)]", children: [_jsx("span", { className: "text-[var(--adaptive-black900)]", children: "\u21B3" }), _jsx("span", { className: "min-w-0 flex-1 truncate text-[var(--adaptive-black900)] text-[14px]", children: latestReply.message }), remainingReplyCount > 0 ? _jsxs("span", { className: "text-[12px] bg-[var(--adaptive-black500)] rounded-full p-[2px_4px] text-white", children: ["+", remainingReplyCount] }) : null] })) : null] }));
}
//# sourceMappingURL=FeedbackHoverCard.js.map