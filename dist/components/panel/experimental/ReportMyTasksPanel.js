import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { useReportPreferences, useReportSession, useReportData } from "../../../providers/reportContext.js";
import { filterMyTasks } from "../../../utils/panel/experimentalPanelTabs.js";
import { ExperimentalFeedbackRow } from "./ExperimentalFeedbackRow.js";
export function ReportMyTasksPanel() {
    const { messages } = useReportPreferences();
    const { sessionActor, locateFeedback, openPanelTab } = useReportSession();
    const { reports, allPageReports, listScope } = useReportData();
    const source = listScope === "all" || allPageReports.length > 0 ? (allPageReports.length > 0 ? allPageReports : reports) : reports;
    const items = useMemo(() => filterMyTasks(source, sessionActor?.name ?? null), [source, sessionActor?.name]);
    const handleOpen = (reportId) => {
        openPanelTab("feedback-list");
        void locateFeedback(reportId);
    };
    return (_jsxs("section", { className: "flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--adaptive-black50)]", children: [_jsxs("div", { className: "shrink-0 border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[8px]", children: [_jsx("p", { className: "text-[12px] font-bold text-[var(--adaptive-black900)]", children: messages.panel.tabMyTasks }), _jsx("p", { className: "mt-[2px] text-[11px] text-[var(--adaptive-black500)]", children: messages.panel.experimentalScopeAll })] }), _jsx("div", { className: "min-h-0 flex-1 overflow-y-auto", children: items.length === 0 ? (_jsx("p", { className: "px-[12px] py-[16px] text-[12px] text-[var(--adaptive-black500)]", children: messages.panel.experimentalEmpty })) : (items.map((report) => (_jsx(ExperimentalFeedbackRow, { report: report, onOpen: handleOpen }, report.id)))) })] }));
}
//# sourceMappingURL=ReportMyTasksPanel.js.map