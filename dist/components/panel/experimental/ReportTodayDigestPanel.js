import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback } from "react";
import { useReportPreferences } from "../../../providers/reportContext.js";
import { filterTodayDigest } from "../../../utils/panel/experimentalPanelTabs.js";
import { ExperimentalFilteredListPanel } from "./ExperimentalFilteredListPanel.js";
export function ReportTodayDigestPanel() {
    const { messages } = useReportPreferences();
    const filter = useCallback((reports) => filterTodayDigest(reports), []);
    return (_jsx(ExperimentalFilteredListPanel, { title: messages.panel.tabTodayDigest, filter: filter }));
}
//# sourceMappingURL=ReportTodayDigestPanel.js.map