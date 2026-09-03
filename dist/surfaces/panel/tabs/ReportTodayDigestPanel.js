import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback } from "react";
import { useReportPreferences } from "../../../shared/providers/reportContext.js";
import { filterTodayDigest } from "../../../shared/utils/panel/experimentalPanelTabs.js";
import { ExperimentalFilteredListPanel } from "./ExperimentalFilteredListPanel.js";
export function ReportTodayDigestPanel() {
    const { messages } = useReportPreferences();
    const filter = useCallback((reports) => filterTodayDigest(reports), []);
    return (_jsx(ExperimentalFilteredListPanel, { title: messages.panel.tabTodayDigest, filter: filter }));
}
//# sourceMappingURL=ReportTodayDigestPanel.js.map