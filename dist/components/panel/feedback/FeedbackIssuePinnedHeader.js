import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { formatDate } from "../../../utils/format.js";
import { getIssueSummary } from "../../../utils/reportCases.js";
import { useReport } from "../../../providers/reportContext.js";
import { CaseProgressLabel } from "./CaseProgressLabel.js";
import { FeedbackCreatorBadge } from "./FeedbackCreatorBadge.js";
export function FeedbackIssuePinnedHeader({ report, locale }) {
    const { messages } = useReport();
    return (_jsx("section", { className: "shrink-0 border-b border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[12px] py-[8px]", children: _jsxs("div", { className: "flex flex-col items-center gap-[8px]", children: [report.author_name ? (_jsxs("div", { className: "flex shrink-0 items-center justify-between gap-[4px] w-full", children: [_jsxs("section", { className: "flex", children: [_jsx("p", { className: "text-[12px] font-medium text-[var(--adaptive-black700)]", children: report.author_name }), _jsx(FeedbackCreatorBadge, {})] }), _jsx("span", { className: "shrink-0 text-[11px] tabular-nums text-[var(--adaptive-black500)]", children: formatDate(report.created_at, locale) })] })) : null, _jsxs("p", { className: "min-w-0 flex-1 truncate text-[12px] text-[var(--adaptive-black600)]", children: [getIssueSummary(report, { summaryMore: messages.cases.summaryMore }), _jsx(CaseProgressLabel, { report: report, className: "ml-[4px] tabular-nums text-[var(--adaptive-black400)]" })] })] }) }));
}
//# sourceMappingURL=FeedbackIssuePinnedHeader.js.map