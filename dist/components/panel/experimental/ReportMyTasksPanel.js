import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { useReportPreferences, useReportSession, useReportData } from "../../../providers/reportContext.js";
import { filterMyTasks } from "../../../utils/panel/experimentalPanelTabs.js";
import { ExperimentalFilteredListPanel } from "./ExperimentalFilteredListPanel.js";
import { ExperimentalFeedbackRow } from "./ExperimentalFeedbackRow.js";
function PinnedSnapshotRow({ item, onOpen }) {
    const { messages } = useReportPreferences();
    return (_jsxs("button", { type: "button", onClick: onOpen, className: "flex w-full flex-col gap-[6px] border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px] text-left hover:bg-[var(--adaptive-black100)]", children: [_jsx("p", { className: "line-clamp-2 text-[12px] font-semibold text-[var(--adaptive-black900)]", children: item.summary }), _jsx("p", { className: "truncate text-[11px] text-[var(--adaptive-black500)]", children: item.pathname }), _jsx("span", { className: "text-[10px] font-semibold text-[var(--adaptive-blue500)]", children: messages.pins.railTitle })] }));
}
function PinnedTasksSection() {
    const { messages, pinnedFeedbackItems } = useReportPreferences();
    const { openPinnedFeedback, openPanelTab } = useReportSession();
    const { reports, allPageReports } = useReportData();
    const reportById = useMemo(() => {
        const byId = new Map();
        for (const report of [...allPageReports, ...reports]) {
            byId.set(report.id, report);
        }
        return byId;
    }, [allPageReports, reports]);
    const orderedPins = useMemo(() => [...pinnedFeedbackItems].reverse(), [pinnedFeedbackItems]);
    if (orderedPins.length === 0) {
        return null;
    }
    return (_jsxs("section", { className: "shrink-0 border-b border-[var(--adaptive-border-subtle)]", children: [_jsx("div", { className: "px-[12px] py-[8px]", children: _jsx("p", { className: "text-[12px] font-bold text-[var(--adaptive-black900)]", children: messages.pins.sectionTitle }) }), orderedPins.map((item) => {
                const report = reportById.get(item.reportId);
                const handleOpen = () => {
                    openPanelTab("feedback-list");
                    void openPinnedFeedback(item.reportId, {
                        caseId: item.caseId,
                        pathname: item.pathname,
                    });
                };
                if (report) {
                    return (_jsx(ExperimentalFeedbackRow, { report: report, onOpen: handleOpen }, item.reportId));
                }
                return (_jsx(PinnedSnapshotRow, { item: item, onOpen: handleOpen }, item.reportId));
            })] }));
}
export function ReportMyTasksPanel() {
    const { messages } = useReportPreferences();
    return (_jsxs("div", { className: "flex min-h-0 flex-1 flex-col overflow-hidden", children: [_jsx(PinnedTasksSection, {}), _jsx(ExperimentalFilteredListPanel, { title: messages.panel.tabMyTasks, filter: filterMyTasks })] }));
}
//# sourceMappingURL=ReportMyTasksPanel.js.map