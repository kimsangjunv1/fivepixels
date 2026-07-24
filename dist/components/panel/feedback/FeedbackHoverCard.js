import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FEEDBACK_STATUS_COLOR } from "../../../constants/feedbackStatus.js";
import { getDetachedMarkerHint } from "../../../utils/marker/markerContext.js";
import { getCaseLatestStatus } from "../../../utils/feedback/feedbackThread.js";
import { getReportCases } from "../../../utils/report/reportCases.js";
import { useReportPreferences } from "../../../providers/reportContext.js";
import { FeedbackCreatorBadge } from "./FeedbackCreatorBadge.js";
const MAX_TOOLTIP_CASES = 5;
function CaseStatusLabel({ status }) {
    const { messages } = useReportPreferences();
    const color = FEEDBACK_STATUS_COLOR[status];
    return (_jsx("span", { className: "shrink-0 whitespace-nowrap text-[11px] font-semibold leading-none", style: { color }, children: messages.status.feedback[status] }));
}
export function FeedbackHoverCard({ report, detached = false, detachedKind = null, detachedHint, detachedModalHint }) {
    const { messages } = useReportPreferences();
    const cases = getReportCases(report);
    const visibleCases = cases.slice(0, MAX_TOOLTIP_CASES);
    const hasMoreCases = cases.length > MAX_TOOLTIP_CASES;
    const resolvedDetachedHint = detached && detachedHint && detachedModalHint ? getDetachedMarkerHint(detachedKind, { detachedHint, detachedModalHint }) : null;
    return (_jsx("div", { className: "flex w-[260px] flex-col bg-transparent", children: _jsxs("div", { className: "flex flex-col gap-[6px] p-[8px_12px]", children: [resolvedDetachedHint ? _jsx("p", { className: "text-[12px] leading-[1.4] text-[var(--adaptive-black500)]", children: resolvedDetachedHint }) : null, _jsx("ul", { className: "flex flex-col gap-[4px]", children: visibleCases.map((item) => {
                        const status = getCaseLatestStatus(report, item.id);
                        return (_jsxs("li", { className: "flex min-w-0 items-center gap-[6px]", children: [_jsx("span", { className: `min-w-0 flex-1 text-[16px] leading-[1.5] truncate text-[var(--adaptive-text-primary)] ${item.status === "resolved" ? "text-[var(--adaptive-black500)] line-through" : ""}`, title: item.text, children: item.text }), _jsx(CaseStatusLabel, { status: status })] }, item.id));
                    }) }), hasMoreCases ? _jsx("p", { className: "text-[11px] leading-[1.4] text-[var(--adaptive-black500)]", children: messages.marker.viewMoreCases }) : null, report.author_name ? (_jsxs("div", { className: "flex items-center gap-[6px] pt-[6px]", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: report.author_name }), _jsx(FeedbackCreatorBadge, {})] })) : null] }) }));
}
//# sourceMappingURL=FeedbackHoverCard.js.map