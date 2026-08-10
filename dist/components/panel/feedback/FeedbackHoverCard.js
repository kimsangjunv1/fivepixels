import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CheckCircleIcon } from "../../../components/icons/Icons.js";
import { getDetachedMarkerHint } from "../../../utils/marker/markerContext.js";
import { getCaseLatestStatus } from "../../../utils/feedback/feedbackThread.js";
import { formatAssigneeLabel, getReportCases, resolveAuthorDepartment } from "../../../utils/report/reportCases.js";
import { mentionMessageToPlainText } from "../../../utils/mention/elementMentions.js";
import { formatRelativeTime } from "../../../utils/shared/format.js";
import { useReport, useReportPreferences } from "../../../providers/reportContext.js";
import { ACCENT_COLOR } from "../../../constants/accentColors.js";
const MAX_TOOLTIP_CASES = 5;
const RESOLVED_STATUS_COLOR = ACCENT_COLOR.green;
function CaseStatusLabel({ status }) {
    const { messages } = useReportPreferences();
    const isResolved = status === "resolved";
    return (_jsx("span", { className: `shrink-0 whitespace-nowrap text-[14px] font-semibold leading-none ${isResolved ? "" : "text-[var(--adaptive-black500)]"}`, style: isResolved ? { color: RESOLVED_STATUS_COLOR } : undefined, children: messages.status.feedback[status] }));
}
export function FeedbackHoverCard({ report, detached = false, detachedKind = null, detachedHint, detachedModalHint }) {
    const { messages } = useReportPreferences();
    const { authors } = useReport();
    const cases = getReportCases(report);
    const visibleCases = cases.slice(0, MAX_TOOLTIP_CASES);
    const hasMoreCases = cases.length > MAX_TOOLTIP_CASES;
    const resolvedDetachedHint = detached && detachedHint && detachedModalHint ? getDetachedMarkerHint(detachedKind, { detachedHint, detachedModalHint }) : null;
    const reportRelativeTime = formatRelativeTime(report.created_at, messages.common.relativeTime);
    const authorLabel = report.author_name
        ? formatAssigneeLabel(report.author_name, resolveAuthorDepartment(authors, report.author_name))
        : null;
    return (_jsx("div", { className: "flex w-[260px] flex-col bg-transparent", children: _jsxs("div", { className: "flex flex-col gap-[6px] p-[8px_12px]", children: [resolvedDetachedHint ? _jsx("p", { className: "text-[13px] leading-[1.4] text-[var(--adaptive-black500)]", children: resolvedDetachedHint }) : null, _jsx("ul", { className: "flex flex-col gap-[4px]", children: visibleCases.map((item) => {
                        const status = getCaseLatestStatus(report, item.id);
                        const isResolved = status === "resolved";
                        const caseText = mentionMessageToPlainText(item.text, item.mentions);
                        return (_jsxs("li", { className: "flex min-w-0 items-center gap-[6px]", children: [_jsx("span", { className: "min-w-0 flex-1 text-[14px] leading-[1.5] truncate text-[var(--adaptive-text-primary)]", title: caseText, children: caseText }), isResolved ? (_jsx(CheckCircleIcon, { className: "h-[16px] w-[16px] shrink-0", fill: RESOLVED_STATUS_COLOR })) : null, _jsx(CaseStatusLabel, { status: status })] }, item.id));
                    }) }), hasMoreCases ? _jsx("p", { className: "text-[12px] leading-[1.4] text-[var(--adaptive-black500)]", children: messages.marker.viewMoreCases }) : null, authorLabel || reportRelativeTime ? (_jsxs("div", { className: "flex items-center gap-[6px] pt-[6px]", children: [authorLabel ? (_jsx("p", { className: "min-w-0 truncate text-[14px] text-[var(--adaptive-black500)]", title: authorLabel, children: authorLabel })) : null, reportRelativeTime ? _jsx("p", { className: "shrink-0 text-[14px] text-[var(--adaptive-black500)]", children: reportRelativeTime }) : null] })) : null] }) }));
}
//# sourceMappingURL=FeedbackHoverCard.js.map