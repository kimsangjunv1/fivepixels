import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { useReportPreferences, useReportData } from "../../../providers/reportContext.js";
import { buildProjectHealthSummary } from "../../../utils/panel/experimentalPanelTabs.js";
import { formatStatCount } from "../../../utils/panel/formatStatCount.js";
import { panelNumericClassName } from "../../../utils/panel/panelTypography.js";
export function ReportProjectHealthPanel() {
    const { messages } = useReportPreferences();
    const { reports, allPageReports, listScope } = useReportData();
    const source = listScope === "all" || allPageReports.length > 0 ? (allPageReports.length > 0 ? allPageReports : reports) : reports;
    const summary = useMemo(() => buildProjectHealthSummary(source), [source]);
    const rows = [
        { key: "completion", label: messages.panel.roleStats.completionRate, value: summary.completionRate === null ? "-" : `${summary.completionRate}%` },
        { key: "open", label: messages.panel.experimentalOpen, value: formatStatCount(summary.open) },
        { key: "resolved", label: messages.panel.statsResolved, value: formatStatCount(summary.resolved) },
        { key: "today", label: messages.panel.roleStats.today, value: formatStatCount(summary.todayNew) },
        { key: "issued", label: messages.panel.roleStats.issued, value: formatStatCount(summary.gitIssued) },
        { key: "errors", label: messages.panel.roleStats.errors, value: formatStatCount(summary.errors) },
        { key: "recheck", label: messages.panel.roleStats.recheck, value: formatStatCount(summary.recheck) },
    ];
    return (_jsxs("section", { className: "flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--adaptive-black50)]", children: [_jsxs("div", { className: "border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[8px]", children: [_jsx("p", { className: "text-[12px] font-bold text-[var(--adaptive-black900)]", children: messages.panel.tabProjectHealth }), _jsx("p", { className: "mt-[2px] text-[11px] text-[var(--adaptive-black500)]", children: messages.panel.experimentalScopeAll })] }), _jsx("div", { className: "flex flex-col px-[12px]", children: rows.map((row, index) => (_jsxs("div", { className: `flex items-center justify-between gap-[8px] py-[10px] ${index < rows.length - 1 ? "border-b border-[var(--adaptive-border-subtle)]" : ""}`, children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black600)]", children: row.label }), _jsx("p", { className: `text-[14px] font-bold text-[var(--adaptive-black900)] ${panelNumericClassName}`, children: row.value })] }, row.key))) }), summary.total === 0 ? _jsx("p", { className: "px-[12px] py-[8px] text-[12px] text-[var(--adaptive-black500)]", children: messages.panel.experimentalEmpty }) : null] }));
}
//# sourceMappingURL=ReportProjectHealthPanel.js.map