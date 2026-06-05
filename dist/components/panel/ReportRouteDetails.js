import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReport } from "../../providers/reportContext.js";
import { formatStatCount } from "../../utils/formatStatCount.js";
import { panelNumericClassName } from "../../utils/panelTypography.js";
import { ROUTE_DETAIL_STATUS_LABEL } from "../../utils/routeDetailStatus.js";
function StatusRowIcon({ status }) {
    if (status === "wait") {
        return _jsx("span", { "aria-hidden": true, children: "\u2691" });
    }
    if (status === "suggested") {
        return _jsx("span", { "aria-hidden": true, children: "\u21BB" });
    }
    return _jsx("span", { "aria-hidden": true, children: "\u2713" });
}
export function ReportRouteDetails() {
    const { routeDetailsStats, projectId, environment, appVersion } = useReport();
    const { pathname, statusRows, fieldCounts } = routeDetailsStats;
    return (_jsxs("section", { className: "flex flex-col gap-[12px] rounded-[12px] bg-[var(--adaptive-grey100)] p-[12px]", children: [_jsxs("section", { className: "flex flex-col gap-[8px]", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-grey500)]", children: pathname }), _jsxs("div", { className: "grid grid-cols-[1fr_56px_56px] items-center gap-x-[8px] text-[12px] text-[var(--adaptive-grey500)]", children: [_jsx("span", {}), _jsx("span", { className: "text-right", children: "All" }), _jsx("span", { className: "text-right", children: "Today" })] }), statusRows.map((row) => (_jsxs("div", { className: "grid grid-cols-[1fr_56px_56px] items-center gap-x-[8px]", children: [_jsxs("div", { className: "flex items-center gap-[6px] text-[13px] font-semibold text-[var(--adaptive-grey800)]", children: [_jsx(StatusRowIcon, { status: row.status }), _jsx("span", { children: ROUTE_DETAIL_STATUS_LABEL[row.status] })] }), _jsx("p", { className: `text-right text-[14px] font-bold text-[var(--adaptive-grey900)] ${panelNumericClassName}`, children: row.all.toLocaleString() }), _jsx("p", { className: `text-right text-[14px] font-bold text-[var(--adaptive-grey900)] ${panelNumericClassName}`, children: row.today.toLocaleString() })] }, row.status)))] }), fieldCounts.length > 0 ? (_jsx("section", { className: "grid grid-cols-3 gap-[8px] border-t border-[var(--adaptive-grey200)] pt-[12px]", children: fieldCounts.map((field) => (_jsxs("div", { className: "flex flex-col items-center gap-[4px] text-center", children: [_jsx("span", { className: "text-[11px] font-semibold uppercase tracking-wide text-[var(--adaptive-grey500)]", children: field.label }), _jsx("p", { className: `text-[14px] font-bold text-[var(--adaptive-grey900)] ${panelNumericClassName}`, children: formatStatCount(field.count) })] }, field.key))) })) : null, _jsx("section", { className: "border-t border-[var(--adaptive-grey200)] pt-[10px] text-[11px] text-[var(--adaptive-grey500)]", children: _jsxs("p", { className: "flex flex-wrap items-center gap-x-[8px] gap-y-[4px]", children: [_jsxs("span", { children: ["projectId: ", _jsx("strong", { className: "text-[var(--adaptive-grey800)]", children: projectId })] }), _jsx("span", { "aria-hidden": true, children: "|" }), _jsxs("span", { children: ["environment: ", _jsx("strong", { className: "text-[var(--adaptive-grey800)]", children: environment ?? "-" })] }), _jsx("span", { "aria-hidden": true, children: "|" }), _jsxs("span", { children: ["appVersion: ", _jsx("strong", { className: "text-[var(--adaptive-grey800)]", children: appVersion ?? "-" })] })] }) })] }));
}
//# sourceMappingURL=ReportRouteDetails.js.map