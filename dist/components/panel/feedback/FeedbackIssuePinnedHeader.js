import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { formatDate } from "../../../utils/format.js";
import { getIssueSummary } from "../../../utils/reportCases.js";
import { FeedbackCreatorBadge } from "./FeedbackCreatorBadge.js";
export function FeedbackIssuePinnedHeader({ report, locale }) {
    return (_jsx("section", { className: "shrink-0 border-b border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[12px] py-[8px]", children: _jsxs("div", { className: "flex items-center gap-[8px]", children: [report.author_name ? (_jsxs("div", { className: "flex shrink-0 items-center gap-[4px]", children: [_jsx("p", { className: "text-[12px] font-medium text-[var(--adaptive-black700)]", children: report.author_name }), _jsx(FeedbackCreatorBadge, {})] })) : null, _jsx("p", { className: "min-w-0 flex-1 truncate text-[12px] text-[var(--adaptive-black600)]", children: getIssueSummary(report) }), _jsx("span", { className: "shrink-0 text-[11px] tabular-nums text-[var(--adaptive-black500)]", children: formatDate(report.created_at, locale) })] }) }));
}
//# sourceMappingURL=FeedbackIssuePinnedHeader.js.map